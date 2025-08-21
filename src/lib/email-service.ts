import nodemailer from 'nodemailer';
import { OrganizationInvitation, EmailTemplate, EmailLog } from '@/types/database';
import { query } from '@/lib/db';
import { performSecurityCheck, EmailSecurityConfig } from '@/lib/email-security';

// Email configuration
const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
};

// Create transporter
const transporter = nodemailer.createTransporter(emailConfig);

// Email template categories
export const EMAIL_CATEGORIES = {
  AUTHENTICATION: 'authentication',
  QUESTIONNAIRE: 'questionnaire',
  ORGANIZATION: 'organization',
  NOTIFICATION: 'notification',
  SYSTEM: 'system',
  MARKETING: 'marketing'
} as const;

// Email template types
export const EMAIL_TEMPLATE_TYPES = {
  WELCOME: 'welcome',
  EMAIL_VERIFICATION: 'email_verification',
  PASSWORD_RESET: 'password_reset',
  QUESTIONNAIRE_INVITATION: 'questionnaire_invitation',
  QUESTIONNAIRE_REMINDER: 'questionnaire_reminder',
  ASSESSMENT_COMPLETION: 'assessment_completion',
  ASSESSMENT_RESULTS: 'assessment_results',
  AI_ANALYSIS_REPORT: 'ai_analysis_report',
  ORGANIZATION_INVITATION: 'organization_invitation',
  ROLE_CHANGE: 'role_change',
  FOLLOW_UP: 'follow_up',
  BULK_COMMUNICATION: 'bulk_communication'
} as const;

// Template variable definitions
export interface TemplateVariables {
  [key: string]: {
    description: string;
    required: boolean;
    type: 'string' | 'number' | 'date' | 'boolean' | 'url';
    example?: string;
  };
}

// Email template data interface
export interface EmailTemplateData {
  name: string;
  subject: string;
  html_content: string;
  text_content: string;
  variables: TemplateVariables;
  category: string;
  type: string;
  is_active: boolean;
  organization_id?: number;
}

