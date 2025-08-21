import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { 
  UserSettings, 
  UpdateUserSettingsData, 
  UserSettingsResponse,
  SettingsValidationError 
} from '@/types/database';

// Helper function to get user from request (mock implementation)
function getUserFromRequest(request: NextRequest) {
  // In a real implementation, this would extract and validate the JWT token
  // For now, return a mock user
  return {
    userId: 1,
    role: 'admin'
  };
}

// Helper function to validate settings data
function validateUserSettings(data: UpdateUserSettingsData): SettingsValidationError[] {
  const errors: SettingsValidationError[] = [];

  // Validate profile settings
  if (data.profile) {
    if (data.profile.first_name && data.profile.first_name.length > 50) {
      errors.push({
        field: 'profile.first_name',
        message: 'First name must be less than 50 characters',
        code: 'INVALID_LENGTH'
      });
    }
    if (data.profile.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.profile.email)) {
      errors.push({
        field: 'profile.email',
        message: 'Invalid email format',
        code: 'INVALID_FORMAT'
      });
    }
  }

  // Validate notification settings
  if (data.notifications?.sms?.phone_number) {
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    if (!phoneRegex.test(data.notifications.sms.phone_number)) {
      errors.push({
        field: 'notifications.sms.phone_number',
        message: 'Invalid phone number format',
        code: 'INVALID_FORMAT'
      });
    }
  }

  // Validate UI settings
  if (data.ui?.timezone && !Intl.supportedValuesOf('timeZone').includes(data.ui.timezone)) {
    errors.push({
      field: 'ui.timezone',
      message: 'Invalid timezone',
      code: 'INVALID_VALUE'
    });
  }

  return errors;
}

// Default user settings
const getDefaultUserSettings = (): UserSettings => ({
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
  privacy: {
    analytics_opt_out: false,
    data_sharing_opt_out: false,
    profile_indexing: true,
    activity_tracking: true,
    usage_statistics: true,
    third_party_cookies: true,
    data_retention_period: 365,
  },
  security: {
    two_factor_enabled: false,
    two_factor_method: 'app',
    session_timeout: 480, // 8 hours
    login_notifications: true,
    device_tracking: true,
    password_expiry_days: 90,
    require_password_change: false,
    allowed_ip_addresses: [],
    security_questions: [],
  },
});

// GET /api/settings/user - Get user settings
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user settings from database
    const userResult = await query(
      'SELECT id, name, email, role, profile_image, settings FROM users WHERE id = $1',
      [user.userId]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userResult.rows[0];
    const settings = userData.settings || getDefaultUserSettings();

    const response: UserSettingsResponse = {
      success: true,
      data: {
        settings,
        user: {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          profile_image: userData.profile_image,
        },
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching user settings:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/settings/user - Update user settings
export async function PUT(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const updateData: UpdateUserSettingsData = await request.json();

    // Validate the update data
    const validationErrors = validateUserSettings(updateData);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          errors: validationErrors,
          message: 'Validation failed' 
        },
        { status: 400 }
      );
    }

    // Get current settings
    const currentResult = await query(
      'SELECT settings FROM users WHERE id = $1',
      [user.userId]
    );

    if (currentResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const currentSettings = currentResult.rows[0].settings || getDefaultUserSettings();

    // Merge the updates with current settings
    const updatedSettings: UserSettings = {
      profile: { ...currentSettings.profile, ...updateData.profile },
      notifications: {
        email: { ...currentSettings.notifications.email, ...updateData.notifications?.email },
        in_app: { ...currentSettings.notifications.in_app, ...updateData.notifications?.in_app },
        push: { ...currentSettings.notifications.push, ...updateData.notifications?.push },
        sms: { ...currentSettings.notifications.sms, ...updateData.notifications?.sms },
      },
      ui: { ...currentSettings.ui, ...updateData.ui },
      privacy: { ...currentSettings.privacy, ...updateData.privacy },
      security: { ...currentSettings.security, ...updateData.security },
    };

    // Update settings in database
    await query(
      'UPDATE users SET settings = $1, updated_at = NOW() WHERE id = $2',
      [JSON.stringify(updatedSettings), user.userId]
    );

    // Get updated user data
    const updatedResult = await query(
      'SELECT id, name, email, role, profile_image FROM users WHERE id = $1',
      [user.userId]
    );

    const userData = updatedResult.rows[0];

    const response: UserSettingsResponse = {
      success: true,
      data: {
        settings: updatedSettings,
        user: {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          profile_image: userData.profile_image,
        },
      },
      message: 'Settings updated successfully',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating user settings:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
