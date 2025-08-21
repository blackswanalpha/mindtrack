import { 
  MockOrganizationService,
  mockUsers,
  mockOrganizations,
  mockOrganizationMembers,
  mockOrganizationInvitations,
  mockNotifications
} from './mock-organization-data';
import { 
  Organization, 
  OrganizationMember, 
  OrganizationInvitation, 
  OrganizationWithStats,
  Notification,
  CreateOrganizationData,
  UpdateOrganizationData,
  InviteMemberData,
  UpdateMemberRoleData
} from '@/types/database';

// Mock API responses with realistic delays
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

export class MockOrganizationAPI {
  private static currentUserId = 1; // Default mock user

  // Set current user for mock context
  static setCurrentUser(userId: number) {
    this.currentUserId = userId;
  }

  // Organization endpoints
  static async getOrganizations(): Promise<{ organizations: OrganizationWithStats[] }> {
    await delay();
    const organizations = MockOrganizationService.getUserOrganizations(this.currentUserId);
    return { organizations };
  }

  static async getOrganization(id: number): Promise<{ organization: OrganizationWithStats }> {
    await delay();
    const organization = MockOrganizationService.getOrganizationById(id, this.currentUserId);
    if (!organization) {
      throw new Error('Organization not found');
    }
    return { organization };
  }

