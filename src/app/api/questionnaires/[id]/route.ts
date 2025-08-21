import { NextRequest, NextResponse } from 'next/server';
import { MockQuestionnaireService, mockQuestionnaires, mockQuestionnaireVersions } from '@/lib/mock-questionnaire-data';
import { successResponse, errorResponse, ValidationError } from '@/lib/api-utils';
import { CreateQuestionnaireData, Questionnaire, QuestionnaireType } from '@/types/database';

// GET /api/questionnaires/[id] - Get questionnaire by ID
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

    // Get questions for this questionnaire
    const questions = MockQuestionnaireService.getQuestionsByQuestionnaireId(id);
    
    // Get version history
    const versions = MockQuestionnaireService.getQuestionnaireVersions(id);

    const response = {
      ...questionnaire,
      questions,
      versions
    };

    return successResponse(response);

  } catch (error) {
    console.error('Error fetching questionnaire:', error);
    return errorResponse('Failed to fetch questionnaire', 500);
  }
}

// PUT /api/questionnaires/[id] - Update questionnaire
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return errorResponse('Invalid questionnaire ID', 400);
    }

    const body: Partial<CreateQuestionnaireData> = await request.json();
    
    const existingIndex = mockQuestionnaires.findIndex(q => q.id === id);
    
    if (existingIndex === -1) {
      return errorResponse('Questionnaire not found', 404);
    }

    const existing = mockQuestionnaires[existingIndex];

    // Validate questionnaire type if provided
    if (body.type) {
      const validTypes: QuestionnaireType[] = [
        'standard', 'assessment', 'screening', 'feedback', 
        'survey', 'clinical', 'research', 'educational'
      ];
      
      if (!validTypes.includes(body.type)) {
        throw new ValidationError(`Invalid questionnaire type. Must be one of: ${validTypes.join(', ')}`);
      }
    }

    // Create new version if significant changes
    const shouldCreateVersion = body.title !== existing.title || 
                               body.description !== existing.description ||
                               body.type !== existing.type;

    let newVersion = existing.version;
    if (shouldCreateVersion) {
      newVersion = existing.version + 1;
      
      // Create version record
      const versionRecord = {
        id: Math.max(...mockQuestionnaireVersions.map(v => v.id), 0) + 1,
        questionnaire_id: id,
        version_number: newVersion,
        title: body.title || existing.title,
        description: body.description || existing.description,
        type: body.type || existing.type,
        category: body.category || existing.category,
        estimated_time: body.estimated_time || existing.estimated_time,
        is_active: body.is_active !== undefined ? body.is_active : existing.is_active,
        is_adaptive: body.is_adaptive !== undefined ? body.is_adaptive : existing.is_adaptive,
        is_qr_enabled: body.is_qr_enabled !== undefined ? body.is_qr_enabled : existing.is_qr_enabled,
        is_template: body.is_template !== undefined ? body.is_template : existing.is_template,
        is_public: body.is_public !== undefined ? body.is_public : existing.is_public,
        allow_anonymous: body.allow_anonymous !== undefined ? body.allow_anonymous : existing.allow_anonymous,
        requires_auth: body.requires_auth !== undefined ? body.requires_auth : existing.requires_auth,
        max_responses: body.max_responses || existing.max_responses,
        expires_at: body.expires_at || existing.expires_at,
        tags: existing.tags || [],
        questions_snapshot: null,
        change_summary: 'Updated questionnaire details',
        created_by_id: 1, // Mock user ID
        created_at: new Date().toISOString()
      };
      
      mockQuestionnaireVersions.push(versionRecord);
    }

    // Update questionnaire
    const updatedQuestionnaire: Questionnaire = {
      ...existing,
      title: body.title || existing.title,
      description: body.description !== undefined ? body.description : existing.description,
      type: body.type || existing.type,
      category: body.category !== undefined ? body.category : existing.category,
      estimated_time: body.estimated_time !== undefined ? body.estimated_time : existing.estimated_time,
      is_active: body.is_active !== undefined ? body.is_active : existing.is_active,
      is_adaptive: body.is_adaptive !== undefined ? body.is_adaptive : existing.is_adaptive,
      is_qr_enabled: body.is_qr_enabled !== undefined ? body.is_qr_enabled : existing.is_qr_enabled,
      is_template: body.is_template !== undefined ? body.is_template : existing.is_template,
      is_public: body.is_public !== undefined ? body.is_public : existing.is_public,
      allow_anonymous: body.allow_anonymous !== undefined ? body.allow_anonymous : existing.allow_anonymous,
      requires_auth: body.requires_auth !== undefined ? body.requires_auth : existing.requires_auth,
      max_responses: body.max_responses !== undefined ? body.max_responses : existing.max_responses,
      expires_at: body.expires_at !== undefined ? body.expires_at : existing.expires_at,
      organization_id: body.organization_id !== undefined ? body.organization_id : existing.organization_id,
      version: newVersion,
      updated_at: new Date().toISOString()
    };

    mockQuestionnaires[existingIndex] = updatedQuestionnaire;

    return successResponse(updatedQuestionnaire, 'Questionnaire updated successfully');

  } catch (error) {
    console.error('Error updating questionnaire:', error);
    if (error instanceof ValidationError) {
      return errorResponse(error.message, 400);
    }
    return errorResponse('Failed to update questionnaire', 500);
  }
}

// DELETE /api/questionnaires/[id] - Delete questionnaire
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return errorResponse('Invalid questionnaire ID', 400);
    }

    const existingIndex = mockQuestionnaires.findIndex(q => q.id === id);
    
    if (existingIndex === -1) {
      return errorResponse('Questionnaire not found', 404);
    }

    // Remove questionnaire from mock data
    mockQuestionnaires.splice(existingIndex, 1);

    // Also remove associated versions
    const versionIndices = mockQuestionnaireVersions
      .map((v, index) => v.questionnaire_id === id ? index : -1)
      .filter(index => index !== -1)
      .reverse(); // Remove from end to avoid index shifting

    versionIndices.forEach(index => {
      mockQuestionnaireVersions.splice(index, 1);
    });

    return successResponse(null, 'Questionnaire deleted successfully');

  } catch (error) {
    console.error('Error deleting questionnaire:', error);
    return errorResponse('Failed to delete questionnaire', 500);
  }
}
