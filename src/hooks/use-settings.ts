import { useSettings } from '@/lib/settings-context';
import { 
  ProfileSettings, 
  NotificationSettings, 
  UISettings, 
  PrivacySettings, 
  SecuritySettings 
} from '@/types/database';

// Hook for profile settings
export const useProfileSettings = () => {
  const { userSettings, updateUserSettings, isLoadingUserSettings, error } = useSettings();
  
  const updateProfile = async (profileData: Partial<ProfileSettings>) => {
    return await updateUserSettings({ profile: profileData });
  };

  return {
    profile: userSettings?.profile || null,
    updateProfile,
    isLoading: isLoadingUserSettings,
    error,
  };
};

// Hook for notification settings
export const useNotificationSettings = () => {
  const { userSettings, updateUserSettings, isLoadingUserSettings, error } = useSettings();
  
  const updateNotifications = async (notificationData: Partial<NotificationSettings>) => {
    return await updateUserSettings({ notifications: notificationData });
  };

  return {
    notifications: userSettings?.notifications || null,
    updateNotifications,
    isLoading: isLoadingUserSettings,
    error,
  };
};

// Hook for UI settings
export const useUISettings = () => {
  const { userSettings, updateUserSettings, isLoadingUserSettings, error } = useSettings();
  
  const updateUI = async (uiData: Partial<UISettings>) => {
    return await updateUserSettings({ ui: uiData });
  };

  const toggleTheme = async () => {
    const currentTheme = userSettings?.ui?.theme || 'system';
    let newTheme: 'light' | 'dark' | 'system';
    
    switch (currentTheme) {
      case 'light':
        newTheme = 'dark';
        break;
      case 'dark':
        newTheme = 'system';
        break;
      default:
        newTheme = 'light';
        break;
    }
    
    return await updateUI({ theme: newTheme });
  };

  const updateDensity = async (density: 'compact' | 'comfortable' | 'spacious') => {
    return await updateUI({ density });
  };

  const updateLanguage = async (language: string) => {
    return await updateUI({ language });
  };

  const updateTimezone = async (timezone: string) => {
    return await updateUI({ timezone });
  };

  return {
    ui: userSettings?.ui || null,
    updateUI,
    toggleTheme,
    updateDensity,
    updateLanguage,
    updateTimezone,
    isLoading: isLoadingUserSettings,
    error,
  };
};

// Hook for privacy settings
export const usePrivacySettings = () => {
  const { userSettings, updateUserSettings, isLoadingUserSettings, error } = useSettings();
  
  const updatePrivacy = async (privacyData: Partial<PrivacySettings>) => {
    return await updateUserSettings({ privacy: privacyData });
  };

  const toggleAnalyticsOptOut = async () => {
    const current = userSettings?.privacy?.analytics_opt_out || false;
    return await updatePrivacy({ analytics_opt_out: !current });
  };

  const toggleDataSharingOptOut = async () => {
    const current = userSettings?.privacy?.data_sharing_opt_out || false;
    return await updatePrivacy({ data_sharing_opt_out: !current });
  };

  return {
    privacy: userSettings?.privacy || null,
    updatePrivacy,
    toggleAnalyticsOptOut,
    toggleDataSharingOptOut,
    isLoading: isLoadingUserSettings,
    error,
  };
};

// Hook for security settings
export const useSecuritySettings = () => {
  const { userSettings, updateUserSettings, isLoadingUserSettings, error } = useSettings();
  
  const updateSecurity = async (securityData: Partial<SecuritySettings>) => {
    return await updateUserSettings({ security: securityData });
  };

  const toggleTwoFactor = async () => {
    const current = userSettings?.security?.two_factor_enabled || false;
    return await updateSecurity({ two_factor_enabled: !current });
  };

  const updateSessionTimeout = async (timeout: number) => {
    return await updateSecurity({ session_timeout: timeout });
  };

  const toggleLoginNotifications = async () => {
    const current = userSettings?.security?.login_notifications || true;
    return await updateSecurity({ login_notifications: !current });
  };

  return {
    security: userSettings?.security || null,
    updateSecurity,
    toggleTwoFactor,
    updateSessionTimeout,
    toggleLoginNotifications,
    isLoading: isLoadingUserSettings,
    error,
  };
};

// Hook for application settings (admin only)
export const useApplicationSettings = () => {
  const { 
    applicationSettings, 
    updateApplicationSettings, 
    isLoadingApplicationSettings, 
    error 
  } = useSettings();
  
  const updateGeneral = async (generalData: any) => {
    return await updateApplicationSettings({ general: generalData });
  };

  const updateAPI = async (apiData: any) => {
    return await updateApplicationSettings({ api: apiData });
  };

  const updateIntegrations = async (integrationsData: any) => {
    return await updateApplicationSettings({ integrations: integrationsData });
  };

  const updateEmail = async (emailData: any) => {
    return await updateApplicationSettings({ email: emailData });
  };

  const updateSystem = async (systemData: any) => {
    return await updateApplicationSettings({ system: systemData });
  };

  const toggleMaintenanceMode = async () => {
    const current = applicationSettings?.system?.maintenance_mode || false;
    return await updateSystem({ maintenance_mode: !current });
  };

  return {
    applicationSettings,
    updateGeneral,
    updateAPI,
    updateIntegrations,
    updateEmail,
    updateSystem,
    toggleMaintenanceMode,
    isLoading: isLoadingApplicationSettings,
    error,
  };
};

// Hook for theme management
export const useTheme = () => {
  const { ui, toggleTheme, updateUI, isLoading } = useUISettings();
  
  const theme = ui?.theme || 'system';
  const isDark = theme === 'dark' || (theme === 'system' && 
    typeof window !== 'undefined' && 
    window.matchMedia('(prefers-color-scheme: dark)').matches);

  const setTheme = async (newTheme: 'light' | 'dark' | 'system') => {
    return await updateUI({ theme: newTheme });
  };

  return {
    theme,
    isDark,
    setTheme,
    toggleTheme,
    isLoading,
  };
};

// Hook for getting formatted date/time based on user preferences
export const useDateTimeFormat = () => {
  const { ui } = useUISettings();
  
  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const format = ui?.date_format || 'MM/DD/YYYY';
    
    switch (format) {
      case 'DD/MM/YYYY':
        return dateObj.toLocaleDateString('en-GB');
      case 'YYYY-MM-DD':
        return dateObj.toISOString().split('T')[0];
      default:
        return dateObj.toLocaleDateString('en-US');
    }
  };

  const formatTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const format = ui?.time_format || '12h';
    
    return dateObj.toLocaleTimeString('en-US', {
      hour12: format === '12h',
      timeZone: ui?.timezone || 'UTC',
    });
  };

  const formatDateTime = (date: Date | string) => {
    return `${formatDate(date)} ${formatTime(date)}`;
  };

  return {
    formatDate,
    formatTime,
    formatDateTime,
    timezone: ui?.timezone || 'UTC',
    dateFormat: ui?.date_format || 'MM/DD/YYYY',
    timeFormat: ui?.time_format || '12h',
  };
};