  static async createOrganization(data: CreateOrganizationData): Promise<{ organization: OrganizationWithStats }> {
    await delay(800);
    
    // Generate new ID
    const newId = Math.max(...mockOrganizations.map(o => o.id)) + 1;
    
    // Create new organization
    const newOrg: Organization = {
      id: newId,
      name: data.name,
      description: data.description || null,
      type: data.type || null,
      contact_email: data.contact_email || null,
      contact_phone: data.contact_phone || null,
      address: data.address || null,
      logo_url: data.logo_url || null,
      settings: data.settings || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Add to mock data
    mockOrganizations.push(newOrg);

    // Create owner membership
    const newMembership: OrganizationMember = {
      id: Math.max(...mockOrganizationMembers.map(m => m.id)) + 1,
      organization_id: newId,
      user_id: this.currentUserId,
      role: 'owner',
      status: 'active',
      joined_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user: mockUsers.find(u => u.id === this.currentUserId)!,
      organization: { id: newId, name: newOrg.name }
    };

    mockOrganizationMembers.push(newMembership);

    // Generate stats
    const stats = MockOrganizationService.generateMockStats(newId);

    const organizationWithStats: OrganizationWithStats = {
      ...newOrg,
      stats,
      user_role: 'owner',
      user_status: 'active'
    };

    return { organization: organizationWithStats };
  }

  static async updateOrganization(id: number, data: UpdateOrganizationData): Promise<{ organization: OrganizationWithStats }> {
    await delay(600);
    
    // Check permission
    const permission = MockOrganizationService.checkUserPermission(id, this.currentUserId, 'admin');
    if (!permission.hasAccess) {
      throw new Error('Insufficient permissions');
    }

    // Find and update organization
    const orgIndex = mockOrganizations.findIndex(o => o.id === id);
    if (orgIndex === -1) {
      throw new Error('Organization not found');
    }

    const updatedOrg = {
      ...mockOrganizations[orgIndex],
      ...data,
      updated_at: new Date().toISOString()
    };

    mockOrganizations[orgIndex] = updatedOrg;

    const organization = MockOrganizationService.getOrganizationById(id, this.currentUserId)!;
    return { organization };
  }

  static async deleteOrganization(id: number): Promise<{ success: boolean }> {
    await delay(800);
    
    // Check permission - only owners can delete
    const permission = MockOrganizationService.checkUserPermission(id, this.currentUserId, 'owner');
    if (!permission.hasAccess) {
      throw new Error('Only organization owners can delete organizations');
    }

    // Remove organization and related data
    const orgIndex = mockOrganizations.findIndex(o => o.id === id);
    if (orgIndex === -1) {
      throw new Error('Organization not found');
    }

    mockOrganizations.splice(orgIndex, 1);
    
    // Remove members
    const memberIndices = mockOrganizationMembers
      .map((member, index) => member.organization_id === id ? index : -1)
      .filter(index => index !== -1)
      .reverse();
    
    memberIndices.forEach(index => mockOrganizationMembers.splice(index, 1));

    // Remove invitations
    const invitationIndices = mockOrganizationInvitations
      .map((invitation, index) => invitation.organization_id === id ? index : -1)
      .filter(index => index !== -1)
      .reverse();
    
    invitationIndices.forEach(index => mockOrganizationInvitations.splice(index, 1));

    return { success: true };
  }

  // Member management endpoints
  static async getMembers(organizationId: number): Promise<{ members: OrganizationMember[] }> {
    await delay();
    
    // Check permission
    const permission = MockOrganizationService.checkUserPermission(organizationId, this.currentUserId, 'member');
    if (!permission.hasAccess) {
      throw new Error('Insufficient permissions');
    }

    const members = MockOrganizationService.getOrganizationMembers(organizationId);
    return { members };
  }

  static async inviteMember(organizationId: number, data: InviteMemberData): Promise<{ invitation: OrganizationInvitation }> {
    await delay(700);
    
    // Check permission
    const permission = MockOrganizationService.checkUserPermission(organizationId, this.currentUserId, 'admin');
    if (!permission.hasAccess) {
      throw new Error('Insufficient permissions to invite members');
    }

    // Check if user is already a member
    const existingMember = mockOrganizationMembers.find(
      m => m.organization_id === organizationId && m.user?.email === data.email
    );
    if (existingMember) {
      throw new Error('User is already a member of this organization');
    }

    // Check for existing pending invitation
    const existingInvitation = mockOrganizationInvitations.find(
      i => i.organization_id === organizationId && i.email === data.email && i.status === 'pending'
    );
    if (existingInvitation) {
      throw new Error('There is already a pending invitation for this email');
    }

    // Create new invitation
    const newInvitation: OrganizationInvitation = {
      id: Math.max(...mockOrganizationInvitations.map(i => i.id)) + 1,
      organization_id: organizationId,
      email: data.email,
      role: data.role,
      token: `inv_${Math.random().toString(36).substring(2, 18)}`,
      status: 'pending',
      invited_by_id: this.currentUserId,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      organization: mockOrganizations.find(o => o.id === organizationId)!,
      invited_by: mockUsers.find(u => u.id === this.currentUserId)!
    };

    mockOrganizationInvitations.push(newInvitation);

    return { invitation: newInvitation };
  }

  static async updateMemberRole(organizationId: number, userId: number, data: UpdateMemberRoleData): Promise<{ member: OrganizationMember }> {
    await delay(600);
    
    // Check permission
    const permission = MockOrganizationService.checkUserPermission(organizationId, this.currentUserId, 'admin');
    if (!permission.hasAccess) {
      throw new Error('Insufficient permissions to update member roles');
    }

    // Find member
    const memberIndex = mockOrganizationMembers.findIndex(
      m => m.organization_id === organizationId && m.user_id === userId
    );
    if (memberIndex === -1) {
      throw new Error('Member not found');
    }

    // Update role
    mockOrganizationMembers[memberIndex] = {
      ...mockOrganizationMembers[memberIndex],
      role: data.role,
      updated_at: new Date().toISOString()
    };

    return { member: mockOrganizationMembers[memberIndex] };
  }

  static async removeMember(organizationId: number, userId: number): Promise<{ success: boolean }> {
    await delay(600);
    
    // Check permission
    const permission = MockOrganizationService.checkUserPermission(organizationId, this.currentUserId, 'admin');
    if (!permission.hasAccess) {
      throw new Error('Insufficient permissions to remove members');
    }

    // Find and remove member
    const memberIndex = mockOrganizationMembers.findIndex(
      m => m.organization_id === organizationId && m.user_id === userId
    );
    if (memberIndex === -1) {
      throw new Error('Member not found');
    }

    // Prevent removing the last owner
    const member = mockOrganizationMembers[memberIndex];
    if (member.role === 'owner') {
      const ownerCount = mockOrganizationMembers.filter(
        m => m.organization_id === organizationId && m.role === 'owner'
      ).length;
      if (ownerCount <= 1) {
        throw new Error('Cannot remove the last owner of the organization');
      }
    }

    mockOrganizationMembers.splice(memberIndex, 1);

    return { success: true };
  }

  // Invitation endpoints
  static async getInvitations(organizationId: number): Promise<{ invitations: OrganizationInvitation[] }> {
    await delay();
    
    // Check permission
    const permission = MockOrganizationService.checkUserPermission(organizationId, this.currentUserId, 'admin');
    if (!permission.hasAccess) {
      throw new Error('Insufficient permissions');
    }

    const invitations = MockOrganizationService.getOrganizationInvitations(organizationId);
    return { invitations };
  }

  static async getInvitationByToken(token: string): Promise<{ invitation: OrganizationInvitation }> {
    await delay();
    
    const invitation = MockOrganizationService.getInvitationByToken(token);
    if (!invitation) {
      throw new Error('Invitation not found');
    }

    // Check if expired
    if (new Date(invitation.expires_at) < new Date()) {
      invitation.status = 'expired';
    }

    return { invitation };
  }

  static async acceptInvitation(token: string): Promise<{ member: OrganizationMember }> {
    await delay(800);
    
    const invitation = MockOrganizationService.getInvitationByToken(token);
    if (!invitation) {
      throw new Error('Invitation not found');
    }

    if (invitation.status !== 'pending') {
      throw new Error('Invitation is no longer valid');
    }

    if (new Date(invitation.expires_at) < new Date()) {
      throw new Error('Invitation has expired');
    }

    // Update invitation status
    const invitationIndex = mockOrganizationInvitations.findIndex(i => i.token === token);
    mockOrganizationInvitations[invitationIndex] = {
      ...invitation,
      status: 'accepted',
      accepted_at: new Date().toISOString(),
      accepted_by_id: this.currentUserId,
      updated_at: new Date().toISOString()
    };

    // Create new member
    const newMember: OrganizationMember = {
      id: Math.max(...mockOrganizationMembers.map(m => m.id)) + 1,
      organization_id: invitation.organization_id,
      user_id: this.currentUserId,
      role: invitation.role,
      status: 'active',
      joined_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user: mockUsers.find(u => u.id === this.currentUserId)!,
      organization: invitation.organization!
    };

    mockOrganizationMembers.push(newMember);

    return { member: newMember };
  }

  // Notification endpoints
  static async getNotifications(organizationId?: number): Promise<{ notifications: Notification[] }> {
    await delay();
    
    const notifications = MockOrganizationService.getUserNotifications(this.currentUserId, organizationId);
    return { notifications: notifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) };
  }

