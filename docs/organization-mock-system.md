# Organization/Member Mock System

This document describes the comprehensive mock system for the organization/member workflow, designed for development, testing, and demonstration purposes.

## Overview

The mock system provides a complete simulation of the organization/member functionality without requiring a database connection. It includes realistic data, proper state management, and all the features of the real system.

## Features

### 🏢 **Organizations**
- Multiple pre-configured organizations with different types (healthcare, education, research)
- Realistic organization data with logos, contact information, and settings
- Organization statistics (member count, questionnaires, responses, etc.)
- User-specific role and status information

### 👥 **Members**
- Pre-configured users with profile images and realistic data
- Role-based access control (Owner, Admin, Member, Viewer)
- Member status management (Active, Inactive, Suspended)
- Proper permission checking and role hierarchy

### 📧 **Invitations**
- Complete invitation workflow simulation
- Token-based invitation system
- Invitation status tracking (Pending, Accepted, Declined, Expired)
- Email validation and duplicate checking

### 🔔 **Notifications**
- Real-time notification system
- Different notification types (invitation, role_change, organization_update, system)
- Unread notification counting
- Mark as read functionality

## Files Structure

```
src/
├── lib/
│   ├── mock-organization-data.ts     # Mock data definitions
│   └── mock-organization-api.ts      # Mock API implementation
├── hooks/
│   └── use-mock-organization.ts      # React hook for mock system
└── app/(admin)/demo/
    └── organization-mock/
        └── page.tsx                  # Interactive demo page
```

## Mock Data

### Users (5 users)
- **John Smith** - Admin user with profile image
- **Sarah Johnson** - Regular user
- **Michael Chen** - Regular user  
- **Emily Davis** - Regular user
- **David Wilson** - Regular user

### Organizations (3 organizations)
1. **HealthCare Plus** - Healthcare provider with 12 members
2. **EduTech Solutions** - Educational technology company with 8 members
3. **Research Institute** - Academic research institution with 6 members

### Memberships
- Users can belong to multiple organizations
- Different roles in different organizations
- Realistic join dates and status

### Invitations
- Pending, accepted, expired, and declined invitations
- Proper token generation and validation
- Expiration date handling

### Notifications
- Organization updates, role changes, invitations
- System notifications
- Read/unread status tracking

## Usage

### 1. Enable Mock Mode

Set the environment variable in your `.env.local`:

```bash
NEXT_PUBLIC_USE_MOCK_API="true"
```

### 2. Using the Hook

```typescript
import { useMockOrganization } from '@/hooks/use-mock-organization';

function MyComponent() {
  const {
    organizations,
    currentOrganization,
    members,
    loading,
    error,
    isMockMode,
    fetchOrganizations,
    createOrganization,
    inviteMember
  } = useMockOrganization();

  useEffect(() => {
    if (isMockMode) {
      fetchOrganizations();
    }
  }, [isMockMode, fetchOrganizations]);

  // Component logic...
}
```

### 3. Setting Current User

```typescript
const { setCurrentUser } = useMockOrganization();

// Switch to different user for testing
setCurrentUser(2); // Sarah Johnson
```

### 4. Demo Page

Visit `/demo/organization-mock` to see the interactive demo with:
- User switching
- Organization management
- Member management
- Invitation system
- Notification center

## API Methods

### Organizations
- `fetchOrganizations()` - Get user's organizations
- `fetchOrganization(id)` - Get specific organization
- `createOrganization(data)` - Create new organization
- `updateOrganization(id, data)` - Update organization
- `deleteOrganization(id)` - Delete organization

### Members
- `fetchMembers(orgId)` - Get organization members
- `inviteMember(orgId, data)` - Invite new member
- `updateMemberRole(orgId, userId, data)` - Update member role
- `removeMember(orgId, userId)` - Remove member

### Invitations
- `fetchInvitations(orgId)` - Get organization invitations
- `getInvitationByToken(token)` - Get invitation details
- `acceptInvitation(token)` - Accept invitation

### Notifications
- `fetchNotifications(orgId?)` - Get notifications
- `markNotificationAsRead(id)` - Mark notification as read
- `markAllNotificationsAsRead(orgId?)` - Mark all as read

## Mock vs Real API

The mock system is designed to be a drop-in replacement for the real API:

```typescript
// Mock mode automatically detected
const { isMockMode } = useMockOrganization();

if (isMockMode) {
  // Uses mock data and simulated delays
} else {
  // Uses real API endpoints
}
```

## Realistic Behavior

### Delays
- API calls include realistic delays (200-800ms)
- Simulates network latency for better testing

### Validation
- Email validation for invitations
- Permission checking for all operations
- Duplicate prevention (existing members, pending invitations)

### State Management
- Proper state updates after operations
- Optimistic updates where appropriate
- Error handling and rollback

### Data Persistence
- Changes persist during the session
- State resets on page refresh (as expected for mock data)

## Testing Scenarios

### User Roles
1. **Owner** (User 1 in HealthCare Plus)
   - Can delete organization
   - Can manage all members
   - Full administrative access

2. **Admin** (User 2 in HealthCare Plus)
   - Can invite and manage members
   - Cannot delete organization
   - Can update organization settings

3. **Member** (User 3 in HealthCare Plus)
   - Can view organization and members
   - Cannot invite or manage other members
   - Limited access

4. **Viewer** (Limited access role)
   - Read-only access to organization
   - Cannot perform any management actions

### Multi-Organization
- User 2 (Sarah) is owner of EduTech and admin of HealthCare
- User 3 (Michael) is member of HealthCare and owner of Research Institute
- Test switching between organizations and role contexts

### Invitation Flow
1. Admin invites new member
2. Invitation appears in pending list
3. Token-based acceptance flow
4. Member added to organization
5. Notification sent to relevant users

## Development Tips

### Debugging
```typescript
// Check if mock mode is active
console.log('Mock mode:', isMockMode);

// Inspect current mock data
import { mockOrganizations, mockUsers } from '@/lib/mock-organization-data';
console.log('Organizations:', mockOrganizations);
console.log('Users:', mockUsers);
```

### Custom Scenarios
```typescript
// Add custom test data
import { mockOrganizations } from '@/lib/mock-organization-data';

// Add new organization for testing
mockOrganizations.push({
  id: 999,
  name: 'Test Organization',
  // ... other properties
});
```

### Error Testing
```typescript
// Simulate API errors
const { error } = useMockOrganization();

// Mock API throws errors for invalid operations
// - Insufficient permissions
// - Duplicate invitations
// - Invalid tokens
// - Missing resources
```

## Integration with Real System

The mock system is designed to seamlessly integrate with the real organization system:

1. **Same Interface** - Identical API surface
2. **Same Data Types** - Uses the same TypeScript interfaces
3. **Same Behavior** - Matches real system behavior
4. **Easy Switching** - Toggle with environment variable

This allows for:
- Development without database setup
- Component testing with realistic data
- Demo and presentation purposes
- Integration testing scenarios

## Conclusion

The organization/member mock system provides a comprehensive development and testing environment that closely mirrors the real system behavior while being completely self-contained and easy to use.
