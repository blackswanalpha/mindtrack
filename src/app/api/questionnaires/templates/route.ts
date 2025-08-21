import { NextRequest, NextResponse } from 'next/server';
import { MockQuestionnaireService } from '@/lib/mock-questionnaire-data';
import { successResponse, errorResponse } from '@/lib/api-utils';
import { QuestionnaireType } from '@/types/database';

// GET /api/questionnaires/templates - Get all questionnaire templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters for template filtering
    const filters = {
      is_template: true, // Always filter for templates
      type: searchParams.get('type') as QuestionnaireType || undefined,
      category: searchParams.get('category') || undefined,
      search: searchParams.get('search') || undefined,
      is_public: searchParams.get('is_public') === 'true' ? true : 
                 searchParams.get('is_public') === 'false' ? false : undefined
    };

    // Remove undefined values
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== undefined)
    );

    const templates = MockQuestionnaireService.getAllQuestionnaires(cleanFilters);

    // Add template-specific metadata
    const templatesWithMetadata = templates.map(template => {
      const questions = MockQuestionnaireService.getQuestionsByQuestionnaireId(template.id);
      
      return {
        ...template,
        question_count: questions.length,
        usage_count: Math.floor(Math.random() * 1000) + 50, // Mock usage count
        rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // Mock rating 3.0-5.0
        is_featured: template.id <= 3, // First 3 templates are featured
        is_validated: ['assessment', 'screening', 'clinical'].includes(template.type),
        difficulty: template.estimated_time && template.estimated_time > 30 ? 'advanced' :
                   template.estimated_time && template.estimated_time > 15 ? 'intermediate' : 'beginner'
      };
    });

    // Sort templates - featured first, then by usage count
    templatesWithMetadata.sort((a, b) => {
      if (a.is_featured && !b.is_featured) return -1;
      if (!a.is_featured && b.is_featured) return 1;
      return b.usage_count - a.usage_count;
    });

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;
    const paginatedTemplates = templatesWithMetadata.slice(offset, offset + limit);

    return successResponse({
      templates: paginatedTemplates,
      pagination: {
        page,
        limit,
        total: templatesWithMetadata.length,
        pages: Math.ceil(templatesWithMetadata.length / limit)
      },
      categories: getTemplateCategories(templates),
      types: getTemplateTypes(templates)
    });

  } catch (error) {
    console.error('Error fetching templates:', error);
    return errorResponse('Failed to fetch templates', 500);
  }
}

// Helper function to get unique categories from templates
function getTemplateCategories(templates: any[]) {
  const categories = templates
    .map(t => t.category)
    .filter(Boolean)
    .filter((category, index, arr) => arr.indexOf(category) === index);
  
  return categories.map(category => ({
    value: category,
    label: category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' '),
    count: templates.filter(t => t.category === category).length
  }));
}

// Helper function to get unique types from templates
function getTemplateTypes(templates: any[]) {
  const types = templates
    .map(t => t.type)
    .filter((type, index, arr) => arr.indexOf(type) === index);
  
  return types.map(type => ({
    value: type,
    label: type.charAt(0).toUpperCase() + type.slice(1),
    count: templates.filter(t => t.type === type).length
  }));
}
