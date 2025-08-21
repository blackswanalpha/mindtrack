import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { 
  updateMemberRole,
  removeMember,
  checkUserPermission,
  getOrganizationById
} from '@/lib/organization-db';
import { logMemberAction, notifyRoleChange } from '@/lib/audit-utils';
import { UpdateMemberRoleData } from '@/types/database';
import { query } from '@/lib/db';

// PUT /api/organizations/[id]/members/[userId] - Update member role
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; userId: string } }
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
    const targetUserId = parseInt(params.userId);
    
    if (isNaN(organizationId) || isNaN(targetUserId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid organization ID or user ID' },
        { status: 400 }
      );
    }

    // Check if user has admin or owner permissions
    const permission = await checkUserPermission(organizationId, user.userId, 'admin');
    if (!permission.hasAccess) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions to update member roles' },
        { status: 403 }
      );
    }

    // Users cannot change their own role
    if (user.userId === targetUserId) {
      return NextResponse.json(
        { success: false, error: 'You cannot change your own role' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { role } = body;

    // Validate role
    const validRoles = ['owner', 'admin', 'member', 'viewer'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Check if target user is a member of the organization
    const targetMemberPermission = await checkUserPermission(organizationId, targetUserId);
    if (!targetMemberPermission.hasAccess) {
      return NextResponse.json(
        { success: false, error: 'Target user is not a member of this organization' },
        { status: 404 }
      );
    }

    // Only owners can assign owner role or change other owners
    if (role === 'owner' || targetMemberPermission.role === 'owner') {
      const ownerPermission = await checkUserPermission(organizationId, user.userId, 'owner');
      if (!ownerPermission.hasAccess) {
        return NextResponse.json(
          { success: false, error: 'Only organization owners can assign or modify owner roles' },
          { status: 403 }
        );
      }
    }

    const updateData: UpdateMemberRoleData = { role };
    const updatedMember = await updateMemberRole(organizationId, targetUserId, updateData);

    if (!updatedMember) {
      return NextResponse.json(
        { success: false, error: 'Failed to update member role' },
        { status: 500 }
      );
    }

    // Get organization and user details for notifications and logging
    const organization = await getOrganizationById(organizationId);
    const userDetailsResult = await query<{ name: string; email: string }>(
      'SELECT name, email FROM users WHERE id = $1',
      [targetUserId]
    );
    const updaterDetailsResult = await query<{ name: string }>(
      'SELECT name FROM users WHERE id = $1',
      [user.userId]
    );

    const targetUserName = userDetailsResult.rows[0]?.name || 'Unknown User';
    const updaterName = updaterDetailsResult.rows[0]?.name || 'Someone';

    // Send notification to the user whose role was changed
    if (organization) {
      await notifyRoleChange(
        targetUserId,
        organizationId,
        organization.name,
        role,
        updaterName
      );
    }

    // Log the action
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    await logMemberAction(
      'member_role_updated',
      organizationId,
      targetUserId,
      user.userId,
      { 
        target_user_name: targetUserName,
        old_role: targetMemberPermission.role,
        new_role: role,
        organization_name: organization?.name
      },
      clientIP,
      userAgent
    );

    return NextResponse.json({
      success: true,
      data: { member: updatedMember },
      message: 'Member role updated successfully'
    });
  } catch (error) {
    console.error('Error updating member role:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update member role' },
      { status: 500 }
    );
  }
}

// DELETE /api/organizations/[id]/members/[userId] - Remove member
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; userId: string } }
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
    const targetUserId = parseInt(params.userId);
    
    if (isNaN(organizationId) || isNaN(targetUserId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid organization ID or user ID' },
        { status: 400 }
      );
    }

    // Check if user has admin or owner permissions
    const permission = await checkUserPermission(organizationId, user.userId, 'admin');
    if (!permission.hasAccess) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions to remove members' },
        { status: 403 }
      );
    }

    // Check if target user is a member of the organization
    const targetMemberPermission = await checkUserPermission(organizationId, targetUserId);
    if (!targetMemberPermission.hasAccess) {
      return NextResponse.json(
        { success: false, error: 'Target user is not a member of this organization' },
        { status: 404 }
      );
    }

    // Only owners can remove other owners
    if (targetMemberPermission.role === 'owner') {
      const ownerPermission = await checkUserPermission(organizationId, user.userId, 'owner');
      if (!ownerPermission.hasAccess) {
        return NextResponse.json(
          { success: false, error: 'Only organization owners can remove other owners' },
          { status: 403 }
        );
      }
    }

    // Check if this is the last owner
    if (targetMemberPermission.role === 'owner') {
      const ownerCountResult = await query<{ count: string }>(
        'SELECT COUNT(*) as count FROM organization_members WHERE organization_id = $1 AND role = $2 AND status = $3',
        [organizationId, 'owner', 'active']
      );
      
      const ownerCount = parseInt(ownerCountResult.rows[0].count);
      if (ownerCount <= 1) {
        return NextResponse.json(
          { success: false, error: 'Cannot remove the last owner of the organization' },
          { status: 400 }
        );
      }
    }

    // Get user details for logging before removal
    const userDetailsResult = await query<{ name: string; email: string }>(
      'SELECT name, email FROM users WHERE id = $1',
      [targetUserId]
    );
    const organization = await getOrganizationById(organizationId);
    const updaterDetailsResult = await query<{ name: string }>(
      'SELECT name FROM users WHERE id = $1',
      [user.userId]
    );

    const targetUserName = userDetailsResult.rows[0]?.name || 'Unknown User';
    const updaterName = updaterDetailsResult.rows[0]?.name || 'Someone';

    const success = await removeMember(organizationId, targetUserId);
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to remove member' },
        { status: 500 }
      );
    }

    // Log the action
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    await logMemberAction(
      'member_removed',
      organizationId,
      targetUserId,
      user.userId,
      { 
        target_user_name: targetUserName,
        removed_role: targetMemberPermission.role,
        organization_name: organization?.name
      },
      clientIP,
      userAgent
    );

    return NextResponse.json({
      success: true,
      message: 'Member removed successfully'
    });
  } catch (error) {
    console.error('Error removing member:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove member' },
      { status: 500 }
    );
  }
}
