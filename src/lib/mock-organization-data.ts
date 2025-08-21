import { 
  Organization, 
  OrganizationMember, 
  OrganizationInvitation, 
  OrganizationWithStats,
  OrganizationStats,
  Notification,
  User
} from '@/types/database';

// Mock Users
export const mockUsers: User[] = [
  {
    id: 1,
    name: 'John Smith',
    email: 'john.smith@example.com',
    role: 'admin',
    profile_image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    last_login: '2024-01-20T10:30:00Z',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-20T10:30:00Z'
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    role: 'user',
    profile_image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    last_login: '2024-01-19T15:45:00Z',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-19T15:45:00Z'
  },
  {
    id: 3,
    name: 'Michael Chen',
    email: 'michael.chen@example.com',
    role: 'user',
    profile_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    last_login: '2024-01-18T09:15:00Z',
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-18T09:15:00Z'
  },
  {
    id: 4,
    name: 'Emily Davis',
    email: 'emily.davis@example.com',
    role: 'user',
    profile_image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    last_login: '2024-01-17T14:20:00Z',
    created_at: '2024-01-04T00:00:00Z',
    updated_at: '2024-01-17T14:20:00Z'
  },
  {
    id: 5,
    name: 'David Wilson',
    email: 'david.wilson@example.com',
    role: 'user',
    profile_image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    last_login: '2024-01-16T11:30:00Z',
    created_at: '2024-01-05T00:00:00Z',
    updated_at: '2024-01-16T11:30:00Z'
  }
];

// Mock Organizations
export const mockOrganizations: Organization[] = [
  {
    id: 1,
    name: 'HealthCare Plus',
    description: 'Leading healthcare provider specializing in patient care and medical assessments',
    type: 'healthcare',
    contact_email: 'contact@healthcareplus.com',
    contact_phone: '+1-555-0123',
    address: '123 Medical Center Dr, Health City, HC 12345',
    logo_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=200&h=200&fit=crop',
    settings: {
      theme: 'blue',
      notifications_enabled: true,
      public_questionnaires: true,
      require_approval: false
    },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T10:30:00Z'
  },
  {
    id: 2,
    name: 'EduTech Solutions',
    description: 'Educational technology company focused on student assessment and learning analytics',
    type: 'education',
    contact_email: 'info@edutech.com',
    contact_phone: '+1-555-0456',
    address: '456 Innovation Blvd, Tech Valley, TV 67890',
    logo_url: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=200&h=200&fit=crop',
    settings: {
      theme: 'green',
      notifications_enabled: true,
      public_questionnaires: false,
      require_approval: true
    },
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-18T14:20:00Z'
  },
  {
    id: 3,
    name: 'Research Institute',
    description: 'Academic research institution conducting psychological and behavioral studies',
    type: 'research',
    contact_email: 'research@institute.edu',
    contact_phone: '+1-555-0789',
    address: '789 University Ave, Research Park, RP 13579',
    logo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    settings: {
      theme: 'purple',
      notifications_enabled: true,
      public_questionnaires: true,
      require_approval: true
    },
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-19T16:45:00Z'
  }
];

// Mock Organization Stats
export const mockOrganizationStats: Record<number, OrganizationStats> = {
  1: {
    member_count: 12,
    questionnaire_count: 25,
    response_count: 1847,
    active_questionnaire_count: 18,
    recent_activity_count: 156
  },
  2: {
    member_count: 8,
    questionnaire_count: 15,
    response_count: 892,
    active_questionnaire_count: 12,
    recent_activity_count: 89
  },
  3: {
    member_count: 6,
    questionnaire_count: 8,
    response_count: 234,
    active_questionnaire_count: 5,
    recent_activity_count: 23
  }
};

// Mock Organizations with Stats
export const mockOrganizationsWithStats: OrganizationWithStats[] = mockOrganizations.map(org => ({
  ...org,
  stats: mockOrganizationStats[org.id],
  user_role: org.id === 1 ? 'owner' : org.id === 2 ? 'admin' : 'member',
  user_status: 'active'
}));

