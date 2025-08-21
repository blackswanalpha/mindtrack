/**
 * API Integration tests for questionnaire management endpoints
 */

import { NextRequest } from 'next/server';
import { GET as getQuestionnaires, POST as createQuestionnaire } from '@/app/api/questionnaires/route';
import { GET as getQuestionnaireById, PUT as updateQuestionnaire, DELETE as deleteQuestionnaire } from '@/app/api/questionnaires/[id]/route';
import { POST as duplicateQuestionnaire } from '@/app/api/questionnaires/[id]/duplicate/route';
import { GET as getTemplates } from '@/app/api/questionnaires/templates/route';
import { GET as getVersions } from '@/app/api/questionnaires/[id]/versions/route';
import { POST as restoreVersion } from '@/app/api/questionnaires/[id]/versions/[version]/restore/route';

// Mock NextRequest
const createMockRequest = (url: string, options: RequestInit = {}) => {
  return new NextRequest(url, options);
};

describe('Questionnaire API Integration', () => {
  describe('GET /api/questionnaires', () => {
    test('should return questionnaires with pagination', async () => {
      const request = createMockRequest('http://localhost:3000/api/questionnaires');
      const response = await getQuestionnaires(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data.questionnaires).toBeInstanceOf(Array);
      expect(data.data.pagination).toBeDefined();
      expect(data.data.pagination.page).toBe(1);
      expect(data.data.pagination.total).toBeGreaterThan(0);
    });

    test('should filter questionnaires by type', async () => {
      const request = createMockRequest('http://localhost:3000/api/questionnaires?type=assessment');
      const response = await getQuestionnaires(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      data.data.questionnaires.forEach((q: any) => {
        expect(q.type).toBe('assessment');
      });
    });

    test('should filter questionnaires by template status', async () => {
      const request = createMockRequest('http://localhost:3000/api/questionnaires?is_template=true');
      const response = await getQuestionnaires(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      data.data.questionnaires.forEach((q: any) => {
        expect(q.is_template).toBe(true);
      });
    });

    test('should search questionnaires', async () => {
      const request = createMockRequest('http://localhost:3000/api/questionnaires?search=anxiety');
      const response = await getQuestionnaires(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.questionnaires.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/questionnaires', () => {
    test('should create a new questionnaire', async () => {
      const questionnaireData = {
        title: 'Test Questionnaire',
        description: 'A test questionnaire',
        type: 'standard',
        category: 'test',
        estimated_time: 10,
        is_active: true,
        is_public: false,
        allow_anonymous: true
      };

      const request = createMockRequest('http://localhost:3000/api/questionnaires', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionnaireData)
      });

      const response = await createQuestionnaire(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.title).toBe(questionnaireData.title);
      expect(data.data.type).toBe(questionnaireData.type);
      expect(data.data.version).toBe(1);
    });

    test('should validate required fields', async () => {
      const request = createMockRequest('http://localhost:3000/api/questionnaires', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      const response = await createQuestionnaire(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Title is required');
    });

    test('should validate questionnaire type', async () => {
      const request = createMockRequest('http://localhost:3000/api/questionnaires', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Test',
          type: 'invalid_type'
        })
      });

      const response = await createQuestionnaire(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid questionnaire type');
    });
  });

  describe('GET /api/questionnaires/[id]', () => {
    test('should return questionnaire with questions and versions', async () => {
      const request = createMockRequest('http://localhost:3000/api/questionnaires/1');
      const response = await getQuestionnaireById(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe(1);
      expect(data.data.questions).toBeInstanceOf(Array);
      expect(data.data.versions).toBeInstanceOf(Array);
    });

    test('should return 404 for non-existent questionnaire', async () => {
      const request = createMockRequest('http://localhost:3000/api/questionnaires/999');
      const response = await getQuestionnaireById(request, { params: { id: '999' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toContain('not found');
    });
  });

  describe('PUT /api/questionnaires/[id]', () => {
    test('should update questionnaire and create new version', async () => {
      const updateData = {
        title: 'Updated Title',
        description: 'Updated description'
      };

      const request = createMockRequest('http://localhost:3000/api/questionnaires/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      const response = await updateQuestionnaire(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.title).toBe(updateData.title);
      expect(data.data.description).toBe(updateData.description);
    });
  });

  describe('DELETE /api/questionnaires/[id]', () => {
    test('should delete questionnaire', async () => {
      const request = createMockRequest('http://localhost:3000/api/questionnaires/8');
      const response = await deleteQuestionnaire(request, { params: { id: '8' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toContain('deleted successfully');
    });
  });

  describe('POST /api/questionnaires/[id]/duplicate', () => {
    test('should duplicate questionnaire', async () => {
      const duplicateData = {
        title: 'Duplicated Questionnaire',
        copy_questions: true,
        make_template: false
      };

      const request = createMockRequest('http://localhost:3000/api/questionnaires/1/duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(duplicateData)
      });

      const response = await duplicateQuestionnaire(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.questionnaire.title).toBe(duplicateData.title);
      expect(data.data.questionnaire.parent_id).toBe(1);
      expect(data.data.original_id).toBe(1);
    });
  });

  describe('GET /api/questionnaires/templates', () => {
    test('should return templates with metadata', async () => {
      const request = createMockRequest('http://localhost:3000/api/questionnaires/templates');
      const response = await getTemplates(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.templates).toBeInstanceOf(Array);
      expect(data.data.pagination).toBeDefined();
      expect(data.data.categories).toBeInstanceOf(Array);
      expect(data.data.types).toBeInstanceOf(Array);

      // Verify template metadata
      data.data.templates.forEach((template: any) => {
        expect(template.is_template).toBe(true);
        expect(template.question_count).toBeDefined();
        expect(template.usage_count).toBeDefined();
        expect(template.rating).toBeDefined();
        expect(template.difficulty).toBeDefined();
      });
    });

    test('should filter templates by type', async () => {
      const request = createMockRequest('http://localhost:3000/api/questionnaires/templates?type=assessment');
      const response = await getTemplates(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      data.data.templates.forEach((template: any) => {
        expect(template.type).toBe('assessment');
      });
    });
  });

  describe('GET /api/questionnaires/[id]/versions', () => {
    test('should return version history', async () => {
      const request = createMockRequest('http://localhost:3000/api/questionnaires/1/versions');
      const response = await getVersions(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.questionnaire_id).toBe(1);
      expect(data.data.current_version).toBeDefined();
      expect(data.data.versions).toBeInstanceOf(Array);
      expect(data.data.total_versions).toBeDefined();
    });
  });

  describe('POST /api/questionnaires/[id]/versions/[version]/restore', () => {
    test('should restore previous version', async () => {
      const request = createMockRequest('http://localhost:3000/api/questionnaires/1/versions/1/restore', {
        method: 'POST'
      });

      const response = await restoreVersion(request, { params: { id: '1', version: '1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.restored_from_version).toBe(1);
      expect(data.data.new_version).toBeGreaterThan(1);
    });

    test('should not restore to current version', async () => {
      const request = createMockRequest('http://localhost:3000/api/questionnaires/1/versions/2/restore', {
        method: 'POST'
      });

      const response = await restoreVersion(request, { params: { id: '1', version: '2' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Cannot restore to current version');
    });
  });

  describe('Feature Validation', () => {
    test('should validate all 8 questionnaire types are supported', async () => {
      const types = ['standard', 'assessment', 'screening', 'feedback', 'survey', 'clinical', 'research', 'educational'];
      
      for (const type of types) {
        const request = createMockRequest(`http://localhost:3000/api/questionnaires?type=${type}`);
        const response = await getQuestionnaires(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        // Should have at least one questionnaire of each type
        expect(data.data.questionnaires.length).toBeGreaterThan(0);
      }
    });

    test('should support all required filtering options', async () => {
      const filters = [
        'is_active=true',
        'is_public=false',
        'is_template=true',
        'category=mental_health',
        'search=anxiety'
      ];

      for (const filter of filters) {
        const request = createMockRequest(`http://localhost:3000/api/questionnaires?${filter}`);
        const response = await getQuestionnaires(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data.questionnaires).toBeInstanceOf(Array);
      }
    });
  });
});
