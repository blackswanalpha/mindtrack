import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals';
import { render, screen, waitFor, act } from '@testing-library/react';
import { SettingsProvider, useSettings } from '@/lib/settings-context';
import { AuthProvider } from '@/lib/auth-context';
import { useUISettings, useProfileSettings } from '@/hooks/use-settings';

// Mock fetch
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Test component that uses settings
const TestComponent = () => {
  const { userSettings, isLoadingUserSettings, updateUserSettings } = useSettings();
  
  return (
    <div>
      <div data-testid="loading">{isLoadingUserSettings ? 'Loading' : 'Loaded'}</div>
      <div data-testid="theme">{userSettings?.ui?.theme || 'No theme'}</div>
      <button 
        data-testid="update-theme"
        onClick={() => updateUserSettings({ ui: { theme: 'dark' } })}
      >
        Update Theme
      </button>
    </div>
  );
};

// Test component for UI settings hook
const UITestComponent = () => {
  const { ui, toggleTheme, updateDensity } = useUISettings();
  
  return (
    <div>
      <div data-testid="ui-theme">{ui?.theme || 'No theme'}</div>
      <div data-testid="ui-density">{ui?.density || 'No density'}</div>
      <button data-testid="toggle-theme" onClick={toggleTheme}>
        Toggle Theme
      </button>
      <button data-testid="set-compact" onClick={() => updateDensity('compact')}>
        Set Compact
      </button>
    </div>
  );
};

// Test component for profile settings hook
const ProfileTestComponent = () => {
  const { profile, updateProfile } = useProfileSettings();
  
  return (
    <div>
      <div data-testid="profile-visibility">{profile?.profile_visibility || 'No visibility'}</div>
      <button 
        data-testid="update-profile"
        onClick={() => updateProfile({ first_name: 'John' })}
      >
        Update Profile
      </button>
    </div>
  );
};

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <AuthProvider>
      <SettingsProvider>
        {component}
      </SettingsProvider>
    </AuthProvider>
  );
};

