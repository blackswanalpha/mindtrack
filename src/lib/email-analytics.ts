import { query } from '@/lib/db';

// Email analytics interfaces
export interface EmailAnalytics {
  total_sent: number;
  total_delivered: number;
  total_opened: number;
  total_clicked: number;
  total_bounced: number;
  total_failed: number;
  delivery_rate: number;
  open_rate: number;
  click_rate: number;
  bounce_rate: number;
  failure_rate: number;
}

export interface EmailAnalyticsFilters {
  date_from?: string;
  date_to?: string;
  organization_id?: number;
  template_id?: number;
  campaign_id?: number;
  status?: string;
}

export interface EmailTrendData {
  date: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  failed: number;
}

export interface TopPerformingTemplate {
  template_id: number;
  template_name: string;
  total_sent: number;
  open_rate: number;
  click_rate: number;
  delivery_rate: number;
}

// Get comprehensive email analytics
export async function getEmailAnalytics(filters: EmailAnalyticsFilters = {}): Promise<EmailAnalytics> {
  try {
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    // Build where clause based on filters
    if (filters.date_from) {
      whereClause += ` AND sent_at >= $${paramIndex}`;
      params.push(filters.date_from);
      paramIndex++;
    }

    if (filters.date_to) {
      whereClause += ` AND sent_at <= $${paramIndex}`;
      params.push(filters.date_to);
      paramIndex++;
    }

    if (filters.organization_id) {
      whereClause += ` AND organization_id = $${paramIndex}`;
      params.push(filters.organization_id);
      paramIndex++;
    }

    if (filters.template_id) {
      whereClause += ` AND template_id = $${paramIndex}`;
      params.push(filters.template_id);
      paramIndex++;
    }

    if (filters.status) {
      whereClause += ` AND status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    const result = await query<{
      total_sent: number;
      total_delivered: number;
      total_opened: number;
      total_clicked: number;
      total_bounced: number;
      total_failed: number;
    }>(
      `SELECT 
        COUNT(*) as total_sent,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as total_delivered,
        COUNT(CASE WHEN opened_at IS NOT NULL THEN 1 END) as total_opened,
        COUNT(CASE WHEN clicked_at IS NOT NULL THEN 1 END) as total_clicked,
        COUNT(CASE WHEN status = 'bounced' THEN 1 END) as total_bounced,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as total_failed
       FROM email_logs 
       ${whereClause}`,
      params
    );

    const data = result.rows[0];
    const totalSent = parseInt(data.total_sent.toString());
    const totalDelivered = parseInt(data.total_delivered.toString());
    const totalOpened = parseInt(data.total_opened.toString());
    const totalClicked = parseInt(data.total_clicked.toString());
    const totalBounced = parseInt(data.total_bounced.toString());
    const totalFailed = parseInt(data.total_failed.toString());

    return {
      total_sent: totalSent,
      total_delivered: totalDelivered,
      total_opened: totalOpened,
      total_clicked: totalClicked,
      total_bounced: totalBounced,
      total_failed: totalFailed,
      delivery_rate: totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0,
      open_rate: totalDelivered > 0 ? (totalOpened / totalDelivered) * 100 : 0,
      click_rate: totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0,
      bounce_rate: totalSent > 0 ? (totalBounced / totalSent) * 100 : 0,
      failure_rate: totalSent > 0 ? (totalFailed / totalSent) * 100 : 0
    };

  } catch (error) {
    console.error('Error getting email analytics:', error);
    throw error;
  }
}

// Get email trend data over time
export async function getEmailTrendData(
  filters: EmailAnalyticsFilters = {},
  period: 'day' | 'week' | 'month' = 'day',
  limit: number = 30
): Promise<EmailTrendData[]> {
  try {
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    // Build where clause
    if (filters.date_from) {
      whereClause += ` AND sent_at >= $${paramIndex}`;
      params.push(filters.date_from);
      paramIndex++;
    }

    if (filters.date_to) {
      whereClause += ` AND sent_at <= $${paramIndex}`;
      params.push(filters.date_to);
      paramIndex++;
    }

    if (filters.organization_id) {
      whereClause += ` AND organization_id = $${paramIndex}`;
      params.push(filters.organization_id);
      paramIndex++;
    }

    // Determine date truncation based on period
    let dateTrunc = 'DATE(sent_at)';
    if (period === 'week') {
      dateTrunc = 'DATE_TRUNC(\'week\', sent_at)::date';
    } else if (period === 'month') {
      dateTrunc = 'DATE_TRUNC(\'month\', sent_at)::date';
    }

    const result = await query<EmailTrendData>(
      `SELECT 
        ${dateTrunc} as date,
        COUNT(*) as sent,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered,
        COUNT(CASE WHEN opened_at IS NOT NULL THEN 1 END) as opened,
        COUNT(CASE WHEN clicked_at IS NOT NULL THEN 1 END) as clicked,
        COUNT(CASE WHEN status = 'bounced' THEN 1 END) as bounced,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed
       FROM email_logs 
       ${whereClause}
       GROUP BY ${dateTrunc}
       ORDER BY date DESC
       LIMIT $${paramIndex}`,
      [...params, limit]
    );

    return result.rows.map(row => ({
      date: row.date,
      sent: parseInt(row.sent.toString()),
      delivered: parseInt(row.delivered.toString()),
      opened: parseInt(row.opened.toString()),
      clicked: parseInt(row.clicked.toString()),
      bounced: parseInt(row.bounced.toString()),
      failed: parseInt(row.failed.toString())
    }));

  } catch (error) {
    console.error('Error getting email trend data:', error);
    throw error;
  }
}

// Get top performing email templates
export async function getTopPerformingTemplates(
  filters: EmailAnalyticsFilters = {},
  limit: number = 10
): Promise<TopPerformingTemplate[]> {
  try {
    let whereClause = 'WHERE el.template_id IS NOT NULL';
    const params: any[] = [];
    let paramIndex = 1;

    if (filters.date_from) {
      whereClause += ` AND el.sent_at >= $${paramIndex}`;
      params.push(filters.date_from);
      paramIndex++;
    }

    if (filters.date_to) {
      whereClause += ` AND el.sent_at <= $${paramIndex}`;
      params.push(filters.date_to);
      paramIndex++;
    }

    if (filters.organization_id) {
      whereClause += ` AND el.organization_id = $${paramIndex}`;
      params.push(filters.organization_id);
      paramIndex++;
    }

    const result = await query<TopPerformingTemplate>(
      `SELECT 
        el.template_id,
        et.name as template_name,
        COUNT(*) as total_sent,
        ROUND(
          (COUNT(CASE WHEN el.opened_at IS NOT NULL THEN 1 END)::float / 
           NULLIF(COUNT(CASE WHEN el.status = 'delivered' THEN 1 END), 0)) * 100, 2
        ) as open_rate,
        ROUND(
          (COUNT(CASE WHEN el.clicked_at IS NOT NULL THEN 1 END)::float / 
           NULLIF(COUNT(CASE WHEN el.opened_at IS NOT NULL THEN 1 END), 0)) * 100, 2
        ) as click_rate,
        ROUND(
          (COUNT(CASE WHEN el.status = 'delivered' THEN 1 END)::float / COUNT(*)) * 100, 2
        ) as delivery_rate
       FROM email_logs el
       LEFT JOIN email_templates et ON el.template_id = et.id
       ${whereClause}
       GROUP BY el.template_id, et.name
       HAVING COUNT(*) >= 5  -- Only include templates with at least 5 sends
       ORDER BY open_rate DESC, total_sent DESC
       LIMIT $${paramIndex}`,
      [...params, limit]
    );

    return result.rows.map(row => ({
      template_id: row.template_id,
      template_name: row.template_name || 'Unknown Template',
      total_sent: parseInt(row.total_sent.toString()),
      open_rate: parseFloat(row.open_rate?.toString() || '0'),
      click_rate: parseFloat(row.click_rate?.toString() || '0'),
      delivery_rate: parseFloat(row.delivery_rate?.toString() || '0')
    }));

  } catch (error) {
    console.error('Error getting top performing templates:', error);
    throw error;
  }
}

// Track email event (open, click, etc.)
export async function trackEmailEvent(
  emailLogId: number,
  eventType: 'delivered' | 'opened' | 'clicked' | 'bounced' | 'complained',
  eventData?: Record<string, any>,
  ipAddress?: string,
  userAgent?: string
): Promise<boolean> {
  try {
    // Update email log with event timestamp
    const timestampField = `${eventType}_at`;
    await query(
      `UPDATE email_logs SET ${timestampField} = NOW() WHERE id = $1`,
      [emailLogId]
    );

    // Insert tracking record
    await query(
      `INSERT INTO email_tracking (email_log_id, event_type, event_data, ip_address, user_agent, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [
        emailLogId,
        eventType,
        eventData ? JSON.stringify(eventData) : null,
        ipAddress,
        userAgent
      ]
    );

    return true;

  } catch (error) {
    console.error('Error tracking email event:', error);
    return false;
  }
}

// Get email performance by organization
export async function getEmailPerformanceByOrganization(
  filters: EmailAnalyticsFilters = {}
): Promise<Array<{
  organization_id: number;
  organization_name: string;
  total_sent: number;
  delivery_rate: number;
  open_rate: number;
  click_rate: number;
}>> {
  try {
    let whereClause = 'WHERE el.organization_id IS NOT NULL';
    const params: any[] = [];
    let paramIndex = 1;

    if (filters.date_from) {
      whereClause += ` AND el.sent_at >= $${paramIndex}`;
      params.push(filters.date_from);
      paramIndex++;
    }

    if (filters.date_to) {
      whereClause += ` AND el.sent_at <= $${paramIndex}`;
      params.push(filters.date_to);
      paramIndex++;
    }

    const result = await query<{
      organization_id: number;
      organization_name: string;
      total_sent: number;
      delivery_rate: number;
      open_rate: number;
      click_rate: number;
    }>(
      `SELECT 
        el.organization_id,
        o.name as organization_name,
        COUNT(*) as total_sent,
        ROUND(
          (COUNT(CASE WHEN el.status = 'delivered' THEN 1 END)::float / COUNT(*)) * 100, 2
        ) as delivery_rate,
        ROUND(
          (COUNT(CASE WHEN el.opened_at IS NOT NULL THEN 1 END)::float / 
           NULLIF(COUNT(CASE WHEN el.status = 'delivered' THEN 1 END), 0)) * 100, 2
        ) as open_rate,
        ROUND(
          (COUNT(CASE WHEN el.clicked_at IS NOT NULL THEN 1 END)::float / 
           NULLIF(COUNT(CASE WHEN el.opened_at IS NOT NULL THEN 1 END), 0)) * 100, 2
        ) as click_rate
       FROM email_logs el
       LEFT JOIN organizations o ON el.organization_id = o.id
       ${whereClause}
       GROUP BY el.organization_id, o.name
       ORDER BY total_sent DESC`,
      params
    );

    return result.rows.map(row => ({
      organization_id: row.organization_id,
      organization_name: row.organization_name || 'Unknown Organization',
      total_sent: parseInt(row.total_sent.toString()),
      delivery_rate: parseFloat(row.delivery_rate?.toString() || '0'),
      open_rate: parseFloat(row.open_rate?.toString() || '0'),
      click_rate: parseFloat(row.click_rate?.toString() || '0')
    }));

  } catch (error) {
    console.error('Error getting email performance by organization:', error);
    throw error;
  }
}
