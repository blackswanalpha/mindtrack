import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { 
  getUserNotifications,
  markAllNotificationsAsRead,
  getUnreadNotificationCount
} from '@/lib/audit-utils';

// GET /api/notifications - Get user notifications
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unread_only') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const organizationId = searchParams.get('organization_id');

    const notifications = await getUserNotifications(
      user.userId, 
      unreadOnly, 
      Math.min(limit, 100), // Cap at 100
      Math.max(offset, 0)
    );

    // Get unread count
    const unreadCount = await getUnreadNotificationCount(
      user.userId,
      organizationId ? parseInt(organizationId) : undefined
    );

    return NextResponse.json({
      success: true,
      data: { 
        notifications,
        unread_count: unreadCount,
        total_count: notifications.length
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// PUT /api/notifications - Mark all notifications as read
export async function PUT(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { organization_id } = body;

    const markedCount = await markAllNotificationsAsRead(
      user.userId,
      organization_id
    );

    return NextResponse.json({
      success: true,
      data: { marked_count: markedCount },
      message: `${markedCount} notifications marked as read`
    });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to mark notifications as read' },
      { status: 500 }
    );
  }
}
