import { query } from './db';
import { AuditLog, Notification, CreateAuditLogData, CreateNotificationData } from '@/types/database';

// Audit logging functions
export async function createAuditLog(data: CreateAuditLogData): Promise<AuditLog> {
  const result = await query<AuditLog>(
    `INSERT INTO audit_logs (user_id, organization_id, action, entity_type, entity_id, details, ip_address, user_agent)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [data.user_id, data.organization_id, data.action, data.entity_type, data.entity_id, data.details, data.ip_address, data.user_agent]
  );

  return result.rows[0];
}

export async function getAuditLogs(organizationId?: number, userId?: number, limit: number = 50, offset: number = 0): Promise<AuditLog[]> {
  let whereClause = '';
  const params: any[] = [];
  let paramCount = 1;

  if (organizationId) {
    whereClause += `WHERE organization_id = $${paramCount}`;
    params.push(organizationId);
    paramCount++;
  }

  if (userId) {
    whereClause += whereClause ? ` AND user_id = $${paramCount}` : `WHERE user_id = $${paramCount}`;
    params.push(userId);
    paramCount++;
  }

  params.push(limit, offset);

  const result = await query<AuditLog & { user_name?: string; user_email?: string; organization_name?: string }>(
    `SELECT 
      al.*,
      u.name as user_name,
      u.email as user_email,
      o.name as organization_name
     FROM audit_logs al
     LEFT JOIN users u ON al.user_id = u.id
     LEFT JOIN organizations o ON al.organization_id = o.id
     ${whereClause}
     ORDER BY al.created_at DESC
     LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
    params
  );

  return result.rows.map(row => ({
    id: row.id,
    user_id: row.user_id,
    organization_id: row.organization_id,
    action: row.action,
    entity_type: row.entity_type,
    entity_id: row.entity_id,
    details: row.details,
    ip_address: row.ip_address,
    user_agent: row.user_agent,
    created_at: row.created_at,
    user: row.user_name ? {
      id: row.user_id!,
      name: row.user_name,
      email: row.user_email!
    } : undefined,
    organization: row.organization_name ? {
      id: row.organization_id!,
      name: row.organization_name
    } : undefined
  }));
}

// Notification functions
export async function createNotification(data: CreateNotificationData): Promise<Notification> {
  const result = await query<Notification>(
    `INSERT INTO notifications (user_id, organization_id, title, message, type, entity_type, entity_id, action_url, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [data.user_id, data.organization_id, data.title, data.message, data.type, data.entity_type, data.entity_id, data.action_url, data.expires_at]
  );

  return result.rows[0];
}

export async function getUserNotifications(userId: number, unreadOnly: boolean = false, limit: number = 50, offset: number = 0): Promise<Notification[]> {
  let whereClause = 'WHERE user_id = $1';
  const params: any[] = [userId];
  let paramCount = 2;

  if (unreadOnly) {
    whereClause += ` AND is_read = false`;
  }

  // Filter out expired notifications
  whereClause += ` AND (expires_at IS NULL OR expires_at > NOW())`;

  params.push(limit, offset);

  const result = await query<Notification>(
    `SELECT * FROM notifications
     ${whereClause}
     ORDER BY created_at DESC
     LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
    params
  );

  return result.rows;
}

export async function markNotificationAsRead(notificationId: number, userId: number): Promise<boolean> {
  const result = await query(
    `UPDATE notifications 
     SET is_read = true, read_at = NOW()
     WHERE id = $1 AND user_id = $2`,
    [notificationId, userId]
  );

  return result.rowCount > 0;
}

export async function markAllNotificationsAsRead(userId: number, organizationId?: number): Promise<number> {
  let whereClause = 'WHERE user_id = $1 AND is_read = false';
  const params: any[] = [userId];
  let paramCount = 2;

  if (organizationId) {
    whereClause += ` AND organization_id = $${paramCount}`;
    params.push(organizationId);
  }

  const result = await query(
    `UPDATE notifications 
     SET is_read = true, read_at = NOW()
     ${whereClause}`,
    params
  );

  return result.rowCount;
}

export async function deleteNotification(notificationId: number, userId: number): Promise<boolean> {
  const result = await query(
    'DELETE FROM notifications WHERE id = $1 AND user_id = $2',
    [notificationId, userId]
  );

  return result.rowCount > 0;
}

export async function getUnreadNotificationCount(userId: number, organizationId?: number): Promise<number> {
  let whereClause = 'WHERE user_id = $1 AND is_read = false';
  const params: any[] = [userId];
  let paramCount = 2;

  if (organizationId) {
    whereClause += ` AND organization_id = $${paramCount}`;
    params.push(organizationId);
  }

  // Filter out expired notifications
  whereClause += ` AND (expires_at IS NULL OR expires_at > NOW())`;

  const result = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM notifications ${whereClause}`,
    params
  );

  return parseInt(result.rows[0].count);
}

// Utility functions for common audit actions
export async function logOrganizationAction(
  action: string,
  organizationId: number,
  userId?: number,
  details?: any,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await createAuditLog({
    user_id: userId,
    organization_id: organizationId,
    action,
    entity_type: 'organization',
    entity_id: organizationId,
    details,
    ip_address: ipAddress,
    user_agent: userAgent
  });
}

export async function logMemberAction(
  action: string,
  organizationId: number,
  targetUserId: number,
  performedByUserId?: number,
  details?: any,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await createAuditLog({
    user_id: performedByUserId,
    organization_id: organizationId,
    action,
    entity_type: 'organization_member',
    entity_id: targetUserId,
    details,
    ip_address: ipAddress,
    user_agent: userAgent
  });
}

export async function logInvitationAction(
  action: string,
  organizationId: number,
  invitationId: number,
  performedByUserId?: number,
  details?: any,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await createAuditLog({
    user_id: performedByUserId,
    organization_id: organizationId,
    action,
    entity_type: 'organization_invitation',
    entity_id: invitationId,
    details,
    ip_address: ipAddress,
    user_agent: userAgent
  });
}

// Utility functions for common notifications
export async function notifyInvitation(
  userId: number,
  organizationId: number,
  organizationName: string,
  inviterName: string,
  role: string,
  invitationToken: string
): Promise<void> {
  await createNotification({
    user_id: userId,
    organization_id: organizationId,
    title: `Invitation to join ${organizationName}`,
    message: `${inviterName} has invited you to join ${organizationName} as a ${role}.`,
    type: 'invitation',
    entity_type: 'organization_invitation',
    action_url: `/invitations/${invitationToken}`,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
  });
}

export async function notifyRoleChange(
  userId: number,
  organizationId: number,
  organizationName: string,
  newRole: string,
  changedByName: string
): Promise<void> {
  await createNotification({
    user_id: userId,
    organization_id: organizationId,
    title: `Role updated in ${organizationName}`,
    message: `Your role in ${organizationName} has been updated to ${newRole} by ${changedByName}.`,
    type: 'role_change',
    entity_type: 'organization_member'
  });
}

export async function notifyOrganizationUpdate(
  userIds: number[],
  organizationId: number,
  organizationName: string,
  updateType: string,
  updatedByName: string
): Promise<void> {
  const notifications = userIds.map(userId => 
    createNotification({
      user_id: userId,
      organization_id: organizationId,
      title: `${organizationName} updated`,
      message: `${organizationName} ${updateType} has been updated by ${updatedByName}.`,
      type: 'organization_update',
      entity_type: 'organization',
      entity_id: organizationId
    })
  );

  await Promise.all(notifications);
}
