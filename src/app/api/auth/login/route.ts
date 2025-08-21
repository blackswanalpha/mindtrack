import { NextRequest } from 'next/server';
import { z } from 'zod';
import { query } from '@/lib/db';
import { verifyPassword, generateToken, createAuthResponse } from '@/lib/auth';
import { handleApiError, validateMethod, parseJsonBody, successResponse, AuthenticationError } from '@/lib/api-utils';
import { User, LoginCredentials } from '@/types/database';

// Validation schema
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

export async function POST(request: NextRequest) {
  try {
    // Validate request method
    validateMethod(request, ['POST']);
    
    // Parse and validate request body
    const body = await parseJsonBody<LoginCredentials>(request);
    const { email, password } = loginSchema.parse(body);
    
    // Find user by email
    const userResult = await query<User>(
      'SELECT id, name, email, password, role, profile_image, last_login, created_at, updated_at FROM users WHERE email = $1',
      [email.toLowerCase()]
    );
    
    if (userResult.rows.length === 0) {
      throw new AuthenticationError('Invalid email or password');
    }
    
    const user = userResult.rows[0];
    
    // Verify password
    if (!user.password) {
      throw new AuthenticationError('Invalid email or password');
    }
    
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid email or password');
    }
    
    // Update last login timestamp
    await query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );
    
    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });
    
    // Create response (without password)
    const { password: _, ...userWithoutPassword } = user;
    const authResponse = createAuthResponse(userWithoutPassword, token, 'Login successful');
    
    return successResponse(authResponse, 'Login successful', 200);
    
  } catch (error) {
    return handleApiError(error);
  }
}

// Handle unsupported methods
export async function GET() {
  return handleApiError(new Error('Method GET not allowed'));
}

export async function PUT() {
  return handleApiError(new Error('Method PUT not allowed'));
}

export async function DELETE() {
  return handleApiError(new Error('Method DELETE not allowed'));
}
