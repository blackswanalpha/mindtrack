'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  UserSettings, 
  ApplicationSettings, 
  UpdateUserSettingsData,
  UpdateApplicationSettingsData,
  UserSettingsResponse,
  ApplicationSettingsResponse 
} from '@/types/database';
import { useAuth } from '@/lib/auth-context';

interface SettingsContextType {
  // User Settings
  userSettings: UserSettings | null;
  isLoadingUserSettings: boolean;
  updateUserSettings: (updates: UpdateUserSettingsData) => Promise<boolean>;
  refreshUserSettings: () => Promise<void>;
  
  // Application Settings (Admin only)
  applicationSettings: ApplicationSettings | null;
  isLoadingApplicationSettings: boolean;
  updateApplicationSettings: (updates: UpdateApplicationSettingsData) => Promise<boolean>;
  refreshApplicationSettings: () => Promise<void>;
  
  // Error handling
  error: string | null;
  clearError: () => void;
}

const SettingsContext = createContext<SettingsContextType>({
  userSettings: null,
  isLoadingUserSettings: true,
  updateUserSettings: async () => false,
  refreshUserSettings: async () => {},
  applicationSettings: null,
  isLoadingApplicationSettings: true,
  updateApplicationSettings: async () => false,
  refreshApplicationSettings: async () => {},
  error: null,
  clearError: () => {}
});

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [applicationSettings, setApplicationSettings] = useState<ApplicationSettings | null>(null);
  const [isLoadingUserSettings, setIsLoadingUserSettings] = useState<boolean>(true);
  const [isLoadingApplicationSettings, setIsLoadingApplicationSettings] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = user?.role === 'admin' || user?.role === 'organization_admin';

  // Load user settings when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserSettings();
    } else {
      setUserSettings(null);
      setIsLoadingUserSettings(false);
    }
  }, [isAuthenticated, user]);

  // Load application settings for admin users
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      loadApplicationSettings();
    } else {
      setApplicationSettings(null);
      setIsLoadingApplicationSettings(false);
    }
  }, [isAuthenticated, isAdmin]);

  const loadUserSettings = async () => {
    try {
      setIsLoadingUserSettings(true);
      setError(null);
      
      const response = await fetch('/api/settings/user');
      
      if (response.ok) {
        const data: UserSettingsResponse = await response.json();
        setUserSettings(data.data.settings);
        
        // Apply UI settings immediately
        applyUISettings(data.data.settings.ui);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load user settings');
      }
    } catch (err) {
      console.error('Error loading user settings:', err);
      setError('Failed to load user settings');
    } finally {
      setIsLoadingUserSettings(false);
    }
  };

  const loadApplicationSettings = async () => {
    try {
      setIsLoadingApplicationSettings(true);
      setError(null);
      
      const response = await fetch('/api/settings/application');
      
      if (response.ok) {
        const data: ApplicationSettingsResponse = await response.json();
        setApplicationSettings(data.data.settings);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load application settings');
      }
    } catch (err) {
      console.error('Error loading application settings:', err);
      setError('Failed to load application settings');
    } finally {
      setIsLoadingApplicationSettings(false);
    }
  };

  const updateUserSettings = async (updates: UpdateUserSettingsData): Promise<boolean> => {
    try {
      setError(null);
      
      const response = await fetch('/api/settings/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const data: UserSettingsResponse = await response.json();
        setUserSettings(data.data.settings);
        
        // Apply UI settings if they were updated
        if (updates.ui) {
          applyUISettings(data.data.settings.ui);
        }
        
        return true;
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update user settings');
        return false;
      }
    } catch (err) {
      console.error('Error updating user settings:', err);
      setError('Failed to update user settings');
      return false;
    }
  };

  const updateApplicationSettings = async (updates: UpdateApplicationSettingsData): Promise<boolean> => {
    try {
      setError(null);
      
      const response = await fetch('/api/settings/application', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const data: ApplicationSettingsResponse = await response.json();
        setApplicationSettings(data.data.settings);
        return true;
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update application settings');
        return false;
      }
    } catch (err) {
      console.error('Error updating application settings:', err);
      setError('Failed to update application settings');
      return false;
    }
  };

  const refreshUserSettings = async () => {
    await loadUserSettings();
  };

  const refreshApplicationSettings = async () => {
    await loadApplicationSettings();
  };

  const clearError = () => {
    setError(null);
  };

  // Apply UI settings to the document
  const applyUISettings = (uiSettings: UserSettings['ui']) => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;
    
    // Apply theme
    if (uiSettings.theme === 'dark') {
      root.classList.add('dark');
    } else if (uiSettings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System theme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }

    // Apply density
    root.setAttribute('data-density', uiSettings.density);

    // Apply font size
    root.setAttribute('data-font-size', uiSettings.font_size);

    // Apply high contrast
    if (uiSettings.high_contrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Apply animations
    if (!uiSettings.animations_enabled) {
      root.classList.add('no-animations');
    } else {
      root.classList.remove('no-animations');
    }

    // Store settings in localStorage for persistence
    localStorage.setItem('ui-settings', JSON.stringify(uiSettings));
  };

  // Load UI settings from localStorage on initial load
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedSettings = localStorage.getItem('ui-settings');
    if (savedSettings && !userSettings) {
      try {
        const uiSettings = JSON.parse(savedSettings);
        applyUISettings(uiSettings);
      } catch (err) {
        console.error('Error parsing saved UI settings:', err);
      }
    }
  }, [userSettings]);

  const value: SettingsContextType = {
    userSettings,
    isLoadingUserSettings,
    updateUserSettings,
    refreshUserSettings,
    applicationSettings,
    isLoadingApplicationSettings,
    updateApplicationSettings,
    refreshApplicationSettings,
    error,
    clearError,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
