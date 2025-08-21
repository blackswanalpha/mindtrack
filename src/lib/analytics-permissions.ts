/**
 * Analytics Access Control and Permissions System
 * Manages role-based access control for reports, dashboards, and data export
 */

export interface User {
  id: string;
  email: string;
  role: UserRole;
  organization_id?: string;
  permissions: Permission[];
}

export type UserRole = 'admin' | 'organization_admin' | 'user' | 'viewer';

export type Permission = 
  | 'analytics:view'
  | 'analytics:create'
  | 'analytics:edit'
  | 'analytics:delete'
  | 'reports:view'
  | 'reports:create'
  | 'reports:edit'
  | 'reports:delete'
  | 'reports:share'
  | 'dashboards:view'
  | 'dashboards:create'
  | 'dashboards:edit'
  | 'dashboards:delete'
  | 'dashboards:share'
  | 'data:export'
  | 'data:export_sensitive'
  | 'organization:manage'
  | 'users:manage';

export type ResourceVisibility = 'private' | 'organization' | 'public';

export interface AnalyticsResource {
  id: string;
  title: string;
  created_by: string;
  organization_id?: string;
  visibility: ResourceVisibility;
  shared_with?: string[];
  tags?: string[];
}

export interface Report extends AnalyticsResource {
  type: 'questionnaire' | 'response' | 'user' | 'organization' | 'custom';
  data_sources: string[];
  format: 'pdf' | 'csv' | 'excel' | 'json';
}

export interface Dashboard extends AnalyticsResource {
  layout: 'grid' | 'masonry' | 'flow';
  widgets: string[];
}

// Role-based permission mappings
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'analytics:view',
    'analytics:create',
    'analytics:edit',
    'analytics:delete',
    'reports:view',
    'reports:create',
    'reports:edit',
    'reports:delete',
    'reports:share',
    'dashboards:view',
    'dashboards:create',
    'dashboards:edit',
    'dashboards:delete',
    'dashboards:share',
    'data:export',
    'data:export_sensitive',
    'organization:manage',
    'users:manage'
  ],
  organization_admin: [
    'analytics:view',
    'analytics:create',
    'analytics:edit',
    'reports:view',
    'reports:create',
    'reports:edit',
    'reports:share',
    'dashboards:view',
    'dashboards:create',
    'dashboards:edit',
    'dashboards:share',
    'data:export'
  ],
  user: [
    'analytics:view',
    'analytics:create',
    'reports:view',
    'reports:create',
    'dashboards:view',
    'dashboards:create',
    'data:export'
  ],
  viewer: [
    'analytics:view',
    'reports:view',
    'dashboards:view'
  ]
};

export class AnalyticsPermissionManager {
  /**
   * Check if user has a specific permission
   */
  static hasPermission(user: User, permission: Permission): boolean {
    const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
    return rolePermissions.includes(permission) || user.permissions.includes(permission);
  }

  /**
   * Check if user can access a specific resource
   */
  static canAccessResource<T extends AnalyticsResource>(
    user: User, 
    resource: T, 
    action: 'view' | 'edit' | 'delete' | 'share'
  ): boolean {
    // Admin can access everything
    if (user.role === 'admin') {
      return true;
    }

    // Check if user is the owner
    if (resource.created_by === user.id) {
      return true;
    }

    // Check visibility rules
    switch (resource.visibility) {
      case 'public':
        return action === 'view' || this.hasPermission(user, `${this.getResourceType(resource)}:${action}` as Permission);
      
      case 'organization':
        if (user.organization_id === resource.organization_id) {
          return action === 'view' || this.hasPermission(user, `${this.getResourceType(resource)}:${action}` as Permission);
        }
        return false;
      
      case 'private':
        // Check if explicitly shared with user
        if (resource.shared_with?.includes(user.id)) {
          return action === 'view';
        }
        return false;
      
      default:
        return false;
    }
  }

  /**
   * Get resource type from resource object
   */
  private static getResourceType(resource: AnalyticsResource): string {
    if ('type' in resource) return 'reports';
    if ('widgets' in resource) return 'dashboards';
    return 'analytics';
  }

  /**
   * Filter resources based on user permissions
   */
  static filterAccessibleResources<T extends AnalyticsResource>(
    user: User, 
    resources: T[], 
    action: 'view' | 'edit' | 'delete' | 'share' = 'view'
  ): T[] {
    return resources.filter(resource => this.canAccessResource(user, resource, action));
  }

  /**
   * Check if user can export specific data types
   */
  static canExportDataType(user: User, dataType: string): boolean {
    const sensitiveDataTypes = ['user_personal_data', 'medical_records', 'sensitive_responses'];
    
    if (sensitiveDataTypes.includes(dataType)) {
      return this.hasPermission(user, 'data:export_sensitive');
    }
    
    return this.hasPermission(user, 'data:export');
  }

  /**
   * Get allowed export formats for user
   */
  static getAllowedExportFormats(user: User): string[] {
    const baseFormats = ['csv', 'json'];
    const standardFormats = ['pdf', 'excel'];
    const advancedFormats = ['png', 'jpeg'];

    let allowedFormats = [...baseFormats];

    if (this.hasPermission(user, 'data:export')) {
      allowedFormats.push(...standardFormats);
    }

    if (this.hasPermission(user, 'data:export_sensitive')) {
      allowedFormats.push(...advancedFormats);
    }

    return allowedFormats;
  }

  /**
   * Validate resource creation permissions
   */
  static canCreateResource(user: User, resourceType: 'report' | 'dashboard'): boolean {
    const permission = `${resourceType}s:create` as Permission;
    return this.hasPermission(user, permission);
  }

  /**
   * Validate resource sharing permissions
   */
  static canShareResource(user: User, resource: AnalyticsResource): boolean {
    // Must be owner or have share permission
    if (resource.created_by === user.id) {
      return true;
    }

    const resourceType = this.getResourceType(resource);
    const sharePermission = `${resourceType}:share` as Permission;
    
    return this.hasPermission(user, sharePermission);
  }

  /**
   * Get maximum data retention period for user exports
   */
  static getDataRetentionPeriod(user: User): number {
    switch (user.role) {
      case 'admin':
        return 365; // 1 year
      case 'organization_admin':
        return 90; // 3 months
      case 'user':
        return 30; // 1 month
      case 'viewer':
        return 7; // 1 week
      default:
        return 7;
    }
  }

  /**
   * Check if user can access organization-level analytics
   */
  static canAccessOrganizationAnalytics(user: User, organizationId: string): boolean {
    if (user.role === 'admin') {
      return true;
    }

    if (user.role === 'organization_admin' && user.organization_id === organizationId) {
      return true;
    }

    return false;
  }

  /**
   * Get user's data access scope
   */
  static getDataAccessScope(user: User): {
    canAccessAllOrganizations: boolean;
    canAccessOwnOrganization: boolean;
    canAccessOwnData: boolean;
    organizationId?: string;
  } {
    return {
      canAccessAllOrganizations: user.role === 'admin',
      canAccessOwnOrganization: ['admin', 'organization_admin'].includes(user.role),
      canAccessOwnData: true,
      organizationId: user.organization_id
    };
  }
}

// Export utility functions
export const checkPermission = AnalyticsPermissionManager.hasPermission;
export const canAccessResource = AnalyticsPermissionManager.canAccessResource;
export const filterAccessibleResources = AnalyticsPermissionManager.filterAccessibleResources;
export const canExportDataType = AnalyticsPermissionManager.canExportDataType;
export const getAllowedExportFormats = AnalyticsPermissionManager.getAllowedExportFormats;
