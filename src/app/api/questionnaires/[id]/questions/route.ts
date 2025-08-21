import { NextRequest, NextResponse } from 'next/server';
import { MockQuestionnaireService, mockQuestions } from '@/lib/mock-questionnaire-data';
import { successResponse, errorResponse, ValidationError } from '@/lib/api-utils';
import { CreateQuestionData, Question, QuestionType } from '@/types/database';
import { QuestionValidationEngine } from '@/lib/question-validation-engine';

// GET /api/questionnaires/[id]/questions - Get questions for questionnaire
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

    const questions = MockQuestionnaireService.getQuestionsByQuestionnaireId(id);
    
    // Sort questions by order_num
    questions.sort((a, b) => a.order_num - b.order_num);

    return successResponse({
      questionnaire_id: id,
      questions,
      total_questions: questions.length
    });

  } catch (error) {
    console.error('Error fetching questions:', error);
    return errorResponse('Failed to fetch questions', 500);
  }
}

// POST /api/questionnaires/[id]/questions - Add question to questionnaire
export async function POST(
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

    const body: CreateQuestionData = await request.json();

    // Validate required fields
    if (!body.text) {
      throw new ValidationError('Question text is required');
    }

    // Validate question type
    const validTypes: QuestionType[] = [
      'text', 'textarea', 'rich_text', 'multiple_choice', 'single_choice', 'dropdown',
      'rating', 'likert', 'star_rating', 'nps', 'semantic_differential',
      'boolean', 'slider', 'number', 'decimal', 'date', 'time', 'datetime',
      'file_upload', 'image_upload', 'country', 'state', 'city'
    ];
    if (!validTypes.includes(body.type)) {
      throw new ValidationError(`Invalid question type. Must be one of: ${validTypes.join(', ')}`);
    }

    // Get existing questions to determine order
    const existingQuestions = MockQuestionnaireService.getQuestionsByQuestionnaireId(id);
    const maxOrder = existingQuestions.length > 0 ? Math.max(...existingQuestions.map(q => q.order_num)) : 0;

    // Create new question
    const newQuestionId = Math.max(...mockQuestions.map(q => q.id), 0) + 1;
    const now = new Date().toISOString();

    const newQuestion: Question = {
      id: newQuestionId,
      questionnaire_id: id,
      section_id: body.section_id || undefined,
      text: body.text,
      type: body.type,
      required: body.required !== undefined ? body.required : true,
      order_num: body.order_num !== undefined ? body.order_num : maxOrder + 1,
      options: body.options || undefined,
      validation_rules: body.validation_rules || undefined,
      conditional_logic: body.conditional_logic || undefined,
      metadata: body.metadata || undefined,
      help_text: body.help_text || undefined,
      placeholder_text: body.placeholder_text || undefined,
      error_message: body.error_message || undefined,
      is_template: body.is_template || false,
      template_category: body.template_category || undefined,
      created_at: now,
      updated_at: now
    };

    mockQuestions.push(newQuestion);

    return successResponse(newQuestion, 'Question added successfully', 201);

  } catch (error) {
    console.error('Error adding question:', error);
    if (error instanceof ValidationError) {
      return errorResponse(error.message, 400);
    }
    return errorResponse('Failed to add question', 500);
  }
}
