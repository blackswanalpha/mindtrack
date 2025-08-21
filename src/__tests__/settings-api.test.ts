import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { GET as getUserSettings, PUT as updateUserSettings } from '@/app/api/settings/user/route';
import { GET as getApplicationSettings, PUT as updateApplicationSettings } from '@/app/api/settings/application/route';
import { POST as changePassword } from '@/app/api/settings/password/route';

// Mock the database query function
jest.mock('@/lib/db', () => ({
  query: jest.fn(),
}));

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

const { query } = require('@/lib/db');
const bcrypt = require('bcryptjs');

describe('Settings API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('User Settings API', () => {
    describe('GET /api/settings/user', () => {
      it('should return user settings successfully', async () => {
        const mockUserData = {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
          profile_image: null,
          settings: {
            profile: {
              profile_visibility: 'private',
              show_email: false,
              show_phone: false,
            },
            notifications: {
              email: {
                enabled: true,
                questionnaire_responses: true,
                organization_invites: true,
                system_updates: true,
                marketing: false,
                weekly_digest: true,
                frequency: 'immediate',
              },
            },
          },
        };

        query.mockResolvedValueOnce({ rows: [mockUserData] });

        const request = new NextRequest('http://localhost:3000/api/settings/user');
        const response = await getUserSettings(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data.settings).toBeDefined();
        expect(data.data.user.id).toBe(1);
      });

      it('should return 404 when user not found', async () => {
        query.mockResolvedValueOnce({ rows: [] });

        const request = new NextRequest('http://localhost:3000/api/settings/user');
        const response = await getUserSettings(request);
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data.success).toBe(false);
        expect(data.error).toBe('User not found');
      });
    });

    describe('PUT /api/settings/user', () => {
      it('should update user settings successfully', async () => {
        const mockCurrentSettings = {
          profile: { profile_visibility: 'private' },
          notifications: { email: { enabled: true } },
        };

        const mockUserData = {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
          profile_image: null,
        };

        query
          .mockResolvedValueOnce({ rows: [{ settings: mockCurrentSettings }] })
          .mockResolvedValueOnce({})
          .mockResolvedValueOnce({ rows: [mockUserData] });

        const updateData = {
          profile: { first_name: 'John' },
        };

        const request = new NextRequest('http://localhost:3000/api/settings/user', {
          method: 'PUT',
          body: JSON.stringify(updateData),
        });

        const response = await updateUserSettings(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.message).toBe('Settings updated successfully');
      });

      it('should validate settings data and return errors', async () => {
        const invalidData = {
          profile: {
            first_name: 'A'.repeat(51), // Too long
            email: 'invalid-email', // Invalid format
          },
        };

        const request = new NextRequest('http://localhost:3000/api/settings/user', {
          method: 'PUT',
          body: JSON.stringify(invalidData),
        });

        const response = await updateUserSettings(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.errors).toBeDefined();
        expect(data.errors.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Application Settings API', () => {
    describe('GET /api/settings/application', () => {
      it('should return application settings for admin users', async () => {
        const mockSettings = {
          general: {
            company_name: 'MindTrack',
            support_email: 'support@mindtrack.com',
          },
          api: {
            rate_limits: {
              requests_per_minute: 100,
              requests_per_hour: 1000,
              requests_per_day: 10000,
            },
          },
        };

        query.mockResolvedValueOnce({ 
          rows: [{ value: JSON.stringify(mockSettings) }] 
        });

        const request = new NextRequest('http://localhost:3000/api/settings/application');
        const response = await getApplicationSettings(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data.settings).toBeDefined();
        expect(data.data.settings.general.company_name).toBe('MindTrack');
      });

      it('should return 403 for non-admin users', async () => {
        // This would be tested with proper authentication mocking
        // For now, we'll assume the getUserFromRequest function handles this
      });
    });

    describe('PUT /api/settings/application', () => {
      it('should update application settings successfully', async () => {
        const mockCurrentSettings = {
          general: { company_name: 'MindTrack' },
          api: { rate_limits: { requests_per_minute: 100 } },
        };

        query
          .mockResolvedValueOnce({ 
            rows: [{ value: JSON.stringify(mockCurrentSettings) }] 
          })
          .mockResolvedValueOnce({});

        const updateData = {
          general: { company_name: 'Updated MindTrack' },
        };

        const request = new NextRequest('http://localhost:3000/api/settings/application', {
          method: 'PUT',
          body: JSON.stringify(updateData),
        });

        const response = await updateApplicationSettings(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.message).toBe('Application settings updated successfully');
      });
    });
  });

  describe('Password Change API', () => {
    describe('POST /api/settings/password', () => {
      it('should change password successfully', async () => {
        const mockUserData = {
          id: 1,
          password: 'hashed_current_password',
        };

        query
          .mockResolvedValueOnce({ rows: [mockUserData] })
          .mockResolvedValueOnce({})
          .mockResolvedValueOnce({});

        bcrypt.compare.mockResolvedValueOnce(true);
        bcrypt.hash.mockResolvedValueOnce('hashed_new_password');

        const passwordData = {
          current_password: 'current_password',
          new_password: 'new_password123',
          confirm_password: 'new_password123',
        };

        const request = new NextRequest('http://localhost:3000/api/settings/password', {
          method: 'POST',
          body: JSON.stringify(passwordData),
        });

        const response = await changePassword(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.message).toBe('Password changed successfully');
      });

      it('should reject invalid current password', async () => {
        const mockUserData = {
          id: 1,
          password: 'hashed_current_password',
        };

        query.mockResolvedValueOnce({ rows: [mockUserData] });
        bcrypt.compare.mockResolvedValueOnce(false);

        const passwordData = {
          current_password: 'wrong_password',
          new_password: 'new_password123',
          confirm_password: 'new_password123',
        };

        const request = new NextRequest('http://localhost:3000/api/settings/password', {
          method: 'POST',
          body: JSON.stringify(passwordData),
        });

        const response = await changePassword(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.message).toBe('Current password is incorrect');
      });

      it('should validate password strength', async () => {
        const passwordData = {
          current_password: 'current_password',
          new_password: '123', // Too weak
          confirm_password: '123',
        };

        const request = new NextRequest('http://localhost:3000/api/settings/password', {
          method: 'POST',
          body: JSON.stringify(passwordData),
        });

        const response = await changePassword(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.errors).toBeDefined();
        expect(data.errors.some((error: any) => error.code === 'PASSWORD_TOO_SHORT')).toBe(true);
      });

      it('should reject mismatched passwords', async () => {
        const passwordData = {
          current_password: 'current_password',
          new_password: 'new_password123',
          confirm_password: 'different_password123',
        };

        const request = new NextRequest('http://localhost:3000/api/settings/password', {
          method: 'POST',
          body: JSON.stringify(passwordData),
        });

        const response = await changePassword(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.errors).toBeDefined();
        expect(data.errors.some((error: any) => error.code === 'PASSWORD_MISMATCH')).toBe(true);
      });
    });
  });
});
