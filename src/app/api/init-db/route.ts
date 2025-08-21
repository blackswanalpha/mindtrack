import { NextRequest } from 'next/server';
import { initializeDatabase } from '@/lib/db-init';
import { successResponse, handleApiError, validateMethod } from '@/lib/api-utils';

export async function POST(request: NextRequest) {
  try {
    // Validate request method
    validateMethod(request, ['POST']);
    
    // Only allow in development environment
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Database initialization not allowed in production');
    }
    
    console.log('Starting database initialization...');
    const success = await initializeDatabase();
    
    if (success) {
      return successResponse(
        { initialized: true }, 
        'Database initialized successfully'
      );
    } else {
      throw new Error('Database initialization failed');
    }
    
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
