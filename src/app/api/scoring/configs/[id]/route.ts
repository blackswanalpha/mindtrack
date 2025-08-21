/**
 * Individual Scoring Configuration API Routes
 * Handles operations for specific scoring configurations
 */

import { NextRequest } from 'next/server';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-utils';
import { scoringService, UpdateScoringConfigData } from '@/lib/scoring/scoring-service';
import { scoringEngine } from '@/lib/scoring/scoring-engine';

// GET /api/scoring/configs/[id] - Get scoring configuration by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const configuration = await scoringService.getConfiguration(params.id);
    
    if (!configuration) {
      return errorResponse('Scoring configuration not found', 404);
    }

    return successResponse(configuration);

  } catch (error) {
    console.error('Error fetching scoring configuration:', error);
    return handleApiError(error);
  }
}

// PUT /api/scoring/configs/[id] - Update scoring configuration
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body: Partial<UpdateScoringConfigData> = await request.json();
    
    // Ensure ID matches
    body.id = params.id;

    // Get existing configuration
    const existing = await scoringService.getConfiguration(params.id);
    if (!existing) {
      return errorResponse('Scoring configuration not found', 404);
    }

    // Validate if provided
    if (body.max_score !== undefined && body.min_score !== undefined && body.max_score <= body.min_score) {
      return errorResponse('Maximum score must be greater than minimum score', 400);
    }

    if (body.scoring_method === 'custom' && !body.formula && !existing.formula) {
      return errorResponse('Formula is required for custom scoring method', 400);
    }

    if (body.scoring_method === 'weighted' && !body.weights && !existing.weights) {
      return errorResponse('Weights are required for weighted scoring method', 400);
    }

    // Update configuration
    const updatedConfiguration = await scoringService.updateConfiguration(body);

    // Update in scoring engine
    scoringEngine.addConfiguration(updatedConfiguration);

    return successResponse(updatedConfiguration, 'Scoring configuration updated successfully');

  } catch (error) {
    console.error('Error updating scoring configuration:', error);
    return handleApiError(error);
  }
}

// DELETE /api/scoring/configs/[id] - Delete scoring configuration
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const configuration = await scoringService.getConfiguration(params.id);
    
    if (!configuration) {
      return errorResponse('Scoring configuration not found', 404);
    }

    // Check if it's the default configuration
    if (configuration.is_default) {
      return errorResponse('Cannot delete default scoring configuration. Set another configuration as default first.', 400);
    }

    const deleted = await scoringService.deleteConfiguration(params.id);
    
    if (!deleted) {
      return errorResponse('Failed to delete scoring configuration', 500);
    }

    return successResponse(null, 'Scoring configuration deleted successfully');

  } catch (error) {
    console.error('Error deleting scoring configuration:', error);
    return handleApiError(error);
  }
}
