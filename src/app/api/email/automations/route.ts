import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { query } from '@/lib/db';
import { 
  createEmailAutomation, 
  getActiveAutomations,
  EMAIL_TRIGGERS,
  EmailAutomationConfig 
} from '@/lib/email-automation';
import { EMAIL_TEMPLATE_TYPES } from '@/lib/email-service';

// GET /api/email/automations - List email automations
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
    const organizationId = searchParams.get('organization_id');
    const triggerType = searchParams.get('trigger_type');
    const isActive = searchParams.get('is_active');

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (organizationId) {
      whereClause += ` AND (organization_id = $${paramIndex} OR organization_id IS NULL)`;
      params.push(parseInt(organizationId));
      paramIndex++;
    }

    if (triggerType) {
      whereClause += ` AND trigger_type = $${paramIndex}`;
      params.push(triggerType);
      paramIndex++;
    }

    if (isActive !== null) {
      whereClause += ` AND is_active = $${paramIndex}`;
      params.push(isActive === 'true');
      paramIndex++;
    }

    const result = await query<EmailAutomationConfig & {
      created_by_name: string;
      organization_name?: string;
      questionnaire_title?: string;
    }>(
      `SELECT 
        ea.*,
        u.name as created_by_name,
        o.name as organization_name,
        q.title as questionnaire_title
       FROM email_automations ea
       LEFT JOIN users u ON ea.created_by_id = u.id
       LEFT JOIN organizations o ON ea.organization_id = o.id
       LEFT JOIN questionnaires q ON ea.questionnaire_id = q.id
       ${whereClause}
       ORDER BY ea.created_at DESC`,
      params
    );

    return NextResponse.json({
      success: true,
      data: {
        automations: result.rows,
        available_triggers: Object.values(EMAIL_TRIGGERS),
        available_templates: Object.values(EMAIL_TEMPLATE_TYPES)
      }
    });

  } catch (error) {
    console.error('Error fetching email automations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch email automations' },
      { status: 500 }
    );
  }
}

// POST /api/email/automations - Create email automation
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
      trigger_type,
      template_type,
      is_active = true,
      delay_minutes = 0,
      conditions,
      organization_id,
      questionnaire_id
    } = body;

    // Validate required fields
    if (!trigger_type || !template_type) {
      return NextResponse.json(
        { success: false, error: 'trigger_type and template_type are required' },
        { status: 400 }
      );
    }

    // Validate trigger type
    if (!Object.values(EMAIL_TRIGGERS).includes(trigger_type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid trigger_type' },
        { status: 400 }
      );
    }

    // Validate template type
    if (!Object.values(EMAIL_TEMPLATE_TYPES).includes(template_type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid template_type' },
        { status: 400 }
      );
    }

    // Validate delay
    if (delay_minutes < 0 || delay_minutes > 10080) { // Max 1 week
      return NextResponse.json(
        { success: false, error: 'delay_minutes must be between 0 and 10080 (1 week)' },
        { status: 400 }
      );
    }

    const config: EmailAutomationConfig = {
      trigger_type,
      template_type,
      is_active,
      delay_minutes,
      conditions,
      organization_id: organization_id ? parseInt(organization_id) : undefined,
      questionnaire_id: questionnaire_id ? parseInt(questionnaire_id) : undefined,
      created_by_id: user.userId
    };

    const automationId = await createEmailAutomation(config);

    if (!automationId) {
      return NextResponse.json(
        { success: false, error: 'Failed to create email automation' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { automation_id: automationId },
      message: 'Email automation created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating email automation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create email automation' },
      { status: 500 }
    );
  }
}

// PUT /api/email/automations - Update email automation
export async function PUT(request: NextRequest) {
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
      id,
      trigger_type,
      template_type,
      is_active,
      delay_minutes,
      conditions,
      organization_id,
      questionnaire_id
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Automation ID is required' },
        { status: 400 }
      );
    }

    // Check if automation exists
    const existing = await query<EmailAutomationConfig>(
      'SELECT id FROM email_automations WHERE id = $1',
      [id]
    );

    if (existing.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Email automation not found' },
        { status: 404 }
      );
    }

    // Build update query dynamically
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (trigger_type !== undefined) {
      if (!Object.values(EMAIL_TRIGGERS).includes(trigger_type)) {
        return NextResponse.json(
          { success: false, error: 'Invalid trigger_type' },
          { status: 400 }
        );
      }
      updates.push(`trigger_type = $${paramIndex}`);
      params.push(trigger_type);
      paramIndex++;
    }

    if (template_type !== undefined) {
      if (!Object.values(EMAIL_TEMPLATE_TYPES).includes(template_type)) {
        return NextResponse.json(
          { success: false, error: 'Invalid template_type' },
          { status: 400 }
        );
      }
      updates.push(`template_type = $${paramIndex}`);
      params.push(template_type);
      paramIndex++;
    }

    if (is_active !== undefined) {
      updates.push(`is_active = $${paramIndex}`);
      params.push(is_active);
      paramIndex++;
    }

    if (delay_minutes !== undefined) {
      if (delay_minutes < 0 || delay_minutes > 10080) {
        return NextResponse.json(
          { success: false, error: 'delay_minutes must be between 0 and 10080 (1 week)' },
          { status: 400 }
        );
      }
      updates.push(`delay_minutes = $${paramIndex}`);
      params.push(delay_minutes);
      paramIndex++;
    }

    if (conditions !== undefined) {
      updates.push(`conditions = $${paramIndex}`);
      params.push(conditions ? JSON.stringify(conditions) : null);
      paramIndex++;
    }

    if (organization_id !== undefined) {
      updates.push(`organization_id = $${paramIndex}`);
      params.push(organization_id ? parseInt(organization_id) : null);
      paramIndex++;
    }

    if (questionnaire_id !== undefined) {
      updates.push(`questionnaire_id = $${paramIndex}`);
      params.push(questionnaire_id ? parseInt(questionnaire_id) : null);
      paramIndex++;
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No fields to update' },
        { status: 400 }
      );
    }

    updates.push(`updated_at = NOW()`);
    params.push(id);

    await query(
      `UPDATE email_automations SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
      params
    );

    return NextResponse.json({
      success: true,
      message: 'Email automation updated successfully'
    });

  } catch (error) {
    console.error('Error updating email automation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update email automation' },
      { status: 500 }
    );
  }
}
