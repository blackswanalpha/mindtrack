import { 
  createOrganization,
  updateOrganization,
  deleteOrganization,
  getUserOrganizations,
  getOrganizationById,
  getOrganizationMembers,
  updateMemberRole,
  removeMember,
  createInvitation,
  getOrganizationInvitations,
  acceptInvitation,
  cancelInvitation,
  checkUserPermission
} from './organization-db';
import { 
  logOrganizationAction,
  logMemberAction,
  logInvitationAction,
  notifyInvitation,
  notifyRoleChange,
  createNotification
} from './audit-utils';
import { sendInvitationEmail, sendRoleChangeEmail } from './email-service';
import { 
  CreateOrganizationData,
  UpdateOrganizationData,
  InviteMemberData,
  UpdateMemberRoleData,
  OrganizationWithStats,
  OrganizationMember,
  OrganizationInvitation
} from '@/types/database';
import { query } from './db';

export class OrganizationService {
  // Organization management
  static async createOrganization(
    data: CreateOrganizationData, 
    createdById: number,
    clientIP?: string,
    userAgent?: string
  ): Promise<OrganizationWithStats> {
    const organization = await createOrganization(data, createdById);
    
    // Log the action
    await logOrganizationAction(
      'organization_created',
      organization.id,
      createdById,
      { organization_name: organization.name },
      clientIP,
      userAgent
    );

    // Get organization with stats
    const orgWithStats = await getOrganizationById(organization.id, createdById);
    if (!orgWithStats) {
      throw new Error('Failed to retrieve created organization');
    }

    return orgWithStats;
  }

  static async updateOrganization(
    organizationId: number,
    data: UpdateOrganizationData,
    updatedById: number,
    clientIP?: string,
    userAgent?: string
  ): Promise<OrganizationWithStats> {
    // Check permissions
    const permission = await checkUserPermission(organizationId, updatedById, 'admin');
    if (!permission.hasAccess) {
      throw new Error('Insufficient permissions to update organization');
    }

    const organization = await updateOrganization(organizationId, data);
    if (!organization) {
      throw new Error('Organization not found');
    }

    // Log the action
    await logOrganizationAction(
      'organization_updated',
      organizationId,
      updatedById,
      { 
        organization_name: organization.name,
        updated_fields: Object.keys(data)
      },
      clientIP,
      userAgent
    );

    // Notify organization members about the update
    const members = await getOrganizationMembers(organizationId);
    const updaterResult = await query<{ name: string }>(
      'SELECT name FROM users WHERE id = $1',
      [updatedById]
    );
    const updaterName = updaterResult.rows[0]?.name || 'Someone';

    // Send notifications to all active members except the updater
    const notificationPromises = members
      .filter(member => member.user_id !== updatedById && member.status === 'active')
      .map(member => 
        createNotification({
          user_id: member.user_id,
          organization_id: organizationId,
          title: `${organization.name} updated`,
          message: `Organization settings have been updated by ${updaterName}.`,
          type: 'organization_update',
          entity_type: 'organization',
          entity_id: organizationId
        })
      );

    await Promise.all(notificationPromises);

    // Get organization with stats
    const orgWithStats = await getOrganizationById(organizationId, updatedById);
    if (!orgWithStats) {
      throw new Error('Failed to retrieve updated organization');
    }

    return orgWithStats;
  }

  static async deleteOrganization(
    organizationId: number,
    deletedById: number,
    clientIP?: string,
    userAgent?: string
  ): Promise<void> {
    // Check permissions - only owners can delete
    const permission = await checkUserPermission(organizationId, deletedById, 'owner');
    if (!permission.hasAccess) {
      throw new Error('Only organization owners can delete organizations');
    }

    // Get organization details for logging
    const organization = await getOrganizationById(organizationId);
    if (!organization) {
      throw new Error('Organization not found');
    }

    const success = await deleteOrganization(organizationId);
    if (!success) {
      throw new Error('Failed to delete organization');
    }

    // Log the action
    await logOrganizationAction(
      'organization_deleted',
      organizationId,
      deletedById,
      { organization_name: organization.name },
      clientIP,
      userAgent
    );
  }

