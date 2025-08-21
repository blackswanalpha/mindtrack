import { NextRequest } from 'next/server';
import { testConnection } from '@/lib/db';
import { successResponse, handleApiError } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: dbConnected ? 'connected' : 'disconnected',
      environment: process.env.NODE_ENV || 'development'
    };
    
    return successResponse(healthStatus, 'Health check successful');
    
  } catch (error) {
    return handleApiError(error);
  }
}
