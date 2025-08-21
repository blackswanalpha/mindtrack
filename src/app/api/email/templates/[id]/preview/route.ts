import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { query } from '@/lib/db';
import { EmailTemplate } from '@/types/database';
import { 
  substituteVariables, 
  validateTemplateVariables,
  defaultEmailTemplates 
} from '@/lib/email-service';

// POST /api/email/templates/[id]/preview - Preview email template with variables
export async function POST(
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

    const templateId = params.id;
    const body = await request.json();
    const { variables = {} } = body;

    let template: EmailTemplate | null = null;

    // Handle default templates (id = 0 or template type)
    if (templateId === '0' || isNaN(parseInt(templateId))) {
      // Look for default template by type
      const defaultTemplate = Object.values(defaultEmailTemplates).find(
        t => t.type === templateId || t.name.toLowerCase().replace(/\s+/g, '_') === templateId
      );
      
      if (defaultTemplate) {
        template = {
          id: 0,
          name: defaultTemplate.name,
          subject: defaultTemplate.subject,
          body: defaultTemplate.text_content,
          html_content: defaultTemplate.html_content,
          variables: JSON.stringify(defaultTemplate.variables),
          category: defaultTemplate.category,
          type: defaultTemplate.type,
          is_active: defaultTemplate.is_active,
          organization_id: null,
          created_by_id: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }
    } else {
      // Get template from database
      const result = await query<EmailTemplate>(
        `SELECT id, name, subject, body, html_content, variables, category, type, 
                is_active, organization_id, created_by_id, created_at, updated_at
         FROM email_templates 
         WHERE id = $1 AND is_active = true`,
        [parseInt(templateId)]
      );

      template = result.rows[0] || null;
    }

    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Email template not found' },
        { status: 404 }
      );
    }

    // Parse template variables
    let templateVariables = {};
    try {
      templateVariables = typeof template.variables === 'string' 
        ? JSON.parse(template.variables) 
        : template.variables || {};
    } catch (error) {
      console.error('Error parsing template variables:', error);
      templateVariables = {};
    }

    // Validate provided variables
    const validation = validateTemplateVariables(templateVariables, variables);
    if (!validation.valid) {
      return NextResponse.json({
        success: false,
        error: 'Variable validation failed',
        validation_errors: validation.errors
      }, { status: 400 });
    }

    // Generate preview with variable substitution
    const previewSubject = substituteVariables(template.subject, variables);
    const previewHtml = substituteVariables(template.html_content, variables);
    const previewText = substituteVariables(template.body, variables);

    return NextResponse.json({
      success: true,
      data: {
        template: {
          id: template.id,
          name: template.name,
          type: template.type,
          category: template.category
        },
        preview: {
          subject: previewSubject,
          html_content: previewHtml,
          text_content: previewText
        },
        variables_used: variables,
        template_variables: templateVariables
      }
    });

  } catch (error) {
    console.error('Error previewing email template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to preview email template' },
      { status: 500 }
    );
  }
}

// GET /api/email/templates/[id]/preview - Get template variables for preview
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

    const templateId = params.id;
    let template: EmailTemplate | null = null;

    // Handle default templates
    if (templateId === '0' || isNaN(parseInt(templateId))) {
      const defaultTemplate = Object.values(defaultEmailTemplates).find(
        t => t.type === templateId || t.name.toLowerCase().replace(/\s+/g, '_') === templateId
      );
      
      if (defaultTemplate) {
        template = {
          id: 0,
          name: defaultTemplate.name,
          subject: defaultTemplate.subject,
          body: defaultTemplate.text_content,
          html_content: defaultTemplate.html_content,
          variables: JSON.stringify(defaultTemplate.variables),
          category: defaultTemplate.category,
          type: defaultTemplate.type,
          is_active: defaultTemplate.is_active,
          organization_id: null,
          created_by_id: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }
    } else {
      const result = await query<EmailTemplate>(
        'SELECT id, name, subject, variables, type, category FROM email_templates WHERE id = $1 AND is_active = true',
        [parseInt(templateId)]
      );

      template = result.rows[0] || null;
    }

    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Email template not found' },
        { status: 404 }
      );
    }

    // Parse template variables
    let templateVariables = {};
    try {
      templateVariables = typeof template.variables === 'string' 
        ? JSON.parse(template.variables) 
        : template.variables || {};
    } catch (error) {
      console.error('Error parsing template variables:', error);
      templateVariables = {};
    }

    // Generate example variables
    const exampleVariables: Record<string, any> = {};
    Object.entries(templateVariables).forEach(([key, config]: [string, any]) => {
      if (config.example) {
        exampleVariables[key] = config.example;
      } else {
        switch (config.type) {
          case 'string':
            exampleVariables[key] = `Example ${key}`;
            break;
          case 'number':
            exampleVariables[key] = 42;
            break;
          case 'boolean':
            exampleVariables[key] = true;
            break;
          case 'date':
            exampleVariables[key] = new Date().toISOString().split('T')[0];
            break;
          case 'url':
            exampleVariables[key] = 'https://example.com';
            break;
          default:
            exampleVariables[key] = `Example ${key}`;
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        template: {
          id: template.id,
          name: template.name,
          type: template.type,
          category: template.category
        },
        template_variables: templateVariables,
        example_variables: exampleVariables
      }
    });

  } catch (error) {
    console.error('Error fetching template variables:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch template variables' },
      { status: 500 }
    );
  }
}
