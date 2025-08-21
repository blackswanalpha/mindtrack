import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { 
  getInvitationByToken,
  acceptInvitation
} from '@/lib/organization-db';
import { logInvitationAction, logMemberAction } from '@/lib/audit-utils';
import { query } from '@/lib/db';

// GET /api/invitations/[token] - Get invitation details
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Invalid invitation token' },
        { status: 400 }
      );
    }

    const invitation = await getInvitationByToken(token);
    if (!invitation) {
      return NextResponse.json(
        { success: false, error: 'Invitation not found or expired' },
        { status: 404 }
      );
    }

    // Return invitation details without sensitive information
    const publicInvitation = {
      id: invitation.id,
      organization: invitation.organization,
      email: invitation.email,
      role: invitation.role,
      expires_at: invitation.expires_at,
      created_at: invitation.created_at
    };

    return NextResponse.json({
      success: true,
      data: { invitation: publicInvitation }
    });
  } catch (error) {
    console.error('Error fetching invitation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch invitation' },
      { status: 500 }
    );
  }
}

// POST /api/invitations/[token] - Accept invitation
export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { token } = params;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Invalid invitation token' },
        { status: 400 }
      );
    }

    // Get invitation details
    const invitation = await getInvitationByToken(token);
    if (!invitation) {
      return NextResponse.json(
        { success: false, error: 'Invitation not found or expired' },
        { status: 404 }
      );
    }

    // Verify that the authenticated user's email matches the invitation email
    const userResult = await query<{ email: string; name: string }>(
      'SELECT email, name FROM users WHERE id = $1',
      [user.userId]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const userEmail = userResult.rows[0].email.toLowerCase();
    const invitationEmail = invitation.email.toLowerCase();

    if (userEmail !== invitationEmail) {
      return NextResponse.json(
        { success: false, error: 'This invitation is not for your email address' },
        { status: 403 }
      );
    }

    // Accept the invitation
    const result = await acceptInvitation(token, user.userId);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: 'Failed to accept invitation. You may already be a member.' },
        { status: 409 }
      );
    }

    // Log the actions
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    // Log invitation acceptance
    await logInvitationAction(
      'invitation_accepted',
      invitation.organization_id,
      invitation.id,
      user.userId,
      { 
        invited_email: invitation.email,
        role: invitation.role,
        organization_name: invitation.organization?.name
      },
      clientIP,
      userAgent
    );

    // Log member addition
    await logMemberAction(
      'member_joined',
      invitation.organization_id,
      user.userId,
      user.userId,
      { 
        user_name: userResult.rows[0].name,
        role: invitation.role,
        organization_name: invitation.organization?.name,
        joined_via: 'invitation'
      },
      clientIP,
      userAgent
    );

    return NextResponse.json({
      success: true,
      data: { 
        member: result.member,
        organization: invitation.organization
      },
      message: 'Invitation accepted successfully'
    });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to accept invitation' },
      { status: 500 }
    );
  }
}
