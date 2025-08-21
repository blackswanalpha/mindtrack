import { query, transaction } from './db';
import { 
  Organization, 
  OrganizationMember, 
  OrganizationInvitation, 
  CreateOrganizationData,
  UpdateOrganizationData,
  InviteMemberData,
  UpdateMemberRoleData,
  OrganizationStats,
  OrganizationWithStats
} from '@/types/database';

// Organization CRUD operations
export async function createOrganization(data: CreateOrganizationData, createdById: number): Promise<Organization> {
  const result = await transaction(async (client) => {
    // Create organization
    const orgResult = await client.query<Organization>(
      `INSERT INTO organizations (name, description, type, contact_email, contact_phone, address, logo_url, settings)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [data.name, data.description, data.type, data.contact_email, data.contact_phone, data.address, data.logo_url, data.settings]
    );

    const organization = orgResult.rows[0];

    // Add creator as owner
    await client.query(
      `INSERT INTO organization_members (organization_id, user_id, role, status)
       VALUES ($1, $2, 'owner', 'active')`,
      [organization.id, createdById]
    );

    return organization;
  });

  return result;
}

export async function getOrganizationById(id: number, userId?: number): Promise<OrganizationWithStats | null> {
  const orgResult = await query<Organization>(
    'SELECT * FROM organizations WHERE id = $1',
    [id]
  );

  if (orgResult.rows.length === 0) {
    return null;
  }

  const organization = orgResult.rows[0];

  // Get organization stats
  const statsResult = await query<OrganizationStats>(
    `SELECT 
      (SELECT COUNT(*) FROM organization_members WHERE organization_id = $1 AND status = 'active') as member_count,
      (SELECT COUNT(*) FROM questionnaires WHERE organization_id = $1) as questionnaire_count,
      (SELECT COUNT(*) FROM responses WHERE organization_id = $1) as response_count,
      (SELECT COUNT(*) FROM questionnaires WHERE organization_id = $1 AND is_active = true) as active_questionnaire_count,
      (SELECT COUNT(*) FROM audit_logs WHERE organization_id = $1 AND created_at > NOW() - INTERVAL '7 days') as recent_activity_count`,
    [id]
  );

  const stats = statsResult.rows[0];

  // Get user role if userId provided
  let userRole: string | undefined;
  let userStatus: string | undefined;
  if (userId) {
    const memberResult = await query<{ role: string; status: string }>(
      'SELECT role, status FROM organization_members WHERE organization_id = $1 AND user_id = $2',
      [id, userId]
    );
    if (memberResult.rows.length > 0) {
      userRole = memberResult.rows[0].role;
      userStatus = memberResult.rows[0].status;
    }
  }

  return {
    ...organization,
    stats,
    user_role: userRole,
    user_status: userStatus
  };
}

export async function updateOrganization(id: number, data: UpdateOrganizationData): Promise<Organization | null> {
  const fields = [];
  const values = [];
  let paramCount = 1;

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      fields.push(`${key} = $${paramCount}`);
      values.push(value);
      paramCount++;
    }
  });

  if (fields.length === 0) {
    return null;
  }

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const result = await query<Organization>(
    `UPDATE organizations SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
    values
  );

  return result.rows.length > 0 ? result.rows[0] : null;
}

export async function deleteOrganization(id: number): Promise<boolean> {
  const result = await query(
    'DELETE FROM organizations WHERE id = $1',
    [id]
  );

  return result.rowCount > 0;
}

export async function getUserOrganizations(userId: number): Promise<OrganizationWithStats[]> {
  const result = await query<OrganizationWithStats & { role: string; status: string }>(
    `SELECT 
      o.*,
      om.role as user_role,
      om.status as user_status,
      (SELECT COUNT(*) FROM organization_members WHERE organization_id = o.id AND status = 'active') as member_count,
      (SELECT COUNT(*) FROM questionnaires WHERE organization_id = o.id) as questionnaire_count,
      (SELECT COUNT(*) FROM responses WHERE organization_id = o.id) as response_count,
      (SELECT COUNT(*) FROM questionnaires WHERE organization_id = o.id AND is_active = true) as active_questionnaire_count,
      (SELECT COUNT(*) FROM audit_logs WHERE organization_id = o.id AND created_at > NOW() - INTERVAL '7 days') as recent_activity_count
     FROM organizations o
     JOIN organization_members om ON o.id = om.organization_id
     WHERE om.user_id = $1 AND om.status = 'active'
     ORDER BY o.name`,
    [userId]
  );

  return result.rows.map(row => ({
    id: row.id,
    name: row.name,
    description: row.description,
    type: row.type,
    contact_email: row.contact_email,
    contact_phone: row.contact_phone,
    address: row.address,
    logo_url: row.logo_url,
    settings: row.settings,
    created_at: row.created_at,
    updated_at: row.updated_at,
    stats: {
      member_count: row.member_count,
      questionnaire_count: row.questionnaire_count,
      response_count: row.response_count,
      active_questionnaire_count: row.active_questionnaire_count,
      recent_activity_count: row.recent_activity_count
    },
    user_role: row.user_role,
    user_status: row.user_status
  }));
}

// Member management operations
export async function getOrganizationMembers(organizationId: number): Promise<OrganizationMember[]> {
  const result = await query<OrganizationMember & { user_name: string; user_email: string; user_profile_image?: string }>(
    `SELECT 
      om.*,
      u.name as user_name,
      u.email as user_email,
      u.profile_image as user_profile_image
     FROM organization_members om
     JOIN users u ON om.user_id = u.id
     WHERE om.organization_id = $1
     ORDER BY om.role, u.name`,
    [organizationId]
  );

  return result.rows.map(row => ({
    id: row.id,
    organization_id: row.organization_id,
    user_id: row.user_id,
    role: row.role,
    status: row.status,
    joined_at: row.joined_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
    user: {
      id: row.user_id,
      name: row.user_name,
      email: row.user_email,
      profile_image: row.user_profile_image
    }
  }));
}

export async function updateMemberRole(organizationId: number, userId: number, data: UpdateMemberRoleData): Promise<OrganizationMember | null> {
  const result = await query<OrganizationMember>(
    `UPDATE organization_members 
     SET role = $1, updated_at = NOW()
     WHERE organization_id = $2 AND user_id = $3
     RETURNING *`,
    [data.role, organizationId, userId]
  );

  return result.rows.length > 0 ? result.rows[0] : null;
}

export async function removeMember(organizationId: number, userId: number): Promise<boolean> {
  const result = await query(
    'DELETE FROM organization_members WHERE organization_id = $1 AND user_id = $2',
    [organizationId, userId]
  );

  return result.rowCount > 0;
}

export async function checkUserPermission(organizationId: number, userId: number, requiredRole?: string): Promise<{ hasAccess: boolean; role?: string; status?: string }> {
  const result = await query<{ role: string; status: string }>(
    'SELECT role, status FROM organization_members WHERE organization_id = $1 AND user_id = $2',
    [organizationId, userId]
  );

  if (result.rows.length === 0) {
    return { hasAccess: false };
  }

  const { role, status } = result.rows[0];

  if (status !== 'active') {
    return { hasAccess: false, role, status };
  }

  if (requiredRole) {
    const roleHierarchy = ['viewer', 'member', 'admin', 'owner'];
    const userRoleIndex = roleHierarchy.indexOf(role);
    const requiredRoleIndex = roleHierarchy.indexOf(requiredRole);

    if (userRoleIndex < requiredRoleIndex) {
      return { hasAccess: false, role, status };
    }
  }

  return { hasAccess: true, role, status };
}

// Invitation management operations
export async function createInvitation(organizationId: number, data: InviteMemberData, invitedById: number): Promise<OrganizationInvitation> {
  // Generate unique token
  const token = generateInvitationToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

  const result = await query<OrganizationInvitation>(
    `INSERT INTO organization_invitations (organization_id, email, role, token, invited_by_id, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [organizationId, data.email, data.role, token, invitedById, expiresAt.toISOString()]
  );

  return result.rows[0];
}

export async function getOrganizationInvitations(organizationId: number): Promise<OrganizationInvitation[]> {
  const result = await query<OrganizationInvitation & { invited_by_name: string; invited_by_email: string }>(
    `SELECT
      oi.*,
      u.name as invited_by_name,
      u.email as invited_by_email
     FROM organization_invitations oi
     JOIN users u ON oi.invited_by_id = u.id
     WHERE oi.organization_id = $1
     ORDER BY oi.created_at DESC`,
    [organizationId]
  );

  return result.rows.map(row => ({
    id: row.id,
    organization_id: row.organization_id,
    email: row.email,
    role: row.role,
    token: row.token,
    status: row.status,
    invited_by_id: row.invited_by_id,
    expires_at: row.expires_at,
    accepted_at: row.accepted_at,
    accepted_by_id: row.accepted_by_id,
    created_at: row.created_at,
    updated_at: row.updated_at,
    invited_by: {
      id: row.invited_by_id,
      name: row.invited_by_name,
      email: row.invited_by_email
    }
  }));
}

export async function getInvitationByToken(token: string): Promise<OrganizationInvitation | null> {
  const result = await query<OrganizationInvitation & { organization_name: string }>(
    `SELECT
      oi.*,
      o.name as organization_name
     FROM organization_invitations oi
     JOIN organizations o ON oi.organization_id = o.id
     WHERE oi.token = $1 AND oi.status = 'pending' AND oi.expires_at > NOW()`,
    [token]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    ...row,
    organization: {
      id: row.organization_id,
      name: row.organization_name
    }
  };
}

export async function acceptInvitation(token: string, userId: number): Promise<{ success: boolean; member?: OrganizationMember }> {
  return await transaction(async (client) => {
    // Get invitation
    const invitationResult = await client.query<OrganizationInvitation>(
      'SELECT * FROM organization_invitations WHERE token = $1 AND status = $2 AND expires_at > NOW()',
      [token, 'pending']
    );

    if (invitationResult.rows.length === 0) {
      return { success: false };
    }

    const invitation = invitationResult.rows[0];

    // Check if user is already a member
    const existingMemberResult = await client.query(
      'SELECT id FROM organization_members WHERE organization_id = $1 AND user_id = $2',
      [invitation.organization_id, userId]
    );

    if (existingMemberResult.rows.length > 0) {
      return { success: false };
    }

    // Add user as member
    const memberResult = await client.query<OrganizationMember>(
      `INSERT INTO organization_members (organization_id, user_id, role, status)
       VALUES ($1, $2, $3, 'active')
       RETURNING *`,
      [invitation.organization_id, userId, invitation.role]
    );

    // Update invitation status
    await client.query(
      `UPDATE organization_invitations
       SET status = 'accepted', accepted_at = NOW(), accepted_by_id = $1, updated_at = NOW()
       WHERE id = $2`,
      [userId, invitation.id]
    );

    return { success: true, member: memberResult.rows[0] };
  });
}

export async function cancelInvitation(invitationId: number): Promise<boolean> {
  const result = await query(
    `UPDATE organization_invitations
     SET status = 'cancelled', updated_at = NOW()
     WHERE id = $1 AND status = 'pending'`,
    [invitationId]
  );

  return result.rowCount > 0;
}

// Utility functions
function generateInvitationToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
