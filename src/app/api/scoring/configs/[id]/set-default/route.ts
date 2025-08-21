/**
 * Set Default Scoring Configuration API Route
 */

import { NextRequest } from 'next/server';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-utils';
import { scoringService } from '@/lib/scoring/scoring-service';
import { scoringEngine } from '@/lib/scoring/scoring-engine';

// POST /api/scoring/configs/[id]/set-default - Set configuration as default
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const configuration = await scoringService.getConfiguration(params.id);
    
    if (!configuration) {
      return errorResponse('Scoring configuration not found', 404);
    }

    if (!configuration.is_active) {
      return errorResponse('Cannot set inactive configuration as default', 400);
    }

    // Set as default
    const updatedConfiguration = await scoringService.setDefaultConfiguration(params.id);

    // Update in scoring engine
    scoringEngine.addConfiguration(updatedConfiguration);

    return successResponse(
      updatedConfiguration,
      `Scoring configuration "${updatedConfiguration.name}" set as default`
    );

  } catch (error) {
    console.error('Error setting default scoring configuration:', error);
    return handleApiError(error);
  }
}
