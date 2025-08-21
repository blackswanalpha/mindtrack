/**
 * Comprehensive test suite for all 8 required questionnaire management features
 */

import { QuestionnaireApiService } from '@/lib/questionnaire-api';
import { MockQuestionnaireService } from '@/lib/mock-questionnaire-data';
import { QuestionnaireType } from '@/types/database';

// Mock fetch for API tests
global.fetch = jest.fn();

describe('Questionnaire Management Features', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Feature 1: Multiple Questionnaire Types', () => {
    test('should support all 8 required questionnaire types', () => {
      const requiredTypes: QuestionnaireType[] = [
        'standard', 'assessment', 'screening', 'feedback',
        'survey', 'clinical', 'research', 'educational'
      ];

      const questionnaires = MockQuestionnaireService.getAllQuestionnaires();
      const availableTypes = [...new Set(questionnaires.map(q => q.type))];

      // Verify all required types are represented in mock data
      requiredTypes.forEach(type => {
        expect(availableTypes).toContain(type);
      });

      // Verify we have at least one questionnaire of each type
      requiredTypes.forEach(type => {
        const questionnaireOfType = questionnaires.find(q => q.type === type);
        expect(questionnaireOfType).toBeDefined();
        expect(questionnaireOfType?.type).toBe(type);
      });
    });

    test('should filter questionnaires by type', () => {
      const assessmentQuestionnaires = MockQuestionnaireService.getAllQuestionnaires({
        type: 'assessment'
      });

      expect(assessmentQuestionnaires.length).toBeGreaterThan(0);
      assessmentQuestionnaires.forEach(q => {
        expect(q.type).toBe('assessment');
      });
    });

    test('should validate questionnaire type in API', async () => {
      const mockResponse = {
        success: false,
        error: 'Invalid questionnaire type. Must be one of: standard, assessment, screening, feedback, survey, clinical, research, educational'
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse)
      });

      await expect(
        QuestionnaireApiService.createQuestionnaire({
          title: 'Test',
          type: 'invalid_type' as QuestionnaireType
        })
      ).rejects.toThrow('Invalid questionnaire type');
    });
  });

  describe('Feature 2: Template System', () => {
    test('should identify templates using is_template field', () => {
      const templates = MockQuestionnaireService.getTemplates();
      
      expect(templates.length).toBeGreaterThan(0);
      templates.forEach(template => {
        expect(template.is_template).toBe(true);
      });
    });

    test('should filter questionnaires to show only templates', () => {
      const templates = MockQuestionnaireService.getAllQuestionnaires({
        is_template: true
      });

      expect(templates.length).toBeGreaterThan(0);
      templates.forEach(template => {
        expect(template.is_template).toBe(true);
      });
    });

    test('should support template duplication', () => {
      const originalTemplate = MockQuestionnaireService.getTemplates()[0];
      const duplicated = MockQuestionnaireService.duplicateQuestionnaire(
        originalTemplate.id,
        'Duplicated Template'
      );

      expect(duplicated).toBeDefined();
      expect(duplicated?.title).toBe('Duplicated Template');
      expect(duplicated?.parent_id).toBe(originalTemplate.id);
      expect(duplicated?.version).toBe(1);
      expect(duplicated?.is_template).toBe(false); // Duplicates are not templates by default
    });

    test('should have predefined templates with metadata', () => {
      const templates = MockQuestionnaireService.getTemplates();
      
      templates.forEach(template => {
        expect(template.title).toBeDefined();
        expect(template.description).toBeDefined();
        expect(template.type).toBeDefined();
        expect(template.estimated_time).toBeDefined();
        expect(template.tags).toBeDefined();
        expect(Array.isArray(template.tags)).toBe(true);
      });
    });
  });

  describe('Feature 3: Version Control and History', () => {
    test('should track version numbers', () => {
      const questionnaires = MockQuestionnaireService.getAllQuestionnaires();
      
      questionnaires.forEach(q => {
        expect(q.version).toBeDefined();
        expect(typeof q.version).toBe('number');
        expect(q.version).toBeGreaterThanOrEqual(1);
      });
    });

    test('should maintain version history', () => {
      const questionnaireWithVersions = MockQuestionnaireService.getAllQuestionnaires()
        .find(q => q.version > 1);

      if (questionnaireWithVersions) {
        const versions = MockQuestionnaireService.getQuestionnaireVersions(questionnaireWithVersions.id);
        
        expect(versions.length).toBeGreaterThan(0);
        versions.forEach(version => {
          expect(version.questionnaire_id).toBe(questionnaireWithVersions.id);
          expect(version.version_number).toBeDefined();
          expect(version.change_summary).toBeDefined();
          expect(version.created_at).toBeDefined();
        });
      }
    });

    test('should support parent-child relationships for versions', () => {
      const questionnaires = MockQuestionnaireService.getAllQuestionnaires();
      const childQuestionnaire = questionnaires.find(q => q.parent_id !== null);

      if (childQuestionnaire) {
        const parent = MockQuestionnaireService.getQuestionnaireById(childQuestionnaire.parent_id!);
        expect(parent).toBeDefined();
      }
    });
  });

  describe('Feature 4: Category-based Organization', () => {
    test('should support questionnaire categories', () => {
      const questionnaires = MockQuestionnaireService.getAllQuestionnaires();
      const categorizedQuestionnaires = questionnaires.filter(q => q.category);

      expect(categorizedQuestionnaires.length).toBeGreaterThan(0);
      
      const categories = [...new Set(categorizedQuestionnaires.map(q => q.category))];
      expect(categories.length).toBeGreaterThan(1);
    });

    test('should filter questionnaires by category', () => {
      const mentalHealthQuestionnaires = MockQuestionnaireService.getAllQuestionnaires({
        category: 'mental_health'
      });

      mentalHealthQuestionnaires.forEach(q => {
        expect(q.category).toBe('mental_health');
      });
    });

    test('should have diverse categories', () => {
      const questionnaires = MockQuestionnaireService.getAllQuestionnaires();
      const categories = [...new Set(questionnaires.map(q => q.category).filter(Boolean))];

      // Should have multiple categories
      expect(categories.length).toBeGreaterThanOrEqual(3);
      
      // Should include common categories
      const expectedCategories = ['mental_health', 'wellness', 'satisfaction'];
      expectedCategories.forEach(category => {
        expect(categories).toContain(category);
      });
    });
  });

  describe('Feature 5: Public/Private Settings', () => {
    test('should support public/private access control', () => {
      const questionnaires = MockQuestionnaireService.getAllQuestionnaires();
      
      questionnaires.forEach(q => {
        expect(typeof q.is_public).toBe('boolean');
      });

      const publicQuestionnaires = questionnaires.filter(q => q.is_public);
      const privateQuestionnaires = questionnaires.filter(q => !q.is_public);

      expect(publicQuestionnaires.length).toBeGreaterThan(0);
      expect(privateQuestionnaires.length).toBeGreaterThan(0);
    });

    test('should filter questionnaires by public/private status', () => {
      const publicQuestionnaires = MockQuestionnaireService.getAllQuestionnaires({
        is_public: true
      });

      publicQuestionnaires.forEach(q => {
        expect(q.is_public).toBe(true);
      });

      const privateQuestionnaires = MockQuestionnaireService.getAllQuestionnaires({
        is_public: false
      });

      privateQuestionnaires.forEach(q => {
        expect(q.is_public).toBe(false);
      });
    });
  });

  describe('Feature 6: Anonymous Response Collection', () => {
    test('should support anonymous response settings', () => {
      const questionnaires = MockQuestionnaireService.getAllQuestionnaires();
      
      questionnaires.forEach(q => {
        expect(typeof q.allow_anonymous).toBe('boolean');
      });

      const anonymousAllowed = questionnaires.filter(q => q.allow_anonymous);
      const anonymousNotAllowed = questionnaires.filter(q => !q.allow_anonymous);

      expect(anonymousAllowed.length).toBeGreaterThan(0);
      expect(anonymousNotAllowed.length).toBeGreaterThan(0);
    });

    test('should have anonymous response examples', () => {
      const { mockResponses } = require('@/lib/mock-questionnaire-data');
      const anonymousResponses = mockResponses.filter((r: any) => !r.user_id && r.patient_identifier);

      expect(anonymousResponses.length).toBeGreaterThan(0);
      
      anonymousResponses.forEach((response: any) => {
        expect(response.user_id).toBeNull();
        expect(response.patient_identifier).toBeDefined();
        expect(response.patient_identifier).toMatch(/^ANON_/);
      });
    });
  });

  describe('Feature 7: Expiration Date Settings', () => {
    test('should support expiration dates', () => {
      const questionnaires = MockQuestionnaireService.getAllQuestionnaires();
      const questionnairesWithExpiry = questionnaires.filter(q => q.expires_at);

      expect(questionnairesWithExpiry.length).toBeGreaterThan(0);
      
      questionnairesWithExpiry.forEach(q => {
        expect(q.expires_at).toBeDefined();
        expect(new Date(q.expires_at!)).toBeInstanceOf(Date);
      });
    });

    test('should handle questionnaires without expiration', () => {
      const questionnaires = MockQuestionnaireService.getAllQuestionnaires();
      const questionnairesWithoutExpiry = questionnaires.filter(q => !q.expires_at);

      expect(questionnairesWithoutExpiry.length).toBeGreaterThan(0);
      
      questionnairesWithoutExpiry.forEach(q => {
        expect(q.expires_at).toBeNull();
      });
    });
  });

  describe('Feature 8: Response Limits', () => {
    test('should support response limits', () => {
      const questionnaires = MockQuestionnaireService.getAllQuestionnaires();
      const questionnairesWithLimits = questionnaires.filter(q => q.max_responses);

      expect(questionnairesWithLimits.length).toBeGreaterThan(0);
      
      questionnairesWithLimits.forEach(q => {
        expect(q.max_responses).toBeDefined();
        expect(typeof q.max_responses).toBe('number');
        expect(q.max_responses!).toBeGreaterThan(0);
      });
    });

    test('should handle unlimited responses', () => {
      const questionnaires = MockQuestionnaireService.getAllQuestionnaires();
      const unlimitedQuestionnaires = questionnaires.filter(q => !q.max_responses);

      expect(unlimitedQuestionnaires.length).toBeGreaterThan(0);
      
      unlimitedQuestionnaires.forEach(q => {
        expect(q.max_responses).toBeNull();
      });
    });

    test('should have varied response limits', () => {
      const questionnaires = MockQuestionnaireService.getAllQuestionnaires();
      const limits = questionnaires
        .map(q => q.max_responses)
        .filter(limit => limit !== null) as number[];

      const uniqueLimits = [...new Set(limits)];
      expect(uniqueLimits.length).toBeGreaterThan(1); // Should have different limits
    });
  });

  describe('Integration Tests', () => {
    test('should support complex filtering with multiple criteria', () => {
      const results = MockQuestionnaireService.getAllQuestionnaires({
        is_active: true,
        is_public: true,
        type: 'assessment',
        category: 'mental_health'
      });

      results.forEach(q => {
        expect(q.is_active).toBe(true);
        expect(q.is_public).toBe(true);
        expect(q.type).toBe('assessment');
        expect(q.category).toBe('mental_health');
      });
    });

    test('should support search functionality', () => {
      const searchResults = MockQuestionnaireService.getAllQuestionnaires({
        search: 'anxiety'
      });

      expect(searchResults.length).toBeGreaterThan(0);
      searchResults.forEach(q => {
        const matchesTitle = q.title.toLowerCase().includes('anxiety');
        const matchesDescription = q.description?.toLowerCase().includes('anxiety');
        expect(matchesTitle || matchesDescription).toBe(true);
      });
    });

    test('should maintain data consistency across all features', () => {
      const questionnaires = MockQuestionnaireService.getAllQuestionnaires();
      
      questionnaires.forEach(q => {
        // All questionnaires should have required fields
        expect(q.id).toBeDefined();
        expect(q.title).toBeDefined();
        expect(q.type).toBeDefined();
        expect(typeof q.is_active).toBe('boolean');
        expect(typeof q.is_public).toBe('boolean');
        expect(typeof q.allow_anonymous).toBe('boolean');
        expect(typeof q.is_template).toBe('boolean');
        expect(q.version).toBeGreaterThanOrEqual(1);
        expect(q.created_at).toBeDefined();
        expect(q.updated_at).toBeDefined();
      });
    });
  });
});
