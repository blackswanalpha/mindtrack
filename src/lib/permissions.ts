import { checkUserPermission } from './organization-db';

// Role hierarchy (higher index = more permissions)
export const ROLE_HIERARCHY = ['viewer', 'member', 'admin', 'owner'] as const;
export type OrganizationRole = typeof ROLE_HIERARCHY[number];

// Permission definitions
export const PERMISSIONS = {
  // Organization permissions
  ORGANIZATION_VIEW: 'organization:view',
  ORGANIZATION_UPDATE: 'organization:update',
  ORGANIZATION_DELETE: 'organization:delete',
  ORGANIZATION_SETTINGS: 'organization:settings',

  // Member permissions
  MEMBER_VIEW: 'member:view',
  MEMBER_INVITE: 'member:invite',
  MEMBER_UPDATE_ROLE: 'member:update_role',
  MEMBER_REMOVE: 'member:remove',

  // Questionnaire permissions
  QUESTIONNAIRE_VIEW: 'questionnaire:view',
  QUESTIONNAIRE_CREATE: 'questionnaire:create',
  QUESTIONNAIRE_UPDATE: 'questionnaire:update',
  QUESTIONNAIRE_DELETE: 'questionnaire:delete',
  QUESTIONNAIRE_PUBLISH: 'questionnaire:publish',

  // Response permissions
  RESPONSE_VIEW: 'response:view',
  RESPONSE_VIEW_ALL: 'response:view_all',
  RESPONSE_EXPORT: 'response:export',
  RESPONSE_DELETE: 'response:delete',

  // Analytics permissions
  ANALYTICS_VIEW: 'analytics:view',
  ANALYTICS_EXPORT: 'analytics:export',

  // Invitation permissions
  INVITATION_VIEW: 'invitation:view',
  INVITATION_CANCEL: 'invitation:cancel',

  // Audit permissions
  AUDIT_VIEW: 'audit:view'
} as const;

// Role-based permission mapping
export const ROLE_PERMISSIONS: Record<OrganizationRole, string[]> = {
  viewer: [
    PERMISSIONS.ORGANIZATION_VIEW,
    PERMISSIONS.MEMBER_VIEW,
    PERMISSIONS.QUESTIONNAIRE_VIEW,
    PERMISSIONS.RESPONSE_VIEW,
    PERMISSIONS.ANALYTICS_VIEW
  ],
  member: [
    PERMISSIONS.ORGANIZATION_VIEW,
    PERMISSIONS.MEMBER_VIEW,
    PERMISSIONS.QUESTIONNAIRE_VIEW,
    PERMISSIONS.QUESTIONNAIRE_CREATE,
    PERMISSIONS.QUESTIONNAIRE_UPDATE,
    PERMISSIONS.RESPONSE_VIEW,
    PERMISSIONS.RESPONSE_VIEW_ALL,
    PERMISSIONS.ANALYTICS_VIEW
  ],
  admin: [
    PERMISSIONS.ORGANIZATION_VIEW,
    PERMISSIONS.ORGANIZATION_UPDATE,
    PERMISSIONS.ORGANIZATION_SETTINGS,
    PERMISSIONS.MEMBER_VIEW,
    PERMISSIONS.MEMBER_INVITE,
    PERMISSIONS.MEMBER_UPDATE_ROLE,
    PERMISSIONS.MEMBER_REMOVE,
    PERMISSIONS.QUESTIONNAIRE_VIEW,
    PERMISSIONS.QUESTIONNAIRE_CREATE,
    PERMISSIONS.QUESTIONNAIRE_UPDATE,
    PERMISSIONS.QUESTIONNAIRE_DELETE,
    PERMISSIONS.QUESTIONNAIRE_PUBLISH,
    PERMISSIONS.RESPONSE_VIEW,
    PERMISSIONS.RESPONSE_VIEW_ALL,
    PERMISSIONS.RESPONSE_EXPORT,
    PERMISSIONS.RESPONSE_DELETE,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.ANALYTICS_EXPORT,
    PERMISSIONS.INVITATION_VIEW,
    PERMISSIONS.INVITATION_CANCEL,
    PERMISSIONS.AUDIT_VIEW
  ],
  owner: [
    PERMISSIONS.ORGANIZATION_VIEW,
    PERMISSIONS.ORGANIZATION_UPDATE,
    PERMISSIONS.ORGANIZATION_DELETE,
    PERMISSIONS.ORGANIZATION_SETTINGS,
    PERMISSIONS.MEMBER_VIEW,
    PERMISSIONS.MEMBER_INVITE,
    PERMISSIONS.MEMBER_UPDATE_ROLE,
    PERMISSIONS.MEMBER_REMOVE,
    PERMISSIONS.QUESTIONNAIRE_VIEW,
    PERMISSIONS.QUESTIONNAIRE_CREATE,
    PERMISSIONS.QUESTIONNAIRE_UPDATE,
    PERMISSIONS.QUESTIONNAIRE_DELETE,
    PERMISSIONS.QUESTIONNAIRE_PUBLISH,
    PERMISSIONS.RESPONSE_VIEW,
    PERMISSIONS.RESPONSE_VIEW_ALL,
    PERMISSIONS.RESPONSE_EXPORT,
    PERMISSIONS.RESPONSE_DELETE,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.ANALYTICS_EXPORT,
    PERMISSIONS.INVITATION_VIEW,
    PERMISSIONS.INVITATION_CANCEL,
    PERMISSIONS.AUDIT_VIEW
  ]
};

// Permission checking utilities
export class PermissionChecker {
  private organizationId: number;
  private userId: number;
  private userRole?: OrganizationRole;
  private userStatus?: string;

  constructor(organizationId: number, userId: number) {
    this.organizationId = organizationId;
    this.userId = userId;
  }

