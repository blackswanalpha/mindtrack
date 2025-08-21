import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { 
  ChangePasswordData, 
  ChangePasswordResponse,
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

// Helper function to validate password
function validatePassword(password: string): SettingsValidationError[] {
  const errors: SettingsValidationError[] = [];

  if (password.length < 8) {
    errors.push({
      field: 'new_password',
      message: 'Password must be at least 8 characters long',
      code: 'PASSWORD_TOO_SHORT'
    });
  }

  if (!/[A-Z]/.test(password)) {
    errors.push({
      field: 'new_password',
      message: 'Password must contain at least one uppercase letter',
      code: 'PASSWORD_MISSING_UPPERCASE'
    });
  }

  if (!/[a-z]/.test(password)) {
    errors.push({
      field: 'new_password',
      message: 'Password must contain at least one lowercase letter',
      code: 'PASSWORD_MISSING_LOWERCASE'
    });
  }

  if (!/\d/.test(password)) {
    errors.push({
      field: 'new_password',
      message: 'Password must contain at least one number',
      code: 'PASSWORD_MISSING_NUMBER'
    });
  }

  // Check for common weak passwords
  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123', 
    'password123', 'admin', 'letmein', 'welcome', 'monkey'
  ];
  
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push({
      field: 'new_password',
      message: 'Password is too common. Please choose a stronger password',
      code: 'PASSWORD_TOO_COMMON'
    });
  }

  return errors;
}

// Helper function to validate password change data
function validatePasswordChangeData(data: ChangePasswordData): SettingsValidationError[] {
  const errors: SettingsValidationError[] = [];

  if (!data.current_password) {
    errors.push({
      field: 'current_password',
      message: 'Current password is required',
      code: 'REQUIRED_FIELD'
    });
  }

  if (!data.new_password) {
    errors.push({
      field: 'new_password',
      message: 'New password is required',
      code: 'REQUIRED_FIELD'
    });
  }

  if (!data.confirm_password) {
    errors.push({
      field: 'confirm_password',
      message: 'Password confirmation is required',
      code: 'REQUIRED_FIELD'
    });
  }

  if (data.new_password && data.confirm_password && data.new_password !== data.confirm_password) {
    errors.push({
      field: 'confirm_password',
      message: 'Passwords do not match',
      code: 'PASSWORD_MISMATCH'
    });
  }

  if (data.current_password && data.new_password && data.current_password === data.new_password) {
    errors.push({
      field: 'new_password',
      message: 'New password must be different from current password',
      code: 'PASSWORD_SAME_AS_CURRENT'
    });
  }

  // Validate new password strength
  if (data.new_password) {
    const passwordErrors = validatePassword(data.new_password);
    errors.push(...passwordErrors);
  }

  return errors;
}

// POST /api/settings/password - Change user password
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const passwordData: ChangePasswordData = await request.json();

    // Validate the password change data
    const validationErrors = validatePasswordChangeData(passwordData);
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

    // Get current user data
    const userResult = await query(
      'SELECT id, password FROM users WHERE id = $1',
      [user.userId]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userResult.rows[0];

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      passwordData.current_password, 
      userData.password
    );

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Current password is incorrect',
          errors: [{
            field: 'current_password',
            message: 'Current password is incorrect',
            code: 'INVALID_PASSWORD'
          }]
        },
        { status: 400 }
      );
    }

    // Hash the new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(passwordData.new_password, saltRounds);

    // Update password in database
    await query(
      'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2',
      [hashedNewPassword, user.userId]
    );

    // Log password change for security audit
    await query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, created_at) 
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [
        user.userId,
        'password_changed',
        'user',
        user.userId,
        JSON.stringify({ 
          timestamp: new Date().toISOString(),
          ip_address: request.headers.get('x-forwarded-for') || 'unknown',
          user_agent: request.headers.get('user-agent') || 'unknown'
        })
      ]
    );

    const response: ChangePasswordResponse = {
      success: true,
      message: 'Password changed successfully',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/settings/password/policy - Get password policy
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get password policy from application settings
    const settingsResult = await query(
      'SELECT value FROM application_settings WHERE key = $1',
      ['application_settings']
    );

    let passwordPolicy = {
      min_length: 8,
      require_uppercase: true,
      require_lowercase: true,
      require_numbers: true,
      require_symbols: false,
      expiry_days: 90,
    };

    if (settingsResult.rows.length > 0) {
      const settings = JSON.parse(settingsResult.rows[0].value);
      passwordPolicy = settings.system?.password_policy || passwordPolicy;
    }

    return NextResponse.json({
      success: true,
      data: {
        policy: passwordPolicy,
        requirements: [
          `At least ${passwordPolicy.min_length} characters long`,
          ...(passwordPolicy.require_uppercase ? ['At least one uppercase letter'] : []),
          ...(passwordPolicy.require_lowercase ? ['At least one lowercase letter'] : []),
          ...(passwordPolicy.require_numbers ? ['At least one number'] : []),
          ...(passwordPolicy.require_symbols ? ['At least one special character'] : []),
        ]
      }
    });
  } catch (error) {
    console.error('Error fetching password policy:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
