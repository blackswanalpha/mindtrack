import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import {
  createOrganization,
  getOrganizationById,
  updateOrganization,
  deleteOrganization,
  getUserOrganizations,
  getOrganizationMembers,
  updateMemberRole,
  removeMember,
  checkUserPermission,
  createInvitation,
  getInvitationByToken,
  acceptInvitation
} from '@/lib/organization-db';

// Mock the database
jest.mock('@/lib/db');

const mockQuery = jest.fn();
const mockTransaction = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  const { query, transaction } = require('@/lib/db');
  query.mockImplementation(mockQuery);
  transaction.mockImplementation(mockTransaction);
});

describe('Organization Database Functions', () => {
  describe('createOrganization', () => {
    it('should create organization and add creator as owner', async () => {
      const mockOrg = {
        id: 1,
        name: 'Test Org',
        description: 'Test Description',
        created_at: '2024-01-01T00:00:00Z'
      };

      mockTransaction.mockImplementation(async (callback) => {
        const mockClient = {
          query: jest.fn()
            .mockResolvedValueOnce({ rows: [mockOrg] }) // Create organization
            .mockResolvedValueOnce({ rows: [] }) // Add owner
        };
        return await callback(mockClient);
      });

      const result = await createOrganization({
        name: 'Test Org',
        description: 'Test Description'
      }, 1);

      expect(result).toEqual(mockOrg);
      expect(mockTransaction).toHaveBeenCalled();
    });
  });

  describe('getOrganizationById', () => {
    it('should return organization with stats and user role', async () => {
      const mockOrg = {
        id: 1,
        name: 'Test Org',
        description: 'Test Description'
      };

      const mockStats = {
        member_count: 5,
        questionnaire_count: 10,
        response_count: 100,
        active_questionnaire_count: 8,
        recent_activity_count: 3
      };

      const mockMember = {
        role: 'admin',
        status: 'active'
      };

      mockQuery
        .mockResolvedValueOnce({ rows: [mockOrg] }) // Get organization
        .mockResolvedValueOnce({ rows: [mockStats] }) // Get stats
        .mockResolvedValueOnce({ rows: [mockMember] }); // Get user role

      const result = await getOrganizationById(1, 1);

      expect(result).toEqual({
        ...mockOrg,
        stats: mockStats,
        user_role: 'admin',
        user_status: 'active'
      });
    });

    it('should return null if organization not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const result = await getOrganizationById(999);

      expect(result).toBeNull();
    });
  });

  describe('checkUserPermission', () => {
    it('should return access for active member', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ role: 'admin', status: 'active' }]
      });

      const result = await checkUserPermission(1, 1);

      expect(result).toEqual({
        hasAccess: true,
        role: 'admin',
        status: 'active'
      });
    });

    it('should deny access for inactive member', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ role: 'member', status: 'inactive' }]
      });

      const result = await checkUserPermission(1, 1);

      expect(result).toEqual({
        hasAccess: false,
        role: 'member',
        status: 'inactive'
      });
    });

    it('should deny access for non-member', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const result = await checkUserPermission(1, 1);

      expect(result).toEqual({
        hasAccess: false
      });
    });

    it('should check role hierarchy for required role', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ role: 'member', status: 'active' }]
      });

      const result = await checkUserPermission(1, 1, 'admin');

      expect(result).toEqual({
        hasAccess: false,
        role: 'member',
        status: 'active'
      });
    });

    it('should allow access for sufficient role', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ role: 'owner', status: 'active' }]
      });

      const result = await checkUserPermission(1, 1, 'admin');

      expect(result).toEqual({
        hasAccess: true,
        role: 'owner',
        status: 'active'
      });
    });
  });

  describe('getOrganizationMembers', () => {
    it('should return members with user details', async () => {
      const mockMembers = [
        {
          id: 1,
          organization_id: 1,
          user_id: 1,
          role: 'owner',
          status: 'active',
          joined_at: '2024-01-01T00:00:00Z',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          user_name: 'John Doe',
          user_email: 'john@example.com',
          user_profile_image: null
        }
      ];

      mockQuery.mockResolvedValueOnce({ rows: mockMembers });

      const result = await getOrganizationMembers(1);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 1,
        organization_id: 1,
        user_id: 1,
        role: 'owner',
        status: 'active',
        joined_at: '2024-01-01T00:00:00Z',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        user: {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          profile_image: null
        }
      });
    });
  });

  describe('updateMemberRole', () => {
    it('should update member role successfully', async () => {
      const mockUpdatedMember = {
        id: 1,
        organization_id: 1,
        user_id: 2,
        role: 'admin',
        status: 'active',
        updated_at: '2024-01-01T00:00:00Z'
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockUpdatedMember] });

      const result = await updateMemberRole(1, 2, { role: 'admin' });

      expect(result).toEqual(mockUpdatedMember);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE organization_members'),
        ['admin', 1, 2]
      );
    });

    it('should return null if member not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const result = await updateMemberRole(1, 999, { role: 'admin' });

      expect(result).toBeNull();
    });
  });

  describe('removeMember', () => {
    it('should remove member successfully', async () => {
      mockQuery.mockResolvedValueOnce({ rowCount: 1 });

      const result = await removeMember(1, 2);

      expect(result).toBe(true);
      expect(mockQuery).toHaveBeenCalledWith(
        'DELETE FROM organization_members WHERE organization_id = $1 AND user_id = $2',
        [1, 2]
      );
    });

    it('should return false if member not found', async () => {
      mockQuery.mockResolvedValueOnce({ rowCount: 0 });

      const result = await removeMember(1, 999);

      expect(result).toBe(false);
    });
  });

  describe('createInvitation', () => {
    it('should create invitation with generated token', async () => {
      const mockInvitation = {
        id: 1,
        organization_id: 1,
        email: 'test@example.com',
        role: 'member',
        token: 'generated-token',
        status: 'pending',
        invited_by_id: 1,
        expires_at: '2024-12-31T23:59:59Z',
        created_at: '2024-01-01T00:00:00Z'
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockInvitation] });

      const result = await createInvitation(1, {
        email: 'test@example.com',
        role: 'member'
      }, 1);

      expect(result).toEqual(mockInvitation);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO organization_invitations'),
        expect.arrayContaining([1, 'test@example.com', 'member', expect.any(String), 1, expect.any(String)])
      );
    });
  });

  describe('getInvitationByToken', () => {
    it('should return invitation with organization details', async () => {
      const mockInvitation = {
        id: 1,
        organization_id: 1,
        email: 'test@example.com',
        role: 'member',
        token: 'test-token',
        status: 'pending',
        expires_at: '2024-12-31T23:59:59Z',
        organization_name: 'Test Org'
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockInvitation] });

      const result = await getInvitationByToken('test-token');

      expect(result).toEqual({
        ...mockInvitation,
        organization: {
          id: 1,
          name: 'Test Org'
        }
      });
    });

    it('should return null for invalid or expired token', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const result = await getInvitationByToken('invalid-token');

      expect(result).toBeNull();
    });
  });

  describe('acceptInvitation', () => {
    it('should accept invitation and create member', async () => {
      const mockInvitation = {
        id: 1,
        organization_id: 1,
        email: 'test@example.com',
        role: 'member'
      };

      const mockMember = {
        id: 1,
        organization_id: 1,
        user_id: 2,
        role: 'member',
        status: 'active'
      };

      mockTransaction.mockImplementation(async (callback) => {
        const mockClient = {
          query: jest.fn()
            .mockResolvedValueOnce({ rows: [mockInvitation] }) // Get invitation
            .mockResolvedValueOnce({ rows: [] }) // Check existing member
            .mockResolvedValueOnce({ rows: [mockMember] }) // Add member
            .mockResolvedValueOnce({ rows: [] }) // Update invitation
        };
        return await callback(mockClient);
      });

      const result = await acceptInvitation('test-token', 2);

      expect(result).toEqual({
        success: true,
        member: mockMember
      });
    });

    it('should fail if invitation not found', async () => {
      mockTransaction.mockImplementation(async (callback) => {
        const mockClient = {
          query: jest.fn().mockResolvedValueOnce({ rows: [] })
        };
        return await callback(mockClient);
      });

      const result = await acceptInvitation('invalid-token', 2);

      expect(result).toEqual({
        success: false
      });
    });

    it('should fail if user is already a member', async () => {
      const mockInvitation = {
        id: 1,
        organization_id: 1,
        email: 'test@example.com',
        role: 'member'
      };

      mockTransaction.mockImplementation(async (callback) => {
        const mockClient = {
          query: jest.fn()
            .mockResolvedValueOnce({ rows: [mockInvitation] }) // Get invitation
            .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // Existing member found
        };
        return await callback(mockClient);
      });

      const result = await acceptInvitation('test-token', 2);

      expect(result).toEqual({
        success: false
      });
    });
  });
});
