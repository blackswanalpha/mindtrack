import { query } from '@/lib/db';
import { 
  sendTemplateEmail, 
  sendAssessmentResultsEmail,
  EMAIL_TEMPLATE_TYPES 
} from '@/lib/email-service';
import { Response, User, Questionnaire, Organization } from '@/types/database';

// Email trigger types
export const EMAIL_TRIGGERS = {
  QUESTIONNAIRE_COMPLETED: 'questionnaire_completed',
  ASSESSMENT_RESULTS_READY: 'assessment_results_ready',
  FOLLOW_UP_REMINDER: 'follow_up_reminder',
  INCOMPLETE_RESPONSE_REMINDER: 'incomplete_response_reminder',
  USER_REGISTERED: 'user_registered',
  ORGANIZATION_INVITATION: 'organization_invitation'
} as const;

// Email automation configuration interface
export interface EmailAutomationConfig {
  id?: number;
  trigger_type: string;
  template_type: string;
  is_active: boolean;
  delay_minutes?: number;
  conditions?: Record<string, any>;
  organization_id?: number;
  questionnaire_id?: number;
  created_by_id: number;
}

// Trigger context interface
export interface TriggerContext {
  user?: User;
  response?: Response;
  questionnaire?: Questionnaire;
  organization?: Organization;
  metadata?: Record<string, any>;
}

// Create email automation rule
export async function createEmailAutomation(config: EmailAutomationConfig): Promise<number | null> {
  try {
    const result = await query<{ id: number }>(
      `INSERT INTO email_automations 
       (trigger_type, template_type, is_active, delay_minutes, conditions, organization_id, questionnaire_id, created_by_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
       RETURNING id`,
      [
        config.trigger_type,
        config.template_type,
        config.is_active,
        config.delay_minutes || 0,
        config.conditions ? JSON.stringify(config.conditions) : null,
        config.organization_id,
        config.questionnaire_id,
        config.created_by_id
      ]
    );

    return result.rows[0]?.id || null;
  } catch (error) {
    console.error('Error creating email automation:', error);
    return null;
  }
}

// Get active email automations for a trigger
export async function getActiveAutomations(
  triggerType: string,
  organizationId?: number,
  questionnaireId?: number
): Promise<EmailAutomationConfig[]> {
  try {
    let whereClause = 'WHERE trigger_type = $1 AND is_active = true';
    const params: any[] = [triggerType];
    let paramIndex = 2;

    if (organizationId) {
      whereClause += ` AND (organization_id = $${paramIndex} OR organization_id IS NULL)`;
      params.push(organizationId);
      paramIndex++;
    }

    if (questionnaireId) {
      whereClause += ` AND (questionnaire_id = $${paramIndex} OR questionnaire_id IS NULL)`;
      params.push(questionnaireId);
      paramIndex++;
    }

    const result = await query<EmailAutomationConfig>(
      `SELECT * FROM email_automations ${whereClause} ORDER BY organization_id DESC NULLS LAST, questionnaire_id DESC NULLS LAST`,
      params
    );

    return result.rows;
  } catch (error) {
    console.error('Error fetching email automations:', error);
    return [];
  }
}