// Mock Organization Members
export const mockOrganizationMembers: OrganizationMember[] = [
  // HealthCare Plus members
  {
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
      name: 'John Smith',
      email: 'john.smith@example.com',
      profile_image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    },
    organization: {
      id: 1,
      name: 'HealthCare Plus'
    }
  },
  {
    id: 2,
    organization_id: 1,
    user_id: 2,
    role: 'admin',
    status: 'active',
    joined_at: '2024-01-05T00:00:00Z',
    created_at: '2024-01-05T00:00:00Z',
    updated_at: '2024-01-05T00:00:00Z',
    user: {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      profile_image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
    },
    organization: {
      id: 1,
      name: 'HealthCare Plus'
    }
  },
  {
    id: 3,
    organization_id: 1,
    user_id: 3,
    role: 'member',
    status: 'active',
    joined_at: '2024-01-10T00:00:00Z',
    created_at: '2024-01-10T00:00:00Z',
    updated_at: '2024-01-10T00:00:00Z',
    user: {
      id: 3,
      name: 'Michael Chen',
      email: 'michael.chen@example.com',
      profile_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    },
    organization: {
      id: 1,
      name: 'HealthCare Plus'
    }
  },
  // EduTech Solutions members
  {
    id: 4,
    organization_id: 2,
    user_id: 2,
    role: 'owner',
    status: 'active',
    joined_at: '2024-01-02T00:00:00Z',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
    user: {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      profile_image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
    },
    organization: {
      id: 2,
      name: 'EduTech Solutions'
    }
  },
  {
    id: 5,
    organization_id: 2,
    user_id: 4,
    role: 'admin',
    status: 'active',
    joined_at: '2024-01-08T00:00:00Z',
    created_at: '2024-01-08T00:00:00Z',
    updated_at: '2024-01-08T00:00:00Z',
    user: {
      id: 4,
      name: 'Emily Davis',
      email: 'emily.davis@example.com',
      profile_image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
    },
    organization: {
      id: 2,
      name: 'EduTech Solutions'
    }
  },
  // Research Institute members
  {
    id: 6,
    organization_id: 3,
    user_id: 3,
    role: 'owner',
    status: 'active',
    joined_at: '2024-01-03T00:00:00Z',
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z',
    user: {
      id: 3,
      name: 'Michael Chen',
      email: 'michael.chen@example.com',
      profile_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    },
    organization: {
      id: 3,
      name: 'Research Institute'
    }
  },
  {
    id: 7,
    organization_id: 3,
    user_id: 5,
    role: 'member',
    status: 'active',
    joined_at: '2024-01-12T00:00:00Z',
    created_at: '2024-01-12T00:00:00Z',
    updated_at: '2024-01-12T00:00:00Z',
    user: {
      id: 5,
      name: 'David Wilson',
      email: 'david.wilson@example.com',
      profile_image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
    },
    organization: {
      id: 3,
      name: 'Research Institute'
    }
  }
];

// Mock Organization Invitations
export const mockOrganizationInvitations: OrganizationInvitation[] = [
  {
    id: 1,
    organization_id: 1,
    email: 'alice.brown@example.com',
    role: 'member',
    token: 'inv_1234567890abcdef',
    status: 'pending',
    invited_by_id: 1,
    expires_at: '2024-02-01T00:00:00Z',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    organization: {
      id: 1,
      name: 'HealthCare Plus'
    },
    invited_by: {
      id: 1,
      name: 'John Smith',
      email: 'john.smith@example.com'
    }
  },
  {
    id: 2,
    organization_id: 2,
    email: 'bob.taylor@example.com',
    role: 'admin',
    token: 'inv_fedcba0987654321',
    status: 'pending',
    invited_by_id: 2,
    expires_at: '2024-02-05T00:00:00Z',
    created_at: '2024-01-18T14:30:00Z',
    updated_at: '2024-01-18T14:30:00Z',
    organization: {
      id: 2,
      name: 'EduTech Solutions'
    },
    invited_by: {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com'
    }
  },
  {
    id: 3,
    organization_id: 1,
    email: 'carol.white@example.com',
    role: 'viewer',
    token: 'inv_abcd1234efgh5678',
    status: 'accepted',
    invited_by_id: 1,
    expires_at: '2024-01-25T00:00:00Z',
    accepted_at: '2024-01-20T09:15:00Z',
    accepted_by_id: 6,
    created_at: '2024-01-12T16:45:00Z',
    updated_at: '2024-01-20T09:15:00Z',
    organization: {
      id: 1,
      name: 'HealthCare Plus'
    },
    invited_by: {
      id: 1,
      name: 'John Smith',
      email: 'john.smith@example.com'
    }
  },
  {
    id: 4,
    organization_id: 3,
    email: 'expired.invite@example.com',
    role: 'member',
    token: 'inv_expired123456',
    status: 'expired',
    invited_by_id: 3,
    expires_at: '2024-01-10T00:00:00Z',
    created_at: '2024-01-01T12:00:00Z',
    updated_at: '2024-01-10T00:01:00Z',
    organization: {
      id: 3,
      name: 'Research Institute'
    },
    invited_by: {
      id: 3,
      name: 'Michael Chen',
      email: 'michael.chen@example.com'
    }
  }
];

