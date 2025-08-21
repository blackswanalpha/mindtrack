import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { 
  cancelInvitation,
  checkUserPermission
} from '@/lib/organization-db';
import { logInvitationAction } from '@/lib/audit-utils';
import { query } from '@/lib/db';

// DELETE /api/organizations/invitations/[id] - Cancel invitation
export async function DELETE(
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

    const invitationId = parseInt(params.id);
    if (isNaN(invitationId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid invitation ID' },
        { status: 400 }
      );
    }

    // Get invitation details to check organization and permissions
    const invitationResult = await query<{
      id: number;
      organization_id: number;
      email: string;
      role: string;
      status: string;
      organization_name: string;
    }>(
      `SELECT 
        oi.id, oi.organization_id, oi.email, oi.role, oi.status,
        o.name as organization_name
       FROM organization_invitations oi
       JOIN organizations o ON oi.organization_id = o.id
       WHERE oi.id = $1`,
      [invitationId]
    );

    if (invitationResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invitation not found' },
        { status: 404 }
      );
    }

    const invitation = invitationResult.rows[0];

    // Check if user has admin or owner permissions for the organization
    const permission = await checkUserPermission(invitation.organization_id, user.userId, 'admin');
    if (!permission.hasAccess) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions to cancel invitations' },
        { status: 403 }
      );
    }

    // Check if invitation is still pending
    if (invitation.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: 'Only pending invitations can be cancelled' },
        { status: 400 }
      );
    }

    const success = await cancelInvitation(invitationId);
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to cancel invitation' },
        { status: 500 }
      );
    }

    // Log the action
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    await logInvitationAction(
      'invitation_cancelled',
      invitation.organization_id,
      invitationId,
      user.userId,
      { 
        invited_email: invitation.email,
        role: invitation.role,
        organization_name: invitation.organization_name
      },
      clientIP,
      userAgent
    );

    return NextResponse.json({
      success: true,
      message: 'Invitation cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling invitation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to cancel invitation' },
      { status: 500 }
    );
  }
}
