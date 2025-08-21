/**
 * Analytics Data Export API Route
 * Handles data export requests with access control and format validation
 */

import { NextRequest, NextResponse } from 'next/server';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-utils';
import { AnalyticsPermissionManager, getAllowedExportFormats, canExportDataType } from '@/lib/analytics-permissions';

// Mock user for demonstration (in real app, get from auth)
const mockUser = {
  id: 'user-123',
  email: 'admin@mindtrack.com',
  role: 'admin' as const,
  organization_id: 'org-456',
  permissions: []
};

interface ExportRequest {
  name: string;
  format: 'pdf' | 'csv' | 'excel' | 'json' | 'png' | 'jpeg';
  data_types: string[];
  date_range: string;
  filters?: Record<string, any>;
  include_sensitive?: boolean;
}

// POST /api/analytics/export - Create new export
export async function POST(request: NextRequest) {
  try {
    const body: ExportRequest = await request.json();
    const { name, format, data_types, date_range, filters, include_sensitive } = body;

    // Validate required fields
    if (!name || !format || !data_types || data_types.length === 0) {
      return errorResponse('Missing required fields: name, format, data_types', 400);
    }

    // Check if user can export data
    if (!AnalyticsPermissionManager.hasPermission(mockUser, 'data:export')) {
      return errorResponse('Insufficient permissions to export data', 403);
    }

    // Validate export format
    const allowedFormats = getAllowedExportFormats(mockUser);
    if (!allowedFormats.includes(format)) {
      return errorResponse(`Export format '${format}' not allowed for your role`, 403);
    }

    // Validate data types
    const invalidDataTypes = data_types.filter(dataType => !canExportDataType(mockUser, dataType));
    if (invalidDataTypes.length > 0) {
      return errorResponse(
        `Cannot export data types: ${invalidDataTypes.join(', ')}. Insufficient permissions.`,
        403
      );
    }

    // Check sensitive data access
    if (include_sensitive && !AnalyticsPermissionManager.hasPermission(mockUser, 'data:export_sensitive')) {
      return errorResponse('Insufficient permissions to export sensitive data', 403);
    }

    // Generate export job
    const exportJob = {
      id: `export-${Date.now()}`,
      name,
      format,
      data_types,
      date_range,
      filters: filters || {},
      include_sensitive: include_sensitive || false,
      status: 'queued',
      created_at: new Date().toISOString(),
      created_by: mockUser.id,
      organization_id: mockUser.organization_id,
      estimated_completion: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
      file_size_estimate: calculateEstimatedSize(data_types, date_range, format),
      retention_period: AnalyticsPermissionManager.getDataRetentionPeriod(mockUser)
    };

    // In a real implementation, you would:
    // 1. Queue the export job in a background processing system
    // 2. Store the job details in the database
    // 3. Send notifications when complete

    // Simulate processing delay
    setTimeout(() => {
      // Update job status to 'processing' then 'completed'
      console.log(`Export job ${exportJob.id} started processing`);
    }, 1000);

    return successResponse(exportJob, 'Export job created successfully');

  } catch (error) {
    console.error('Export creation error:', error);
    return handleApiError(error, 'Failed to create export job');
  }
}

