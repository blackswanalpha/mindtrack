/**
 * Score Calculation API Route
 * Calculates scores for responses using specific scoring configurations
 */

import { NextRequest } from 'next/server';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-utils';
import { scoringService } from '@/lib/scoring/scoring-service';
import { scoringEngine } from '@/lib/scoring/scoring-engine';
import { MockQuestionnaireService } from '@/lib/mock-questionnaire-data';

// POST /api/scoring/configs/[id]/calculate - Calculate score for a response
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { response_id } = body;

    if (!response_id) {
      return errorResponse('response_id is required', 400);
    }

    // Get scoring configuration
    const configuration = await scoringService.getConfiguration(params.id);
    if (!configuration) {
      return errorResponse('Scoring configuration not found', 404);
    }

    // Get response data (using mock service for now)
    const response = MockQuestionnaireService.getResponseById(response_id);
    if (!response) {
      return errorResponse('Response not found', 404);
    }

    // Get answers for the response
    const answers = MockQuestionnaireService.getAnswersByResponseId(response_id);
    
    // Get questions for the questionnaire
    const questions = MockQuestionnaireService.getQuestionsByQuestionnaireId(response.questionnaire_id);

    // Ensure configuration matches questionnaire
    if (configuration.questionnaire_id !== response.questionnaire_id) {
      return errorResponse('Scoring configuration does not match response questionnaire', 400);
    }

    // Calculate score
    const scoreResult = scoringEngine.calculateScore(response, answers, questions, params.id);

    // Store the calculated score
    await scoringService.storeScore(scoreResult);

    return successResponse({
      ...scoreResult,
      questionnaire_id: response.questionnaire_id,
      questionnaire_title: MockQuestionnaireService.getQuestionnaireById(response.questionnaire_id)?.title || 'Unknown'
    }, 'Score calculated successfully');

  } catch (error) {
    console.error('Error calculating score:', error);
    return handleApiError(error);
  }
}

// GET /api/scoring/configs/[id]/calculate?response_id=123 - Get calculated score
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const responseId = searchParams.get('response_id');

    if (!responseId) {
      return errorResponse('response_id parameter is required', 400);
    }

    // Get stored score
    const scoreResult = await scoringService.getScore(parseInt(responseId), params.id);
    
    if (!scoreResult) {
      return errorResponse('Score not found. Calculate score first.', 404);
    }

    // Get additional context
    const response = MockQuestionnaireService.getResponseById(parseInt(responseId));
    const questionnaire = response ? MockQuestionnaireService.getQuestionnaireById(response.questionnaire_id) : null;

    return successResponse({
      ...scoreResult,
      questionnaire_id: response?.questionnaire_id,
      questionnaire_title: questionnaire?.title || 'Unknown'
    });

  } catch (error) {
    console.error('Error fetching calculated score:', error);
    return handleApiError(error);
  }
}
