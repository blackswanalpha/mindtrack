import { NextRequest, NextResponse } from 'next/server';
import { MockQuestionnaireService, mockQuestionnaires } from '@/lib/mock-questionnaire-data';
import { successResponse, errorResponse, ValidationError } from '@/lib/api-utils';
import { CreateQuestionnaireData, Questionnaire, QuestionnaireType } from '@/types/database';

// GET /api/questionnaires - List questionnaires with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const filters = {
      is_active: searchParams.get('is_active') === 'true' ? true :
                 searchParams.get('is_active') === 'false' ? false : undefined,
      is_public: searchParams.get('is_public') === 'true' ? true :
                 searchParams.get('is_public') === 'false' ? false : undefined,
      is_template: searchParams.get('is_template') === 'true' ? true :
                   searchParams.get('is_template') === 'false' ? false : undefined,
      type: searchParams.get('type') as QuestionnaireType || undefined,
      category: searchParams.get('category') || undefined,
      search: searchParams.get('search') || undefined
    };

    // Remove undefined values
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== undefined)
    );

    const questionnaires = MockQuestionnaireService.getAllQuestionnaires(cleanFilters);

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;
    const paginatedQuestionnaires = questionnaires.slice(offset, offset + limit);

    return successResponse({
      questionnaires: paginatedQuestionnaires,
      pagination: {
        page,
        limit,
        total: questionnaires.length,
        pages: Math.ceil(questionnaires.length / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching questionnaires:', error);
    return errorResponse('Failed to fetch questionnaires', 500);
  }
}

// POST /api/questionnaires - Create new questionnaire
export async function POST(request: NextRequest) {
  try {
    const body: CreateQuestionnaireData = await request.json();

    // Validate required fields
    if (!body.title) {
      throw new ValidationError('Title is required');
    }

    // Validate questionnaire type
    const validTypes: QuestionnaireType[] = [
      'standard', 'assessment', 'screening', 'feedback',
      'survey', 'clinical', 'research', 'educational'
    ];

    if (body.type && !validTypes.includes(body.type)) {
      throw new ValidationError(`Invalid questionnaire type. Must be one of: ${validTypes.join(', ')}`);
    }

    // Create new questionnaire with mock data
    const newId = Math.max(...MockQuestionnaireService.getAllQuestionnaires().map(q => q.id)) + 1;
    const now = new Date().toISOString();

    const newQuestionnaire: Questionnaire = {
      id: newId,
      title: body.title,
      description: body.description || null,
      type: body.type || 'standard',
      category: body.category || null,
      estimated_time: body.estimated_time || null,
      is_active: body.is_active !== undefined ? body.is_active : true,
      is_adaptive: body.is_adaptive !== undefined ? body.is_adaptive : false,
      is_qr_enabled: body.is_qr_enabled !== undefined ? body.is_qr_enabled : true,
      is_template: body.is_template !== undefined ? body.is_template : false,
      is_public: body.is_public !== undefined ? body.is_public : false,
      allow_anonymous: body.allow_anonymous !== undefined ? body.allow_anonymous : true,
      requires_auth: body.requires_auth !== undefined ? body.requires_auth : false,
      max_responses: body.max_responses || null,
      expires_at: body.expires_at || null,
      version: 1,
      parent_id: null,
      tags: [],
      organization_id: body.organization_id || null,
      created_by_id: 1, // Mock user ID
      created_at: now,
      updated_at: now
    };

    // Add to mock data
    mockQuestionnaires.push(newQuestionnaire);

    return successResponse(newQuestionnaire, 'Questionnaire created successfully', 201);

  } catch (error) {
    console.error('Error creating questionnaire:', error);
    if (error instanceof ValidationError) {
      return errorResponse(error.message, 400);
    }
    return errorResponse('Failed to create questionnaire', 500);
  }
}


