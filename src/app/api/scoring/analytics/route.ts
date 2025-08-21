/**
 * Scoring Analytics API Routes
 * Provides analytics and insights for scoring data
 */

import { NextRequest } from 'next/server';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-utils';
import { scoringService } from '@/lib/scoring/scoring-service';

// GET /api/scoring/analytics - Get scoring analytics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const questionnaireId = searchParams.get('questionnaire_id');
    const configId = searchParams.get('config_id');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');

    if (!questionnaireId) {
      return errorResponse('questionnaire_id parameter is required', 400);
    }

    // Get analytics data
    const analytics = await scoringService.getAnalytics(
      parseInt(questionnaireId),
      configId || undefined
    );

    // Filter by date range if provided
    if (dateFrom || dateTo) {
      const fromDate = dateFrom ? new Date(dateFrom) : new Date(0);
      const toDate = dateTo ? new Date(dateTo) : new Date();

      analytics.score_trends = analytics.score_trends.filter(trend => {
        const trendDate = new Date(trend.date);
        return trendDate >= fromDate && trendDate <= toDate;
      });
    }

    // Calculate additional metrics
    const enhancedAnalytics = {
      ...analytics,
      risk_percentage: {
        none: analytics.total_scores > 0 ? Math.round((analytics.risk_distribution.none / analytics.total_scores) * 100) : 0,
        low: analytics.total_scores > 0 ? Math.round((analytics.risk_distribution.low / analytics.total_scores) * 100) : 0,
        medium: analytics.total_scores > 0 ? Math.round((analytics.risk_distribution.medium / analytics.total_scores) * 100) : 0,
        high: analytics.total_scores > 0 ? Math.round((analytics.risk_distribution.high / analytics.total_scores) * 100) : 0,
        critical: analytics.total_scores > 0 ? Math.round((analytics.risk_distribution.critical / analytics.total_scores) * 100) : 0,
      },
      high_risk_count: analytics.risk_distribution.high + analytics.risk_distribution.critical,
      trend_direction: calculateTrendDirection(analytics.score_trends),
      last_updated: new Date().toISOString()
    };

    return successResponse(enhancedAnalytics);

  } catch (error) {
    console.error('Error fetching scoring analytics:', error);
    return handleApiError(error);
  }
}

/**
 * Calculate trend direction from score trends
 */
function calculateTrendDirection(trends: Array<{ date: string; average_score: number; total_responses: number }>): 'up' | 'down' | 'stable' | 'insufficient_data' {
  if (trends.length < 2) {
    return 'insufficient_data';
  }

  // Compare last 3 data points if available
  const recentTrends = trends.slice(-3);
  if (recentTrends.length < 2) {
    return 'insufficient_data';
  }

  const first = recentTrends[0].average_score;
  const last = recentTrends[recentTrends.length - 1].average_score;
  const difference = last - first;
  const threshold = 0.5; // Minimum difference to consider significant

  if (Math.abs(difference) < threshold) {
    return 'stable';
  }

  return difference > 0 ? 'up' : 'down';
}
