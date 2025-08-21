import { NextRequest, NextResponse } from 'next/server';
import { MockQuestionnaireService, mockQuestions } from '@/lib/mock-questionnaire-data';
import { successResponse, errorResponse, ValidationError } from '@/lib/api-utils';
import { CreateQuestionData, Question, QuestionType } from '@/types/database';

// POST /api/questionnaires/[id]/questions/bulk - Bulk operations on questions
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

    const body: {
      operation: 'create' | 'update' | 'delete' | 'reorder' | 'import';
      questions?: CreateQuestionData[];
      updates?: { id: number; data: Partial<CreateQuestionData> }[];
      deleteIds?: number[];
      reorderData?: { id: number; order_num: number; section_id?: number }[];
      importData?: {
        format: 'csv' | 'json';
        data: any[];
        mapping?: Record<string, string>;
      };
    } = await request.json();

    if (!body.operation) {
      throw new ValidationError('Operation type is required');
    }

    let result: any = {};

    switch (body.operation) {
      case 'create':
        result = await handleBulkCreate(id, body.questions || []);
        break;
      
      case 'update':
        result = await handleBulkUpdate(id, body.updates || []);
        break;
      
      case 'delete':
        result = await handleBulkDelete(id, body.deleteIds || []);
        break;
      
      case 'reorder':
        result = await handleBulkReorder(id, body.reorderData || []);
        break;
      
      case 'import':
        result = await handleBulkImport(id, body.importData);
        break;
      
      default:
        throw new ValidationError(`Unsupported operation: ${body.operation}`);
    }

    return successResponse(result, `Bulk ${body.operation} completed successfully`);

  } catch (error) {
    console.error('Error in bulk operation:', error);
    if (error instanceof ValidationError) {
      return errorResponse(error.message, 400);
    }
    return errorResponse('Failed to perform bulk operation', 500);
  }
}

// Handle bulk create
async function handleBulkCreate(questionnaireId: number, questionsData: CreateQuestionData[]) {
  const validTypes: QuestionType[] = [
    'text', 'textarea', 'rich_text', 'multiple_choice', 'single_choice', 'dropdown',
    'rating', 'likert', 'star_rating', 'nps', 'semantic_differential',
    'boolean', 'slider', 'number', 'decimal', 'date', 'time', 'datetime',
    'file_upload', 'image_upload', 'country', 'state', 'city'
  ];

  const createdQuestions: Question[] = [];
  const existingQuestions = MockQuestionnaireService.getQuestionsByQuestionnaireId(questionnaireId);
  let maxOrder = existingQuestions.length > 0 ? Math.max(...existingQuestions.map(q => q.order_num)) : 0;

  for (const questionData of questionsData) {
    // Validate required fields
    if (!questionData.text) {
      throw new ValidationError('Question text is required for all questions');
    }

    if (!validTypes.includes(questionData.type)) {
      throw new ValidationError(`Invalid question type: ${questionData.type}`);
    }

    const newQuestionId = Math.max(...mockQuestions.map(q => q.id), 0) + createdQuestions.length + 1;
    const now = new Date().toISOString();

    const newQuestion: Question = {
      id: newQuestionId,
      questionnaire_id: questionnaireId,
      section_id: questionData.section_id || undefined,
      text: questionData.text,
      type: questionData.type,
      required: questionData.required !== undefined ? questionData.required : true,
      order_num: questionData.order_num !== undefined ? questionData.order_num : ++maxOrder,
      options: questionData.options || undefined,
      validation_rules: questionData.validation_rules || undefined,
      conditional_logic: questionData.conditional_logic || undefined,
      metadata: questionData.metadata || undefined,
      help_text: questionData.help_text || undefined,
      placeholder_text: questionData.placeholder_text || undefined,
      error_message: questionData.error_message || undefined,
      is_template: questionData.is_template || false,
      template_category: questionData.template_category || undefined,
      created_at: now,
      updated_at: now
    };

    mockQuestions.push(newQuestion);
    createdQuestions.push(newQuestion);
  }

  return {
    created_questions: createdQuestions,
    count: createdQuestions.length
  };
}

