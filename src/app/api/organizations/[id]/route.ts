import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { 
  getOrganizationById, 
  updateOrganization, 
  deleteOrganization,
  checkUserPermission 
} from '@/lib/organization-db';
import { logOrganizationAction } from '@/lib/audit-utils';
import { UpdateOrganizationData } from '@/types/database';

// GET /api/organizations/[id] - Get organization details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const organizationId = parseInt(params.id);
    if (isNaN(organizationId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid organization ID' },
        { status: 400 }
      );
    }

    // Check if user has access to this organization
    const permission = await checkUserPermission(organizationId, user.userId);
    if (!permission.hasAccess) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    const organization = await getOrganizationById(organizationId, user.userId);
    if (!organization) {
      return NextResponse.json(
        { success: false, error: 'Organization not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { organization }
    });
  } catch (error) {
    console.error('Error fetching organization:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch organization' },
      { status: 500 }
    );
  }
}

// PUT /api/organizations/[id] - Update organization
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const organizationId = parseInt(params.id);
    if (isNaN(organizationId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid organization ID' },
        { status: 400 }
      );
    }

    // Check if user has admin or owner permissions
    const permission = await checkUserPermission(organizationId, user.userId, 'admin');
    if (!permission.hasAccess) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, type, contact_email, contact_phone, address, logo_url, settings } = body;

    // Validate email format if provided
    if (contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact_email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const updateData: UpdateOrganizationData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim();
    if (type !== undefined) updateData.type = type?.trim();
    if (contact_email !== undefined) updateData.contact_email = contact_email?.trim();
    if (contact_phone !== undefined) updateData.contact_phone = contact_phone?.trim();
    if (address !== undefined) updateData.address = address?.trim();
    if (logo_url !== undefined) updateData.logo_url = logo_url?.trim();
    if (settings !== undefined) updateData.settings = settings;

    const organization = await updateOrganization(organizationId, updateData);
    if (!organization) {
      return NextResponse.json(
        { success: false, error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Log the action
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    await logOrganizationAction(
      'organization_updated',
      organizationId,
      user.userId,
      { 
        organization_name: organization.name,
        updated_fields: Object.keys(updateData)
      },
      clientIP,
      userAgent
    );

    return NextResponse.json({
      success: true,
      data: { organization },
      message: 'Organization updated successfully'
    });
  } catch (error) {
    console.error('Error updating organization:', error);
    
    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes('duplicate key')) {
        return NextResponse.json(
          { success: false, error: 'Organization name already exists' },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update organization' },
      { status: 500 }
    );
  }
}

// DELETE /api/organizations/[id] - Delete organization
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const organizationId = parseInt(params.id);
    if (isNaN(organizationId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid organization ID' },
        { status: 400 }
      );
    }

    // Check if user has owner permissions
    const permission = await checkUserPermission(organizationId, user.userId, 'owner');
    if (!permission.hasAccess) {
      return NextResponse.json(
        { success: false, error: 'Only organization owners can delete organizations' },
        { status: 403 }
      );
    }

    // Get organization details for logging before deletion
    const organization = await getOrganizationById(organizationId);
    if (!organization) {
      return NextResponse.json(
        { success: false, error: 'Organization not found' },
        { status: 404 }
      );
    }

    const success = await deleteOrganization(organizationId);
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete organization' },
        { status: 500 }
      );
    }

    // Log the action
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    await logOrganizationAction(
      'organization_deleted',
      organizationId,
      user.userId,
      { organization_name: organization.name },
      clientIP,
      userAgent
    );

    return NextResponse.json({
      success: true,
      message: 'Organization deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting organization:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete organization' },
      { status: 500 }
    );
  }
}
