import { NextRequest, NextResponse } from 'next/server';
import { unsubscribeEmail, isEmailUnsubscribed } from '@/lib/email-security';

// GET /api/email/unsubscribe - Check unsubscribe status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const organizationId = searchParams.get('org');

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email address is required' },
        { status: 400 }
      );
    }

    const isUnsubscribed = await isEmailUnsubscribed(
      email,
      organizationId ? parseInt(organizationId) : undefined
    );

    return NextResponse.json({
      success: true,
      data: {
        email,
        is_unsubscribed: isUnsubscribed,
        organization_id: organizationId ? parseInt(organizationId) : null
      }
    });

  } catch (error) {
    console.error('Error checking unsubscribe status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check unsubscribe status' },
      { status: 500 }
    );
  }
}

// POST /api/email/unsubscribe - Unsubscribe email
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, reason, organization_id } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email address is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Get client information
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    const success = await unsubscribeEmail(
      email,
      reason,
      organization_id ? parseInt(organization_id) : undefined,
      ipAddress,
      userAgent
    );

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to unsubscribe email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Email unsubscribed successfully'
    });

  } catch (error) {
    console.error('Error unsubscribing email:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to unsubscribe email' },
      { status: 500 }
    );
  }
}
