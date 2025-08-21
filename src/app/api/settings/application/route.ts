import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { 
  ApplicationSettings, 
  UpdateApplicationSettingsData, 
  ApplicationSettingsResponse,
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

// Helper function to check if user is admin
function isAdmin(userRole: string): boolean {
  return ['admin', 'organization_admin'].includes(userRole);
}

// Helper function to validate application settings
function validateApplicationSettings(data: UpdateApplicationSettingsData): SettingsValidationError[] {
  const errors: SettingsValidationError[] = [];

  // Validate general settings
  if (data.general) {
    if (data.general.company_name && data.general.company_name.length > 100) {
      errors.push({
        field: 'general.company_name',
        message: 'Company name must be less than 100 characters',
        code: 'INVALID_LENGTH'
      });
    }
    if (data.general.support_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.general.support_email)) {
      errors.push({
        field: 'general.support_email',
        message: 'Invalid email format',
        code: 'INVALID_FORMAT'
      });
    }
  }

  // Validate API settings
  if (data.api?.rate_limits) {
    const { requests_per_minute, requests_per_hour, requests_per_day } = data.api.rate_limits;
    if (requests_per_minute && (requests_per_minute < 1 || requests_per_minute > 10000)) {
      errors.push({
        field: 'api.rate_limits.requests_per_minute',
        message: 'Requests per minute must be between 1 and 10000',
        code: 'INVALID_RANGE'
      });
    }
    if (requests_per_hour && (requests_per_hour < 1 || requests_per_hour > 100000)) {
      errors.push({
        field: 'api.rate_limits.requests_per_hour',
        message: 'Requests per hour must be between 1 and 100000',
        code: 'INVALID_RANGE'
      });
    }
  }

  // Validate email settings
  if (data.email?.smtp) {
    const { host, port } = data.email.smtp;
    if (host && host.length === 0) {
      errors.push({
        field: 'email.smtp.host',
        message: 'SMTP host is required',
        code: 'REQUIRED_FIELD'
      });
    }
    if (port && (port < 1 || port > 65535)) {
      errors.push({
        field: 'email.smtp.port',
        message: 'Port must be between 1 and 65535',
        code: 'INVALID_RANGE'
      });
    }
  }

  return errors;
}

// Default application settings
const getDefaultApplicationSettings = (): ApplicationSettings => ({
  general: {
    company_name: 'MindTrack',
    support_email: 'support@mindtrack.com',
    default_language: 'en',
    default_timezone: 'UTC',
    date_format: 'MM/DD/YYYY',
    time_format: '12h',
    currency: 'USD',
    address: {},
    branding: {
      primary_color: '#3B82F6',
      secondary_color: '#64748B',
      accent_color: '#10B981',
    },
  },
  api: {
    keys: [],
    rate_limits: {
      requests_per_minute: 100,
      requests_per_hour: 1000,
      requests_per_day: 10000,
    },
    cors_origins: ['http://localhost:3000'],
    webhook_settings: {
      enabled: false,
      secret_key: '',
      retry_attempts: 3,
      timeout_seconds: 30,
    },
    documentation_url: '/api/docs',
  },
  integrations: {
    google_analytics: {
      enabled: false,
      enhanced_ecommerce: false,
    },
    google_oauth: {
      enabled: false,
    },
    microsoft_oauth: {
      enabled: false,
    },
    slack: {
      enabled: false,
    },
    zapier: {
      enabled: false,
    },
    custom_webhooks: [],
  },
  email: {
    smtp: {
      host: '',
      port: 587,
      username: '',
      password: '',
      use_tls: true,
      use_ssl: false,
    },
    default_sender: {
      name: 'MindTrack',
      email: 'noreply@mindtrack.com',
    },
    bounce_handling: {
      enabled: false,
    },
    templates: {
      welcome_email: '',
      password_reset: '',
      invitation: '',
      notification: '',
    },
    automation: {
      enabled: false,
      welcome_series: false,
      abandoned_questionnaire: false,
      follow_up_reminders: false,
    },
  },
  system: {
    maintenance_mode: false,
    feature_flags: {},
    max_file_upload_size: 10 * 1024 * 1024, // 10MB
    session_timeout: 480, // 8 hours
    password_policy: {
      min_length: 8,
      require_uppercase: true,
      require_lowercase: true,
      require_numbers: true,
      require_symbols: false,
      expiry_days: 90,
    },
    backup_settings: {
      enabled: true,
      frequency: 'daily',
      retention_days: 30,
      storage_location: 'local',
    },
    logging: {
      level: 'info',
      retention_days: 30,
      include_user_actions: true,
    },
  },
});

