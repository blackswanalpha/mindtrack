# Organization/Member Workflow System

## Overview

The MindTrack Organization/Member Workflow System provides comprehensive functionality for managing organizations, members, roles, and permissions within the MindTrack platform. This system enables collaborative questionnaire management and response analysis across teams and organizations.

## Features

### Core Features
- **Organization Management**: Create, update, and manage organizations
- **Member Management**: Invite, manage, and remove organization members
- **Role-Based Access Control**: Granular permissions based on user roles
- **Invitation System**: Email-based member invitations with secure tokens
- **Audit Logging**: Complete audit trail of all organization activities
- **Notification System**: Real-time notifications for organization events
- **Multi-Organization Support**: Users can belong to multiple organizations

### User Roles

#### Owner
- Full control over the organization
- Can manage all aspects of the organization
- Can assign/remove other owners
- Can delete the organization

#### Administrator
- Can manage members and their roles
- Can manage questionnaires and responses
- Can update organization settings
- Cannot delete the organization or manage owners

#### Member
- Can create and manage questionnaires
- Can view responses within their scope
- Can participate in organization activities
- Limited administrative access

#### Viewer
- Read-only access to organization data
- Can view questionnaires and responses
- Cannot create or modify content
- Cannot manage members

## Database Schema

### Core Tables

