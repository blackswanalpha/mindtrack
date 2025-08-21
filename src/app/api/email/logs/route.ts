import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { query } from '@/lib/db';
import { EmailLog } from '@/types/database';

// GET /api/email/logs - Get email logs
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
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0);
    const status = searchParams.get('status');
    const recipient = searchParams.get('recipient');
    const organizationId = searchParams.get('organization_id');
    const responseId = searchParams.get('response_id');
    const templateId = searchParams.get('template_id');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    // Add filters
    if (status) {
      whereClause += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (recipient) {
      whereClause += ` AND recipient ILIKE $${paramIndex}`;
      params.push(`%${recipient}%`);
      paramIndex++;
    }

    if (organizationId) {
      whereClause += ` AND organization_id = $${paramIndex}`;
      params.push(parseInt(organizationId));
      paramIndex++;
    }

    if (responseId) {
      whereClause += ` AND response_id = $${paramIndex}`;
      params.push(parseInt(responseId));
      paramIndex++;
    }

    if (templateId) {
      whereClause += ` AND template_id = $${paramIndex}`;
      params.push(parseInt(templateId));
      paramIndex++;
    }

    if (dateFrom) {
      whereClause += ` AND sent_at >= $${paramIndex}`;
      params.push(dateFrom);
      paramIndex++;
    }

    if (dateTo) {
      whereClause += ` AND sent_at <= $${paramIndex}`;
      params.push(dateTo);
      paramIndex++;
    }

    // Get total count
    const countResult = await query<{ count: number }>(
      `SELECT COUNT(*) as count FROM email_logs ${whereClause}`,
      params
    );

    const totalCount = parseInt(countResult.rows[0]?.count || '0');

    // Get email logs with pagination
    const result = await query<EmailLog & { 
      template_name?: string; 
      sent_by_name?: string;
      organization_name?: string;
    }>(
      `SELECT 
        el.*,
        et.name as template_name,
        u.name as sent_by_name,
        o.name as organization_name
       FROM email_logs el
       LEFT JOIN email_templates et ON el.template_id = et.id
       LEFT JOIN users u ON el.sent_by_id = u.id
       LEFT JOIN organizations o ON el.organization_id = o.id
       ${whereClause}
       ORDER BY el.sent_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    // Get status summary
    const statusSummary = await query<{ status: string; count: number }>(
      `SELECT status, COUNT(*) as count 
       FROM email_logs 
       ${whereClause}
       GROUP BY status`,
      params
    );

    return NextResponse.json({
      success: true,
      data: {
        logs: result.rows,
        pagination: {
          total: totalCount,
          limit,
          offset,
          has_more: offset + limit < totalCount
        },
        summary: {
          total_emails: totalCount,
          status_breakdown: statusSummary.rows.reduce((acc, row) => {
            acc[row.status] = parseInt(row.count.toString());
            return acc;
          }, {} as Record<string, number>)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching email logs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch email logs' },
      { status: 500 }
    );
  }
}

// DELETE /api/email/logs - Clean up old email logs
export async function DELETE(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const daysOld = parseInt(searchParams.get('days_old') || '90');
    const status = searchParams.get('status'); // Optional: only delete logs with specific status

    if (daysOld < 30) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete logs newer than 30 days' },
        { status: 400 }
      );
    }

    let whereClause = 'WHERE sent_at < NOW() - INTERVAL \'$1 days\'';
    const params: any[] = [daysOld];

    if (status) {
      whereClause += ' AND status = $2';
      params.push(status);
    }

    const result = await query<{ count: number }>(
      `DELETE FROM email_logs ${whereClause} RETURNING COUNT(*) as count`,
      params
    );

    const deletedCount = result.rows[0]?.count || 0;

    return NextResponse.json({
      success: true,
      data: { deleted_count: deletedCount },
      message: `Deleted ${deletedCount} email logs older than ${daysOld} days`
    });

  } catch (error) {
    console.error('Error cleaning up email logs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to clean up email logs' },
      { status: 500 }
    );
  }
}
