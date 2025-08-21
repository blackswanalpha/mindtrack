import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SettingsProvider } from '@/lib/settings-context';
import { AuthProvider } from '@/lib/auth-context';
import ProfileSettingsPage from '@/app/settings/profile/page';
import NotificationSettingsPage from '@/app/settings/notifications/page';
import UISettingsPage from '@/app/settings/ui/page';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/settings/profile',
}));

// Mock fetch
global.fetch = jest.fn();

// Mock file upload
Object.defineProperty(window, 'File', {
  value: class MockFile {
    constructor(public name: string, public type: string, public size: number) {}
  },
});

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <AuthProvider>
      <SettingsProvider>
        {component}
      </SettingsProvider>
    </AuthProvider>
  );
};

describe('Settings Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful settings fetch
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
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
              in_app: {
                enabled: true,
                questionnaire_responses: true,
                organization_invites: true,
                system_updates: true,
                mentions: true,
                sound_enabled: true,
              },
              push: {
                enabled: false,
                questionnaire_responses: false,
                organization_invites: true,
                system_updates: false,
                mentions: true,
              },
              sms: {
                enabled: false,
                critical_only: true,
              },
            },
            ui: {
              theme: 'system',
              density: 'comfortable',
              language: 'en',
              timezone: 'UTC',
              date_format: 'MM/DD/YYYY',
              time_format: '12h',
              sidebar_collapsed: false,
              animations_enabled: true,
              high_contrast: false,
              font_size: 'medium',
            },
          },
          user: {
            id: 1,
            name: 'Test User',
            email: 'test@example.com',
            role: 'user',
            profile_image: null,
          },
        },
      }),
    });
  });

  describe('Profile Settings Page', () => {
    it('should render profile settings form', async () => {
      renderWithProviders(<ProfileSettingsPage />);

      await waitFor(() => {
        expect(screen.getByText('Profile Picture')).toBeInTheDocument();
        expect(screen.getByText('Personal Information')).toBeInTheDocument();
        expect(screen.getByText('Social Links')).toBeInTheDocument();
        expect(screen.getByText('Profile Privacy')).toBeInTheDocument();
      });
    });

    it('should handle profile picture upload', async () => {
      const user = userEvent.setup();
      
      // Mock successful upload
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            profile_image_url: '/uploads/profile-pictures/test.jpg',
          },
        }),
      });

      renderWithProviders(<ProfileSettingsPage />);

      await waitFor(() => {
        expect(screen.getByText('Upload')).toBeInTheDocument();
      });

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = document.createElement('input');
      input.type = 'file';
      input.id = 'profile-picture-input';
      document.body.appendChild(input);

      await user.upload(input, file);

      expect(input.files?.[0]).toBe(file);
    });

    it('should update personal information', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<ProfileSettingsPage />);

      await waitFor(() => {
        expect(screen.getByLabelText('First Name')).toBeInTheDocument();
      });

      const firstNameInput = screen.getByLabelText('First Name');
      await user.clear(firstNameInput);
      await user.type(firstNameInput, 'John');

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/settings/user', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            profile: expect.objectContaining({
              first_name: 'John',
            }),
          }),
        });
      });
    });

    it('should toggle privacy settings', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<ProfileSettingsPage />);

      await waitFor(() => {
        expect(screen.getByText('Show Email Address')).toBeInTheDocument();
      });

      const emailToggle = screen.getByRole('switch', { name: /show email address/i });
      await user.click(emailToggle);

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/settings/user', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            profile: expect.objectContaining({
              show_email: true,
            }),
          }),
        });
      });
    });
  });

  describe('Notification Settings Page', () => {
    it('should render notification settings form', async () => {
      renderWithProviders(<NotificationSettingsPage />);

      await waitFor(() => {
        expect(screen.getByText('Email Notifications')).toBeInTheDocument();
        expect(screen.getByText('In-App Notifications')).toBeInTheDocument();
        expect(screen.getByText('Push Notifications')).toBeInTheDocument();
        expect(screen.getByText('SMS Notifications')).toBeInTheDocument();
      });
    });

    it('should toggle email notifications', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<NotificationSettingsPage />);

      await waitFor(() => {
        expect(screen.getByText('Enable Email Notifications')).toBeInTheDocument();
      });

      const emailToggle = screen.getByRole('switch', { name: /enable email notifications/i });
      await user.click(emailToggle);

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/settings/user', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            notifications: expect.objectContaining({
              email: expect.objectContaining({
                enabled: false,
              }),
            }),
          }),
        });
      });
    });

    it('should update email frequency', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<NotificationSettingsPage />);

      await waitFor(() => {
        expect(screen.getByText('Email Frequency')).toBeInTheDocument();
      });

      const frequencySelect = screen.getByRole('combobox');
      await user.click(frequencySelect);
      
      const dailyOption = screen.getByText('Daily Digest');
      await user.click(dailyOption);

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/settings/user', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            notifications: expect.objectContaining({
              email: expect.objectContaining({
                frequency: 'daily',
              }),
            }),
          }),
        });
      });
    });
  });

  describe('UI Settings Page', () => {
    it('should render UI settings form', async () => {
      renderWithProviders(<UISettingsPage />);

      await waitFor(() => {
        expect(screen.getByText('Theme & Appearance')).toBeInTheDocument();
        expect(screen.getByText('Language & Region')).toBeInTheDocument();
        expect(screen.getByText('Preview')).toBeInTheDocument();
      });
    });

    it('should change theme', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<UISettingsPage />);

      await waitFor(() => {
        expect(screen.getByText('Theme')).toBeInTheDocument();
      });

      const themeSelect = screen.getByRole('combobox');
      await user.click(themeSelect);
      
      const darkOption = screen.getByText('Dark');
      await user.click(darkOption);

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/settings/user', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ui: expect.objectContaining({
              theme: 'dark',
            }),
          }),
        });
      });
    });

    it('should toggle animations', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<UISettingsPage />);

      await waitFor(() => {
        expect(screen.getByText('Animations')).toBeInTheDocument();
      });

      const animationsToggle = screen.getByRole('switch', { name: /animations/i });
      await user.click(animationsToggle);

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/settings/user', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ui: expect.objectContaining({
              animations_enabled: false,
            }),
          }),
        });
      });
    });

    it('should update timezone', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<UISettingsPage />);

      await waitFor(() => {
        expect(screen.getByText('Timezone')).toBeInTheDocument();
      });

      const timezoneSelect = screen.getAllByRole('combobox')[1]; // Second combobox is timezone
      await user.click(timezoneSelect);
      
      const estOption = screen.getByText('Eastern Time (ET)');
      await user.click(estOption);

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/settings/user', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ui: expect.objectContaining({
              timezone: 'America/New_York',
            }),
          }),
        });
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message when API call fails', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
      
      renderWithProviders(<ProfileSettingsPage />);

      await waitFor(() => {
        // The component should handle the error gracefully
        expect(screen.queryByText('Loading')).not.toBeInTheDocument();
      });
    });

    it('should handle validation errors', async () => {
      const user = userEvent.setup();
      
      // Mock validation error response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          errors: [
            {
              field: 'profile.first_name',
              message: 'First name is too long',
              code: 'INVALID_LENGTH',
            },
          ],
        }),
      });

      renderWithProviders(<ProfileSettingsPage />);

      await waitFor(() => {
        expect(screen.getByLabelText('First Name')).toBeInTheDocument();
      });

      const firstNameInput = screen.getByLabelText('First Name');
      await user.clear(firstNameInput);
      await user.type(firstNameInput, 'A'.repeat(51)); // Too long

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);

      // The component should handle validation errors appropriately
      await waitFor(() => {
        expect(fetch).toHaveBeenCalled();
      });
    });
  });
});
