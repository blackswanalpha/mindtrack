import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { 
  sendEmail, 
  sendTemplateEmail, 
  testEmailConfiguration,
  sendTestEmail 
} from '@/lib/email-service';

// POST /api/email/send - Send email
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
      to,
      cc,
      bcc,
      subject,
      html,
      text,
      template_type,
      variables,
      organization_id,
      response_id,
      attachments,
      is_test = false
    } = body;

    // Validate required fields
    if (!to) {
      return NextResponse.json(
        { success: false, error: 'Recipient email address is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        { success: false, error: 'Invalid recipient email format' },
        { status: 400 }
      );
    }

    // Handle test email
    if (is_test) {
      const success = await sendTestEmail(to, user.email || 'MindTrack User');
      return NextResponse.json({
        success,
        message: success ? 'Test email sent successfully' : 'Failed to send test email'
      });
    }

    let result;

    if (template_type && variables) {
      // Send using template
      if (!subject && !html && !text) {
        result = await sendTemplateEmail(
          template_type,
          variables,
          to,
          {
            cc,
            bcc,
            userId: user.userId,
            organizationId: organization_id ? parseInt(organization_id) : undefined,
            responseId: response_id ? parseInt(response_id) : undefined,
            attachments
          }
        );
      } else {
        return NextResponse.json(
          { success: false, error: 'Cannot specify both template_type and manual content (subject/html/text)' },
          { status: 400 }
        );
      }
    } else {
      // Send custom email
      if (!subject || (!html && !text)) {
        return NextResponse.json(
          { success: false, error: 'Subject and content (html or text) are required for custom emails' },
          { status: 400 }
        );
      }

      result = await sendEmail({
        to,
        cc,
        bcc,
        subject,
        html: html || '',
        text: text || '',
        variables,
        userId: user.userId,
        organizationId: organization_id ? parseInt(organization_id) : undefined,
        responseId: response_id ? parseInt(response_id) : undefined,
        attachments
      });
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: { email_log_id: result.emailLogId },
        message: 'Email sent successfully'
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send email' },
      { status: 500 }
    );
  }
}

// GET /api/email/send - Test email configuration
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const isConfigValid = await testEmailConfiguration();

    return NextResponse.json({
      success: true,
      data: {
        email_configured: isConfigValid,
        smtp_host: process.env.SMTP_HOST || 'Not configured',
        smtp_port: process.env.SMTP_PORT || 'Not configured',
        smtp_user: process.env.SMTP_USER ? 'Configured' : 'Not configured'
      },
      message: isConfigValid ? 'Email configuration is valid' : 'Email configuration needs attention'
    });

  } catch (error) {
    console.error('Error testing email configuration:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to test email configuration' },
      { status: 500 }
    );
  }
}
