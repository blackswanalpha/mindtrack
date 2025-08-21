import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { query } from '@/lib/db';
import { EmailTemplate } from '@/types/database';
import { 
  saveEmailTemplate, 
  defaultEmailTemplates, 
  EMAIL_CATEGORIES, 
  EMAIL_TEMPLATE_TYPES,
  EmailTemplateData 
} from '@/lib/email-service';

// GET /api/email/templates - List email templates
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const organizationId = searchParams.get('organization_id');
    const includeDefaults = searchParams.get('include_defaults') === 'true';

    let whereClause = 'WHERE is_active = true';
    const params: any[] = [];
    let paramIndex = 1;

    if (category) {
      whereClause += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (organizationId) {
      whereClause += ` AND (organization_id = $${paramIndex} OR organization_id IS NULL)`;
      params.push(parseInt(organizationId));
      paramIndex++;
    }

    const result = await query<EmailTemplate>(
      `SELECT id, name, subject, body, html_content, variables, category, type, 
              is_active, organization_id, created_by_id, created_at, updated_at
       FROM email_templates 
       ${whereClause}
       ORDER BY organization_id DESC NULLS LAST, name ASC`,
      params
    );

    let templates = result.rows;

    // Include default templates if requested
    if (includeDefaults) {
      const defaultTemplatesList = Object.entries(defaultEmailTemplates).map(([key, template]) => ({
        id: 0,
        name: template.name,
        subject: template.subject,
        body: template.text_content,
        html_content: template.html_content,
        variables: JSON.stringify(template.variables),
        category: template.category,
        type: template.type,
        is_active: template.is_active,
        organization_id: null,
        created_by_id: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_default: true
      }));

      templates = [...templates, ...defaultTemplatesList];
    }

    return NextResponse.json({
      success: true,
      data: {
        templates,
        categories: Object.values(EMAIL_CATEGORIES),
        template_types: Object.values(EMAIL_TEMPLATE_TYPES)
      }
    });

  } catch (error) {
    console.error('Error fetching email templates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch email templates' },
      { status: 500 }
    );
  }
}

// POST /api/email/templates - Create email template
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
    const {
      name,
      subject,
      html_content,
      text_content,
      variables,
      category,
      type,
      is_active = true,
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

    const templateData: EmailTemplateData = {
      name,
      subject,
      html_content,
      text_content,
      variables: variables || {},
      category: category || EMAIL_CATEGORIES.SYSTEM,
      type: type || 'custom',
      is_active,
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
      message: 'Email template created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating email template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create email template' },
      { status: 500 }
    );
  }
}
