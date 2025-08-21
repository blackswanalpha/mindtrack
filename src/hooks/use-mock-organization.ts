import { useState, useEffect, useCallback } from 'react';
import { MockOrganizationAPI } from '@/lib/mock-organization-api';
import { 
  OrganizationWithStats, 
  OrganizationMember, 
  OrganizationInvitation, 
  Notification,
  CreateOrganizationData,
  UpdateOrganizationData,
  InviteMemberData,
  UpdateMemberRoleData
} from '@/types/database';

// Environment flag to enable/disable mock mode
const USE_MOCK_API = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';

export function useMockOrganization() {
  const [organizations, setOrganizations] = useState<OrganizationWithStats[]>([]);
  const [currentOrganization, setCurrentOrganization] = useState<OrganizationWithStats | null>(null);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [invitations, setInvitations] = useState<OrganizationInvitation[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set current user for mock API
  const setCurrentUser = useCallback((userId: number) => {
    if (USE_MOCK_API) {
      MockOrganizationAPI.setCurrentUser(userId);
    }
  }, []);

  // Fetch organizations
  const fetchOrganizations = useCallback(async () => {
    if (!USE_MOCK_API) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await MockOrganizationAPI.getOrganizations();
      setOrganizations(response.organizations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch organizations');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch organization by ID
  const fetchOrganization = useCallback(async (id: number) => {
    if (!USE_MOCK_API) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await MockOrganizationAPI.getOrganization(id);
      setCurrentOrganization(response.organization);
      return response.organization;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch organization');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create organization
  const createOrganization = useCallback(async (data: CreateOrganizationData) => {
    if (!USE_MOCK_API) return null;
    
    setLoading(true);
    setError(null);
    try {
      const response = await MockOrganizationAPI.createOrganization(data);
      setOrganizations(prev => [...prev, response.organization]);
      return response.organization;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create organization');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update organization
  const updateOrganization = useCallback(async (id: number, data: UpdateOrganizationData) => {
    if (!USE_MOCK_API) return null;
    
    setLoading(true);
    setError(null);
    try {
      const response = await MockOrganizationAPI.updateOrganization(id, data);
      setOrganizations(prev => prev.map(org => org.id === id ? response.organization : org));
      if (currentOrganization?.id === id) {
        setCurrentOrganization(response.organization);
      }
      return response.organization;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update organization');
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentOrganization]);

  // Delete organization
  const deleteOrganization = useCallback(async (id: number) => {
    if (!USE_MOCK_API) return false;
    
    setLoading(true);
    setError(null);
    try {
      await MockOrganizationAPI.deleteOrganization(id);
      setOrganizations(prev => prev.filter(org => org.id !== id));
      if (currentOrganization?.id === id) {
        setCurrentOrganization(null);
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete organization');
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentOrganization]);

  // Fetch members
  const fetchMembers = useCallback(async (organizationId: number) => {
    if (!USE_MOCK_API) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await MockOrganizationAPI.getMembers(organizationId);
      setMembers(response.members);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch members');
    } finally {
      setLoading(false);
    }
  }, []);

  // Invite member
  const inviteMember = useCallback(async (organizationId: number, data: InviteMemberData) => {
    if (!USE_MOCK_API) return null;
    
    setLoading(true);
    setError(null);
    try {
      const response = await MockOrganizationAPI.inviteMember(organizationId, data);
      setInvitations(prev => [...prev, response.invitation]);
      return response.invitation;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to invite member');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update member role
  const updateMemberRole = useCallback(async (organizationId: number, userId: number, data: UpdateMemberRoleData) => {
    if (!USE_MOCK_API) return null;
    
    setLoading(true);
    setError(null);
    try {
      const response = await MockOrganizationAPI.updateMemberRole(organizationId, userId, data);
      setMembers(prev => prev.map(member => 
        member.organization_id === organizationId && member.user_id === userId 
          ? response.member 
          : member
      ));
      return response.member;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update member role');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Remove member
  const removeMember = useCallback(async (organizationId: number, userId: number) => {
    if (!USE_MOCK_API) return false;
    
    setLoading(true);
    setError(null);
    try {
      await MockOrganizationAPI.removeMember(organizationId, userId);
      setMembers(prev => prev.filter(member => 
        !(member.organization_id === organizationId && member.user_id === userId)
      ));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove member');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch invitations
  const fetchInvitations = useCallback(async (organizationId: number) => {
    if (!USE_MOCK_API) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await MockOrganizationAPI.getInvitations(organizationId);
      setInvitations(response.invitations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch invitations');
    } finally {
      setLoading(false);
    }
  }, []);

  // Get invitation by token
  const getInvitationByToken = useCallback(async (token: string) => {
    if (!USE_MOCK_API) return null;
    
    setLoading(true);
    setError(null);
    try {
      const response = await MockOrganizationAPI.getInvitationByToken(token);
      return response.invitation;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch invitation');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Accept invitation
  const acceptInvitation = useCallback(async (token: string) => {
    if (!USE_MOCK_API) return null;
    
    setLoading(true);
    setError(null);
    try {
      const response = await MockOrganizationAPI.acceptInvitation(token);
      // Refresh organizations after accepting invitation
      await fetchOrganizations();
      return response.member;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept invitation');
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchOrganizations]);

  // Fetch notifications
  const fetchNotifications = useCallback(async (organizationId?: number) => {
    if (!USE_MOCK_API) return;
    
    try {
      const response = await MockOrganizationAPI.getNotifications(organizationId);
      setNotifications(response.notifications);
      
      const countResponse = await MockOrganizationAPI.getUnreadNotificationCount(organizationId);
      setUnreadCount(countResponse.count);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
    }
  }, []);

  // Mark notification as read
  const markNotificationAsRead = useCallback(async (notificationId: number) => {
    if (!USE_MOCK_API) return false;
    
    try {
      await MockOrganizationAPI.markNotificationAsRead(notificationId);
      setNotifications(prev => prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, is_read: true, read_at: new Date().toISOString() }
          : notification
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark notification as read');
      return false;
    }
  }, []);

  // Mark all notifications as read
  const markAllNotificationsAsRead = useCallback(async (organizationId?: number) => {
    if (!USE_MOCK_API) return false;
    
    try {
      await MockOrganizationAPI.markAllNotificationsAsRead(organizationId);
      setNotifications(prev => prev.map(notification => ({
        ...notification,
        is_read: true,
        read_at: new Date().toISOString()
      })));
      setUnreadCount(0);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark all notifications as read');
      return false;
    }
  }, []);

  return {
    // State
    organizations,
    currentOrganization,
    members,
    invitations,
    notifications,
    unreadCount,
    loading,
    error,
    isMockMode: USE_MOCK_API,

    // Actions
    setCurrentUser,
    fetchOrganizations,
    fetchOrganization,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    fetchMembers,
    inviteMember,
    updateMemberRole,
    removeMember,
    fetchInvitations,
    getInvitationByToken,
    acceptInvitation,
    fetchNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,

    // Utilities
    clearError: () => setError(null),
    setCurrentOrganization
  };
}
