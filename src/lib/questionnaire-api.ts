import { 
  Questionnaire, 
  Question, 
  Response, 
  Answer, 
  QuestionnaireVersion, 
  CreateQuestionnaireData, 
  CreateQuestionData,
  QuestionnaireType 
} from '@/types/database';

// API Response wrapper
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Questionnaire API Service
export class QuestionnaireApiService {
  private static baseUrl = '/api/questionnaires';

  // Get all questionnaires with filtering
  static async getAllQuestionnaires(params?: {
    is_active?: boolean;
    is_public?: boolean;
    is_template?: boolean;
    type?: QuestionnaireType;
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Questionnaire>> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const response = await fetch(`${this.baseUrl}?${searchParams}`);
    const result: ApiResponse<{ questionnaires: Questionnaire[]; pagination: any }> = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to fetch questionnaires');
    }

    return {
      data: result.data.questionnaires,
      pagination: result.data.pagination
    };
  }

  // Get questionnaire by ID
  static async getQuestionnaireById(id: number): Promise<Questionnaire & { questions: Question[]; versions: QuestionnaireVersion[] }> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    const result: ApiResponse<Questionnaire & { questions: Question[]; versions: QuestionnaireVersion[] }> = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to fetch questionnaire');
    }

    return result.data;
  }

  // Create new questionnaire
  static async createQuestionnaire(data: CreateQuestionnaireData): Promise<Questionnaire> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result: ApiResponse<Questionnaire> = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to create questionnaire');
    }

    return result.data;
  }

  // Update questionnaire
  static async updateQuestionnaire(id: number, data: Partial<CreateQuestionnaireData>): Promise<Questionnaire> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result: ApiResponse<Questionnaire> = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to update questionnaire');
    }

    return result.data;
  }

  // Delete questionnaire
  static async deleteQuestionnaire(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });

    const result: ApiResponse<null> = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to delete questionnaire');
    }
  }

  // Duplicate questionnaire
  static async duplicateQuestionnaire(
    id: number, 
    options: { title: string; copy_questions?: boolean; make_template?: boolean }
  ): Promise<{ questionnaire: Questionnaire; questions: Question[]; original_id: number }> {
    const response = await fetch(`${this.baseUrl}/${id}/duplicate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });

    const result: ApiResponse<{ questionnaire: Questionnaire; questions: Question[]; original_id: number }> = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to duplicate questionnaire');
    }

    return result.data;
  }

  // Get templates
  static async getTemplates(params?: {
    type?: QuestionnaireType;
    category?: string;
    search?: string;
    is_public?: boolean;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<any>> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const response = await fetch(`${this.baseUrl}/templates?${searchParams}`);
    const result: ApiResponse<{ templates: any[]; pagination: any; categories: any[]; types: any[] }> = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to fetch templates');
    }

    return {
      data: result.data.templates,
      pagination: result.data.pagination
    };
  }

  // Get version history
  static async getVersionHistory(id: number): Promise<{
    questionnaire_id: number;
    current_version: number;
    versions: QuestionnaireVersion[];
    total_versions: number;
  }> {
    const response = await fetch(`${this.baseUrl}/${id}/versions`);
    const result: ApiResponse<{
      questionnaire_id: number;
      current_version: number;
      versions: QuestionnaireVersion[];
      total_versions: number;
    }> = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to fetch version history');
    }

    return result.data;
  }

  // Restore version
  static async restoreVersion(id: number, versionNumber: number): Promise<{
    questionnaire: Questionnaire;
    restored_from_version: number;
    new_version: number;
    message: string;
  }> {
    const response = await fetch(`${this.baseUrl}/${id}/versions/${versionNumber}/restore`, {
      method: 'POST',
    });

    const result: ApiResponse<{
      questionnaire: Questionnaire;
      restored_from_version: number;
      new_version: number;
      message: string;
    }> = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to restore version');
    }

    return result.data;
  }

  // Get questions for questionnaire
  static async getQuestions(questionnaireId: number): Promise<{
    questionnaire_id: number;
    questions: Question[];
    total_questions: number;
  }> {
    const response = await fetch(`${this.baseUrl}/${questionnaireId}/questions`);
    const result: ApiResponse<{
      questionnaire_id: number;
      questions: Question[];
      total_questions: number;
    }> = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to fetch questions');
    }

    return result.data;
  }

  // Add question to questionnaire
  static async addQuestion(questionnaireId: number, data: CreateQuestionData): Promise<Question> {
    const response = await fetch(`${this.baseUrl}/${questionnaireId}/questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result: ApiResponse<Question> = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to add question');
    }

    return result.data;
  }
}

// Error handling utility
export class QuestionnaireApiError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'QuestionnaireApiError';
  }
}

// Generic API wrapper with error handling
export async function apiCall<T>(
  apiFunction: () => Promise<T>,
  errorMessage: string = 'API call failed'
): Promise<T> {
  try {
    return await apiFunction();
  } catch (error) {
    console.error('Questionnaire API Error:', error);
    throw new QuestionnaireApiError(errorMessage);
  }
}
