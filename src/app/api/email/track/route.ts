import { NextRequest, NextResponse } from 'next/server';
import { trackEmailEvent } from '@/lib/email-analytics';

// GET /api/email/track - Track email opens (pixel tracking)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const emailLogId = searchParams.get('id');
    const event = searchParams.get('event') || 'opened';

    if (!emailLogId || isNaN(parseInt(emailLogId))) {
      // Return a 1x1 transparent pixel even for invalid requests to avoid breaking email clients
      return new Response(
        Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'),
        {
          status: 200,
          headers: {
            'Content-Type': 'image/gif',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }
      );
    }

    // Get client information
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Track the event
    await trackEmailEvent(
      parseInt(emailLogId),
      event as 'opened',
      {
        tracking_method: 'pixel',
        timestamp: new Date().toISOString()
      },
      ipAddress,
      userAgent
    );

    // Return a 1x1 transparent pixel
    return new Response(
      Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'),
      {
        status: 200,
        headers: {
          'Content-Type': 'image/gif',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );

  } catch (error) {
    console.error('Error tracking email open:', error);
    
    // Still return a pixel to avoid breaking email clients
    return new Response(
      Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'),
      {
        status: 200,
        headers: {
          'Content-Type': 'image/gif',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
  }
}

// POST /api/email/track - Track email events (clicks, etc.)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email_log_id, event_type, event_data, redirect_url } = body;

    if (!email_log_id || !event_type) {
      return NextResponse.json(
        { success: false, error: 'email_log_id and event_type are required' },
        { status: 400 }
      );
    }

    // Validate event type
    const validEvents = ['delivered', 'opened', 'clicked', 'bounced', 'complained'];
    if (!validEvents.includes(event_type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid event_type' },
        { status: 400 }
      );
    }

    // Get client information
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Track the event
    const success = await trackEmailEvent(
      parseInt(email_log_id),
      event_type as 'delivered' | 'opened' | 'clicked' | 'bounced' | 'complained',
      event_data,
      ipAddress,
      userAgent
    );

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to track email event' },
        { status: 500 }
      );
    }

    // If this is a click event and a redirect URL is provided, return it
    if (event_type === 'clicked' && redirect_url) {
      return NextResponse.json({
        success: true,
        data: { redirect_url },
        message: 'Email click tracked successfully'
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Email event tracked successfully'
    });

  } catch (error) {
    console.error('Error tracking email event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to track email event' },
      { status: 500 }
    );
  }
}