// Handle bulk update
async function handleBulkUpdate(questionnaireId: number, updates: { id: number; data: Partial<CreateQuestionData> }[]) {
  const updatedQuestions: Question[] = [];

  for (const update of updates) {
    const questionIndex = mockQuestions.findIndex(q => q.id === update.id && q.questionnaire_id === questionnaireId);
    
    if (questionIndex >= 0) {
      const existingQuestion = mockQuestions[questionIndex];
      const updatedQuestion: Question = {
        ...existingQuestion,
        ...update.data,
        id: existingQuestion.id, // Ensure ID doesn't change
        questionnaire_id: existingQuestion.questionnaire_id, // Ensure questionnaire_id doesn't change
        updated_at: new Date().toISOString()
      };

      mockQuestions[questionIndex] = updatedQuestion;
      updatedQuestions.push(updatedQuestion);
    }
  }

  return {
    updated_questions: updatedQuestions,
    count: updatedQuestions.length
  };
}

// Handle bulk delete
async function handleBulkDelete(questionnaireId: number, deleteIds: number[]) {
  const deletedQuestions: Question[] = [];

  for (const questionId of deleteIds) {
    const questionIndex = mockQuestions.findIndex(q => q.id === questionId && q.questionnaire_id === questionnaireId);
    
    if (questionIndex >= 0) {
      const deletedQuestion = mockQuestions[questionIndex];
      mockQuestions.splice(questionIndex, 1);
      deletedQuestions.push(deletedQuestion);
    }
  }

  return {
    deleted_questions: deletedQuestions,
    count: deletedQuestions.length
  };
}

// Handle bulk reorder
async function handleBulkReorder(questionnaireId: number, reorderData: { id: number; order_num: number; section_id?: number }[]) {
  const reorderedQuestions: Question[] = [];

  for (const reorder of reorderData) {
    const questionIndex = mockQuestions.findIndex(q => q.id === reorder.id && q.questionnaire_id === questionnaireId);
    
    if (questionIndex >= 0) {
      const existingQuestion = mockQuestions[questionIndex];
      const updatedQuestion: Question = {
        ...existingQuestion,
        order_num: reorder.order_num,
        section_id: reorder.section_id !== undefined ? reorder.section_id : existingQuestion.section_id,
        updated_at: new Date().toISOString()
      };

      mockQuestions[questionIndex] = updatedQuestion;
      reorderedQuestions.push(updatedQuestion);
    }
  }

  return {
    reordered_questions: reorderedQuestions,
    count: reorderedQuestions.length
  };
}

// Handle bulk import
async function handleBulkImport(questionnaireId: number, importData: any) {
  if (!importData) {
    throw new ValidationError('Import data is required');
  }

  const { format, data, mapping } = importData;

  if (format === 'csv') {
    return handleCSVImport(questionnaireId, data, mapping);
  } else if (format === 'json') {
    return handleJSONImport(questionnaireId, data);
  } else {
    throw new ValidationError('Unsupported import format. Use "csv" or "json"');
  }
}

// Handle CSV import
async function handleCSVImport(questionnaireId: number, csvData: any[], mapping?: Record<string, string>) {
  const defaultMapping = {
    text: 'question_text',
    type: 'question_type',
    required: 'required',
    options: 'options',
    help_text: 'help_text'
  };

  const fieldMapping = { ...defaultMapping, ...mapping };
  const questionsData: CreateQuestionData[] = [];

  for (const row of csvData) {
    const questionData: CreateQuestionData = {
      text: row[fieldMapping.text] || '',
      type: (row[fieldMapping.type] || 'text') as QuestionType,
      required: row[fieldMapping.required] === 'true' || row[fieldMapping.required] === true,
      options: row[fieldMapping.options] ? row[fieldMapping.options].split(',').map((s: string) => s.trim()) : undefined,
      help_text: row[fieldMapping.help_text] || undefined
    };

    if (questionData.text) {
      questionsData.push(questionData);
    }
  }

  return handleBulkCreate(questionnaireId, questionsData);
}

// Handle JSON import
async function handleJSONImport(questionnaireId: number, jsonData: any[]) {
  const questionsData: CreateQuestionData[] = jsonData.map(item => ({
    text: item.text || '',
    type: item.type || 'text',
    required: item.required !== undefined ? item.required : true,
    options: item.options,
    validation_rules: item.validation_rules,
    conditional_logic: item.conditional_logic,
    metadata: item.metadata,
    help_text: item.help_text,
    placeholder_text: item.placeholder_text,
    error_message: item.error_message
  }));

  return handleBulkCreate(questionnaireId, questionsData);
}
