import { NextRequest, NextResponse } from 'next/server';
import { MockQuestionnaireService, mockQuestionnaires, mockQuestionnaireVersions } from '@/lib/mock-questionnaire-data';
import { successResponse, errorResponse } from '@/lib/api-utils';
import { Questionnaire } from '@/types/database';

// POST /api/questionnaires/[id]/versions/[version]/restore - Restore questionnaire to specific version
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; version: string } }
) {
  try {
    const id = parseInt(params.id);
    const versionNumber = parseInt(params.version);
    
    if (isNaN(id) || isNaN(versionNumber)) {
      return errorResponse('Invalid questionnaire ID or version number', 400);
    }

    const currentQuestionnaire = MockQuestionnaireService.getQuestionnaireById(id);
    
    if (!currentQuestionnaire) {
      return errorResponse('Questionnaire not found', 404);
    }

    // Find the version to restore
    const versionToRestore = mockQuestionnaireVersions.find(
      v => v.questionnaire_id === id && v.version_number === versionNumber
    );

    if (!versionToRestore) {
      return errorResponse('Version not found', 404);
    }

    // Cannot restore to current version
    if (versionNumber === currentQuestionnaire.version) {
      return errorResponse('Cannot restore to current version', 400);
    }

    // Create new version record for current state before restoring
    const newVersionNumber = currentQuestionnaire.version + 1;
    const currentVersionRecord = {
      id: Math.max(...mockQuestionnaireVersions.map(v => v.id)) + 1,
      questionnaire_id: id,
      version_number: newVersionNumber,
      title: currentQuestionnaire.title,
      description: currentQuestionnaire.description,
      type: currentQuestionnaire.type,
      category: currentQuestionnaire.category,
      estimated_time: currentQuestionnaire.estimated_time,
      is_active: currentQuestionnaire.is_active,
      is_adaptive: currentQuestionnaire.is_adaptive,
      is_qr_enabled: currentQuestionnaire.is_qr_enabled,
      is_template: currentQuestionnaire.is_template,
      is_public: currentQuestionnaire.is_public,
      allow_anonymous: currentQuestionnaire.allow_anonymous,
      requires_auth: currentQuestionnaire.requires_auth,
      max_responses: currentQuestionnaire.max_responses,
      expires_at: currentQuestionnaire.expires_at,
      tags: currentQuestionnaire.tags || [],
      questions_snapshot: null,
      change_summary: `Restored from version ${versionNumber}`,
      created_by_id: 1, // Mock user ID
      created_at: new Date().toISOString()
    };

    mockQuestionnaireVersions.push(currentVersionRecord);

    // Update questionnaire with restored version data
    const questionnaireIndex = mockQuestionnaires.findIndex(q => q.id === id);
    
    const restoredQuestionnaire: Questionnaire = {
      ...currentQuestionnaire,
      title: versionToRestore.title,
      description: versionToRestore.description,
      type: versionToRestore.type,
      category: versionToRestore.category,
      estimated_time: versionToRestore.estimated_time,
      is_active: versionToRestore.is_active,
      is_adaptive: versionToRestore.is_adaptive,
      is_qr_enabled: versionToRestore.is_qr_enabled,
      is_template: versionToRestore.is_template,
      is_public: versionToRestore.is_public,
      allow_anonymous: versionToRestore.allow_anonymous,
      requires_auth: versionToRestore.requires_auth,
      max_responses: versionToRestore.max_responses,
      expires_at: versionToRestore.expires_at,
      version: newVersionNumber,
      updated_at: new Date().toISOString()
    };

    mockQuestionnaires[questionnaireIndex] = restoredQuestionnaire;

    return successResponse({
      questionnaire: restoredQuestionnaire,
      restored_from_version: versionNumber,
      new_version: newVersionNumber,
      message: `Successfully restored questionnaire to version ${versionNumber}`
    }, 'Questionnaire restored successfully');

  } catch (error) {
    console.error('Error restoring questionnaire version:', error);
    return errorResponse('Failed to restore questionnaire version', 500);
  }
}