  // Initialize user permissions (call this once)
  async initialize(): Promise<void> {
    const permission = await checkUserPermission(this.organizationId, this.userId);
    if (permission.hasAccess && permission.role) {
      this.userRole = permission.role as OrganizationRole;
      this.userStatus = permission.status;
    }
  }

  // Check if user has a specific permission
  hasPermission(permission: string): boolean {
    if (!this.userRole || this.userStatus !== 'active') {
      return false;
    }

    return ROLE_PERMISSIONS[this.userRole].includes(permission);
  }

  // Check if user has any of the specified permissions
  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some(permission => this.hasPermission(permission));
  }

  // Check if user has all of the specified permissions
  hasAllPermissions(permissions: string[]): boolean {
    return permissions.every(permission => this.hasPermission(permission));
  }

  // Check if user has a specific role or higher
  hasRole(role: OrganizationRole): boolean {
    if (!this.userRole || this.userStatus !== 'active') {
      return false;
    }

    const userRoleIndex = ROLE_HIERARCHY.indexOf(this.userRole);
    const requiredRoleIndex = ROLE_HIERARCHY.indexOf(role);
    
    return userRoleIndex >= requiredRoleIndex;
  }

  // Get user's role
  getRole(): OrganizationRole | undefined {
    return this.userRole;
  }

  // Get user's status
  getStatus(): string | undefined {
    return this.userStatus;
  }

  // Check if user is active
  isActive(): boolean {
    return this.userStatus === 'active';
  }

  // Get all permissions for user's role
  getAllPermissions(): string[] {
    if (!this.userRole) {
      return [];
    }

    return ROLE_PERMISSIONS[this.userRole];
  }
}

// Utility functions for common permission checks
export async function canViewOrganization(organizationId: number, userId: number): Promise<boolean> {
  const checker = new PermissionChecker(organizationId, userId);
  await checker.initialize();
  return checker.hasPermission(PERMISSIONS.ORGANIZATION_VIEW);
}

export async function canUpdateOrganization(organizationId: number, userId: number): Promise<boolean> {
  const checker = new PermissionChecker(organizationId, userId);
  await checker.initialize();
  return checker.hasPermission(PERMISSIONS.ORGANIZATION_UPDATE);
}

export async function canDeleteOrganization(organizationId: number, userId: number): Promise<boolean> {
  const checker = new PermissionChecker(organizationId, userId);
  await checker.initialize();
  return checker.hasPermission(PERMISSIONS.ORGANIZATION_DELETE);
}

export async function canInviteMembers(organizationId: number, userId: number): Promise<boolean> {
  const checker = new PermissionChecker(organizationId, userId);
  await checker.initialize();
  return checker.hasPermission(PERMISSIONS.MEMBER_INVITE);
}

export async function canUpdateMemberRoles(organizationId: number, userId: number): Promise<boolean> {
  const checker = new PermissionChecker(organizationId, userId);
  await checker.initialize();
  return checker.hasPermission(PERMISSIONS.MEMBER_UPDATE_ROLE);
}

export async function canRemoveMembers(organizationId: number, userId: number): Promise<boolean> {
  const checker = new PermissionChecker(organizationId, userId);
  await checker.initialize();
  return checker.hasPermission(PERMISSIONS.MEMBER_REMOVE);
}

export async function canCreateQuestionnaires(organizationId: number, userId: number): Promise<boolean> {
  const checker = new PermissionChecker(organizationId, userId);
  await checker.initialize();
  return checker.hasPermission(PERMISSIONS.QUESTIONNAIRE_CREATE);
}

export async function canViewAllResponses(organizationId: number, userId: number): Promise<boolean> {
  const checker = new PermissionChecker(organizationId, userId);
  await checker.initialize();
  return checker.hasPermission(PERMISSIONS.RESPONSE_VIEW_ALL);
}

export async function canViewAuditLogs(organizationId: number, userId: number): Promise<boolean> {
  const checker = new PermissionChecker(organizationId, userId);
  await checker.initialize();
  return checker.hasPermission(PERMISSIONS.AUDIT_VIEW);
}

// Role comparison utilities
export function isRoleHigherOrEqual(userRole: OrganizationRole, compareRole: OrganizationRole): boolean {
  const userRoleIndex = ROLE_HIERARCHY.indexOf(userRole);
  const compareRoleIndex = ROLE_HIERARCHY.indexOf(compareRole);
  
  return userRoleIndex >= compareRoleIndex;
}

export function getRoleDisplayName(role: OrganizationRole): string {
  const displayNames: Record<OrganizationRole, string> = {
    viewer: 'Viewer',
    member: 'Member',
    admin: 'Administrator',
    owner: 'Owner'
  };

  return displayNames[role];
}

export function getRoleDescription(role: OrganizationRole): string {
  const descriptions: Record<OrganizationRole, string> = {
    viewer: 'Can view organization data and questionnaires',
    member: 'Can create and manage questionnaires, view responses',
    admin: 'Can manage members, questionnaires, and organization settings',
    owner: 'Full control over the organization and all its resources'
  };

  return descriptions[role];
}

// Permission middleware for API routes
export async function requirePermission(
  organizationId: number,
  userId: number,
  permission: string
): Promise<void> {
  const checker = new PermissionChecker(organizationId, userId);
  await checker.initialize();
  
  if (!checker.hasPermission(permission)) {
    throw new Error(`Insufficient permissions. Required: ${permission}`);
  }
}

export async function requireRole(
  organizationId: number,
  userId: number,
  role: OrganizationRole
): Promise<void> {
  const checker = new PermissionChecker(organizationId, userId);
  await checker.initialize();
  
  if (!checker.hasRole(role)) {
    throw new Error(`Insufficient role. Required: ${role} or higher`);
  }
}
