import { NextRequest, NextResponse } from 'next/server';
import { MockQuestionnaireService, mockQuestionnaireVersions } from '@/lib/mock-questionnaire-data';
import { successResponse, errorResponse } from '@/lib/api-utils';

// GET /api/questionnaires/[id]/versions - Get version history for questionnaire
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return errorResponse('Invalid questionnaire ID', 400);
    }

    const questionnaire = MockQuestionnaireService.getQuestionnaireById(id);
    
    if (!questionnaire) {
      return errorResponse('Questionnaire not found', 404);
    }

    const versions = MockQuestionnaireService.getQuestionnaireVersions(id);
    
    // Sort versions by version number (newest first)
    versions.sort((a, b) => b.version_number - a.version_number);

    // Add additional metadata for each version
    const versionsWithMetadata = versions.map(version => ({
      ...version,
      is_current: version.version_number === questionnaire.version,
      created_by_name: 'Mock User', // In real app, would join with users table
      changes_count: Math.floor(Math.random() * 10) + 1 // Mock changes count
    }));

    return successResponse({
      questionnaire_id: id,
      current_version: questionnaire.version,
      versions: versionsWithMetadata,
      total_versions: versions.length
    });

  } catch (error) {
    console.error('Error fetching questionnaire versions:', error);
    return errorResponse('Failed to fetch questionnaire versions', 500);
  }
}
