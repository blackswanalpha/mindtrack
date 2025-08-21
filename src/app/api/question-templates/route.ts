import { NextRequest, NextResponse } from 'next/server';
import { successResponse, errorResponse, ValidationError } from '@/lib/api-utils';
import { CreateQuestionTemplateData, QuestionTemplate, QuestionType } from '@/types/database';

// Mock question templates data
let mockQuestionTemplates: QuestionTemplate[] = [
  {
    id: 1,
    name: 'Basic Text Input',
    description: 'Simple text input question with character limit',
    category: 'text_input',
    type: 'text',
    template_data: {
      text: 'Please enter your response',
      validation_rules: { max_length: 255 },
      placeholder_text: 'Type your answer here...'
    },
    usage_count: 150,
    is_public: true,
    tags: ['basic', 'text', 'input'],
    created_by_id: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    name: 'Yes/No Question',
    description: 'Simple boolean question template',
    category: 'basic',
    type: 'boolean',
    template_data: {
      text: 'Do you agree with the statement?',
      required: true
    },
    usage_count: 200,
    is_public: true,
    tags: ['boolean', 'yes-no', 'basic'],
    created_by_id: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 3,
    name: '5-Point Likert Scale',
    description: 'Standard 5-point Likert scale for agreement',
    category: 'rating',
    type: 'likert',
    template_data: {
      text: 'Please rate your level of agreement',
      options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
      metadata: {
        likert_scale: {
          scale_type: '5_point',
          labels: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
          neutral_option: true
        }
      }
    },
    usage_count: 300,
    is_public: true,
    tags: ['likert', 'rating', 'agreement', '5-point'],
    created_by_id: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 4,
    name: 'Star Rating',
    description: '5-star rating system',
    category: 'rating',
    type: 'star_rating',
    template_data: {
      text: 'How would you rate this?',
      validation_rules: { min_value: 1, max_value: 5 },
      metadata: {
        rating_scale: {
          min: 1,
          max: 5,
          show_numbers: false
        }
      }
    },
    usage_count: 180,
    is_public: true,
    tags: ['star', 'rating', '5-star'],
    created_by_id: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 5,
    name: 'NPS Question',
    description: 'Net Promoter Score question template',
    category: 'rating',
    type: 'nps',
    template_data: {
      text: 'How likely are you to recommend us to a friend or colleague?',
      validation_rules: { min_value: 0, max_value: 10 },
      metadata: {
        nps_config: {
          detractor_range: [0, 6],
          passive_range: [7, 8],
          promoter_range: [9, 10]
        }
      }
    },
    usage_count: 120,
    is_public: true,
    tags: ['nps', 'recommendation', 'loyalty'],
    created_by_id: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 6,
    name: 'File Upload',
    description: 'Document upload with file type restrictions',
    category: 'file',
    type: 'file_upload',
    template_data: {
      text: 'Please upload your document',
      validation_rules: {
        max_file_size: 10485760, // 10MB
        allowed_file_types: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        max_files: 3
      },
      help_text: 'Accepted formats: PDF, DOC, DOCX. Maximum 10MB per file.'
    },
    usage_count: 80,
    is_public: true,
    tags: ['file', 'upload', 'document'],
    created_by_id: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 7,
    name: 'Country Selection',
    description: 'Country dropdown with search functionality',
    category: 'geographic',
    type: 'country',
    template_data: {
      text: 'Select your country',
      required: true,
      metadata: {
        geographic_config: {
          include_flags: true,
          autocomplete_enabled: true
        }
      }
    },
    usage_count: 95,
    is_public: true,
    tags: ['country', 'geographic', 'dropdown'],
    created_by_id: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

// GET /api/question-templates - Get all question templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const filters = {
      category: searchParams.get('category') || undefined,
      type: searchParams.get('type') as QuestionType || undefined,
      is_public: searchParams.get('is_public') === 'true' ? true : 
                 searchParams.get('is_public') === 'false' ? false : undefined,
      search: searchParams.get('search') || undefined,
      tags: searchParams.get('tags')?.split(',') || undefined
    };

    let filteredTemplates = [...mockQuestionTemplates];

    // Apply filters
    if (filters.category) {
      filteredTemplates = filteredTemplates.filter(t => t.category === filters.category);
    }

    if (filters.type) {
      filteredTemplates = filteredTemplates.filter(t => t.type === filters.type);
    }

    if (filters.is_public !== undefined) {
      filteredTemplates = filteredTemplates.filter(t => t.is_public === filters.is_public);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredTemplates = filteredTemplates.filter(t => 
        t.name.toLowerCase().includes(searchLower) ||
        (t.description && t.description.toLowerCase().includes(searchLower)) ||
        t.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    if (filters.tags) {
      filteredTemplates = filteredTemplates.filter(t => 
        filters.tags!.some(tag => t.tags?.includes(tag))
      );
    }

    // Sort by usage count (most used first)
    filteredTemplates.sort((a, b) => b.usage_count - a.usage_count);

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;
    const paginatedTemplates = filteredTemplates.slice(offset, offset + limit);

    // Get categories and types for filtering
    const categories = [...new Set(mockQuestionTemplates.map(t => t.category).filter(Boolean))];
    const types = [...new Set(mockQuestionTemplates.map(t => t.type))];
    const allTags = [...new Set(mockQuestionTemplates.flatMap(t => t.tags || []))];

    return successResponse({
      templates: paginatedTemplates,
      pagination: {
        page,
        limit,
        total: filteredTemplates.length,
        pages: Math.ceil(filteredTemplates.length / limit)
      },
      filters: {
        categories: categories.map(cat => ({
          value: cat,
          label: cat.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          count: mockQuestionTemplates.filter(t => t.category === cat).length
        })),
        types: types.map(type => ({
          value: type,
          label: type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          count: mockQuestionTemplates.filter(t => t.type === type).length
        })),
        tags: allTags.map(tag => ({
          value: tag,
          label: tag,
          count: mockQuestionTemplates.filter(t => t.tags?.includes(tag)).length
        }))
      }
    });

  } catch (error) {
    console.error('Error fetching question templates:', error);
    return errorResponse('Failed to fetch question templates', 500);
  }
}

// POST /api/question-templates - Create new question template
export async function POST(request: NextRequest) {
  try {
    const body: CreateQuestionTemplateData = await request.json();

    // Validate required fields
    if (!body.name) {
      throw new ValidationError('Template name is required');
    }

    if (!body.type) {
      throw new ValidationError('Template type is required');
    }

    if (!body.template_data) {
      throw new ValidationError('Template data is required');
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

    // Create new template
    const newTemplateId = Math.max(...mockQuestionTemplates.map(t => t.id), 0) + 1;
    const now = new Date().toISOString();

    const newTemplate: QuestionTemplate = {
      id: newTemplateId,
      name: body.name,
      description: body.description || undefined,
      category: body.category || undefined,
      type: body.type,
      template_data: body.template_data,
      usage_count: 0,
      is_public: body.is_public !== undefined ? body.is_public : false,
      tags: body.tags || [],
      created_by_id: 1, // Mock user ID
      created_at: now,
      updated_at: now
    };

    mockQuestionTemplates.push(newTemplate);

    return successResponse(newTemplate, 'Question template created successfully', 201);

  } catch (error) {
    console.error('Error creating question template:', error);
    if (error instanceof ValidationError) {
      return errorResponse(error.message, 400);
    }
    return errorResponse('Failed to create question template', 500);
  }
}
