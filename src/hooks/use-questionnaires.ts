'use client'

import { useState, useEffect, useCallback } from 'react';
import { QuestionnaireApiService, apiCall } from '@/lib/questionnaire-api';
import { 
  Questionnaire, 
  Question, 
  QuestionnaireVersion, 
  CreateQuestionnaireData, 
  CreateQuestionData,
  QuestionnaireType 
} from '@/types/database';

// Hook for fetching all questionnaires
export function useQuestionnaires(params?: {
  is_active?: boolean;
  is_public?: boolean;
  is_template?: boolean;
  type?: QuestionnaireType;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestionnaires = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiCall(
        () => QuestionnaireApiService.getAllQuestionnaires(params),
        'Failed to fetch questionnaires'
      );
      
      setQuestionnaires(result.data);
      setPagination(result.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchQuestionnaires();
  }, [fetchQuestionnaires]);

  return {
    questionnaires,
    pagination,
    loading,
    error,
    refetch: fetchQuestionnaires
  };
}

// Hook for fetching a single questionnaire
export function useQuestionnaire(id: number | null) {
  const [questionnaire, setQuestionnaire] = useState<(Questionnaire & { questions: Question[]; versions: QuestionnaireVersion[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestionnaire = useCallback(async () => {
    if (!id) {
      setQuestionnaire(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await apiCall(
        () => QuestionnaireApiService.getQuestionnaireById(id),
        'Failed to fetch questionnaire'
      );
      
      setQuestionnaire(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchQuestionnaire();
  }, [fetchQuestionnaire]);

  return {
    questionnaire,
    loading,
    error,
    refetch: fetchQuestionnaire
  };
}

// Hook for questionnaire CRUD operations
export function useQuestionnaireActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createQuestionnaire = async (data: CreateQuestionnaireData): Promise<Questionnaire | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiCall(
        () => QuestionnaireApiService.createQuestionnaire(data),
        'Failed to create questionnaire'
      );
      
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateQuestionnaire = async (id: number, data: Partial<CreateQuestionnaireData>): Promise<Questionnaire | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiCall(
        () => QuestionnaireApiService.updateQuestionnaire(id, data),
        'Failed to update questionnaire'
      );
      
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteQuestionnaire = async (id: number): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      await apiCall(
        () => QuestionnaireApiService.deleteQuestionnaire(id),
        'Failed to delete questionnaire'
      );
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const duplicateQuestionnaire = async (
    id: number, 
    options: { title: string; copy_questions?: boolean; make_template?: boolean }
  ): Promise<{ questionnaire: Questionnaire; questions: Question[]; original_id: number } | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiCall(
        () => QuestionnaireApiService.duplicateQuestionnaire(id, options),
        'Failed to duplicate questionnaire'
      );
      
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    createQuestionnaire,
    updateQuestionnaire,
    deleteQuestionnaire,
    duplicateQuestionnaire,
    loading,
    error
  };
}

// Hook for templates
export function useTemplates(params?: {
  type?: QuestionnaireType;
  category?: string;
  search?: string;
  is_public?: boolean;
  page?: number;
  limit?: number;
}) {
  const [templates, setTemplates] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiCall(
        () => QuestionnaireApiService.getTemplates(params),
        'Failed to fetch templates'
      );
      
      setTemplates(result.data);
      setPagination(result.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  return {
    templates,
    pagination,
    loading,
    error,
    refetch: fetchTemplates
  };
}

// Hook for version control
export function useVersionControl(questionnaireId: number | null) {
  const [versions, setVersions] = useState<QuestionnaireVersion[]>([]);
  const [currentVersion, setCurrentVersion] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVersions = useCallback(async () => {
    if (!questionnaireId) {
      setVersions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await apiCall(
        () => QuestionnaireApiService.getVersionHistory(questionnaireId),
        'Failed to fetch version history'
      );
      
      setVersions(result.versions);
      setCurrentVersion(result.current_version);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [questionnaireId]);

  const restoreVersion = async (versionNumber: number): Promise<boolean> => {
    if (!questionnaireId) return false;

    try {
      setLoading(true);
      setError(null);
      
      await apiCall(
        () => QuestionnaireApiService.restoreVersion(questionnaireId, versionNumber),
        'Failed to restore version'
      );
      
      // Refresh version history after restore
      await fetchVersions();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVersions();
  }, [fetchVersions]);

  return {
    versions,
    currentVersion,
    loading,
    error,
    restoreVersion,
    refetch: fetchVersions
  };
}

// Hook for questions
export function useQuestions(questionnaireId: number | null) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestions = useCallback(async () => {
    if (!questionnaireId) {
      setQuestions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await apiCall(
        () => QuestionnaireApiService.getQuestions(questionnaireId),
        'Failed to fetch questions'
      );
      
      setQuestions(result.questions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [questionnaireId]);

  const addQuestion = async (data: CreateQuestionData): Promise<Question | null> => {
    if (!questionnaireId) return null;

    try {
      setLoading(true);
      setError(null);
      
      const result = await apiCall(
        () => QuestionnaireApiService.addQuestion(questionnaireId, data),
        'Failed to add question'
      );
      
      // Refresh questions after adding
      await fetchQuestions();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  return {
    questions,
    loading,
    error,
    addQuestion,
    refetch: fetchQuestions
  };
}
