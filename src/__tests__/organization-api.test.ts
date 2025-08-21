import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/organizations/route';
import { GET as getOrgById, PUT, DELETE } from '@/app/api/organizations/[id]/route';
import { GET as getMembers, POST as inviteMember } from '@/app/api/organizations/[id]/members/route';
import { PUT as updateMemberRole, DELETE as removeMember } from '@/app/api/organizations/[id]/members/[userId]/route';
import { GET as getInvitation, POST as acceptInvitation } from '@/app/api/invitations/[token]/route';

// Mock the database and auth functions
jest.mock('@/lib/db');
jest.mock('@/lib/auth');
jest.mock('@/lib/organization-db');
jest.mock('@/lib/audit-utils');

const mockUser = {
  userId: 1,
  email: 'test@example.com',
  name: 'Test User'
};

const mockOrganization = {
  id: 1,
  name: 'Test Organization',
  description: 'Test Description',
  type: 'healthcare',
  contact_email: 'contact@test.com',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  stats: {
    member_count: 1,
    questionnaire_count: 0,
    response_count: 0,
    active_questionnaire_count: 0,
    recent_activity_count: 0
  },
  user_role: 'owner',
  user_status: 'active'
};

const mockMember = {
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
    name: 'Test User',
    email: 'test@example.com'
  }
};

const mockInvitation = {
  id: 1,
  organization_id: 1,
  email: 'invite@example.com',
  role: 'member',
  token: 'test-token-123',
  status: 'pending',
  invited_by_id: 1,
  expires_at: '2024-12-31T23:59:59Z',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  organization: {
    id: 1,
    name: 'Test Organization'
  }
};

