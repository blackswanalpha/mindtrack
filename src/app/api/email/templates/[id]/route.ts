import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { query } from '@/lib/db';
import { EmailTemplate } from '@/types/database';
import { 
  saveEmailTemplate, 
  EMAIL_CATEGORIES, 
  EMAIL_TEMPLATE_TYPES,
  EmailTemplateData 
} from '@/lib/email-service';

// GET /api/email/templates/[id] - Get specific email template
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

    const templateId = parseInt(params.id);
    if (isNaN(templateId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid template ID' },
        { status: 400 }
      );
    }

    const result = await query<EmailTemplate>(
      `SELECT id, name, subject, body, html_content, variables, category, type, 
              is_active, organization_id, created_by_id, created_at, updated_at
       FROM email_templates 
       WHERE id = $1`,
      [templateId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Email template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { template: result.rows[0] }
    });

  } catch (error) {
    console.error('Error fetching email template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch email template' },
      { status: 500 }
    );
  }
}

// PUT /api/email/templates/[id] - Update email template
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

    const templateId = parseInt(params.id);
    if (isNaN(templateId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid template ID' },
        { status: 400 }
      );
    }

    // Check if template exists
    const existingTemplate = await query<EmailTemplate>(
      'SELECT id, created_by_id, organization_id FROM email_templates WHERE id = $1',
      [templateId]
    );

    if (existingTemplate.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Email template not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      name,
      subject,
      html_content,
      text_content,
      variables,
      category,
      type,
      is_active,
      organization_id
    } = body;

    // Validate required fields
    if (!name || !subject || !html_content || !text_content) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, subject, html_content, text_content' },
        { status: 400 }
      );
    }

    // Validate category and type
    if (category && !Object.values(EMAIL_CATEGORIES).includes(category)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email category' },
        { status: 400 }
      );
    }

    if (type && !Object.values(EMAIL_TEMPLATE_TYPES).includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email template type' },
        { status: 400 }
      );
    }

    const templateData: EmailTemplateData & { id: number } = {
      id: templateId,
      name,
      subject,
      html_content,
      text_content,
      variables: variables || {},
      category: category || EMAIL_CATEGORIES.SYSTEM,
      type: type || 'custom',
      is_active: is_active !== undefined ? is_active : true,
      organization_id: organization_id ? parseInt(organization_id) : undefined
    };

    const result = await saveEmailTemplate(templateData, user.userId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { template_id: result.templateId },
      message: 'Email template updated successfully'
    });

  } catch (error) {
    console.error('Error updating email template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update email template' },
      { status: 500 }
    );
  }
}

// DELETE /api/email/templates/[id] - Delete email template
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

    const templateId = parseInt(params.id);
    if (isNaN(templateId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid template ID' },
        { status: 400 }
      );
    }

    // Check if template exists
    const existingTemplate = await query<EmailTemplate>(
      'SELECT id FROM email_templates WHERE id = $1',
      [templateId]
    );

    if (existingTemplate.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Email template not found' },
        { status: 404 }
      );
    }

    // Soft delete by setting is_active to false
    await query(
      'UPDATE email_templates SET is_active = false, updated_at = NOW() WHERE id = $1',
      [templateId]
    );

    return NextResponse.json({
      success: true,
      message: 'Email template deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting email template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete email template' },
      { status: 500 }
    );
  }
}
