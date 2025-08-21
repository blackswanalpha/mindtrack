/**
 * AI Analysis History API Routes
 * Handles retrieval of AI analysis history and batch operations
 */

import { NextRequest } from 'next/server';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-utils';
import { aiAnalysisService } from '@/lib/ai-analysis-service';

// GET /api/ai-analysis/history - Get AI analysis history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const userId = searchParams.get('user_id');
    const organizationId = searchParams.get('organization_id');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');
    const questionnaireId = searchParams.get('questionnaire_id');

    // Build filters
    const filters: any = {};
    
    if (userId) {
      const parsedUserId = parseInt(userId);
      if (isNaN(parsedUserId)) {
        return errorResponse('Invalid user_id parameter', 400);
      }
      filters.userId = parsedUserId;
    }

    if (organizationId) {
      const parsedOrgId = parseInt(organizationId);
      if (isNaN(parsedOrgId)) {
        return errorResponse('Invalid organization_id parameter', 400);
      }
      filters.organizationId = parsedOrgId;
    }

    if (limit) {
      const parsedLimit = parseInt(limit);
      if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
        return errorResponse('Invalid limit parameter (1-100)', 400);
      }
      filters.limit = parsedLimit;
    } else {
      filters.limit = 20; // Default limit
    }

    if (offset) {
      const parsedOffset = parseInt(offset);
      if (isNaN(parsedOffset) || parsedOffset < 0) {
        return errorResponse('Invalid offset parameter', 400);
      }
      filters.offset = parsedOffset;
    }

    // Get analysis history
    const history = await aiAnalysisService.getAnalysisHistory(filters);

    // Get total count for pagination
    let totalCount = 0;
    if (history.length > 0) {
      // This is a simplified count - in production, you'd want a separate count query
      totalCount = history.length;
    }

    return successResponse({
      analyses: history,
      pagination: {
        total: totalCount,
        limit: filters.limit,
        offset: filters.offset || 0,
        hasMore: history.length === filters.limit
      }
    }, 'AI analysis history retrieved successfully');

  } catch (error) {
    console.error('AI Analysis History Error:', error);
    return handleApiError(error);
  }
}

// POST /api/ai-analysis/history - Batch analysis operations
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { operation, responseIds, analysisType = 'comprehensive' } = body;

    if (!operation || !Array.isArray(responseIds)) {
      return errorResponse('Invalid request body. Expected operation and responseIds array', 400);
    }

    if (responseIds.length === 0) {
      return errorResponse('No response IDs provided', 400);
    }

    if (responseIds.length > 10) {
      return errorResponse('Maximum 10 responses can be processed in batch', 400);
    }

    switch (operation) {
      case 'batch_analyze':
        return await handleBatchAnalysis(responseIds, analysisType);
      
      case 'batch_delete':
        return await handleBatchDelete(responseIds);
      
      default:
        return errorResponse('Invalid operation. Supported: batch_analyze, batch_delete', 400);
    }

  } catch (error) {
    console.error('Batch AI Analysis Error:', error);
    return handleApiError(error);
  }
}

/**
 * Handle batch analysis of multiple responses
 */
async function handleBatchAnalysis(responseIds: number[], analysisType: string) {
  try {
    const results = [];
    const errors = [];

    for (const responseId of responseIds) {
      try {
        // Check if response exists and get data
        const { query } = await import('@/lib/db');
        
        const responseQuery = `
          SELECT r.*, q.title, q.description, q.type
          FROM responses r
          JOIN questionnaires q ON r.questionnaire_id = q.id
          WHERE r.id = $1
        `;
        
        const responseResult = await query(responseQuery, [responseId]);
        
        if (responseResult.rows.length === 0) {
          errors.push({ responseId, error: 'Response not found' });
          continue;
        }

        const responseData = responseResult.rows[0];

        // Get answers
        const answersQuery = `
          SELECT a.*, q.question_text, q.question_type
          FROM answers a
          JOIN questions q ON a.question_id = q.id
          WHERE a.response_id = $1
          ORDER BY q.order_num
        `;
        
        const answersResult = await query(answersQuery, [responseId]);
        const answers = answersResult.rows;

        // Check if analysis already exists
        const existingAnalysis = await aiAnalysisService.getAnalysis(responseId);
        
        if (existingAnalysis) {
          results.push({
            responseId,
            analysis: existingAnalysis,
            isNew: false,
            status: 'existing'
          });
          continue;
        }

        // Prepare analysis request
        const analysisRequest = {
          responseId,
          questionnaireData: {
            title: responseData.title,
            description: responseData.description,
            type: responseData.type
          },
          responseData: {
            ...responseData,
            answers
          },
          analysisType
        };

        // Generate analysis
        const analysisResult = await aiAnalysisService.generateAnalysis(analysisRequest);

        // Store analysis
        const storedAnalysis = await aiAnalysisService.storeAnalysis(
          responseId,
          `Batch ${analysisType} analysis`,
          analysisResult
        );

        results.push({
          responseId,
          analysis: storedAnalysis,
          isNew: true,
          status: 'generated'
        });

        // Add delay between requests to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`Batch analysis failed for response ${responseId}:`, error);
        errors.push({
          responseId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return successResponse({
      results,
      errors,
      summary: {
        total: responseIds.length,
        successful: results.length,
        failed: errors.length,
        existing: results.filter(r => !r.isNew).length,
        generated: results.filter(r => r.isNew).length
      }
    }, 'Batch analysis completed');

  } catch (error) {
    throw error;
  }
}

/**
 * Handle batch deletion of AI analyses
 */
async function handleBatchDelete(responseIds: number[]) {
  try {
    const { query } = await import('@/lib/db');

    const deleteQuery = `
      DELETE FROM ai_analyses
      WHERE response_id = ANY($1)
      RETURNING response_id
    `;

    const result = await query(deleteQuery, [responseIds]);
    const deletedIds = result.rows.map(row => row.response_id);
    const notFoundIds = responseIds.filter(id => !deletedIds.includes(id));

    return successResponse({
      deletedIds,
      notFoundIds,
      summary: {
        total: responseIds.length,
        deleted: deletedIds.length,
        notFound: notFoundIds.length
      }
    }, 'Batch deletion completed');

  } catch (error) {
    throw error;
  }
}