  // Member management
  static async inviteMember(
    organizationId: number,
    data: InviteMemberData,
    invitedById: number,
    clientIP?: string,
    userAgent?: string
  ): Promise<OrganizationInvitation> {
    // Check permissions
    const permission = await checkUserPermission(organizationId, invitedById, 'admin');
    if (!permission.hasAccess) {
      throw new Error('Insufficient permissions to invite members');
    }

    // Check if user is already a member
    const existingMemberResult = await query(
      `SELECT om.id FROM organization_members om 
       JOIN users u ON om.user_id = u.id 
       WHERE om.organization_id = $1 AND u.email = $2`,
      [organizationId, data.email]
    );

    if (existingMemberResult.rows.length > 0) {
      throw new Error('User is already a member of this organization');
    }

    // Check for existing pending invitation
    const existingInvitationResult = await query(
      'SELECT id FROM organization_invitations WHERE organization_id = $1 AND email = $2 AND status = $3',
      [organizationId, data.email, 'pending']
    );

    if (existingInvitationResult.rows.length > 0) {
      throw new Error('There is already a pending invitation for this email');
    }

    const invitation = await createInvitation(organizationId, data, invitedById);

    // Get organization and inviter details
    const organization = await getOrganizationById(organizationId);
    const inviterResult = await query<{ name: string }>(
      'SELECT name FROM users WHERE id = $1',
      [invitedById]
    );
    const inviterName = inviterResult.rows[0]?.name || 'Someone';

    // Check if invited email belongs to existing user
    const invitedUserResult = await query<{ id: number }>(
      'SELECT id FROM users WHERE email = $1',
      [data.email]
    );

    // Send in-app notification if user exists
    if (invitedUserResult.rows.length > 0 && organization) {
      const invitedUserId = invitedUserResult.rows[0].id;
      await notifyInvitation(
        invitedUserId,
        organizationId,
        organization.name,
        inviterName,
        data.role,
        invitation.token
      );
    }

    // Send email invitation
    if (organization) {
      const invitationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invitations/${invitation.token}`;
      await sendInvitationEmail(
        {
          ...invitation,
          organization: { name: organization.name },
          invited_by: { name: inviterName }
        },
        invitationUrl,
        data.message
      );
    }

    // Log the action
    await logInvitationAction(
      'member_invited',
      organizationId,
      invitation.id,
      invitedById,
      { 
        invited_email: data.email,
        role: data.role,
        organization_name: organization?.name
      },
      clientIP,
      userAgent
    );

    return invitation;
  }

  static async updateMemberRole(
    organizationId: number,
    targetUserId: number,
    data: UpdateMemberRoleData,
    updatedById: number,
    clientIP?: string,
    userAgent?: string
  ): Promise<OrganizationMember> {
    // Check permissions
    const permission = await checkUserPermission(organizationId, updatedById, 'admin');
    if (!permission.hasAccess) {
      throw new Error('Insufficient permissions to update member roles');
    }

    // Users cannot change their own role
    if (updatedById === targetUserId) {
      throw new Error('You cannot change your own role');
    }

    // Check target user membership
    const targetPermission = await checkUserPermission(organizationId, targetUserId);
    if (!targetPermission.hasAccess) {
      throw new Error('Target user is not a member of this organization');
    }

    // Only owners can assign owner role or change other owners
    if (data.role === 'owner' || targetPermission.role === 'owner') {
      const ownerPermission = await checkUserPermission(organizationId, updatedById, 'owner');
      if (!ownerPermission.hasAccess) {
        throw new Error('Only organization owners can assign or modify owner roles');
      }
    }

    const updatedMember = await updateMemberRole(organizationId, targetUserId, data);
    if (!updatedMember) {
      throw new Error('Failed to update member role');
    }

    // Get details for notifications and logging
    const organization = await getOrganizationById(organizationId);
    const userDetailsResult = await query<{ name: string; email: string }>(
      'SELECT name, email FROM users WHERE id = $1',
      [targetUserId]
    );
    const updaterDetailsResult = await query<{ name: string }>(
      'SELECT name FROM users WHERE id = $1',
      [updatedById]
    );

    const targetUserName = userDetailsResult.rows[0]?.name || 'Unknown User';
    const targetUserEmail = userDetailsResult.rows[0]?.email;
    const updaterName = updaterDetailsResult.rows[0]?.name || 'Someone';

    // Send notifications
    if (organization) {
      await notifyRoleChange(
        targetUserId,
        organizationId,
        organization.name,
        data.role,
        updaterName
      );

      // Send email notification
      if (targetUserEmail) {
        const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`;
        await sendRoleChangeEmail(
          targetUserEmail,
          organization.name,
          data.role,
          updaterName,
          dashboardUrl
        );
      }
    }

    // Log the action
    await logMemberAction(
      'member_role_updated',
      organizationId,
      targetUserId,
      updatedById,
      { 
        target_user_name: targetUserName,
        old_role: targetPermission.role,
        new_role: data.role,
        organization_name: organization?.name
      },
      clientIP,
      userAgent
    );