// GET /api/analytics/export - Get export history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const format = searchParams.get('format');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Check permissions
    if (!AnalyticsPermissionManager.hasPermission(mockUser, 'data:export')) {
      return errorResponse('Insufficient permissions to view export history', 403);
    }

    // Mock export history data
    const mockExports = [
      {
        id: 'export-1',
        name: 'Mental Health Summary Report',
        format: 'pdf',
        data_types: ['responses', 'scores'],
        status: 'completed',
        created_at: '2024-01-20T15:30:00Z',
        completed_at: '2024-01-20T15:35:00Z',
        file_size: '2.4 MB',
        download_count: 5,
        expires_at: '2024-02-20T15:30:00Z',
        download_url: '/api/analytics/export/export-1/download'
      },
      {
        id: 'export-2',
        name: 'GAD-7 Response Data',
        format: 'csv',
        data_types: ['responses'],
        status: 'completed',
        created_at: '2024-01-19T10:15:00Z',
        completed_at: '2024-01-19T10:18:00Z',
        file_size: '856 KB',
        download_count: 12,
        expires_at: '2024-02-19T10:15:00Z',
        download_url: '/api/analytics/export/export-2/download'
      },
      {
        id: 'export-3',
        name: 'User Analytics Dashboard',
        format: 'excel',
        data_types: ['users', 'activity'],
        status: 'processing',
        created_at: '2024-01-18T14:45:00Z',
        file_size: null,
        download_count: 0,
        expires_at: '2024-02-18T14:45:00Z'
      },
      {
        id: 'export-4',
        name: 'Risk Distribution Chart',
        format: 'png',
        data_types: ['charts'],
        status: 'failed',
        created_at: '2024-01-17T09:20:00Z',
        error_message: 'Chart generation failed due to insufficient data',
        file_size: null,
        download_count: 0,
        expires_at: '2024-02-17T09:20:00Z'
      }
    ];

    // Apply filters
    let filteredExports = mockExports;
    
    if (status) {
      filteredExports = filteredExports.filter(exp => exp.status === status);
    }
    
    if (format) {
      filteredExports = filteredExports.filter(exp => exp.format === format);
    }

    // Apply pagination
    const paginatedExports = filteredExports.slice(offset, offset + limit);

    const response = {
      exports: paginatedExports,
      pagination: {
        total: filteredExports.length,
        limit,
        offset,
        has_more: offset + limit < filteredExports.length
      },
      summary: {
        total_exports: mockExports.length,
        completed: mockExports.filter(e => e.status === 'completed').length,
        processing: mockExports.filter(e => e.status === 'processing').length,
        failed: mockExports.filter(e => e.status === 'failed').length
      }
    };

    return successResponse(response, 'Export history retrieved successfully');

  } catch (error) {
    console.error('Export history error:', error);
    return handleApiError(error, 'Failed to retrieve export history');
  }
}

// DELETE /api/analytics/export/[id] - Cancel or delete export
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const exportId = pathParts[pathParts.length - 1];

    if (!exportId) {
      return errorResponse('Export ID is required', 400);
    }

    // Check permissions
    if (!AnalyticsPermissionManager.hasPermission(mockUser, 'data:export')) {
      return errorResponse('Insufficient permissions to delete exports', 403);
    }

    // In a real implementation, you would:
    // 1. Verify the export belongs to the user or they have admin permissions
    // 2. Cancel the job if it's still processing
    // 3. Delete the export file and database record
    // 4. Clean up any associated resources

    return successResponse(
      { 
        export_id: exportId,
        deleted_at: new Date().toISOString()
      }, 
      'Export deleted successfully'
    );

  } catch (error) {
    console.error('Export deletion error:', error);
    return handleApiError(error, 'Failed to delete export');
  }
}

// Helper function to calculate estimated file size
function calculateEstimatedSize(dataTypes: string[], dateRange: string, format: string): string {
  const baseSize = dataTypes.length * 100; // KB per data type
  
  const rangeMultiplier = {
    '7d': 0.2,
    '30d': 1,
    '90d': 3,
    '1y': 12,
    'all': 20
  }[dateRange] || 1;

  const formatMultiplier = {
    'csv': 0.5,
    'json': 0.7,
    'excel': 1.5,
    'pdf': 2,
    'png': 1.2,
    'jpeg': 0.8
  }[format] || 1;

  const estimatedKB = baseSize * rangeMultiplier * formatMultiplier;
  
  if (estimatedKB < 1024) {
    return `${Math.round(estimatedKB)} KB`;
  } else {
    return `${(estimatedKB / 1024).toFixed(1)} MB`;
  }
}