#### organizations
```sql
CREATE TABLE organizations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  type VARCHAR(100),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  address TEXT,
  logo_url VARCHAR(500),
  settings JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

#### organization_members
```sql
CREATE TABLE organization_members (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);
```

#### organization_invitations
```sql
CREATE TABLE organization_invitations (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer')),
  token VARCHAR(255) NOT NULL UNIQUE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired', 'cancelled')),
  invited_by_id INTEGER NOT NULL REFERENCES users(id),
  expires_at TIMESTAMP NOT NULL,
  accepted_at TIMESTAMP,
  accepted_by_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

## API Endpoints

### Organization Management

#### GET /api/organizations
Get user's organizations
- **Authentication**: Required
- **Returns**: List of organizations with user's role and stats

#### POST /api/organizations
Create new organization
- **Authentication**: Required
- **Body**: Organization data (name, description, type, etc.)
- **Returns**: Created organization with stats

#### GET /api/organizations/[id]
Get organization details
- **Authentication**: Required
- **Permissions**: Organization member
- **Returns**: Organization details with stats

#### PUT /api/organizations/[id]
Update organization
- **Authentication**: Required
- **Permissions**: Admin or Owner
- **Body**: Updated organization data
- **Returns**: Updated organization

#### DELETE /api/organizations/[id]
Delete organization
- **Authentication**: Required
- **Permissions**: Owner only
- **Returns**: Success confirmation

### Member Management

#### GET /api/organizations/[id]/members
Get organization members
- **Authentication**: Required
- **Permissions**: Organization member
- **Returns**: List of members with user details

#### POST /api/organizations/[id]/members
Invite new member
- **Authentication**: Required
- **Permissions**: Admin or Owner
- **Body**: `{ email, role, message? }`
- **Returns**: Created invitation

#### PUT /api/organizations/[id]/members/[userId]
Update member role
- **Authentication**: Required
- **Permissions**: Admin or Owner (with restrictions)
- **Body**: `{ role }`
- **Returns**: Updated member

#### DELETE /api/organizations/[id]/members/[userId]
Remove member
- **Authentication**: Required
- **Permissions**: Admin or Owner (with restrictions)
- **Returns**: Success confirmation

### Invitation Management

#### GET /api/organizations/[id]/invitations
Get organization invitations
- **Authentication**: Required
- **Permissions**: Admin or Owner
- **Returns**: List of pending invitations

#### GET /api/invitations/[token]
Get invitation details
- **Authentication**: Not required
- **Returns**: Public invitation details

#### POST /api/invitations/[token]
Accept invitation
- **Authentication**: Required
- **Returns**: Membership details

#### DELETE /api/organizations/invitations/[id]
Cancel invitation
- **Authentication**: Required
- **Permissions**: Admin or Owner
- **Returns**: Success confirmation

## Usage Examples

### Creating an Organization

```typescript
import { OrganizationService } from '@/lib/organization-service';

const organization = await OrganizationService.createOrganization({
  name: 'Healthcare Research Institute',
  description: 'Leading healthcare research organization',
  type: 'healthcare',
  contact_email: 'contact@hri.org'
}, userId);
```

### Inviting Members

```typescript
const invitation = await OrganizationService.inviteMember(
  organizationId,
  {
    email: 'researcher@example.com',
    role: 'member',
    message: 'Welcome to our research team!'
  },
  inviterId
);
```

### Checking Permissions

```typescript
import { PermissionChecker, PERMISSIONS } from '@/lib/permissions';

const checker = new PermissionChecker(organizationId, userId);
await checker.initialize();

if (checker.hasPermission(PERMISSIONS.MEMBER_INVITE)) {
  // User can invite members
}
```

## Frontend Components

### Core Components
- `OrganizationSelector`: Dropdown for switching between organizations
- `OrganizationDashboard`: Main dashboard with stats and quick actions
- `MemberManagement`: Complete member management interface
- `InviteMemberForm`: Modal form for inviting new members
- `CreateOrganizationForm`: Modal form for creating organizations
- `NotificationCenter`: Real-time notification display

### Context Provider
```typescript
import { OrganizationProvider, useOrganization } from '@/lib/organization-context';

function App() {
  return (
    <OrganizationProvider>
      <YourApp />
    </OrganizationProvider>
  );
}

function YourComponent() {
  const { currentOrganization, members, userRole } = useOrganization();
  // Use organization context
}
```

## Security Considerations

### Access Control
- All API endpoints require authentication
- Role-based permissions are enforced at the API level
- Organization data is isolated between organizations
- Audit logging tracks all sensitive operations

### Invitation Security
- Invitation tokens are cryptographically secure
- Tokens have expiration dates (7 days default)
- Email verification ensures invitations reach intended recipients
- Tokens are single-use and invalidated after acceptance

### Data Privacy
- Users can only access organizations they belong to
- Member data is only visible to organization members
- Audit logs are organization-scoped
- Sensitive operations require appropriate permissions

## Testing

### Running Tests

```bash
# Run all organization tests
npm run test:organization

# Run unit tests
npm test organization

# Run API tests
npm test organization-api

# Run permission tests
npm test permissions
```

### Test Coverage
- Database operations (CRUD, permissions, invitations)
- API endpoints (all routes with various scenarios)
- Permission system (role hierarchy, access control)
- Frontend components (user interactions, state management)
- Integration workflows (complete user journeys)

## Configuration

### Environment Variables

```env
# Email Configuration (for invitations)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Application URL (for invitation links)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Database Setup

```bash
# Initialize database with organization tables
npm run db:init
```

## Troubleshooting

### Common Issues

1. **Invitation emails not sending**
   - Check SMTP configuration
   - Verify email credentials
   - Test email configuration: `npm run test:email`

2. **Permission denied errors**
   - Verify user has correct role
   - Check organization membership
   - Review permission requirements

3. **Database connection issues**
   - Verify database is running
   - Check connection string
   - Run database initialization

### Debug Mode

Enable debug logging by setting:
```env
DEBUG=organization:*
```

## Migration Guide

### From Basic User System

1. Run database migrations to add organization tables
2. Update existing questionnaires to include organization_id
3. Migrate existing users to organization owners
4. Update frontend to use organization context

### Upgrading Permissions

1. Review existing role assignments
2. Map old permissions to new role-based system
3. Update API endpoints to use new permission checks
4. Test all user workflows

## Contributing

### Adding New Permissions

1. Add permission constant to `PERMISSIONS` object
2. Update role mappings in `ROLE_PERMISSIONS`
3. Add permission checks to relevant API endpoints
4. Update tests to cover new permissions
5. Document permission in this guide

### Adding New Roles

1. Update database CHECK constraints
2. Add role to TypeScript types
3. Update permission mappings
4. Add role-specific UI elements
5. Update tests and documentation

## Support

For issues, questions, or contributions:
- Create an issue in the project repository
- Review existing documentation
- Check test files for usage examples
- Contact the development team