  static async markNotificationAsRead(notificationId: number): Promise<{ success: boolean }> {
    await delay(300);
    
    const notificationIndex = mockNotifications.findIndex(
      n => n.id === notificationId && n.user_id === this.currentUserId
    );
    if (notificationIndex === -1) {
      throw new Error('Notification not found');
    }

    mockNotifications[notificationIndex] = {
      ...mockNotifications[notificationIndex],
      is_read: true,
      read_at: new Date().toISOString()
    };

    return { success: true };
  }

  static async markAllNotificationsAsRead(organizationId?: number): Promise<{ success: boolean }> {
    await delay(500);
    
    const userNotifications = MockOrganizationService.getUserNotifications(this.currentUserId, organizationId);
    const unreadNotifications = userNotifications.filter(n => !n.is_read);

    unreadNotifications.forEach(notification => {
      const index = mockNotifications.findIndex(n => n.id === notification.id);
      if (index !== -1) {
        mockNotifications[index] = {
          ...mockNotifications[index],
          is_read: true,
          read_at: new Date().toISOString()
        };
      }
    });

    return { success: true };
  }

  static async getUnreadNotificationCount(organizationId?: number): Promise<{ count: number }> {
    await delay(200);
    
    const count = MockOrganizationService.getUnreadNotificationCount(this.currentUserId, organizationId);
    return { count };
  }
}