describe('Organization API', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock getUserFromRequest to return our test user
    const { getUserFromRequest } = require('@/lib/auth');
    getUserFromRequest.mockReturnValue(mockUser);
  });

  describe('GET /api/organizations', () => {
    it('should return user organizations', async () => {
      const { getUserOrganizations } = require('@/lib/organization-db');
      getUserOrganizations.mockResolvedValue([mockOrganization]);

      const request = new NextRequest('http://localhost:3000/api/organizations');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.organizations).toHaveLength(1);
      expect(data.data.organizations[0]).toEqual(mockOrganization);
    });

    it('should return 401 if user not authenticated', async () => {
      const { getUserFromRequest } = require('@/lib/auth');
      getUserFromRequest.mockReturnValue(null);

      const request = new NextRequest('http://localhost:3000/api/organizations');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Authentication required');
    });
  });

  describe('POST /api/organizations', () => {
    it('should create a new organization', async () => {
      const { createOrganization } = require('@/lib/organization-db');
      const { logOrganizationAction } = require('@/lib/audit-utils');
      
      createOrganization.mockResolvedValue(mockOrganization);
      logOrganizationAction.mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/organizations', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Organization',
          description: 'Test Description',
          type: 'healthcare'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.organization).toEqual(mockOrganization);
      expect(createOrganization).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Organization',
          description: 'Test Description',
          type: 'healthcare'
        }),
        mockUser.userId
      );
    });

    it('should return 400 if name is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/organizations', {
        method: 'POST',
        body: JSON.stringify({
          description: 'Test Description'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Organization name is required');
    });
  });

  describe('GET /api/organizations/[id]', () => {
    it('should return organization details', async () => {
      const { checkUserPermission, getOrganizationById } = require('@/lib/organization-db');
      
      checkUserPermission.mockResolvedValue({ hasAccess: true, role: 'owner', status: 'active' });
      getOrganizationById.mockResolvedValue(mockOrganization);

      const request = new NextRequest('http://localhost:3000/api/organizations/1');
      const response = await getOrgById(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.organization).toEqual(mockOrganization);
    });

    it('should return 403 if user has no access', async () => {
      const { checkUserPermission } = require('@/lib/organization-db');
      
      checkUserPermission.mockResolvedValue({ hasAccess: false });

      const request = new NextRequest('http://localhost:3000/api/organizations/1');
      const response = await getOrgById(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Access denied');
    });
  });

  describe('GET /api/organizations/[id]/members', () => {
    it('should return organization members', async () => {
      const { checkUserPermission, getOrganizationMembers } = require('@/lib/organization-db');
      
      checkUserPermission.mockResolvedValue({ hasAccess: true, role: 'owner', status: 'active' });
      getOrganizationMembers.mockResolvedValue([mockMember]);

      const request = new NextRequest('http://localhost:3000/api/organizations/1/members');
      const response = await getMembers(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.members).toHaveLength(1);
      expect(data.data.members[0]).toEqual(mockMember);
    });
  });

  describe('POST /api/organizations/[id]/members', () => {
    it('should invite a new member', async () => {
      const { checkUserPermission, createInvitation, getOrganizationById } = require('@/lib/organization-db');
      const { query } = require('@/lib/db');
      const { logInvitationAction, notifyInvitation } = require('@/lib/audit-utils');
      
      checkUserPermission.mockResolvedValue({ hasAccess: true, role: 'admin', status: 'active' });
      query.mockResolvedValueOnce({ rows: [] }); // No existing member
      query.mockResolvedValueOnce({ rows: [] }); // No existing invitation
      createInvitation.mockResolvedValue(mockInvitation);
      getOrganizationById.mockResolvedValue(mockOrganization);
      query.mockResolvedValueOnce({ rows: [{ name: 'Test User' }] }); // Inviter details
      query.mockResolvedValueOnce({ rows: [] }); // No existing user with invited email
      logInvitationAction.mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/organizations/1/members', {
        method: 'POST',
        body: JSON.stringify({
          email: 'invite@example.com',
          role: 'member'
        })
      });

      const response = await inviteMember(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.invitation).toEqual(mockInvitation);
    });

    it('should return 409 if user is already a member', async () => {
      const { checkUserPermission } = require('@/lib/organization-db');
      const { query } = require('@/lib/db');
      
      checkUserPermission.mockResolvedValue({ hasAccess: true, role: 'admin', status: 'active' });
      query.mockResolvedValueOnce({ rows: [{ id: 1 }] }); // Existing member

      const request = new NextRequest('http://localhost:3000/api/organizations/1/members', {
        method: 'POST',
        body: JSON.stringify({
          email: 'existing@example.com',
          role: 'member'
        })
      });

      const response = await inviteMember(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.success).toBe(false);
      expect(data.error).toBe('User is already a member of this organization');
    });
  });

  describe('GET /api/invitations/[token]', () => {
    it('should return invitation details', async () => {
      const { getInvitationByToken } = require('@/lib/organization-db');
      
      getInvitationByToken.mockResolvedValue(mockInvitation);

      const request = new NextRequest('http://localhost:3000/api/invitations/test-token-123');
      const response = await getInvitation(request, { params: { token: 'test-token-123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.invitation.id).toBe(mockInvitation.id);
      expect(data.data.invitation.organization).toEqual(mockInvitation.organization);
    });

    it('should return 404 if invitation not found', async () => {
      const { getInvitationByToken } = require('@/lib/organization-db');
      
      getInvitationByToken.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/invitations/invalid-token');
      const response = await getInvitation(request, { params: { token: 'invalid-token' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invitation not found or expired');
    });
  });

  describe('POST /api/invitations/[token]', () => {
    it('should accept invitation successfully', async () => {
      const { getInvitationByToken, acceptInvitation } = require('@/lib/organization-db');
      const { query } = require('@/lib/db');
      const { logInvitationAction, logMemberAction } = require('@/lib/audit-utils');
      
      getInvitationByToken.mockResolvedValue(mockInvitation);
      query.mockResolvedValueOnce({ rows: [{ email: 'invite@example.com', name: 'Invited User' }] });
      acceptInvitation.mockResolvedValue({ success: true, member: mockMember });
      logInvitationAction.mockResolvedValue(undefined);
      logMemberAction.mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/invitations/test-token-123', {
        method: 'POST'
      });

      const response = await acceptInvitation(request, { params: { token: 'test-token-123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.member).toEqual(mockMember);
      expect(data.data.organization).toEqual(mockInvitation.organization);
    });

    it('should return 403 if email mismatch', async () => {
      const { getInvitationByToken } = require('@/lib/organization-db');
      const { query } = require('@/lib/db');
      
      getInvitationByToken.mockResolvedValue(mockInvitation);
      query.mockResolvedValueOnce({ rows: [{ email: 'different@example.com', name: 'Different User' }] });

      const request = new NextRequest('http://localhost:3000/api/invitations/test-token-123', {
        method: 'POST'
      });

      const response = await acceptInvitation(request, { params: { token: 'test-token-123' } });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error).toBe('This invitation is not for your email address');
    });
  });
});
