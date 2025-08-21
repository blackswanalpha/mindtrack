/**
 * AI Analysis Statistics API Routes
 * Provides analytics and statistics for AI analysis usage
 */

import { NextRequest } from 'next/server';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-utils';
import { query } from '@/lib/db';

// GET /api/ai-analysis/stats - Get AI analysis statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const organizationId = searchParams.get('organization_id');
    const userId = searchParams.get('user_id');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');

    // Build base query with filters
    let whereClause = 'WHERE 1=1';
    const queryParams: any[] = [];
    let paramCount = 0;

    if (organizationId) {
      paramCount++;
      whereClause += ` AND q.organization_id = $${paramCount}`;
      queryParams.push(parseInt(organizationId));
    }

    if (userId) {
      paramCount++;
      whereClause += ` AND ai.created_by_id = $${paramCount}`;
      queryParams.push(parseInt(userId));
    }

    if (dateFrom) {
      paramCount++;
      whereClause += ` AND ai.created_at >= $${paramCount}`;
      queryParams.push(dateFrom);
    }

    if (dateTo) {
      paramCount++;
      whereClause += ` AND ai.created_at <= $${paramCount}`;
      queryParams.push(dateTo);
    }

    // Get overall statistics
    const overallStatsQuery = `
      SELECT 
        COUNT(*) as total_analyses,
        COUNT(DISTINCT ai.response_id) as unique_responses,
        COUNT(DISTINCT ai.created_by_id) as unique_users,
        COUNT(DISTINCT q.id) as unique_questionnaires,
        AVG(CASE WHEN ai.analysis LIKE '%High%' OR ai.risk_assessment LIKE '%High%' THEN 1 ELSE 0 END) as high_risk_percentage
      FROM ai_analyses ai
      JOIN responses r ON ai.response_id = r.id
      JOIN questionnaires q ON r.questionnaire_id = q.id
      ${whereClause}
    `;

    const overallStats = await query(overallStatsQuery, queryParams);

    // Get analyses by model
    const modelStatsQuery = `
      SELECT 
        model_used,
        COUNT(*) as count,
        COUNT(*) * 100.0 / SUM(COUNT(*)) OVER() as percentage
      FROM ai_analyses ai
      JOIN responses r ON ai.response_id = r.id
      JOIN questionnaires q ON r.questionnaire_id = q.id
      ${whereClause}
      GROUP BY model_used
      ORDER BY count DESC
    `;

    const modelStats = await query(modelStatsQuery, queryParams);

    // Get analyses by questionnaire type
    const questionnaireTypeStatsQuery = `
      SELECT
        q.type,
        COUNT(*) as count,
        COUNT(*) * 100.0 / SUM(COUNT(*)) OVER() as percentage
      FROM ai_analyses ai
      JOIN responses r ON ai.response_id = r.id
      JOIN questionnaires q ON r.questionnaire_id = q.id
      ${whereClause}
      GROUP BY q.type
      ORDER BY count DESC
    `;

    const questionnaireTypeStats = await query(questionnaireTypeStatsQuery, queryParams);

    // Get daily analysis trends (last 30 days)
    const trendsQuery = `
      SELECT 
        DATE(ai.created_at) as analysis_date,
        COUNT(*) as count
      FROM ai_analyses ai
      JOIN responses r ON ai.response_id = r.id
      JOIN questionnaires q ON r.questionnaire_id = q.id
      ${whereClause}
      AND ai.created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(ai.created_at)
      ORDER BY analysis_date DESC
      LIMIT 30
    `;

    const trends = await query(trendsQuery, queryParams);

    // Get risk assessment distribution
    const riskDistributionQuery = `
      SELECT 
        CASE 
          WHEN ai.risk_assessment ILIKE '%critical%' THEN 'Critical'
          WHEN ai.risk_assessment ILIKE '%high%' THEN 'High'
          WHEN ai.risk_assessment ILIKE '%medium%' OR ai.risk_assessment ILIKE '%moderate%' THEN 'Medium'
          WHEN ai.risk_assessment ILIKE '%low%' THEN 'Low'
          ELSE 'Unknown'
        END as risk_level,
        COUNT(*) as count,
        COUNT(*) * 100.0 / SUM(COUNT(*)) OVER() as percentage
      FROM ai_analyses ai
      JOIN responses r ON ai.response_id = r.id
      JOIN questionnaires q ON r.questionnaire_id = q.id
      ${whereClause}
      AND ai.risk_assessment IS NOT NULL
      GROUP BY risk_level
      ORDER BY 
        CASE risk_level
          WHEN 'Critical' THEN 1
          WHEN 'High' THEN 2
          WHEN 'Medium' THEN 3
          WHEN 'Low' THEN 4
          ELSE 5
        END
    `;

    const riskDistribution = await query(riskDistributionQuery, queryParams);

    // Get top questionnaires by analysis count
    const topQuestionnairesQuery = `
      SELECT 
        q.id,
        q.title,
        q.type,
        COUNT(*) as analysis_count,
        COUNT(DISTINCT ai.response_id) as unique_responses
      FROM ai_analyses ai
      JOIN responses r ON ai.response_id = r.id
      JOIN questionnaires q ON r.questionnaire_id = q.id
      ${whereClause}
      GROUP BY q.id, q.title, q.type
      ORDER BY analysis_count DESC
      LIMIT 10
    `;

    const topQuestionnaires = await query(topQuestionnairesQuery, queryParams);

    // Get recent analyses for activity feed
    const recentAnalysesQuery = `
      SELECT 
        ai.id,
        ai.created_at,
        ai.model_used,
        q.title as questionnaire_title,
        q.type as questionnaire_type,
        CASE 
          WHEN ai.risk_assessment ILIKE '%critical%' THEN 'Critical'
          WHEN ai.risk_assessment ILIKE '%high%' THEN 'High'
          WHEN ai.risk_assessment ILIKE '%medium%' OR ai.risk_assessment ILIKE '%moderate%' THEN 'Medium'
          WHEN ai.risk_assessment ILIKE '%low%' THEN 'Low'
          ELSE 'Unknown'
        END as risk_level
      FROM ai_analyses ai
      JOIN responses r ON ai.response_id = r.id
      JOIN questionnaires q ON r.questionnaire_id = q.id
      ${whereClause}
      ORDER BY ai.created_at DESC
      LIMIT 10
    `;

    const recentAnalyses = await query(recentAnalysesQuery, queryParams);

    // Compile response
    const stats = {
      overview: {
        totalAnalyses: parseInt(overallStats.rows[0]?.total_analyses || '0'),
        uniqueResponses: parseInt(overallStats.rows[0]?.unique_responses || '0'),
        uniqueUsers: parseInt(overallStats.rows[0]?.unique_users || '0'),
        uniqueQuestionnaires: parseInt(overallStats.rows[0]?.unique_questionnaires || '0'),
        highRiskPercentage: parseFloat(overallStats.rows[0]?.high_risk_percentage || '0')
      },
      modelUsage: modelStats.rows.map(row => ({
        model: row.model_used,
        count: parseInt(row.count),
        percentage: parseFloat(row.percentage).toFixed(1)
      })),
      questionnaireTypes: questionnaireTypeStats.rows.map(row => ({
        type: row.type,
        count: parseInt(row.count),
        percentage: parseFloat(row.percentage).toFixed(1)
      })),
      dailyTrends: trends.rows.map(row => ({
        date: row.analysis_date,
        count: parseInt(row.count)
      })),
      riskDistribution: riskDistribution.rows.map(row => ({
        riskLevel: row.risk_level,
        count: parseInt(row.count),
        percentage: parseFloat(row.percentage).toFixed(1)
      })),
      topQuestionnaires: topQuestionnaires.rows.map(row => ({
        id: row.id,
        title: row.title,
        type: row.type,
        analysisCount: parseInt(row.analysis_count),
        uniqueResponses: parseInt(row.unique_responses)
      })),
      recentActivity: recentAnalyses.rows.map(row => ({
        id: row.id,
        createdAt: row.created_at,
        modelUsed: row.model_used,
        questionnaireTitle: row.questionnaire_title,
        questionnaireType: row.questionnaire_type,
        riskLevel: row.risk_level
      }))
    };

    return successResponse(stats, 'AI analysis statistics retrieved successfully');

  } catch (error) {
    console.error('AI Analysis Statistics Error:', error);
    return handleApiError(error);
  }
}
