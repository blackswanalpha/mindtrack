import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

// Custom API Error classes
export class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication required') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = 'Access forbidden') {
    super(message, 403);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends ApiError {
  constructor(message: string = 'Validation failed') {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: any[];
}

// Success response helper
export function successResponse<T>(
  data: T, 
  message?: string, 
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    message
  }, { status });
}

// Error response helper
export function errorResponse(
  error: string | Error, 
  status: number = 500,
  errors?: any[]
): NextResponse<ApiResponse> {
  const message = typeof error === 'string' ? error : error.message;
  
  return NextResponse.json({
    success: false,
    error: message,
    errors
  }, { status });
}

// Handle API errors
export function handleApiError(error: unknown): NextResponse<ApiResponse> {
  console.error('API Error:', error);
  
  // Handle custom API errors
  if (error instanceof ApiError) {
    return errorResponse(error.message, error.status);
  }
  
  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return errorResponse(
      'Validation failed',
      400,
      error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
    );
  }
  
  // Handle database errors
  if (error && typeof error === 'object' && 'code' in error) {
    const dbError = error as any;
    
    switch (dbError.code) {
      case '23505': // Unique violation
        return errorResponse('Resource already exists', 409);
      case '23503': // Foreign key violation
        return errorResponse('Referenced resource not found', 400);
      case '23502': // Not null violation
        return errorResponse('Required field missing', 400);
      default:
        return errorResponse('Database error occurred', 500);
    }
  }
  
  // Handle generic errors
  if (error instanceof Error) {
    return errorResponse(error.message, 500);
  }
  
  // Fallback for unknown errors
  return errorResponse('An unexpected error occurred', 500);
}

// Validate request method
export function validateMethod(
  request: Request, 
  allowedMethods: string[]
): void {
  if (!allowedMethods.includes(request.method)) {
    throw new ApiError(
      `Method ${request.method} not allowed. Allowed methods: ${allowedMethods.join(', ')}`,
      405
    );
  }
}

// Parse JSON body safely
export async function parseJsonBody<T>(request: Request): Promise<T> {
  try {
    return await request.json();
  } catch (error) {
    throw new ValidationError('Invalid JSON in request body');
  }
}

// Extract query parameters
export function getQueryParams(request: Request): URLSearchParams {
  const url = new URL(request.url);
  return url.searchParams;
}

// Pagination helpers
export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export function getPaginationParams(searchParams: URLSearchParams): PaginationParams {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')));
  const offset = (page - 1) * limit;
  
  return { page, limit, offset };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / limit);
  
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  };
}
