import { NextRequest, NextResponse } from 'next/server';
import { processScheduledEmails } from '@/lib/email-automation';

// POST /api/email/process-scheduled - Process scheduled emails (for cron jobs)
export async function POST(request: NextRequest) {
  try {
    // Verify this is being called by an authorized source
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'default-secret';
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const result = await processScheduledEmails();

    return NextResponse.json({
      success: true,
      data: {
        processed: result.processed,
        errors: result.errors
      },
      message: `Processed ${result.processed} scheduled emails${result.errors.length > 0 ? ` with ${result.errors.length} errors` : ''}`
    });

  } catch (error) {
    console.error('Error processing scheduled emails:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process scheduled emails' },
      { status: 500 }
    );
  }
}

// GET /api/email/process-scheduled - Get scheduled emails status
export async function GET(request: NextRequest) {
  try {
    // This endpoint can be used to check the status of scheduled emails
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'default-secret';
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get scheduled emails statistics
    const { query } = await import('@/lib/db');
    
    const pendingResult = await query<{ count: number }>(
      'SELECT COUNT(*) as count FROM scheduled_emails WHERE sent_at IS NULL AND error IS NULL'
    );

    const overdueResult = await query<{ count: number }>(
      'SELECT COUNT(*) as count FROM scheduled_emails WHERE scheduled_for <= NOW() AND sent_at IS NULL AND error IS NULL'
    );

    const failedResult = await query<{ count: number }>(
      'SELECT COUNT(*) as count FROM scheduled_emails WHERE error IS NOT NULL'
    );

    const sentTodayResult = await query<{ count: number }>(
      'SELECT COUNT(*) as count FROM scheduled_emails WHERE sent_at >= CURRENT_DATE'
    );

    return NextResponse.json({
      success: true,
      data: {
        pending: parseInt(pendingResult.rows[0]?.count?.toString() || '0'),
        overdue: parseInt(overdueResult.rows[0]?.count?.toString() || '0'),
        failed: parseInt(failedResult.rows[0]?.count?.toString() || '0'),
        sent_today: parseInt(sentTodayResult.rows[0]?.count?.toString() || '0')
      }
    });

  } catch (error) {
    console.error('Error getting scheduled emails status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get scheduled emails status' },
      { status: 500 }
    );
  }
}
