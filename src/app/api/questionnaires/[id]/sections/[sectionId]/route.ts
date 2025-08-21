import { NextRequest, NextResponse } from 'next/server';
import { successResponse, errorResponse, ValidationError } from '@/lib/api-utils';
import { CreateQuestionSectionData, QuestionSection } from '@/types/database';

// Import mock sections from the main sections route
// In a real app, this would come from a shared service or database
let mockSections: QuestionSection[] = [];

// GET /api/questionnaires/[id]/sections/[sectionId] - Get specific section
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; sectionId: string } }
) {
  try {
    const questionnaireId = parseInt(params.id);
    const sectionId = parseInt(params.sectionId);
    
    if (isNaN(questionnaireId) || isNaN(sectionId)) {
      return errorResponse('Invalid questionnaire or section ID', 400);
    }

    const section = mockSections.find(s => s.id === sectionId && s.questionnaire_id === questionnaireId);
    
    if (!section) {
      return errorResponse('Section not found', 404);
    }

    return successResponse(section);

  } catch (error) {
    console.error('Error fetching section:', error);
    return errorResponse('Failed to fetch section', 500);
  }
}

// PUT /api/questionnaires/[id]/sections/[sectionId] - Update section
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; sectionId: string } }
) {
  try {
    const questionnaireId = parseInt(params.id);
    const sectionId = parseInt(params.sectionId);
    
    if (isNaN(questionnaireId) || isNaN(sectionId)) {
      return errorResponse('Invalid questionnaire or section ID', 400);
    }

    const body: Partial<CreateQuestionSectionData> = await request.json();
    
    const sectionIndex = mockSections.findIndex(s => s.id === sectionId && s.questionnaire_id === questionnaireId);
    
    if (sectionIndex === -1) {
      return errorResponse('Section not found', 404);
    }

    const existingSection = mockSections[sectionIndex];

    // Update section
    const updatedSection: QuestionSection = {
      ...existingSection,
      title: body.title !== undefined ? body.title : existingSection.title,
      description: body.description !== undefined ? body.description : existingSection.description,
      order_num: body.order_num !== undefined ? body.order_num : existingSection.order_num,
      is_collapsible: body.is_collapsible !== undefined ? body.is_collapsible : existingSection.is_collapsible,
      is_collapsed: body.is_collapsed !== undefined ? body.is_collapsed : existingSection.is_collapsed,
      conditional_logic: body.conditional_logic !== undefined ? body.conditional_logic : existingSection.conditional_logic,
      updated_at: new Date().toISOString()
    };

    mockSections[sectionIndex] = updatedSection;

    return successResponse(updatedSection, 'Section updated successfully');

  } catch (error) {
    console.error('Error updating section:', error);
    if (error instanceof ValidationError) {
      return errorResponse(error.message, 400);
    }
    return errorResponse('Failed to update section', 500);
  }
}

// DELETE /api/questionnaires/[id]/sections/[sectionId] - Delete section
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; sectionId: string } }
) {
  try {
    const questionnaireId = parseInt(params.id);
    const sectionId = parseInt(params.sectionId);
    
    if (isNaN(questionnaireId) || isNaN(sectionId)) {
      return errorResponse('Invalid questionnaire or section ID', 400);
    }

    const sectionIndex = mockSections.findIndex(s => s.id === sectionId && s.questionnaire_id === questionnaireId);
    
    if (sectionIndex === -1) {
      return errorResponse('Section not found', 404);
    }

    // Remove section from mock data
    mockSections.splice(sectionIndex, 1);

    // Note: In a real implementation, you'd also need to handle questions that belong to this section
    // Either delete them or move them to another section/no section

    return successResponse(null, 'Section deleted successfully');

  } catch (error) {
    console.error('Error deleting section:', error);
    return errorResponse('Failed to delete section', 500);
  }
}
