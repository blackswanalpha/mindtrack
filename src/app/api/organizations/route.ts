import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { 
  createOrganization, 
  getUserOrganizations 
} from '@/lib/organization-db';
import { logOrganizationAction } from '@/lib/audit-utils';
import { CreateOrganizationData } from '@/types/database';

// GET /api/organizations - Get user's organizations
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const organizations = await getUserOrganizations(user.userId);

    return NextResponse.json({
      success: true,
      data: { organizations }
    });
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch organizations' },
      { status: 500 }
    );
  }
}

// POST /api/organizations - Create new organization
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, description, type, contact_email, contact_phone, address, logo_url, settings } = body;

    // Validate required fields
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Organization name is required' },
        { status: 400 }
      );
    }

    // Validate email format if provided
    if (contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact_email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const organizationData: CreateOrganizationData = {
      name: name.trim(),
      description: description?.trim(),
      type: type?.trim(),
      contact_email: contact_email?.trim(),
      contact_phone: contact_phone?.trim(),
      address: address?.trim(),
      logo_url: logo_url?.trim(),
      settings: settings || {}
    };

    const organization = await createOrganization(organizationData, user.userId);

    // Log the action
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    await logOrganizationAction(
      'organization_created',
      organization.id,
      user.userId,
      { organization_name: organization.name },
      clientIP,
      userAgent
    );

    return NextResponse.json({
      success: true,
      data: { organization },
      message: 'Organization created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating organization:', error);
    
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
      { success: false, error: 'Failed to create organization' },
      { status: 500 }
    );
  }
}
