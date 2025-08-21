import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { 
  getOrganizationMembers,
  checkUserPermission,
  createInvitation,
  getOrganizationById
} from '@/lib/organization-db';
import { logMemberAction, logInvitationAction, notifyInvitation } from '@/lib/audit-utils';
import { InviteMemberData } from '@/types/database';
import { query } from '@/lib/db';

// GET /api/organizations/[id]/members - Get organization members
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

    // Check if user has access to this organization
    const permission = await checkUserPermission(organizationId, user.userId);
    if (!permission.hasAccess) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    const members = await getOrganizationMembers(organizationId);

    return NextResponse.json({
      success: true,
      data: { members }
    });
  } catch (error) {
    console.error('Error fetching organization members:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch organization members' },
      { status: 500 }
    );
  }
}

// POST /api/organizations/[id]/members - Invite new member
export async function POST(
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
        { success: false, error: 'Insufficient permissions to invite members' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, role, message } = body;

    // Validate required fields
    if (!email || !role) {
      return NextResponse.json(
        { success: false, error: 'Email and role are required' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['admin', 'member', 'viewer'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Check if user is already a member
    const existingMemberResult = await query(
      `SELECT om.id, u.name, u.email 
       FROM organization_members om 
       JOIN users u ON om.user_id = u.id 
       WHERE om.organization_id = $1 AND u.email = $2`,
      [organizationId, email]
    );

    if (existingMemberResult.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'User is already a member of this organization' },
        { status: 409 }
      );
    }

    // Check if there's already a pending invitation
    const existingInvitationResult = await query(
      'SELECT id FROM organization_invitations WHERE organization_id = $1 AND email = $2 AND status = $3',
      [organizationId, email, 'pending']
    );

    if (existingInvitationResult.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'There is already a pending invitation for this email' },
        { status: 409 }
      );
    }

    const invitationData: InviteMemberData = {
      email: email.trim().toLowerCase(),
      role,
      message: message?.trim()
    };

    const invitation = await createInvitation(organizationId, invitationData, user.userId);

    // Get organization details for notification
    const organization = await getOrganizationById(organizationId);
    if (!organization) {
      return NextResponse.json(
        { success: false, error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Get inviter details
    const inviterResult = await query<{ name: string }>(
      'SELECT name FROM users WHERE id = $1',
      [user.userId]
    );
    const inviterName = inviterResult.rows[0]?.name || 'Someone';

    // Check if the invited email belongs to an existing user
    const invitedUserResult = await query<{ id: number }>(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    // Send notification if user exists
    if (invitedUserResult.rows.length > 0) {
      const invitedUserId = invitedUserResult.rows[0].id;
      await notifyInvitation(
        invitedUserId,
        organizationId,
        organization.name,
        inviterName,
        role,
        invitation.token
      );
    }

    // Log the action
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    await logInvitationAction(
      'member_invited',
      organizationId,
      invitation.id,
      user.userId,
      { 
        invited_email: email,
        role,
        organization_name: organization.name
      },
      clientIP,
      userAgent
    );

    return NextResponse.json({
      success: true,
      data: { invitation },
      message: 'Invitation sent successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error inviting member:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send invitation' },
      { status: 500 }
    );
  }
}
