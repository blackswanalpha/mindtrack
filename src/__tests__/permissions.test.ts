import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import {
  PermissionChecker,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  isRoleHigherOrEqual,
  getRoleDisplayName,
  getRoleDescription,
  canViewOrganization,
  canUpdateOrganization,
  canInviteMembers,
  requirePermission,
  requireRole
} from '@/lib/permissions';

// Mock the organization-db module
jest.mock('@/lib/organization-db');

describe('Permission System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('PermissionChecker', () => {
    it('should initialize with user permissions', async () => {
      const { checkUserPermission } = require('@/lib/organization-db');
      checkUserPermission.mockResolvedValue({
        hasAccess: true,
        role: 'admin',
        status: 'active'
      });

      const checker = new PermissionChecker(1, 1);
      await checker.initialize();

      expect(checker.getRole()).toBe('admin');
      expect(checker.getStatus()).toBe('active');
      expect(checker.isActive()).toBe(true);
    });

    it('should check specific permissions correctly', async () => {
      const { checkUserPermission } = require('@/lib/organization-db');
      checkUserPermission.mockResolvedValue({
        hasAccess: true,
        role: 'admin',
        status: 'active'
      });

      const checker = new PermissionChecker(1, 1);
      await checker.initialize();

      expect(checker.hasPermission(PERMISSIONS.ORGANIZATION_UPDATE)).toBe(true);
      expect(checker.hasPermission(PERMISSIONS.ORGANIZATION_DELETE)).toBe(false);
      expect(checker.hasPermission(PERMISSIONS.MEMBER_INVITE)).toBe(true);
    });

    it('should deny permissions for inactive users', async () => {
      const { checkUserPermission } = require('@/lib/organization-db');
      checkUserPermission.mockResolvedValue({
        hasAccess: true,
        role: 'admin',
        status: 'inactive'
      });

      const checker = new PermissionChecker(1, 1);
      await checker.initialize();

      expect(checker.hasPermission(PERMISSIONS.ORGANIZATION_UPDATE)).toBe(false);
      expect(checker.isActive()).toBe(false);
    });

    it('should check role hierarchy correctly', async () => {
      const { checkUserPermission } = require('@/lib/organization-db');
      checkUserPermission.mockResolvedValue({
        hasAccess: true,
        role: 'member',
        status: 'active'
      });

      const checker = new PermissionChecker(1, 1);
      await checker.initialize();

      expect(checker.hasRole('viewer')).toBe(true);
      expect(checker.hasRole('member')).toBe(true);
      expect(checker.hasRole('admin')).toBe(false);
      expect(checker.hasRole('owner')).toBe(false);
    });

    it('should check multiple permissions', async () => {
      const { checkUserPermission } = require('@/lib/organization-db');
      checkUserPermission.mockResolvedValue({
        hasAccess: true,
        role: 'admin',
        status: 'active'
      });

      const checker = new PermissionChecker(1, 1);
      await checker.initialize();

      expect(checker.hasAnyPermission([
        PERMISSIONS.ORGANIZATION_DELETE,
        PERMISSIONS.ORGANIZATION_UPDATE
      ])).toBe(true);

      expect(checker.hasAllPermissions([
        PERMISSIONS.ORGANIZATION_UPDATE,
        PERMISSIONS.MEMBER_INVITE
      ])).toBe(true);

      expect(checker.hasAllPermissions([
        PERMISSIONS.ORGANIZATION_UPDATE,
        PERMISSIONS.ORGANIZATION_DELETE
      ])).toBe(false);
    });

    it('should return all permissions for role', async () => {
      const { checkUserPermission } = require('@/lib/organization-db');
      checkUserPermission.mockResolvedValue({
        hasAccess: true,
        role: 'viewer',
        status: 'active'
      });

      const checker = new PermissionChecker(1, 1);
      await checker.initialize();

      const permissions = checker.getAllPermissions();
      expect(permissions).toEqual(ROLE_PERMISSIONS.viewer);
    });
  });

  describe('Role Permissions', () => {
    it('should have correct permissions for viewer role', () => {
      const viewerPermissions = ROLE_PERMISSIONS.viewer;
      
      expect(viewerPermissions).toContain(PERMISSIONS.ORGANIZATION_VIEW);
      expect(viewerPermissions).toContain(PERMISSIONS.MEMBER_VIEW);
      expect(viewerPermissions).toContain(PERMISSIONS.QUESTIONNAIRE_VIEW);
      expect(viewerPermissions).not.toContain(PERMISSIONS.ORGANIZATION_UPDATE);
      expect(viewerPermissions).not.toContain(PERMISSIONS.MEMBER_INVITE);
    });

    it('should have correct permissions for member role', () => {
      const memberPermissions = ROLE_PERMISSIONS.member;
      
      expect(memberPermissions).toContain(PERMISSIONS.QUESTIONNAIRE_CREATE);
      expect(memberPermissions).toContain(PERMISSIONS.QUESTIONNAIRE_UPDATE);
      expect(memberPermissions).toContain(PERMISSIONS.RESPONSE_VIEW_ALL);
      expect(memberPermissions).not.toContain(PERMISSIONS.MEMBER_INVITE);
      expect(memberPermissions).not.toContain(PERMISSIONS.ORGANIZATION_UPDATE);
    });

    it('should have correct permissions for admin role', () => {
      const adminPermissions = ROLE_PERMISSIONS.admin;
      
      expect(adminPermissions).toContain(PERMISSIONS.ORGANIZATION_UPDATE);
      expect(adminPermissions).toContain(PERMISSIONS.MEMBER_INVITE);
      expect(adminPermissions).toContain(PERMISSIONS.MEMBER_UPDATE_ROLE);
      expect(adminPermissions).toContain(PERMISSIONS.QUESTIONNAIRE_DELETE);
      expect(adminPermissions).not.toContain(PERMISSIONS.ORGANIZATION_DELETE);
    });

    it('should have correct permissions for owner role', () => {
      const ownerPermissions = ROLE_PERMISSIONS.owner;
      
      expect(ownerPermissions).toContain(PERMISSIONS.ORGANIZATION_DELETE);
      expect(ownerPermissions).toContain(PERMISSIONS.ORGANIZATION_UPDATE);
      expect(ownerPermissions).toContain(PERMISSIONS.MEMBER_INVITE);
      expect(ownerPermissions).toContain(PERMISSIONS.MEMBER_UPDATE_ROLE);
    });
  });

  describe('Role Hierarchy Functions', () => {
    it('should compare roles correctly', () => {
      expect(isRoleHigherOrEqual('owner', 'admin')).toBe(true);
      expect(isRoleHigherOrEqual('admin', 'member')).toBe(true);
      expect(isRoleHigherOrEqual('member', 'viewer')).toBe(true);
      expect(isRoleHigherOrEqual('viewer', 'member')).toBe(false);
      expect(isRoleHigherOrEqual('member', 'admin')).toBe(false);
      expect(isRoleHigherOrEqual('admin', 'owner')).toBe(false);
      expect(isRoleHigherOrEqual('admin', 'admin')).toBe(true);
    });

    it('should return correct display names', () => {
      expect(getRoleDisplayName('viewer')).toBe('Viewer');
      expect(getRoleDisplayName('member')).toBe('Member');
      expect(getRoleDisplayName('admin')).toBe('Administrator');
      expect(getRoleDisplayName('owner')).toBe('Owner');
    });

    it('should return correct descriptions', () => {
      expect(getRoleDescription('viewer')).toContain('view');
      expect(getRoleDescription('member')).toContain('create');
      expect(getRoleDescription('admin')).toContain('manage');
      expect(getRoleDescription('owner')).toContain('Full control');
    });
  });

  describe('Utility Permission Functions', () => {
    beforeEach(() => {
      const { checkUserPermission } = require('@/lib/organization-db');
      checkUserPermission.mockResolvedValue({
        hasAccess: true,
        role: 'admin',
        status: 'active'
      });
    });

    it('should check view organization permission', async () => {
      const result = await canViewOrganization(1, 1);
      expect(result).toBe(true);
    });

    it('should check update organization permission', async () => {
      const result = await canUpdateOrganization(1, 1);
      expect(result).toBe(true);
    });

    it('should check invite members permission', async () => {
      const result = await canInviteMembers(1, 1);
      expect(result).toBe(true);
    });

    it('should deny permissions for insufficient role', async () => {
      const { checkUserPermission } = require('@/lib/organization-db');
      checkUserPermission.mockResolvedValue({
        hasAccess: true,
        role: 'viewer',
        status: 'active'
      });

      const result = await canUpdateOrganization(1, 1);
      expect(result).toBe(false);
    });
  });

  describe('Permission Middleware', () => {
    it('should allow access with sufficient permissions', async () => {
      const { checkUserPermission } = require('@/lib/organization-db');
      checkUserPermission.mockResolvedValue({
        hasAccess: true,
        role: 'admin',
        status: 'active'
      });

      await expect(requirePermission(1, 1, PERMISSIONS.ORGANIZATION_UPDATE))
        .resolves.not.toThrow();
    });

    it('should throw error for insufficient permissions', async () => {
      const { checkUserPermission } = require('@/lib/organization-db');
      checkUserPermission.mockResolvedValue({
        hasAccess: true,
        role: 'viewer',
        status: 'active'
      });

      await expect(requirePermission(1, 1, PERMISSIONS.ORGANIZATION_UPDATE))
        .rejects.toThrow('Insufficient permissions');
    });

    it('should allow access with sufficient role', async () => {
      const { checkUserPermission } = require('@/lib/organization-db');
      checkUserPermission.mockResolvedValue({
        hasAccess: true,
        role: 'admin',
        status: 'active'
      });

      await expect(requireRole(1, 1, 'member'))
        .resolves.not.toThrow();
    });

    it('should throw error for insufficient role', async () => {
      const { checkUserPermission } = require('@/lib/organization-db');
      checkUserPermission.mockResolvedValue({
        hasAccess: true,
        role: 'viewer',
        status: 'active'
      });

      await expect(requireRole(1, 1, 'admin'))
        .rejects.toThrow('Insufficient role');
    });

    it('should throw error for inactive users', async () => {
      const { checkUserPermission } = require('@/lib/organization-db');
      checkUserPermission.mockResolvedValue({
        hasAccess: true,
        role: 'admin',
        status: 'inactive'
      });

      await expect(requirePermission(1, 1, PERMISSIONS.ORGANIZATION_VIEW))
        .rejects.toThrow('Insufficient permissions');
    });
  });
});
