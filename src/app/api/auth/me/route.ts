import { NextRequest } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { handleApiError, validateMethod, successResponse, AuthenticationError } from '@/lib/api-utils';
import { User } from '@/types/database';

export async function GET(request: NextRequest) {
  try {
    // Validate request method
    validateMethod(request, ['GET']);
    
    // Get user from JWT token
    const tokenPayload = getUserFromRequest(request);
    if (!tokenPayload) {
      throw new AuthenticationError('Authentication token required');
    }
    
    // Get user details from database
    const userResult = await query<User>(
      'SELECT id, name, email, role, profile_image, last_login, created_at, updated_at FROM users WHERE id = $1',
      [tokenPayload.userId]
    );
    
    if (userResult.rows.length === 0) {
      throw new AuthenticationError('User not found');
    }
    
    const user = userResult.rows[0];
    
    return successResponse({ user }, 'User details retrieved successfully');
    
  } catch (error) {
    return handleApiError(error);
  }
}

// Handle unsupported methods
export async function POST() {
  return handleApiError(new Error('Method POST not allowed'));
}

export async function PUT() {
  return handleApiError(new Error('Method PUT not allowed'));
}

export async function DELETE() {
  return handleApiError(new Error('Method DELETE not allowed'));
}