describe('Settings Context', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('SettingsProvider', () => {
    it('should provide initial loading state', () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            settings: {
              ui: { theme: 'light', density: 'comfortable' },
              profile: { profile_visibility: 'private' },
            },
            user: { id: 1, name: 'Test User' },
          },
        }),
      });

      renderWithProviders(<TestComponent />);
      
      expect(screen.getByTestId('loading')).toHaveTextContent('Loading');
    });

    it('should load user settings successfully', async () => {
      const mockSettings = {
        ui: { theme: 'light', density: 'comfortable' },
        profile: { profile_visibility: 'private' },
        notifications: { email: { enabled: true } },
        privacy: { analytics_opt_out: false },
        security: { two_factor_enabled: false },
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            settings: mockSettings,
            user: { id: 1, name: 'Test User' },
          },
        }),
      });

      renderWithProviders(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Loaded');
      });

      expect(screen.getByTestId('theme')).toHaveTextContent('light');
    });

    it('should handle settings update', async () => {
      const mockSettings = {
        ui: { theme: 'light', density: 'comfortable' },
        profile: { profile_visibility: 'private' },
      };

      // Initial load
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            settings: mockSettings,
            user: { id: 1, name: 'Test User' },
          },
        }),
      });

      // Update response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            settings: { ...mockSettings, ui: { ...mockSettings.ui, theme: 'dark' } },
            user: { id: 1, name: 'Test User' },
          },
        }),
      });

      renderWithProviders(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Loaded');
      });

      act(() => {
        screen.getByTestId('update-theme').click();
      });

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/settings/user', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ui: { theme: 'dark' } }),
        });
      });
    });

    it('should handle API errors gracefully', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          error: 'Failed to load settings',
        }),
      });

      renderWithProviders(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Loaded');
      });

      expect(screen.getByTestId('theme')).toHaveTextContent('No theme');
    });
  });

  describe('UI Settings Hook', () => {
    it('should provide UI settings and update functions', async () => {
      const mockSettings = {
        ui: { theme: 'light', density: 'comfortable' },
        profile: { profile_visibility: 'private' },
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            settings: mockSettings,
            user: { id: 1, name: 'Test User' },
          },
        }),
      });

      renderWithProviders(<UITestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('ui-theme')).toHaveTextContent('light');
        expect(screen.getByTestId('ui-density')).toHaveTextContent('comfortable');
      });
    });

    it('should toggle theme correctly', async () => {
      const mockSettings = {
        ui: { theme: 'light', density: 'comfortable' },
        profile: { profile_visibility: 'private' },
      };

      // Initial load
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            settings: mockSettings,
            user: { id: 1, name: 'Test User' },
          },
        }),
      });

      // Toggle response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            settings: { ...mockSettings, ui: { ...mockSettings.ui, theme: 'dark' } },
            user: { id: 1, name: 'Test User' },
          },
        }),
      });

      renderWithProviders(<UITestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('ui-theme')).toHaveTextContent('light');
      });

      act(() => {
        screen.getByTestId('toggle-theme').click();
      });

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/settings/user', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ui: { theme: 'dark' } }),
        });
      });
    });

    it('should update density correctly', async () => {
      const mockSettings = {
        ui: { theme: 'light', density: 'comfortable' },
        profile: { profile_visibility: 'private' },
      };

      // Initial load
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            settings: mockSettings,
            user: { id: 1, name: 'Test User' },
          },
        }),
      });

      // Update response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            settings: { ...mockSettings, ui: { ...mockSettings.ui, density: 'compact' } },
            user: { id: 1, name: 'Test User' },
          },
        }),
      });

      renderWithProviders(<UITestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('ui-density')).toHaveTextContent('comfortable');
      });

      act(() => {
        screen.getByTestId('set-compact').click();
      });

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/settings/user', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ui: { density: 'compact' } }),
        });
      });
    });
  });

  describe('Profile Settings Hook', () => {
    it('should provide profile settings and update functions', async () => {
      const mockSettings = {
        ui: { theme: 'light' },
        profile: { profile_visibility: 'private', first_name: 'John' },
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            settings: mockSettings,
            user: { id: 1, name: 'Test User' },
          },
        }),
      });

      renderWithProviders(<ProfileTestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('profile-visibility')).toHaveTextContent('private');
      });
    });

    it('should update profile correctly', async () => {
      const mockSettings = {
        ui: { theme: 'light' },
        profile: { profile_visibility: 'private' },
      };

      // Initial load
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            settings: mockSettings,
            user: { id: 1, name: 'Test User' },
          },
        }),
      });

      // Update response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            settings: { ...mockSettings, profile: { ...mockSettings.profile, first_name: 'John' } },
            user: { id: 1, name: 'Test User' },
          },
        }),
      });

      renderWithProviders(<ProfileTestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('profile-visibility')).toHaveTextContent('private');
      });

      act(() => {
        screen.getByTestId('update-profile').click();
      });

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/settings/user', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ profile: { first_name: 'John' } }),
        });
      });
    });
  });

  describe('Settings Persistence', () => {
    it('should save UI settings to localStorage', async () => {
      const mockSettings = {
        ui: { theme: 'dark', density: 'compact', animations_enabled: false },
        profile: { profile_visibility: 'private' },
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            settings: mockSettings,
            user: { id: 1, name: 'Test User' },
          },
        }),
      });

      renderWithProviders(<TestComponent />);

      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'ui-settings',
          JSON.stringify(mockSettings.ui)
        );
      });
    });

    it('should load UI settings from localStorage on initial render', () => {
      const savedUISettings = {
        theme: 'dark',
        density: 'compact',
        animations_enabled: false,
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedUISettings));

      renderWithProviders(<TestComponent />);

      // The settings should be applied immediately from localStorage
      expect(localStorageMock.getItem).toHaveBeenCalledWith('ui-settings');
    });
  });
});
