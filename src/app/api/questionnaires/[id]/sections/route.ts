import { NextRequest, NextResponse } from 'next/server';
import { MockQuestionnaireService } from '@/lib/mock-questionnaire-data';
import { successResponse, errorResponse, ValidationError } from '@/lib/api-utils';
import { CreateQuestionSectionData, QuestionSection } from '@/types/database';

// Mock sections data
let mockSections: QuestionSection[] = [
  {
    id: 1,
    questionnaire_id: 1,
    title: 'Personal Information',
    description: 'Basic demographic information',
    order_num: 1,
    is_collapsible: true,
    is_collapsed: false,
    conditional_logic: undefined,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 2,
    questionnaire_id: 1,
    title: 'Anxiety Assessment',
    description: 'Questions related to anxiety symptoms',
    order_num: 2,
    is_collapsible: true,
    is_collapsed: false,
    conditional_logic: undefined,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  }
];

// GET /api/questionnaires/[id]/sections - Get sections for questionnaire
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

    const sections = mockSections
      .filter(s => s.questionnaire_id === id)
      .sort((a, b) => a.order_num - b.order_num);

    return successResponse({
      questionnaire_id: id,
      sections,
      total_sections: sections.length
    });

  } catch (error) {
    console.error('Error fetching sections:', error);
    return errorResponse('Failed to fetch sections', 500);
  }
}

// POST /api/questionnaires/[id]/sections - Add section to questionnaire
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

    const body: CreateQuestionSectionData = await request.json();

    // Validate required fields
    if (!body.title) {
      throw new ValidationError('Section title is required');
    }

    // Get existing sections to determine order
    const existingSections = mockSections.filter(s => s.questionnaire_id === id);
    const maxOrder = existingSections.length > 0 ? Math.max(...existingSections.map(s => s.order_num)) : 0;

    // Create new section
    const newSectionId = Math.max(...mockSections.map(s => s.id), 0) + 1;
    const now = new Date().toISOString();

    const newSection: QuestionSection = {
      id: newSectionId,
      questionnaire_id: id,
      title: body.title,
      description: body.description || undefined,
      order_num: body.order_num !== undefined ? body.order_num : maxOrder + 1,
      is_collapsible: body.is_collapsible !== undefined ? body.is_collapsible : true,
      is_collapsed: body.is_collapsed !== undefined ? body.is_collapsed : false,
      conditional_logic: body.conditional_logic || undefined,
      created_at: now,
      updated_at: now
    };

    mockSections.push(newSection);

    return successResponse(newSection, 'Section added successfully', 201);

  } catch (error) {
    console.error('Error adding section:', error);
    if (error instanceof ValidationError) {
      return errorResponse(error.message, 400);
    }
    return errorResponse('Failed to add section', 500);
  }
}

// PUT /api/questionnaires/[id]/sections - Update section order (bulk operation)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return errorResponse('Invalid questionnaire ID', 400);
    }

    const body: { sections: { id: number; order_num: number }[] } = await request.json();

    if (!body.sections || !Array.isArray(body.sections)) {
      throw new ValidationError('Sections array is required');
    }

    // Update section orders
    body.sections.forEach(({ id: sectionId, order_num }) => {
      const sectionIndex = mockSections.findIndex(s => s.id === sectionId && s.questionnaire_id === id);
      if (sectionIndex >= 0) {
        mockSections[sectionIndex] = {
          ...mockSections[sectionIndex],
          order_num,
          updated_at: new Date().toISOString()
        };
      }
    });

    const updatedSections = mockSections
      .filter(s => s.questionnaire_id === id)
      .sort((a, b) => a.order_num - b.order_num);

    return successResponse({
      questionnaire_id: id,
      sections: updatedSections,
      message: 'Section order updated successfully'
    });

  } catch (error) {
    console.error('Error updating section order:', error);
    if (error instanceof ValidationError) {
      return errorResponse(error.message, 400);
    }
    return errorResponse('Failed to update section order', 500);
  }
}