// Default email templates with comprehensive variable support
export const defaultEmailTemplates: Record<string, EmailTemplateData> = {
  welcome: {
    name: 'Welcome Email',
    subject: 'Welcome to {{organizationName}} - MindTrack',
    html_content: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to MindTrack</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background: white; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; }
          .content { padding: 30px 20px; }
          .button { display: inline-block; background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to MindTrack!</h1>
          </div>
          <div class="content">
            <p>Hello {{userName}},</p>
            <p>Welcome to {{organizationName}}! We're excited to have you join our mental health assessment platform.</p>
            <p>With MindTrack, you can:</p>
            <ul>
              <li>Complete comprehensive mental health assessments</li>
              <li>Track your progress over time</li>
              <li>Receive personalized insights and recommendations</li>
              <li>Connect with healthcare professionals</li>
            </ul>
            <p>To get started, please verify your email address and complete your profile:</p>
            <a href="{{dashboardUrl}}" class="button">Get Started</a>
            <p>If you have any questions, don't hesitate to reach out to our support team.</p>
            <p>Best regards,<br>The MindTrack Team</p>
          </div>
          <div class="footer">
            <p>This email was sent by {{organizationName}}</p>
            <p>If you didn't create this account, you can safely ignore this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text_content: `Welcome to MindTrack!

Hello {{userName}},

Welcome to {{organizationName}}! We're excited to have you join our mental health assessment platform.

With MindTrack, you can:
- Complete comprehensive mental health assessments
- Track your progress over time
- Receive personalized insights and recommendations
- Connect with healthcare professionals

To get started, please visit: {{dashboardUrl}}

If you have any questions, don't hesitate to reach out to our support team.

Best regards,
The MindTrack Team

This email was sent by {{organizationName}}
If you didn't create this account, you can safely ignore this email.`,
    variables: {
      userName: { description: 'User\'s full name', required: true, type: 'string', example: 'John Doe' },
      organizationName: { description: 'Organization name', required: true, type: 'string', example: 'Healthcare Clinic' },
      dashboardUrl: { description: 'URL to user dashboard', required: true, type: 'url', example: 'https://mindtrack.com/dashboard' }
    },
    category: EMAIL_CATEGORIES.AUTHENTICATION,
    type: EMAIL_TEMPLATE_TYPES.WELCOME,
    is_active: true
  },

  emailVerification: {
    name: 'Email Verification',
    subject: 'Verify your email address - MindTrack',
    html_content: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background: white; }
          .header { background: #28a745; color: white; padding: 30px 20px; text-align: center; }
          .content { padding: 30px 20px; }
          .button { display: inline-block; background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
          .code { background: #f8f9fa; padding: 15px; border-radius: 5px; font-family: monospace; font-size: 18px; text-align: center; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Verify Your Email Address</h1>
          </div>
          <div class="content">
            <p>Hello {{userName}},</p>
            <p>Thank you for registering with MindTrack. To complete your registration, please verify your email address.</p>
            <p>Click the button below to verify your email:</p>
            <a href="{{verificationUrl}}" class="button">Verify Email Address</a>
            <p>Or use this verification code:</p>
            <div class="code">{{verificationCode}}</div>
            <p>This verification link will expire in {{expirationHours}} hours.</p>
            <p>If you didn't create an account with MindTrack, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            <p>This email was sent by {{organizationName}}</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text_content: `Verify Your Email Address

Hello {{userName}},

Thank you for registering with MindTrack. To complete your registration, please verify your email address.

Visit this link to verify your email: {{verificationUrl}}

Or use this verification code: {{verificationCode}}

This verification link will expire in {{expirationHours}} hours.

If you didn't create an account with MindTrack, you can safely ignore this email.

This email was sent by {{organizationName}}`,
    variables: {
      userName: { description: 'User\'s full name', required: true, type: 'string', example: 'John Doe' },
      organizationName: { description: 'Organization name', required: true, type: 'string', example: 'Healthcare Clinic' },
      verificationUrl: { description: 'Email verification URL', required: true, type: 'url', example: 'https://mindtrack.com/verify?token=abc123' },
      verificationCode: { description: 'Verification code', required: true, type: 'string', example: '123456' },
      expirationHours: { description: 'Hours until verification expires', required: true, type: 'number', example: '24' }
    },
    category: EMAIL_CATEGORIES.AUTHENTICATION,
    type: EMAIL_TEMPLATE_TYPES.EMAIL_VERIFICATION,
    is_active: true
  },

  passwordReset: {
    name: 'Password Reset',
    subject: 'Reset your password - MindTrack',
    html_content: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background: white; }
          .header { background: #dc3545; color: white; padding: 30px 20px; text-align: center; }
          .content { padding: 30px 20px; }
          .button { display: inline-block; background: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hello {{userName}},</p>
            <p>We received a request to reset your password for your MindTrack account.</p>
            <p>Click the button below to reset your password:</p>
            <a href="{{resetUrl}}" class="button">Reset Password</a>
            <div class="warning">
              <strong>Security Notice:</strong> This password reset link will expire in {{expirationHours}} hours. If you didn't request this password reset, please ignore this email and your password will remain unchanged.
            </div>
            <p>For security reasons, this link can only be used once.</p>
            <p>If you continue to have problems, please contact our support team.</p>
          </div>
          <div class="footer">
            <p>This email was sent by {{organizationName}}</p>
            <p>Request made from IP: {{ipAddress}} at {{requestTime}}</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text_content: `Password Reset Request

Hello {{userName}},

We received a request to reset your password for your MindTrack account.

Visit this link to reset your password: {{resetUrl}}

Security Notice: This password reset link will expire in {{expirationHours}} hours. If you didn't request this password reset, please ignore this email and your password will remain unchanged.

For security reasons, this link can only be used once.

If you continue to have problems, please contact our support team.

This email was sent by {{organizationName}}
Request made from IP: {{ipAddress}} at {{requestTime}}`,
    variables: {
      userName: { description: 'User\'s full name', required: true, type: 'string', example: 'John Doe' },
      organizationName: { description: 'Organization name', required: true, type: 'string', example: 'Healthcare Clinic' },
      resetUrl: { description: 'Password reset URL', required: true, type: 'url', example: 'https://mindtrack.com/reset?token=abc123' },
      expirationHours: { description: 'Hours until reset link expires', required: true, type: 'number', example: '2' },
      ipAddress: { description: 'IP address of requester', required: false, type: 'string', example: '192.168.1.1' },
      requestTime: { description: 'Time of reset request', required: false, type: 'date', example: '2023-12-01 10:30 AM' }
    },
    category: EMAIL_CATEGORIES.AUTHENTICATION,
    type: EMAIL_TEMPLATE_TYPES.PASSWORD_RESET,
    is_active: true
  },

  assessmentResults: {
    name: 'Assessment Results',
    subject: 'Your {{assessmentName}} results are ready',
    html_content: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Assessment Results</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background: white; }
          .header { background: #17a2b8; color: white; padding: 30px 20px; text-align: center; }
          .content { padding: 30px 20px; }
          .button { display: inline-block; background: #17a2b8; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
          .results-summary { background: #e9ecef; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .score { font-size: 24px; font-weight: bold; color: #17a2b8; }
          .risk-level { padding: 10px; border-radius: 5px; margin: 10px 0; text-align: center; font-weight: bold; }
          .risk-low { background: #d4edda; color: #155724; }
          .risk-medium { background: #fff3cd; color: #856404; }
          .risk-high { background: #f8d7da; color: #721c24; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Assessment Results Ready</h1>
          </div>
          <div class="content">
            <p>Hello {{patientName}},</p>
            <p>Thank you for completing the <strong>{{assessmentName}}</strong> assessment. Your results are now available.</p>

            <div class="results-summary">
              <h3>Results Summary</h3>
              <p>Assessment Score: <span class="score">{{score}}/{{maxScore}}</span></p>
              <div class="risk-level risk-{{riskLevel}}">
                Risk Level: {{riskLevelText}}
              </div>
              <p>Completion Date: {{completionDate}}</p>
              <p>Time Taken: {{completionTime}} minutes</p>
            </div>

            <p>{{resultsSummary}}</p>

            <p>To view your detailed results and recommendations:</p>
            <a href="{{resultsUrl}}" class="button">View Detailed Results</a>

            <p>If you have any questions about your results, please don't hesitate to contact your healthcare provider.</p>

            <p>Best regards,<br>{{organizationName}}</p>
          </div>
          <div class="footer">
            <p>This assessment was completed on {{completionDate}}</p>
            <p>Results are confidential and HIPAA compliant</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text_content: `Assessment Results Ready

Hello {{patientName}},

Thank you for completing the {{assessmentName}} assessment. Your results are now available.

Results Summary:
- Assessment Score: {{score}}/{{maxScore}}
- Risk Level: {{riskLevelText}}
- Completion Date: {{completionDate}}
- Time Taken: {{completionTime}} minutes

{{resultsSummary}}

To view your detailed results and recommendations, visit: {{resultsUrl}}

If you have any questions about your results, please don't hesitate to contact your healthcare provider.

Best regards,
{{organizationName}}

This assessment was completed on {{completionDate}}
Results are confidential and HIPAA compliant`,
    variables: {
      patientName: { description: 'Patient\'s name', required: true, type: 'string', example: 'John Doe' },
      organizationName: { description: 'Organization name', required: true, type: 'string', example: 'Healthcare Clinic' },
      assessmentName: { description: 'Name of the assessment', required: true, type: 'string', example: 'PHQ-9 Depression Screening' },
      score: { description: 'Assessment score', required: true, type: 'number', example: '12' },
      maxScore: { description: 'Maximum possible score', required: true, type: 'number', example: '27' },
      riskLevel: { description: 'Risk level (low/medium/high)', required: true, type: 'string', example: 'medium' },
      riskLevelText: { description: 'Risk level description', required: true, type: 'string', example: 'Moderate Risk' },
      completionDate: { description: 'Date assessment was completed', required: true, type: 'date', example: '2023-12-01' },
      completionTime: { description: 'Time taken to complete', required: true, type: 'number', example: '15' },
      resultsSummary: { description: 'Brief summary of results', required: true, type: 'string', example: 'Your results indicate moderate symptoms...' },
      resultsUrl: { description: 'URL to detailed results', required: true, type: 'url', example: 'https://mindtrack.com/results/123' }
    },
    category: EMAIL_CATEGORIES.QUESTIONNAIRE,
    type: EMAIL_TEMPLATE_TYPES.ASSESSMENT_RESULTS,
    is_active: true
  },

  organizationInvitation: {
    name: 'Organization Invitation',
    subject: 'Invitation to join {{organizationName}}',
    html_content: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Organization Invitation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background: white; }
          .header { background: #6f42c1; color: white; padding: 30px 20px; text-align: center; }
          .content { padding: 30px 20px; }
          .button { display: inline-block; background: #6f42c1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
          .invitation-details { background: #e9ecef; padding: 20px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>You're Invited!</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p><strong>{{inviterName}}</strong> has invited you to join <strong>{{organizationName}}</strong> as a <strong>{{role}}</strong>.</p>

            {{#if message}}
            <div class="invitation-details">
              <h4>Personal Message:</h4>
              <p><em>"{{message}}"</em></p>
            </div>
            {{/if}}

            <p>To accept this invitation and join the organization, click the button below:</p>
            <a href="{{invitationUrl}}" class="button">Accept Invitation</a>

            <p>Or copy and paste this link into your browser:</p>
            <p><a href="{{invitationUrl}}">{{invitationUrl}}</a></p>

            <p>This invitation will expire in {{expirationDays}} days.</p>

            <p>If you don't have a MindTrack account yet, you'll be prompted to create one when you accept the invitation.</p>
          </div>
          <div class="footer">
            <p>This invitation was sent by {{inviterName}} from {{organizationName}}.</p>
            <p>If you believe you received this email in error, you can safely ignore it.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text_content: `You're invited to join {{organizationName}}

Hello,

{{inviterName}} has invited you to join {{organizationName}} as a {{role}}.

{{#if message}}
Personal Message: "{{message}}"
{{/if}}

To accept this invitation and join the organization, visit:
{{invitationUrl}}

This invitation will expire in {{expirationDays}} days.

If you don't have a MindTrack account yet, you'll be prompted to create one when you accept the invitation.

This invitation was sent by {{inviterName}} from {{organizationName}}.
If you believe you received this email in error, you can safely ignore it.`,
    variables: {
      organizationName: { description: 'Organization name', required: true, type: 'string', example: 'Healthcare Clinic' },
      inviterName: { description: 'Name of person sending invitation', required: true, type: 'string', example: 'Dr. Smith' },
      role: { description: 'Role being offered', required: true, type: 'string', example: 'Staff Member' },
      invitationUrl: { description: 'URL to accept invitation', required: true, type: 'url', example: 'https://mindtrack.com/invite/abc123' },
      message: { description: 'Personal message from inviter', required: false, type: 'string', example: 'Looking forward to working with you!' },
      expirationDays: { description: 'Days until invitation expires', required: true, type: 'number', example: '7' }
    },
    category: EMAIL_CATEGORIES.ORGANIZATION,
    type: EMAIL_TEMPLATE_TYPES.ORGANIZATION_INVITATION,
    is_active: true
  }
};

// Template variable substitution function
export function substituteVariables(template: string, variables: Record<string, any>): string {
  let result = template;

  // Handle simple variable substitution {{variableName}}
  result = result.replace(/\{\{(\w+)\}\}/g, (match, variableName) => {
    return variables[variableName] !== undefined ? String(variables[variableName]) : match;
  });

  // Handle conditional blocks {{#if variableName}}...{{/if}}
  result = result.replace(/\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, variableName, content) => {
    return variables[variableName] ? content : '';
  });

  return result;
}

// Validate template variables
export function validateTemplateVariables(
  templateVariables: TemplateVariables,
  providedVariables: Record<string, any>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check required variables
  Object.entries(templateVariables).forEach(([key, config]) => {
    if (config.required && (providedVariables[key] === undefined || providedVariables[key] === null)) {
      errors.push(`Required variable '${key}' is missing`);
    }
  });

  // Check variable types
  Object.entries(providedVariables).forEach(([key, value]) => {
    const config = templateVariables[key];
    if (config && value !== undefined && value !== null) {
      switch (config.type) {
        case 'number':
          if (isNaN(Number(value))) {
            errors.push(`Variable '${key}' must be a number`);
          }
          break;
        case 'boolean':
          if (typeof value !== 'boolean') {
            errors.push(`Variable '${key}' must be a boolean`);
          }
          break;
        case 'url':
          try {
            new URL(value);
          } catch {
            errors.push(`Variable '${key}' must be a valid URL`);
          }
          break;
        case 'date':
          if (isNaN(Date.parse(value))) {
            errors.push(`Variable '${key}' must be a valid date`);
          }
          break;
      }
    }
  });

  return { valid: errors.length === 0, errors };
}

// Email sending interface
export interface SendEmailOptions {
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  html: string;
  text: string;
  templateId?: number;
  variables?: Record<string, any>;
  organizationId?: number;
  userId?: number;
  responseId?: number;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

// Email log interface
export interface EmailLogData {
  template_id?: number;
  recipient: string;
  cc_recipients?: string;
  bcc_recipients?: string;
  subject: string;
  body: string;
  html_body: string;
  status: 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed';
  error?: string;
  sent_by_id?: number;
  organization_id?: number;
  response_id?: number;
  metadata?: Record<string, any>;
}

// Log email to database
export async function logEmail(emailData: EmailLogData): Promise<number | null> {
  try {
    const result = await query<{ id: number }>(
      `INSERT INTO email_logs (
        template_id, recipient, cc_recipients, bcc_recipients, subject, body, html_body,
        status, error, sent_by_id, organization_id, response_id, metadata, sent_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
      RETURNING id`,
      [
        emailData.template_id,
        emailData.recipient,
        emailData.cc_recipients,
        emailData.bcc_recipients,
        emailData.subject,
        emailData.body,
        emailData.html_body,
        emailData.status,
        emailData.error,
        emailData.sent_by_id,
        emailData.organization_id,
        emailData.response_id,
        emailData.metadata ? JSON.stringify(emailData.metadata) : null
      ]
    );

    return result.rows[0]?.id || null;
  } catch (error) {
    console.error('Error logging email:', error);
    return null;
  }
}

// Main email sending function with security checks
export async function sendEmail(
  options: SendEmailOptions,
  ipAddress?: string,
  securityConfig?: EmailSecurityConfig
): Promise<{ success: boolean; emailLogId?: number; error?: string; warnings?: string[] }> {
  try {
    if (!emailConfig.auth.user || !emailConfig.auth.pass) {
      console.warn('Email credentials not configured, skipping email send');
      return { success: false, error: 'Email credentials not configured' };
    }

    // Perform security checks
    const securityCheck = await performSecurityCheck(
      {
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        userId: options.userId,
        organizationId: options.organizationId
      },
      ipAddress,
      securityConfig
    );

    if (!securityCheck.allowed) {
      return {
        success: false,
        error: `Security check failed: ${securityCheck.errors.join(', ')}`
      };
    }

    // Use sanitized content
    const finalHtml = securityCheck.sanitizedHtml || options.html;
    const finalText = securityCheck.sanitizedText || options.text;

    // Prepare email log data
    const emailLogData: EmailLogData = {
      template_id: options.templateId,
      recipient: options.to,
      cc_recipients: options.cc,
      bcc_recipients: options.bcc,
      subject: options.subject,
      body: finalText,
      html_body: finalHtml,
      status: 'pending',
      sent_by_id: options.userId,
      organization_id: options.organizationId,
      response_id: options.responseId,
      metadata: options.variables
    };

    // Log email attempt
    const emailLogId = await logEmail(emailLogData);

    // Prepare mail options
    const mailOptions = {
      from: `"MindTrack" <${emailConfig.auth.user}>`,
      to: options.to,
      cc: options.cc,
      bcc: options.bcc,
      subject: options.subject,
      html: finalHtml,
      text: finalText,
      attachments: options.attachments
    };

    // Send email
    await transporter.sendMail(mailOptions);

    // Update email log status
    if (emailLogId) {
      await query(
        'UPDATE email_logs SET status = $1 WHERE id = $2',
        ['sent', emailLogId]
      );
    }

    console.log(`Email sent successfully to ${options.to}`);
    return {
      success: true,
      emailLogId,
      warnings: securityCheck.warnings.length > 0 ? securityCheck.warnings : undefined
    };

  } catch (error) {
    console.error('Error sending email:', error);

    // Update email log with error
    if (options.templateId) {
      await query(
        'UPDATE email_logs SET status = $1, error = $2 WHERE template_id = $3 AND recipient = $4 AND status = $5',
        ['failed', error instanceof Error ? error.message : 'Unknown error', options.templateId, options.to, 'pending']
      );
    }

    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Send email using template
export async function sendTemplateEmail(
  templateType: string,
  variables: Record<string, any>,
  recipient: string,
  options?: {
    cc?: string;
    bcc?: string;
    userId?: number;
    organizationId?: number;
    responseId?: number;
    attachments?: SendEmailOptions['attachments'];
  }
): Promise<{ success: boolean; emailLogId?: number; error?: string }> {
  try {
    // Get template
    const template = defaultEmailTemplates[templateType];
    if (!template) {
      return { success: false, error: `Template '${templateType}' not found` };
    }

    // Validate variables
    const validation = validateTemplateVariables(template.variables, variables);
    if (!validation.valid) {
      return { success: false, error: `Template validation failed: ${validation.errors.join(', ')}` };
    }

    // Substitute variables in template
    const subject = substituteVariables(template.subject, variables);
    const html = substituteVariables(template.html_content, variables);
    const text = substituteVariables(template.text_content, variables);

    // Send email
    return await sendEmail({
      to: recipient,
      cc: options?.cc,
      bcc: options?.bcc,
      subject,
      html,
      text,
      variables,
      userId: options?.userId,
      organizationId: options?.organizationId,
      responseId: options?.responseId,
      attachments: options?.attachments
    });

  } catch (error) {
    console.error('Error sending template email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Send organization invitation email (updated to use new template system)
export async function sendInvitationEmail(
  invitation: OrganizationInvitation & {
    organization?: { name: string };
    invited_by?: { name: string }
  },
  invitationUrl: string,
  message?: string
): Promise<boolean> {
  const organizationName = invitation.organization?.name || 'Unknown Organization';
  const inviterName = invitation.invited_by?.name || 'Someone';

  const variables = {
    organizationName,
    inviterName,
    role: invitation.role,
    invitationUrl,
    message,
    expirationDays: 7
  };

  const result = await sendTemplateEmail(
    EMAIL_TEMPLATE_TYPES.ORGANIZATION_INVITATION,
    variables,
    invitation.email,
    {
      organizationId: invitation.organization_id,
      userId: invitation.invited_by_id
    }
  );

  return result.success;
}

// Send welcome email
export async function sendWelcomeEmail(
  userEmail: string,
  userName: string,
  organizationName: string,
  dashboardUrl: string,
  options?: {
    userId?: number;
    organizationId?: number;
  }
): Promise<boolean> {
  const variables = {
    userName,
    organizationName,
    dashboardUrl
  };

  const result = await sendTemplateEmail(
    EMAIL_TEMPLATE_TYPES.WELCOME,
    variables,
    userEmail,
    options
  );

  return result.success;
}

// Send email verification
export async function sendEmailVerification(
  userEmail: string,
  userName: string,
  verificationUrl: string,
  verificationCode: string,
  organizationName: string,
  options?: {
    userId?: number;
    organizationId?: number;
    expirationHours?: number;
  }
): Promise<boolean> {
  const variables = {
    userName,
    organizationName,
    verificationUrl,
    verificationCode,
    expirationHours: options?.expirationHours || 24
  };

  const result = await sendTemplateEmail(
    EMAIL_TEMPLATE_TYPES.EMAIL_VERIFICATION,
    variables,
    userEmail,
    options
  );

  return result.success;
}

// Send password reset email
export async function sendPasswordResetEmail(
  userEmail: string,
  userName: string,
  resetUrl: string,
  organizationName: string,
  options?: {
    userId?: number;
    organizationId?: number;
    expirationHours?: number;
    ipAddress?: string;
    requestTime?: string;
  }
): Promise<boolean> {
  const variables = {
    userName,
    organizationName,
    resetUrl,
    expirationHours: options?.expirationHours || 2,
    ipAddress: options?.ipAddress,
    requestTime: options?.requestTime || new Date().toLocaleString()
  };

  const result = await sendTemplateEmail(
    EMAIL_TEMPLATE_TYPES.PASSWORD_RESET,
    variables,
    userEmail,
    options
  );

  return result.success;
}

// Send assessment results email
export async function sendAssessmentResultsEmail(
  patientEmail: string,
  patientName: string,
  assessmentData: {
    name: string;
    score: number;
    maxScore: number;
    riskLevel: 'low' | 'medium' | 'high';
    riskLevelText: string;
    completionDate: string;
    completionTime: number;
    resultsSummary: string;
    resultsUrl: string;
  },
  organizationName: string,
  options?: {
    userId?: number;
    organizationId?: number;
    responseId?: number;
  }
): Promise<boolean> {
  const variables = {
    patientName,
    organizationName,
    assessmentName: assessmentData.name,
    score: assessmentData.score,
    maxScore: assessmentData.maxScore,
    riskLevel: assessmentData.riskLevel,
    riskLevelText: assessmentData.riskLevelText,
    completionDate: assessmentData.completionDate,
    completionTime: assessmentData.completionTime,
    resultsSummary: assessmentData.resultsSummary,
    resultsUrl: assessmentData.resultsUrl
  };

  const result = await sendTemplateEmail(
    EMAIL_TEMPLATE_TYPES.ASSESSMENT_RESULTS,
    variables,
    patientEmail,
    options
  );

  return result.success;
}

// Send role change notification email (updated)
export async function sendRoleChangeEmail(
  userEmail: string,
  organizationName: string,
  newRole: string,
  changedByName: string,
  dashboardUrl: string,
  options?: {
    userId?: number;
    organizationId?: number;
  }
): Promise<boolean> {
  // Create a role change template (we'll add this to defaultEmailTemplates later)
  const variables = {
    organizationName,
    newRole,
    changedByName,
    dashboardUrl
  };

  // For now, use the organization invitation template structure but with role change content
  const subject = `Your role in ${organizationName} has been updated`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Role Updated</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: #28a745; color: white; padding: 30px 20px; text-align: center; }
        .content { padding: 30px 20px; }
        .button { display: inline-block; background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Role Updated</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>Your role in <strong>${organizationName}</strong> has been updated to <strong>${newRole}</strong> by ${changedByName}.</p>
          <p>You can now access your updated permissions and features in the organization dashboard.</p>
          <a href="${dashboardUrl}" class="button">Go to Dashboard</a>
        </div>
        <div class="footer">
          <p>This notification was sent from ${organizationName}.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `Your role has been updated

Hello,

Your role in ${organizationName} has been updated to ${newRole} by ${changedByName}.

You can now access your updated permissions and features in the organization dashboard.

Visit: ${dashboardUrl}

This notification was sent from ${organizationName}.`;

  const result = await sendEmail({
    to: userEmail,
    subject,
    html,
    text,
    variables,
    userId: options?.userId,
    organizationId: options?.organizationId
  });

  return result.success;
}

// Get email template by type
export async function getEmailTemplate(templateType: string, organizationId?: number): Promise<EmailTemplate | null> {
  try {
    const result = await query<EmailTemplate>(
      `SELECT * FROM email_templates
       WHERE name = $1 AND is_active = true
       AND (organization_id = $2 OR organization_id IS NULL)
       ORDER BY organization_id DESC NULLS LAST
       LIMIT 1`,
      [templateType, organizationId]
    );

    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching email template:', error);
    return null;
  }
}

// Create or update email template
export async function saveEmailTemplate(
  templateData: EmailTemplateData & { id?: number },
  createdById: number
): Promise<{ success: boolean; templateId?: number; error?: string }> {
  try {
    if (templateData.id) {
      // Update existing template
      const result = await query<{ id: number }>(
        `UPDATE email_templates
         SET name = $1, subject = $2, body = $3, html_content = $4, variables = $5,
             category = $6, type = $7, is_active = $8, organization_id = $9, updated_at = NOW()
         WHERE id = $10
         RETURNING id`,
        [
          templateData.name,
          templateData.subject,
          templateData.text_content,
          templateData.html_content,
          JSON.stringify(templateData.variables),
          templateData.category,
          templateData.type,
          templateData.is_active,
          templateData.organization_id,
          templateData.id
        ]
      );

      return { success: true, templateId: result.rows[0]?.id };
    } else {
      // Create new template
      const result = await query<{ id: number }>(
        `INSERT INTO email_templates
         (name, subject, body, html_content, variables, category, type, is_active, organization_id, created_by_id, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
         RETURNING id`,
        [
          templateData.name,
          templateData.subject,
          templateData.text_content,
          templateData.html_content,
          JSON.stringify(templateData.variables),
          templateData.category,
          templateData.type,
          templateData.is_active,
          templateData.organization_id,
          createdById
        ]
      );

      return { success: true, templateId: result.rows[0]?.id };
    }
  } catch (error) {
    console.error('Error saving email template:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Initialize default email templates in database
export async function initializeDefaultTemplates(organizationId?: number): Promise<void> {
  try {
    for (const [templateType, templateData] of Object.entries(defaultEmailTemplates)) {
      // Check if template already exists
      const existing = await query(
        'SELECT id FROM email_templates WHERE type = $1 AND (organization_id = $2 OR organization_id IS NULL)',
        [templateData.type, organizationId]
      );

      if (existing.rows.length === 0) {
        await query(
          `INSERT INTO email_templates
           (name, subject, body, html_content, variables, category, type, is_active, organization_id, created_by_id, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())`,
          [
            templateData.name,
            templateData.subject,
            templateData.text_content,
            templateData.html_content,
            JSON.stringify(templateData.variables),
            templateData.category,
            templateData.type,
            templateData.is_active,
            organizationId,
            1 // System user
          ]
        );
        console.log(`Initialized email template: ${templateData.name}`);
      }
    }
  } catch (error) {
    console.error('Error initializing default email templates:', error);
  }
}

// Test email configuration
export async function testEmailConfiguration(): Promise<boolean> {
  try {
    if (!emailConfig.auth.user || !emailConfig.auth.pass) {
      console.warn('Email credentials not configured');
      return false;
    }

    await transporter.verify();
    console.log('Email configuration is valid');
    return true;
  } catch (error) {
    console.error('Email configuration test failed:', error);
    return false;
  }
}

// Add tracking to email content
export function addEmailTracking(
  htmlContent: string,
  emailLogId: number,
  baseUrl: string = process.env.NEXT_PUBLIC_APP_URL || 'https://mindtrack.com'
): string {
  let trackedHtml = htmlContent;

  // Add tracking pixel for opens
  const trackingPixel = `<img src="${baseUrl}/api/email/track?id=${emailLogId}&event=opened" width="1" height="1" style="display:none;" alt="" />`;

  // Insert tracking pixel before closing body tag, or at the end if no body tag
  if (trackedHtml.includes('</body>')) {
    trackedHtml = trackedHtml.replace('</body>', `${trackingPixel}</body>`);
  } else {
    trackedHtml += trackingPixel;
  }

  // Track clicks on links
  trackedHtml = trackedHtml.replace(
    /<a\s+([^>]*href\s*=\s*["']([^"']+)["'][^>]*)>/gi,
    (match, attributes, originalUrl) => {
      // Skip if it's already a tracking URL or an anchor link
      if (originalUrl.includes('/api/email/track') || originalUrl.startsWith('#') || originalUrl.startsWith('mailto:')) {
        return match;
      }

      // Create tracked URL
      const trackedUrl = `${baseUrl}/api/email/track/click?id=${emailLogId}&url=${encodeURIComponent(originalUrl)}`;
      return `<a ${attributes.replace(/href\s*=\s*["'][^"']+["']/i, `href="${trackedUrl}"`)} data-original-url="${originalUrl}">`;
    }
  );

  return trackedHtml;
}

// Create click tracking URL
export function createClickTrackingUrl(
  originalUrl: string,
  emailLogId: number,
  baseUrl: string = process.env.NEXT_PUBLIC_APP_URL || 'https://mindtrack.com'
): string {
  return `${baseUrl}/api/email/track/click?id=${emailLogId}&url=${encodeURIComponent(originalUrl)}`;
}

// Enhanced email sending function with tracking
export async function sendTrackedEmail(options: SendEmailOptions): Promise<{ success: boolean; emailLogId?: number; error?: string }> {
  try {
    // First send the email without tracking to get the log ID
    const result = await sendEmail(options);

    if (result.success && result.emailLogId) {
      // Add tracking to the HTML content
      const trackedHtml = addEmailTracking(options.html, result.emailLogId);

      // Update the email log with tracked content
      await query(
        'UPDATE email_logs SET html_body = $1 WHERE id = $2',
        [trackedHtml, result.emailLogId]
      );
    }

    return result;
  } catch (error) {
    console.error('Error sending tracked email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Send test email
export async function sendTestEmail(
  recipientEmail: string,
  senderName: string = 'MindTrack System'
): Promise<boolean> {
  const result = await sendEmail({
    to: recipientEmail,
    subject: 'MindTrack Email Configuration Test',
    html: `
      <h2>Email Configuration Test</h2>
      <p>This is a test email to verify that your MindTrack email configuration is working correctly.</p>
      <p>If you received this email, your email system is properly configured!</p>
      <p>Sent by: ${senderName}</p>
      <p>Time: ${new Date().toLocaleString()}</p>
      <p><a href="https://mindtrack.com">Visit MindTrack</a></p>
    `,
    text: `Email Configuration Test

This is a test email to verify that your MindTrack email configuration is working correctly.

If you received this email, your email system is properly configured!

Sent by: ${senderName}
Time: ${new Date().toLocaleString()}

Visit: https://mindtrack.com`
  });

  return result.success;
}
