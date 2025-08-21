/**
 * Scoring Configurations API Routes
 * Handles CRUD operations for scoring configurations
 */

import { NextRequest } from 'next/server';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-utils';
import { scoringService, CreateScoringConfigData } from '@/lib/scoring/scoring-service';
import { scoringEngine } from '@/lib/scoring/scoring-engine';

// GET /api/scoring/configs - List scoring configurations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const questionnaireId = searchParams.get('questionnaire_id');
    const activeOnly = searchParams.get('active_only') === 'true';

    if (questionnaireId) {
      const configs = await scoringService.getConfigurationsByQuestionnaire(parseInt(questionnaireId));
      const filteredConfigs = activeOnly ? configs.filter(config => config.is_active) : configs;
      
      return successResponse({
        configurations: filteredConfigs,
        total: filteredConfigs.length
      });
    }

    // If no questionnaire_id provided, return error for now
    // In a real implementation, you might want to return all configs with pagination
    return errorResponse('questionnaire_id parameter is required', 400);

  } catch (error) {
    console.error('Error fetching scoring configurations:', error);
    return handleApiError(error);
  }
}

// POST /api/scoring/configs - Create scoring configuration
export async function POST(request: NextRequest) {
  try {
    const body: CreateScoringConfigData = await request.json();

    // Validate required fields
    if (!body.name?.trim()) {
      return errorResponse('Configuration name is required', 400);
    }

    if (!body.questionnaire_id) {
      return errorResponse('Questionnaire ID is required', 400);
    }

    if (!body.scoring_method) {
      return errorResponse('Scoring method is required', 400);
    }

    if (body.max_score <= body.min_score) {
      return errorResponse('Maximum score must be greater than minimum score', 400);
    }

    if (!body.rules || body.rules.length === 0) {
      return errorResponse('At least one scoring rule is required', 400);
    }

    // Validate scoring method specific requirements
    if (body.scoring_method === 'custom' && !body.formula) {
      return errorResponse('Formula is required for custom scoring method', 400);
    }

    if (body.scoring_method === 'weighted' && !body.weights) {
      return errorResponse('Weights are required for weighted scoring method', 400);
    }

    // Create temporary configuration for validation
    const tempConfig = {
      id: 'temp',
      questionnaire_id: body.questionnaire_id,
      name: body.name,
      description: body.description,
      scoring_method: body.scoring_method,
      weights: body.weights,
      formula: body.formula,
      formula_variables: body.formula_variables,
      max_score: body.max_score,
      min_score: body.min_score,
      passing_score: body.passing_score,
      visualization_type: body.visualization_type,
      visualization_config: body.visualization_config,
      is_active: body.is_active ?? true,
      is_default: body.is_default ?? false,
      rules: body.rules.map(rule => ({
        ...rule,
        id: 'temp',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })),
      created_by: 'user', // TODO: Get from auth context
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Validate configuration
    const validationErrors = scoringEngine.validateConfiguration(tempConfig);
    if (validationErrors.length > 0) {
      return errorResponse(`Validation failed: ${validationErrors.join(', ')}`, 400);
    }

    // Create configuration
    const configuration = await scoringService.createConfiguration(body, 'user'); // TODO: Get user from auth

    // Add to scoring engine
    scoringEngine.addConfiguration(configuration);

    return successResponse(configuration, 'Scoring configuration created successfully', 201);

  } catch (error) {
    console.error('Error creating scoring configuration:', error);
    return handleApiError(error);
  }
}
