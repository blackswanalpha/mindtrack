import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { 
  getEmailAnalytics, 
  getEmailTrendData, 
  getTopPerformingTemplates,
  getEmailPerformanceByOrganization,
  EmailAnalyticsFilters 
} from '@/lib/email-analytics';

// GET /api/email/analytics - Get email analytics
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
    const type = searchParams.get('type') || 'overview';
    
    // Build filters from query parameters
    const filters: EmailAnalyticsFilters = {};
    
    if (searchParams.get('date_from')) {
      filters.date_from = searchParams.get('date_from')!;
    }
    
    if (searchParams.get('date_to')) {
      filters.date_to = searchParams.get('date_to')!;
    }
    
    if (searchParams.get('organization_id')) {
      filters.organization_id = parseInt(searchParams.get('organization_id')!);
    }
    
    if (searchParams.get('template_id')) {
      filters.template_id = parseInt(searchParams.get('template_id')!);
    }
    
    if (searchParams.get('status')) {
      filters.status = searchParams.get('status')!;
    }

    switch (type) {
      case 'overview':
        const analytics = await getEmailAnalytics(filters);
        return NextResponse.json({
          success: true,
          data: { analytics }
        });

      case 'trends':
        const period = (searchParams.get('period') as 'day' | 'week' | 'month') || 'day';
        const limit = parseInt(searchParams.get('limit') || '30');
        const trends = await getEmailTrendData(filters, period, limit);
        return NextResponse.json({
          success: true,
          data: { trends, period, limit }
        });

      case 'templates':
        const templateLimit = parseInt(searchParams.get('limit') || '10');
        const topTemplates = await getTopPerformingTemplates(filters, templateLimit);
        return NextResponse.json({
          success: true,
          data: { templates: topTemplates }
        });

      case 'organizations':
        const orgPerformance = await getEmailPerformanceByOrganization(filters);
        return NextResponse.json({
          success: true,
          data: { organizations: orgPerformance }
        });

      case 'dashboard':
        // Get comprehensive dashboard data
        const [
          dashboardAnalytics,
          recentTrends,
          topPerformingTemplates,
          organizationPerformance
        ] = await Promise.all([
          getEmailAnalytics(filters),
          getEmailTrendData(filters, 'day', 7),
          getTopPerformingTemplates(filters, 5),
          getEmailPerformanceByOrganization(filters)
        ]);

        return NextResponse.json({
          success: true,
          data: {
            analytics: dashboardAnalytics,
            trends: recentTrends,
            top_templates: topPerformingTemplates,
            organization_performance: organizationPerformance
          }
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid analytics type. Use: overview, trends, templates, organizations, or dashboard' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error fetching email analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch email analytics' },
      { status: 500 }
    );
  }
}