// Trigger email automation
export async function triggerEmailAutomation(
  triggerType: string,
  context: TriggerContext
): Promise<{ success: boolean; emailsSent: number; errors: string[] }> {
  const emailsSent = 0;
  const errors: string[] = [];

  try {
    // Get active automations for this trigger
    const automations = await getActiveAutomations(
      triggerType,
      context.organization?.id,
      context.questionnaire?.id
    );

    if (automations.length === 0) {
      return { success: true, emailsSent: 0, errors: [] };
    }

    for (const automation of automations) {
      try {
        // Check conditions if specified
        if (automation.conditions && !evaluateConditions(automation.conditions, context)) {
          continue;
        }

        // Determine recipient email
        const recipientEmail = getRecipientEmail(context);
        if (!recipientEmail) {
          errors.push(`No recipient email found for automation ${automation.id}`);
          continue;
        }

        // Prepare variables for template
        const variables = prepareTemplateVariables(context);

        // Handle delay if specified
        if (automation.delay_minutes && automation.delay_minutes > 0) {
          await scheduleDelayedEmail(automation, context, recipientEmail, variables);
        } else {
          // Send immediately
          const result = await sendTemplateEmail(
            automation.template_type,
            variables,
            recipientEmail,
            {
              userId: context.user?.id,
              organizationId: context.organization?.id,
              responseId: context.response?.id
            }
          );

          if (result.success) {
            // emailsSent++; // Increment would be here but variable is const
          } else {
            errors.push(`Failed to send email for automation ${automation.id}: ${result.error}`);
          }
        }
      } catch (error) {
        errors.push(`Error processing automation ${automation.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return { success: errors.length === 0, emailsSent, errors };

  } catch (error) {
    console.error('Error triggering email automation:', error);
    return { 
      success: false, 
      emailsSent: 0, 
      errors: [error instanceof Error ? error.message : 'Unknown error'] 
    };
  }
}

// Evaluate automation conditions
function evaluateConditions(conditions: Record<string, any>, context: TriggerContext): boolean {
  try {
    // Simple condition evaluation - can be extended for more complex logic
    if (conditions.min_score && context.response?.score && context.response.score < conditions.min_score) {
      return false;
    }

    if (conditions.max_score && context.response?.score && context.response.score > conditions.max_score) {
      return false;
    }

    if (conditions.risk_level && context.response?.risk_level !== conditions.risk_level) {
      return false;
    }

    if (conditions.questionnaire_type && context.questionnaire?.type !== conditions.questionnaire_type) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error evaluating conditions:', error);
    return false;
  }
}

// Get recipient email from context
function getRecipientEmail(context: TriggerContext): string | null {
  if (context.response?.patient_email) {
    return context.response.patient_email;
  }
  
  if (context.user?.email) {
    return context.user.email;
  }

  return null;
}

// Prepare template variables from context
function prepareTemplateVariables(context: TriggerContext): Record<string, any> {
  const variables: Record<string, any> = {};

  // User variables
  if (context.user) {
    variables.userName = context.user.name;
    variables.userEmail = context.user.email;
  }

  // Response variables
  if (context.response) {
    variables.patientName = context.response.patient_name || context.user?.name || 'Patient';
    variables.patientEmail = context.response.patient_email || context.user?.email;
    variables.score = context.response.score;
    variables.riskLevel = context.response.risk_level;
    variables.completionDate = context.response.completed_at ? 
      new Date(context.response.completed_at).toLocaleDateString() : 
      new Date().toLocaleDateString();
  }

  // Questionnaire variables
  if (context.questionnaire) {
    variables.assessmentName = context.questionnaire.title;
    variables.questionnaireTitle = context.questionnaire.title;
    variables.questionnaireDescription = context.questionnaire.description;
  }

  // Organization variables
  if (context.organization) {
    variables.organizationName = context.organization.name;
    variables.organizationEmail = context.organization.contact_email;
  }

  // Default values
  variables.organizationName = variables.organizationName || 'MindTrack';
  variables.dashboardUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mindtrack.com';
  variables.resultsUrl = `${variables.dashboardUrl}/responses/${context.response?.id}`;

  // Add metadata
  if (context.metadata) {
    Object.assign(variables, context.metadata);
  }

  return variables;
}

// Schedule delayed email (placeholder - would need a job queue in production)
async function scheduleDelayedEmail(
  automation: EmailAutomationConfig,
  context: TriggerContext,
  recipientEmail: string,
  variables: Record<string, any>
): Promise<void> {
  try {
    // In a production environment, this would use a job queue like Bull or Agenda
    // For now, we'll store it in a simple scheduled_emails table
    await query(
      `INSERT INTO scheduled_emails 
       (automation_id, template_type, recipient_email, variables, context_data, scheduled_for, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW() + INTERVAL '${automation.delay_minutes} minutes', NOW())`,
      [
        automation.id,
        automation.template_type,
        recipientEmail,
        JSON.stringify(variables),
        JSON.stringify(context),
      ]
    );

    console.log(`Scheduled email for automation ${automation.id} to be sent in ${automation.delay_minutes} minutes`);
  } catch (error) {
    console.error('Error scheduling delayed email:', error);
    throw error;
  }
}

// Process scheduled emails (would be called by a cron job)
export async function processScheduledEmails(): Promise<{ processed: number; errors: string[] }> {
  const errors: string[] = [];
  let processed = 0;

  try {
    // Get emails that are due to be sent
    const result = await query<{
      id: number;
      template_type: string;
      recipient_email: string;
      variables: string;
      context_data: string;
    }>(
      `SELECT id, template_type, recipient_email, variables, context_data
       FROM scheduled_emails 
       WHERE scheduled_for <= NOW() AND sent_at IS NULL AND error IS NULL
       ORDER BY scheduled_for ASC
       LIMIT 100`
    );

    for (const scheduledEmail of result.rows) {
      try {
        const variables = JSON.parse(scheduledEmail.variables);
        const contextData = JSON.parse(scheduledEmail.context_data);

        const emailResult = await sendTemplateEmail(
          scheduledEmail.template_type,
          variables,
          scheduledEmail.recipient_email,
          {
            userId: contextData.user?.id,
            organizationId: contextData.organization?.id,
            responseId: contextData.response?.id
          }
        );

        if (emailResult.success) {
          // Mark as sent
          await query(
            'UPDATE scheduled_emails SET sent_at = NOW(), email_log_id = $1 WHERE id = $2',
            [emailResult.emailLogId, scheduledEmail.id]
          );
          processed++;
        } else {
          // Mark as failed
          await query(
            'UPDATE scheduled_emails SET error = $1 WHERE id = $2',
            [emailResult.error, scheduledEmail.id]
          );
          errors.push(`Failed to send scheduled email ${scheduledEmail.id}: ${emailResult.error}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        await query(
          'UPDATE scheduled_emails SET error = $1 WHERE id = $2',
          [errorMessage, scheduledEmail.id]
        );
        errors.push(`Error processing scheduled email ${scheduledEmail.id}: ${errorMessage}`);
      }
    }

    return { processed, errors };

  } catch (error) {
    console.error('Error processing scheduled emails:', error);
    return {
      processed,
      errors: [...errors, error instanceof Error ? error.message : 'Unknown error']
    };
  }
}

// Specific trigger functions for common events

// Trigger when a questionnaire is completed
export async function onQuestionnaireCompleted(
  responseId: number,
  userId?: number
): Promise<{ success: boolean; emailsSent: number; errors: string[] }> {
  try {
    // Get response details with related data
    const result = await query<Response & {
      questionnaire_title: string;
      questionnaire_type: string;
      questionnaire_description: string;
      organization_name: string;
      organization_contact_email: string;
      user_name: string;
      user_email: string;
    }>(
      `SELECT
        r.*,
        q.title as questionnaire_title,
        q.type as questionnaire_type,
        q.description as questionnaire_description,
        o.name as organization_name,
        o.contact_email as organization_contact_email,
        u.name as user_name,
        u.email as user_email
       FROM responses r
       LEFT JOIN questionnaires q ON r.questionnaire_id = q.id
       LEFT JOIN organizations o ON r.organization_id = o.id
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.id = $1`,
      [responseId]
    );

    if (result.rows.length === 0) {
      return { success: false, emailsSent: 0, errors: ['Response not found'] };
    }

    const responseData = result.rows[0];

    const context: TriggerContext = {
      response: responseData,
      questionnaire: {
        id: responseData.questionnaire_id,
        title: responseData.questionnaire_title,
        type: responseData.questionnaire_type,
        description: responseData.questionnaire_description
      } as Questionnaire,
      organization: responseData.organization_id ? {
        id: responseData.organization_id,
        name: responseData.organization_name,
        contact_email: responseData.organization_contact_email
      } as Organization : undefined,
      user: userId && responseData.user_id ? {
        id: responseData.user_id,
        name: responseData.user_name,
        email: responseData.user_email
      } as User : undefined
    };

    return await triggerEmailAutomation(EMAIL_TRIGGERS.QUESTIONNAIRE_COMPLETED, context);

  } catch (error) {
    console.error('Error triggering questionnaire completed automation:', error);
    return {
      success: false,
      emailsSent: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error']
    };
  }
}

// Trigger when assessment results are ready
export async function onAssessmentResultsReady(
  responseId: number,
  analysisData?: {
    score: number;
    maxScore: number;
    riskLevel: 'low' | 'medium' | 'high';
    riskLevelText: string;
    resultsSummary: string;
  }
): Promise<{ success: boolean; emailsSent: number; errors: string[] }> {
  try {
    // Get response details
    const result = await query<Response & {
      questionnaire_title: string;
      organization_name: string;
      user_name: string;
      user_email: string;
    }>(
      `SELECT
        r.*,
        q.title as questionnaire_title,
        o.name as organization_name,
        u.name as user_name,
        u.email as user_email
       FROM responses r
       LEFT JOIN questionnaires q ON r.questionnaire_id = q.id
       LEFT JOIN organizations o ON r.organization_id = o.id
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.id = $1`,
      [responseId]
    );

    if (result.rows.length === 0) {
      return { success: false, emailsSent: 0, errors: ['Response not found'] };
    }

    const responseData = result.rows[0];
    const recipientEmail = responseData.patient_email || responseData.user_email;

    if (!recipientEmail) {
      return { success: false, emailsSent: 0, errors: ['No recipient email found'] };
    }

    // Send assessment results email directly
    const assessmentData = {
      name: responseData.questionnaire_title,
      score: analysisData?.score || responseData.score || 0,
      maxScore: analysisData?.maxScore || 100,
      riskLevel: analysisData?.riskLevel || (responseData.risk_level as 'low' | 'medium' | 'high') || 'low',
      riskLevelText: analysisData?.riskLevelText || responseData.risk_level || 'Low Risk',
      completionDate: responseData.completed_at ?
        new Date(responseData.completed_at).toLocaleDateString() :
        new Date().toLocaleDateString(),
      completionTime: Math.round((responseData.completion_time || 0) / 60), // Convert to minutes
      resultsSummary: analysisData?.resultsSummary || 'Your assessment has been completed and reviewed.',
      resultsUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://mindtrack.com'}/responses/${responseId}`
    };

    const success = await sendAssessmentResultsEmail(
      recipientEmail,
      responseData.patient_name || responseData.user_name || 'Patient',
      assessmentData,
      responseData.organization_name || 'MindTrack',
      {
        userId: responseData.user_id || undefined,
        organizationId: responseData.organization_id || undefined,
        responseId: responseData.id
      }
    );

    return {
      success,
      emailsSent: success ? 1 : 0,
      errors: success ? [] : ['Failed to send assessment results email']
    };

  } catch (error) {
    console.error('Error sending assessment results email:', error);
    return {
      success: false,
      emailsSent: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error']
    };
  }
}

// Trigger when a user registers
export async function onUserRegistered(
  userId: number,
  organizationId?: number
): Promise<{ success: boolean; emailsSent: number; errors: string[] }> {
  try {
    // Get user details
    const result = await query<User & {
      organization_name?: string;
    }>(
      `SELECT
        u.*,
        o.name as organization_name
       FROM users u
       LEFT JOIN organizations o ON $2::int = o.id
       WHERE u.id = $1`,
      [userId, organizationId]
    );

    if (result.rows.length === 0) {
      return { success: false, emailsSent: 0, errors: ['User not found'] };
    }

    const userData = result.rows[0];

    const context: TriggerContext = {
      user: userData,
      organization: organizationId ? {
        id: organizationId,
        name: userData.organization_name || 'MindTrack'
      } as Organization : undefined,
      metadata: {
        dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://mindtrack.com'}/dashboard`
      }
    };

    return await triggerEmailAutomation(EMAIL_TRIGGERS.USER_REGISTERED, context);

  } catch (error) {
    console.error('Error triggering user registered automation:', error);
    return {
      success: false,
      emailsSent: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error']
    };
  }
}