    return updatedMember;
  }

  static async removeMember(
    organizationId: number,
    targetUserId: number,
    removedById: number,
    clientIP?: string,
    userAgent?: string
  ): Promise<void> {
    // Check permissions
    const permission = await checkUserPermission(organizationId, removedById, 'admin');
    if (!permission.hasAccess) {
      throw new Error('Insufficient permissions to remove members');
    }

    // Check target user membership
    const targetPermission = await checkUserPermission(organizationId, targetUserId);
    if (!targetPermission.hasAccess) {
      throw new Error('Target user is not a member of this organization');
    }

    // Only owners can remove other owners
    if (targetPermission.role === 'owner') {
      const ownerPermission = await checkUserPermission(organizationId, removedById, 'owner');
      if (!ownerPermission.hasAccess) {
        throw new Error('Only organization owners can remove other owners');
      }

      // Check if this is the last owner
      const ownerCountResult = await query<{ count: string }>(
        'SELECT COUNT(*) as count FROM organization_members WHERE organization_id = $1 AND role = $2 AND status = $3',
        [organizationId, 'owner', 'active']
      );
      
      const ownerCount = parseInt(ownerCountResult.rows[0].count);
      if (ownerCount <= 1) {
        throw new Error('Cannot remove the last owner of the organization');
      }
    }

    // Get details for logging before removal
    const organization = await getOrganizationById(organizationId);
    const userDetailsResult = await query<{ name: string }>(
      'SELECT name FROM users WHERE id = $1',
      [targetUserId]
    );
    const targetUserName = userDetailsResult.rows[0]?.name || 'Unknown User';

    const success = await removeMember(organizationId, targetUserId);
    if (!success) {
      throw new Error('Failed to remove member');
    }

    // Log the action
    await logMemberAction(
      'member_removed',
      organizationId,
      targetUserId,
      removedById,
      { 
        target_user_name: targetUserName,
        removed_role: targetPermission.role,
        organization_name: organization?.name
      },
      clientIP,
      userAgent
    );
  }

  // Invitation management
  static async acceptInvitation(
    token: string,
    userId: number,
    clientIP?: string,
    userAgent?: string
  ): Promise<{ member: OrganizationMember; organization: any }> {
    // Get invitation details
    const invitation = await getInvitationByToken(token);
    if (!invitation) {
      throw new Error('Invitation not found or expired');
    }

    // Verify user email matches invitation
    const userResult = await query<{ email: string; name: string }>(
      'SELECT email, name FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      throw new Error('User not found');
    }

    const userEmail = userResult.rows[0].email.toLowerCase();
    const invitationEmail = invitation.email.toLowerCase();

    if (userEmail !== invitationEmail) {
      throw new Error('This invitation is not for your email address');
    }

    // Accept the invitation
    const result = await acceptInvitation(token, userId);
    if (!result.success || !result.member) {
      throw new Error('Failed to accept invitation. You may already be a member.');
    }

    // Log the actions
    await logInvitationAction(
      'invitation_accepted',
      invitation.organization_id,
      invitation.id,
      userId,
      { 
        invited_email: invitation.email,
        role: invitation.role,
        organization_name: invitation.organization?.name
      },
      clientIP,
      userAgent
    );

    await logMemberAction(
      'member_joined',
      invitation.organization_id,
      userId,
      userId,
      { 
        user_name: userResult.rows[0].name,
        role: invitation.role,
        organization_name: invitation.organization?.name,
        joined_via: 'invitation'
      },
      clientIP,
      userAgent
    );

    return {
      member: result.member,
      organization: invitation.organization
    };
  }

  static async cancelInvitation(
    invitationId: number,
    cancelledById: number,
    clientIP?: string,
    userAgent?: string
  ): Promise<void> {
    // Get invitation details
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
      throw new Error('Invitation not found');
    }

    const invitation = invitationResult.rows[0];

    // Check permissions
    const permission = await checkUserPermission(invitation.organization_id, cancelledById, 'admin');
    if (!permission.hasAccess) {
      throw new Error('Insufficient permissions to cancel invitations');
    }

    if (invitation.status !== 'pending') {
      throw new Error('Only pending invitations can be cancelled');
    }

    const success = await cancelInvitation(invitationId);
    if (!success) {
      throw new Error('Failed to cancel invitation');
    }

    // Log the action
    await logInvitationAction(
      'invitation_cancelled',
      invitation.organization_id,
      invitationId,
      cancelledById,
      { 
        invited_email: invitation.email,
        role: invitation.role,
        organization_name: invitation.organization_name
      },
      clientIP,
      userAgent
    );
  }
}
