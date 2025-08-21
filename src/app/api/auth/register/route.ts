import { NextRequest } from 'next/server';
import { z } from 'zod';
import { query } from '@/lib/db';
import { hashPassword, generateToken, createAuthResponse, isValidEmail, isValidPassword } from '@/lib/auth';
import { handleApiError, validateMethod, parseJsonBody, successResponse, ValidationError } from '@/lib/api-utils';
import { User, CreateUserData } from '@/types/database';

// Validation schema
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(255, 'Name too long'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.string().optional().default('user')
});

export async function POST(request: NextRequest) {
  try {
    // Validate request method
    validateMethod(request, ['POST']);
    
    // Parse and validate request body
    const body = await parseJsonBody<CreateUserData>(request);
    const { name, email, password, role } = registerSchema.parse(body);
    
    // Additional email validation
    if (!isValidEmail(email)) {
      throw new ValidationError('Invalid email format');
    }
    
    // Additional password validation
    const passwordValidation = isValidPassword(password);
    if (!passwordValidation.valid) {
      throw new ValidationError(passwordValidation.message);
    }
    
    // Check if user already exists
    const existingUserResult = await query<User>(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );
    
    if (existingUserResult.rows.length > 0) {
      throw new ValidationError('User with this email already exists');
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Create user
    const createUserResult = await query<User>(
      `INSERT INTO users (name, email, password, role, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, NOW(), NOW()) 
       RETURNING id, name, email, role, profile_image, created_at, updated_at`,
      [name.trim(), email.toLowerCase(), hashedPassword, role]
    );
    
    const newUser = createUserResult.rows[0];
    
    // Generate JWT token
    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role
    });
    
    // Create response
    const authResponse = createAuthResponse(newUser, token, 'Registration successful');
    
    return successResponse(authResponse, 'User registered successfully', 201);
    
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
