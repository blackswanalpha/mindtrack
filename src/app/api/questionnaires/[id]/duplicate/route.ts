import { NextRequest, NextResponse } from 'next/server';
import { MockQuestionnaireService, mockQuestionnaires, mockQuestions } from '@/lib/mock-questionnaire-data';
import { successResponse, errorResponse, ValidationError } from '@/lib/api-utils';
import { Questionnaire, Question } from '@/types/database';

// POST /api/questionnaires/[id]/duplicate - Duplicate questionnaire
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return errorResponse('Invalid questionnaire ID', 400);
    }

    const body = await request.json();
    const { title, copy_questions = true, make_template = false } = body;

    if (!title) {
      throw new ValidationError('New title is required for duplication');
    }

    const original = MockQuestionnaireService.getQuestionnaireById(id);
    
    if (!original) {
      return errorResponse('Original questionnaire not found', 404);
    }

    // Create duplicate questionnaire
    const newId = Math.max(...mockQuestionnaires.map(q => q.id)) + 1;
    const now = new Date().toISOString();
    
    const duplicate: Questionnaire = {
      ...original,
      id: newId,
      title,
      version: 1,
      parent_id: id,
      is_template: make_template,
      created_at: now,
      updated_at: now
    };

    mockQuestionnaires.push(duplicate);

    // Copy questions if requested
    let duplicatedQuestions: Question[] = [];
    if (copy_questions) {
      const originalQuestions = MockQuestionnaireService.getQuestionsByQuestionnaireId(id);
      
      duplicatedQuestions = originalQuestions.map(question => {
        const newQuestionId = Math.max(...mockQuestions.map(q => q.id), 0) + 1 + question.order_num;
        
        const duplicatedQuestion: Question = {
          ...question,
          id: newQuestionId,
          questionnaire_id: newId,
          created_at: now,
          updated_at: now
        };
        
        mockQuestions.push(duplicatedQuestion);
        return duplicatedQuestion;
      });
    }

    const response = {
      questionnaire: duplicate,
      questions: duplicatedQuestions,
      original_id: id
    };

    return successResponse(response, 'Questionnaire duplicated successfully', 201);

  } catch (error) {
    console.error('Error duplicating questionnaire:', error);
    if (error instanceof ValidationError) {
      return errorResponse(error.message, 400);
    }
    return errorResponse('Failed to duplicate questionnaire', 500);
  }
}