// GET /api/settings/application - Get application settings (admin only)
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!isAdmin(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Get application settings from database
    // In a real implementation, this would be stored in a dedicated settings table
    const settingsResult = await query(
      'SELECT value FROM application_settings WHERE key = $1',
      ['application_settings']
    );

    let settings: ApplicationSettings;
    if (settingsResult.rows.length > 0) {
      settings = JSON.parse(settingsResult.rows[0].value);
    } else {
      settings = getDefaultApplicationSettings();
    }

    const response: ApplicationSettingsResponse = {
      success: true,
      data: {
        settings,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching application settings:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/settings/application - Update application settings (admin only)
export async function PUT(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!isAdmin(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const updateData: UpdateApplicationSettingsData = await request.json();

    // Validate the update data
    const validationErrors = validateApplicationSettings(updateData);
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
      'SELECT value FROM application_settings WHERE key = $1',
      ['application_settings']
    );

    let currentSettings: ApplicationSettings;
    if (currentResult.rows.length > 0) {
      currentSettings = JSON.parse(currentResult.rows[0].value);
    } else {
      currentSettings = getDefaultApplicationSettings();
    }

    // Merge the updates with current settings
    const updatedSettings: ApplicationSettings = {
      general: { ...currentSettings.general, ...updateData.general },
      api: {
        ...currentSettings.api,
        ...updateData.api,
        rate_limits: { ...currentSettings.api.rate_limits, ...updateData.api?.rate_limits },
        webhook_settings: { ...currentSettings.api.webhook_settings, ...updateData.api?.webhook_settings },
      },
      integrations: {
        ...currentSettings.integrations,
        ...updateData.integrations,
        google_analytics: { ...currentSettings.integrations.google_analytics, ...updateData.integrations?.google_analytics },
        google_oauth: { ...currentSettings.integrations.google_oauth, ...updateData.integrations?.google_oauth },
        microsoft_oauth: { ...currentSettings.integrations.microsoft_oauth, ...updateData.integrations?.microsoft_oauth },
        slack: { ...currentSettings.integrations.slack, ...updateData.integrations?.slack },
        zapier: { ...currentSettings.integrations.zapier, ...updateData.integrations?.zapier },
      },
      email: {
        ...currentSettings.email,
        ...updateData.email,
        smtp: { ...currentSettings.email.smtp, ...updateData.email?.smtp },
        default_sender: { ...currentSettings.email.default_sender, ...updateData.email?.default_sender },
        bounce_handling: { ...currentSettings.email.bounce_handling, ...updateData.email?.bounce_handling },
        templates: { ...currentSettings.email.templates, ...updateData.email?.templates },
        automation: { ...currentSettings.email.automation, ...updateData.email?.automation },
      },
      system: {
        ...currentSettings.system,
        ...updateData.system,
        password_policy: { ...currentSettings.system.password_policy, ...updateData.system?.password_policy },
        backup_settings: { ...currentSettings.system.backup_settings, ...updateData.system?.backup_settings },
        logging: { ...currentSettings.system.logging, ...updateData.system?.logging },
      },
    };

    // Update settings in database
    if (currentResult.rows.length > 0) {
      await query(
        'UPDATE application_settings SET value = $1, updated_at = NOW() WHERE key = $2',
        [JSON.stringify(updatedSettings), 'application_settings']
      );
    } else {
      await query(
        'INSERT INTO application_settings (key, value, created_at, updated_at) VALUES ($1, $2, NOW(), NOW())',
        ['application_settings', JSON.stringify(updatedSettings)]
      );
    }

    const response: ApplicationSettingsResponse = {
      success: true,
      data: {
        settings: updatedSettings,
      },
      message: 'Application settings updated successfully',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating application settings:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
