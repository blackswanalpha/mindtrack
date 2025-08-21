'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { OrganizationWithStats, OrganizationMember, Notification } from '@/types/database';
import { useAuth } from '@/lib/auth-context';

interface OrganizationContextType {
  // Current organization
  currentOrganization: OrganizationWithStats | null;
  setCurrentOrganization: (org: OrganizationWithStats | null) => void;
  
  // User's organizations
  organizations: OrganizationWithStats[];
  setOrganizations: (orgs: OrganizationWithStats[]) => void;
  
  // Current organization members
  members: OrganizationMember[];
  setMembers: (members: OrganizationMember[]) => void;
  
  // User's role in current organization
  userRole: string | null;
  userStatus: string | null;
  
  // Notifications
  notifications: Notification[];
  unreadCount: number;
  
  // Loading states
  isLoading: boolean;
  isLoadingMembers: boolean;
  
  // Actions
  fetchOrganizations: () => Promise<void>;
  fetchMembers: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  switchOrganization: (organizationId: number) => Promise<void>;
  
  // Error handling
  error: string | null;
  clearError: () => void;
}

const OrganizationContext = createContext<OrganizationContextType>({
  currentOrganization: null,
  setCurrentOrganization: () => {},
  organizations: [],
  setOrganizations: () => {},
  members: [],
  setMembers: () => {},
  userRole: null,
  userStatus: null,
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  isLoadingMembers: false,
  fetchOrganizations: async () => {},
  fetchMembers: async () => {},
  fetchNotifications: async () => {},
  switchOrganization: async () => {},
  error: null,
  clearError: () => {}
});

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
};

interface OrganizationProviderProps {
  children: ReactNode;
}

export const OrganizationProvider: React.FC<OrganizationProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  
  const [currentOrganization, setCurrentOrganization] = useState<OrganizationWithStats | null>(null);
  const [organizations, setOrganizations] = useState<OrganizationWithStats[]>([]);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get user's role and status in current organization
  const userRole = currentOrganization?.user_role || null;
  const userStatus = currentOrganization?.user_status || null;

  const clearError = () => setError(null);

  // Fetch user's organizations
  const fetchOrganizations = async () => {
    if (!isAuthenticated || !user) return;

    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const response = await fetch('/api/organizations', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setOrganizations(data.data.organizations);
        
        // Set current organization if not set and organizations exist
        if (!currentOrganization && data.data.organizations.length > 0) {
          const savedOrgId = localStorage.getItem('currentOrganizationId');
          const orgToSet = savedOrgId 
            ? data.data.organizations.find((org: OrganizationWithStats) => org.id.toString() === savedOrgId)
            : data.data.organizations[0];
          
          if (orgToSet) {
            setCurrentOrganization(orgToSet);
            localStorage.setItem('currentOrganizationId', orgToSet.id.toString());
          }
        }
      } else {
        setError(data.error || 'Failed to fetch organizations');
      }
    } catch (err) {
      setError('Network error occurred while fetching organizations');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch members of current organization
  const fetchMembers = async () => {
    if (!currentOrganization || !isAuthenticated) return;

    try {
      setIsLoadingMembers(true);
      setError(null);

      const token = localStorage.getItem('token');
      const response = await fetch(`/api/organizations/${currentOrganization.id}/members`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMembers(data.data.members);
      } else {
        setError(data.error || 'Failed to fetch members');
      }
    } catch (err) {
      setError('Network error occurred while fetching members');
    } finally {
      setIsLoadingMembers(false);
    }
  };

  // Fetch user notifications
  const fetchNotifications = async () => {
    if (!isAuthenticated || !user) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setNotifications(data.data.notifications);
        setUnreadCount(data.data.unread_count);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  // Switch to a different organization
  const switchOrganization = async (organizationId: number) => {
    const organization = organizations.find(org => org.id === organizationId);
    if (!organization) {
      setError('Organization not found');
      return;
    }

    setCurrentOrganization(organization);
    localStorage.setItem('currentOrganizationId', organizationId.toString());
    
    // Clear members when switching organizations
    setMembers([]);
    
    // Fetch members for the new organization
    await fetchMembers();
  };

  // Initialize data when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchOrganizations();
      fetchNotifications();
    } else {
      // Clear data when user is not authenticated
      setCurrentOrganization(null);
      setOrganizations([]);
      setMembers([]);
      setNotifications([]);
      setUnreadCount(0);
      localStorage.removeItem('currentOrganizationId');
    }
  }, [isAuthenticated, user]);

  // Fetch members when current organization changes
  useEffect(() => {
    if (currentOrganization) {
      fetchMembers();
    }
  }, [currentOrganization]);

  // Periodic refresh of notifications
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const value: OrganizationContextType = {
    currentOrganization,
    setCurrentOrganization,
    organizations,
    setOrganizations,
    members,
    setMembers,
    userRole,
    userStatus,
    notifications,
    unreadCount,
    isLoading,
    isLoadingMembers,
    fetchOrganizations,
    fetchMembers,
    fetchNotifications,
    switchOrganization,
    error,
    clearError
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
};
