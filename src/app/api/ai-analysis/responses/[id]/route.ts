/**
 * AI Analysis API Routes for Responses
 * Handles AI analysis generation and retrieval for specific responses
 */

import { NextRequest } from 'next/server';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-utils';
import { aiAnalysisService } from '@/lib/ai-analysis-service';
import { query } from '@/lib/db';

// POST /api/ai-analysis/responses/[id] - Generate AI analysis for response
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const responseId = parseInt(params.id);
    
    if (isNaN(responseId)) {
      return errorResponse('Invalid response ID', 400);
    }

    // Parse request body
    const body = await request.json();
    const { 
      prompt: customPrompt, 
      analysisType = 'comprehensive',
      model = 'gemini-pro' 
    } = body;

    // Check if response exists and get response data
    const responseQuery = `
      SELECT r.*, q.title, q.description, q.type, q.organization_id
      FROM responses r
      JOIN questionnaires q ON r.questionnaire_id = q.id
      WHERE r.id = $1
    `;
    
    const responseResult = await query(responseQuery, [responseId]);
    
    if (responseResult.rows.length === 0) {
      return errorResponse('Response not found', 404);
    }

    const responseData = responseResult.rows[0];

    // Get response answers
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
    
    if (existingAnalysis && !customPrompt) {
      return successResponse({
        analysis: existingAnalysis,
        isNew: false
      }, 'Existing analysis retrieved');
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
      customPrompt,
      analysisType
    };

    // Generate AI analysis
    const analysisResult = await aiAnalysisService.generateAnalysis(analysisRequest);

    // Build prompt for storage
    const promptUsed = customPrompt || `Comprehensive analysis of ${responseData.title} response`;

    // Store analysis in database
    const storedAnalysis = await aiAnalysisService.storeAnalysis(
      responseId,
      promptUsed,
      analysisResult,
      model
    );

    return successResponse({
      analysis: storedAnalysis,
      isNew: true
    }, 'AI analysis generated successfully');

  } catch (error) {
    console.error('AI Analysis Generation Error:', error);
    return handleApiError(error);
  }
}

// GET /api/ai-analysis/responses/[id] - Get existing AI analysis for response
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const responseId = parseInt(params.id);
    
    if (isNaN(responseId)) {
      return errorResponse('Invalid response ID', 400);
    }

    // Check if response exists
    const responseQuery = `
      SELECT id FROM responses WHERE id = $1
    `;
    
    const responseResult = await query(responseQuery, [responseId]);
    
    if (responseResult.rows.length === 0) {
      return errorResponse('Response not found', 404);
    }

    // Get AI analysis
    const analysis = await aiAnalysisService.getAnalysis(responseId);

    if (!analysis) {
      return errorResponse('No AI analysis found for this response', 404);
    }

    return successResponse({
      analysis
    }, 'AI analysis retrieved successfully');

  } catch (error) {
    console.error('AI Analysis Retrieval Error:', error);
    return handleApiError(error);
  }
}

// DELETE /api/ai-analysis/responses/[id] - Delete AI analysis for response
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const responseId = parseInt(params.id);
    
    if (isNaN(responseId)) {
      return errorResponse('Invalid response ID', 400);
    }

    // Delete AI analysis
    const deleteQuery = `
      DELETE FROM ai_analyses 
      WHERE response_id = $1
      RETURNING id
    `;
    
    const result = await query(deleteQuery, [responseId]);

    if (result.rows.length === 0) {
      return errorResponse('No AI analysis found to delete', 404);
    }

    return successResponse({
      deletedCount: result.rows.length
    }, 'AI analysis deleted successfully');

  } catch (error) {
    console.error('AI Analysis Deletion Error:', error);
    return handleApiError(error);
  }
}
