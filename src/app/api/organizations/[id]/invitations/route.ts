import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { 
  getOrganizationInvitations,
  checkUserPermission
} from '@/lib/organization-db';

// GET /api/organizations/[id]/invitations - Get organization invitations
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const organizationId = parseInt(params.id);
    if (isNaN(organizationId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid organization ID' },
        { status: 400 }
      );
    }

    // Check if user has admin or owner permissions
    const permission = await checkUserPermission(organizationId, user.userId, 'admin');
    if (!permission.hasAccess) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions to view invitations' },
        { status: 403 }
      );
    }

    const invitations = await getOrganizationInvitations(organizationId);

    return NextResponse.json({
      success: true,
      data: { invitations }
    });
  } catch (error) {
    console.error('Error fetching organization invitations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch organization invitations' },
      { status: 500 }
    );
  }
}