// Mock Notifications
export const mockNotifications: Notification[] = [
  {
    id: 1,
    user_id: 1,
    organization_id: 1,
    title: 'New Member Joined',
    message: 'Michael Chen has joined HealthCare Plus as a member',
    type: 'organization_update',
    is_read: false,
    entity_type: 'organization_member',
    entity_id: 3,
    action_url: '/organizations/1/members',
    created_at: '2024-01-20T10:00:00Z'
  },
  {
    id: 2,
    user_id: 2,
    organization_id: 2,
    title: 'Invitation Sent',
    message: 'You invited bob.taylor@example.com to join EduTech Solutions',
    type: 'invitation',
    is_read: true,
    entity_type: 'organization_invitation',
    entity_id: 2,
    action_url: '/organizations/2/invitations',
    created_at: '2024-01-18T14:30:00Z',
    read_at: '2024-01-18T15:00:00Z'
  },
  {
    id: 3,
    user_id: 3,
    organization_id: 1,
    title: 'Role Updated',
    message: 'Your role in HealthCare Plus has been updated to member',
    type: 'role_change',
    is_read: false,
    entity_type: 'organization_member',
    entity_id: 3,
    action_url: '/organizations/1',
    created_at: '2024-01-19T11:30:00Z'
  },
  {
    id: 4,
    user_id: 1,
    organization_id: null,
    title: 'System Maintenance',
    message: 'Scheduled maintenance will occur on January 25th from 2-4 AM EST',
    type: 'system',
    is_read: false,
    action_url: '/maintenance-info',
    created_at: '2024-01-17T09:00:00Z'
  },
  {
    id: 5,
    user_id: 2,
    organization_id: 1,
    title: 'Invitation Accepted',
    message: 'Carol White has accepted your invitation to join HealthCare Plus',
    type: 'invitation',
    is_read: true,
    entity_type: 'organization_invitation',
    entity_id: 3,
    action_url: '/organizations/1/members',
    created_at: '2024-01-20T09:15:00Z',
    read_at: '2024-01-20T10:00:00Z'
  }
];

// Utility functions for working with mock data
export class MockOrganizationService {
  // Get organizations for a user
  static getUserOrganizations(userId: number): OrganizationWithStats[] {
    const userMemberships = mockOrganizationMembers.filter(member => member.user_id === userId);
    return userMemberships.map(membership => {
      const org = mockOrganizations.find(o => o.id === membership.organization_id)!;
      return {
        ...org,
        stats: mockOrganizationStats[org.id],
        user_role: membership.role,
        user_status: membership.status
      };
    });
  }

  // Get organization by ID with user context
  static getOrganizationById(organizationId: number, userId?: number): OrganizationWithStats | null {
    const org = mockOrganizations.find(o => o.id === organizationId);
    if (!org) return null;

    let userRole = undefined;
    let userStatus = undefined;

    if (userId) {
      const membership = mockOrganizationMembers.find(
        m => m.organization_id === organizationId && m.user_id === userId
      );
      if (membership) {
        userRole = membership.role;
        userStatus = membership.status;
      }
    }

    return {
      ...org,
      stats: mockOrganizationStats[org.id],
      user_role: userRole,
      user_status: userStatus
    };
  }

  // Get organization members
  static getOrganizationMembers(organizationId: number): OrganizationMember[] {
    return mockOrganizationMembers.filter(member => member.organization_id === organizationId);
  }

  // Get organization invitations
  static getOrganizationInvitations(organizationId: number): OrganizationInvitation[] {
    return mockOrganizationInvitations.filter(invitation => invitation.organization_id === organizationId);
  }

  // Get user notifications
  static getUserNotifications(userId: number, organizationId?: number): Notification[] {
    return mockNotifications.filter(notification => {
      if (notification.user_id !== userId) return false;
      if (organizationId && notification.organization_id !== organizationId) return false;
      return true;
    });
  }

  // Get unread notification count
  static getUnreadNotificationCount(userId: number, organizationId?: number): number {
    const notifications = this.getUserNotifications(userId, organizationId);
    return notifications.filter(n => !n.is_read).length;
  }

  // Check user permission
  static checkUserPermission(
    organizationId: number,
    userId: number,
    requiredRole: 'owner' | 'admin' | 'member' | 'viewer' = 'member'
  ): { hasAccess: boolean; role?: string; status?: string } {
    const membership = mockOrganizationMembers.find(
      m => m.organization_id === organizationId && m.user_id === userId
    );

    if (!membership || membership.status !== 'active') {
      return { hasAccess: false };
    }

    const roleHierarchy = ['viewer', 'member', 'admin', 'owner'];
    const userRoleLevel = roleHierarchy.indexOf(membership.role);
    const requiredRoleLevel = roleHierarchy.indexOf(requiredRole);

    return {
      hasAccess: userRoleLevel >= requiredRoleLevel,
      role: membership.role,
      status: membership.status
    };
  }

  // Get invitation by token
  static getInvitationByToken(token: string): OrganizationInvitation | null {
    return mockOrganizationInvitations.find(invitation => invitation.token === token) || null;
  }

  // Get user by email
  static getUserByEmail(email: string): User | null {
    return mockUsers.find(user => user.email === email) || null;
  }

  // Generate mock stats for organization
  static generateMockStats(organizationId: number): OrganizationStats {
    const memberCount = this.getOrganizationMembers(organizationId).length;
    return {
      member_count: memberCount,
      questionnaire_count: Math.floor(Math.random() * 30) + 5,
      response_count: Math.floor(Math.random() * 2000) + 100,
      active_questionnaire_count: Math.floor(Math.random() * 20) + 3,
      recent_activity_count: Math.floor(Math.random() * 200) + 10
    };
  }
}
