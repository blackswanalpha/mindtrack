/**
 * Unit Tests for Scoring Service
 * Tests database operations and business logic
 */

import { 
  ScoringService, 
  CreateScoringConfigData,
  UpdateScoringConfigData,
  CreateScoreCategoryData 
} from '@/lib/scoring/scoring-service'
import { ScoringConfiguration, ScoreResult } from '@/lib/scoring/scoring-engine'

describe('ScoringService', () => {
  let scoringService: ScoringService

  beforeEach(() => {
    scoringService = new ScoringService()
  })

  describe('Configuration Management', () => {
    const mockConfigData: CreateScoringConfigData = {
      questionnaire_id: 1,
      name: 'Test Configuration',
      description: 'Test scoring configuration',
      scoring_method: 'sum',
      max_score: 21,
      min_score: 0,
      visualization_type: 'gauge',
      is_active: true,
      is_default: true,
      rules: [
        {
          min_score: 0,
          max_score: 10,
          risk_level: 'low',
          label: 'Low Risk',
          color: '#10B981',
          actions: ['Monitor'],
          order_num: 1
        },
        {
          min_score: 11,
          max_score: 21,
          risk_level: 'high',
          label: 'High Risk',
          color: '#EF4444',
          actions: ['Intervene'],
          order_num: 2
        }
      ]
    }

    test('should create configuration successfully', async () => {
      const config = await scoringService.createConfiguration(mockConfigData, 'test-user')
      
      expect(config).toBeDefined()
      expect(config.name).toBe(mockConfigData.name)
      expect(config.questionnaire_id).toBe(mockConfigData.questionnaire_id)
      expect(config.scoring_method).toBe(mockConfigData.scoring_method)
      expect(config.is_default).toBe(true)
      expect(config.rules).toHaveLength(2)
      expect(config.created_by).toBe('test-user')
    })

    test('should retrieve configuration by ID', async () => {
      const created = await scoringService.createConfiguration(mockConfigData, 'test-user')
      const retrieved = await scoringService.getConfiguration(created.id)
      
      expect(retrieved).toEqual(created)
    })

    test('should return null for non-existent configuration', async () => {
      const retrieved = await scoringService.getConfiguration('non-existent')
      expect(retrieved).toBeNull()
    })

    test('should get configurations by questionnaire', async () => {
      const config1 = await scoringService.createConfiguration(mockConfigData, 'test-user')
      const config2 = await scoringService.createConfiguration({
        ...mockConfigData,
        name: 'Second Configuration',
        is_default: false
      }, 'test-user')

      const configs = await scoringService.getConfigurationsByQuestionnaire(1)
      
      expect(configs).toHaveLength(2)
      expect(configs.map(c => c.id)).toContain(config1.id)
      expect(configs.map(c => c.id)).toContain(config2.id)
    })

    test('should get default configuration', async () => {
      const config = await scoringService.createConfiguration(mockConfigData, 'test-user')
      const defaultConfig = await scoringService.getDefaultConfiguration(1)
      
      expect(defaultConfig).toEqual(config)
    })

    test('should update configuration', async () => {
      const created = await scoringService.createConfiguration(mockConfigData, 'test-user')
      
      const updateData: UpdateScoringConfigData = {
        id: created.id,
        name: 'Updated Configuration',
        description: 'Updated description'
      }

      const updated = await scoringService.updateConfiguration(updateData)
      
      expect(updated.name).toBe('Updated Configuration')
      expect(updated.description).toBe('Updated description')
      expect(updated.updated_at).not.toBe(created.updated_at)
    })

    test('should throw error when updating non-existent configuration', async () => {
      const updateData: UpdateScoringConfigData = {
        id: 'non-existent',
        name: 'Updated Configuration'
      }

      await expect(scoringService.updateConfiguration(updateData))
        .rejects.toThrow('Scoring configuration not found: non-existent')
    })

    test('should delete configuration', async () => {
      const created = await scoringService.createConfiguration(mockConfigData, 'test-user')
      
      const deleted = await scoringService.deleteConfiguration(created.id)
      expect(deleted).toBe(true)
      
      const retrieved = await scoringService.getConfiguration(created.id)
      expect(retrieved).toBeNull()
    })

    test('should return false when deleting non-existent configuration', async () => {
      const deleted = await scoringService.deleteConfiguration('non-existent')
      expect(deleted).toBe(false)
    })

    test('should set configuration as default', async () => {
      const config1 = await scoringService.createConfiguration(mockConfigData, 'test-user')
      const config2 = await scoringService.createConfiguration({
        ...mockConfigData,
        name: 'Second Configuration',
        is_default: false
      }, 'test-user')

      const updated = await scoringService.setDefaultConfiguration(config2.id)
      
      expect(updated.is_default).toBe(true)
      
      // Check that the first config is no longer default
      const config1Updated = await scoringService.getConfiguration(config1.id)
      expect(config1Updated?.is_default).toBe(false)
    })

    test('should unset other defaults when creating new default', async () => {
      const config1 = await scoringService.createConfiguration(mockConfigData, 'test-user')
      expect(config1.is_default).toBe(true)

      const config2 = await scoringService.createConfiguration({
        ...mockConfigData,
        name: 'Second Configuration',
        is_default: true
      }, 'test-user')

      expect(config2.is_default).toBe(true)
      
      // Check that the first config is no longer default
      const config1Updated = await scoringService.getConfiguration(config1.id)
      expect(config1Updated?.is_default).toBe(false)
    })
  })

  describe('Rule Management', () => {
    let configId: string

    beforeEach(async () => {
      const config = await scoringService.createConfiguration({
        questionnaire_id: 1,
        name: 'Test Configuration',
        scoring_method: 'sum',
        max_score: 21,
        min_score: 0,
        visualization_type: 'gauge',
        rules: []
      }, 'test-user')
      configId = config.id
    })

    test('should add rule to configuration', async () => {
      const ruleData = {
        min_score: 0,
        max_score: 10,
        risk_level: 'low' as const,
        label: 'Low Risk',
        color: '#10B981',
        actions: ['Monitor'],
        order_num: 1
      }

      const rule = await scoringService.addRule(configId, ruleData)
      
      expect(rule).toBeDefined()
      expect(rule.min_score).toBe(0)
      expect(rule.max_score).toBe(10)
      expect(rule.risk_level).toBe('low')
      expect(rule.label).toBe('Low Risk')
      
      const config = await scoringService.getConfiguration(configId)
      expect(config?.rules).toHaveLength(1)
      expect(config?.rules[0]).toEqual(rule)
    })

    test('should throw error when adding rule to non-existent configuration', async () => {
      const ruleData = {
        min_score: 0,
        max_score: 10,
        risk_level: 'low' as const,
        label: 'Low Risk',
        color: '#10B981',
        actions: ['Monitor'],
        order_num: 1
      }

      await expect(scoringService.addRule('non-existent', ruleData))
        .rejects.toThrow('Scoring configuration not found: non-existent')
    })

    test('should update rule', async () => {
      const rule = await scoringService.addRule(configId, {
        min_score: 0,
        max_score: 10,
        risk_level: 'low',
        label: 'Low Risk',
        color: '#10B981',
        actions: ['Monitor'],
        order_num: 1
      })

      const updatedRule = await scoringService.updateRule(configId, rule.id, {
        label: 'Updated Low Risk',
        actions: ['Monitor', 'Review']
      })

      expect(updatedRule.label).toBe('Updated Low Risk')
      expect(updatedRule.actions).toEqual(['Monitor', 'Review'])
    })

    test('should delete rule', async () => {
      const rule = await scoringService.addRule(configId, {
        min_score: 0,
        max_score: 10,
        risk_level: 'low',
        label: 'Low Risk',
        color: '#10B981',
        actions: ['Monitor'],
        order_num: 1
      })

      const deleted = await scoringService.deleteRule(configId, rule.id)
      expect(deleted).toBe(true)

      const config = await scoringService.getConfiguration(configId)
      expect(config?.rules).toHaveLength(0)
    })
  })

  describe('Category Management', () => {
    const mockCategoryData: CreateScoreCategoryData = {
      questionnaire_id: 1,
      name: 'Anxiety',
      description: 'Anxiety-related questions',
      weight: 1.5,
      color: '#3B82F6',
      order_num: 1,
      question_ids: [1, 2, 3]
    }

    test('should create category', async () => {
      const category = await scoringService.createCategory(mockCategoryData)
      
      expect(category).toBeDefined()
      expect(category.name).toBe(mockCategoryData.name)
      expect(category.questionnaire_id).toBe(mockCategoryData.questionnaire_id)
      expect(category.weight).toBe(mockCategoryData.weight)
      expect(category.question_ids).toEqual(mockCategoryData.question_ids)
    })

    test('should get categories for questionnaire', async () => {
      const category1 = await scoringService.createCategory(mockCategoryData)
      const category2 = await scoringService.createCategory({
        ...mockCategoryData,
        name: 'Depression',
        order_num: 2
      })

      const categories = await scoringService.getCategories(1)
      
      expect(categories).toHaveLength(2)
      expect(categories[0]).toEqual(category1) // Should be ordered by order_num
      expect(categories[1]).toEqual(category2)
    })
  })

  describe('Score Storage and Retrieval', () => {
    const mockScoreResult: ScoreResult = {
      response_id: 1,
      config_id: 'test-config',
      total_score: 15,
      normalized_score: 15,
      percentage: 71.4,
      risk_level: 'high',
      risk_label: 'High Risk',
      risk_color: '#EF4444',
      actions: ['Intervene'],
      visualization_data: {
        score: 15,
        max_score: 21,
        min_score: 0,
        risk_level: 'high',
        label: 'High Risk',
        visualization_type: 'gauge',
        percentage: 71.4,
        zones: []
      },
      calculated_at: '2024-01-01T12:00:00Z'
    }

    test('should store and retrieve score', async () => {
      const stored = await scoringService.storeScore(mockScoreResult)
      expect(stored).toEqual(mockScoreResult)

      const retrieved = await scoringService.getScore(1, 'test-config')
      expect(retrieved).toEqual(mockScoreResult)
    })

    test('should return null for non-existent score', async () => {
      const retrieved = await scoringService.getScore(999, 'non-existent')
      expect(retrieved).toBeNull()
    })

    test('should get scores for response', async () => {
      await scoringService.storeScore(mockScoreResult)
      await scoringService.storeScore({
        ...mockScoreResult,
        config_id: 'another-config'
      })

      const scores = await scoringService.getScoresForResponse(1)
      expect(scores).toHaveLength(2)
    })
  })

  describe('Analytics', () => {
    beforeEach(async () => {
      // Store some mock scores for analytics
      const scores: ScoreResult[] = [
        {
          response_id: 1,
          config_id: 'test-config',
          total_score: 5,
          normalized_score: 5,
          percentage: 23.8,
          risk_level: 'low',
          risk_label: 'Low Risk',
          risk_color: '#10B981',
          actions: [],
          visualization_data: {} as any,
          calculated_at: '2024-01-01T12:00:00Z'
        },
        {
          response_id: 2,
          config_id: 'test-config',
          total_score: 15,
          normalized_score: 15,
          percentage: 71.4,
          risk_level: 'high',
          risk_label: 'High Risk',
          risk_color: '#EF4444',
          actions: [],
          visualization_data: {} as any,
          calculated_at: '2024-01-01T13:00:00Z'
        },
        {
          response_id: 3,
          config_id: 'test-config',
          total_score: 8,
          normalized_score: 8,
          percentage: 38.1,
          risk_level: 'medium',
          risk_label: 'Medium Risk',
          risk_color: '#F59E0B',
          actions: [],
          visualization_data: {} as any,
          calculated_at: '2024-01-02T12:00:00Z'
        }
      ]

      for (const score of scores) {
        await scoringService.storeScore(score)
      }
    })

    test('should calculate analytics correctly', async () => {
      const analytics = await scoringService.getAnalytics(1)
      
      expect(analytics.total_scores).toBe(3)
      expect(analytics.average_score).toBeCloseTo(9.33, 2) // (5 + 15 + 8) / 3
      expect(analytics.risk_distribution.low).toBe(1)
      expect(analytics.risk_distribution.medium).toBe(1)
      expect(analytics.risk_distribution.high).toBe(1)
      expect(analytics.score_trends).toHaveLength(2) // 2 different dates
    })

    test('should return empty analytics for no scores', async () => {
      const analytics = await scoringService.getAnalytics(999) // Non-existent questionnaire
      
      expect(analytics.total_scores).toBe(0)
      expect(analytics.average_score).toBe(0)
      expect(analytics.score_trends).toHaveLength(0)
    })

    test('should filter analytics by config', async () => {
      // Add score with different config
      await scoringService.storeScore({
        response_id: 4,
        config_id: 'other-config',
        total_score: 20,
        normalized_score: 20,
        percentage: 95.2,
        risk_level: 'critical',
        risk_label: 'Critical Risk',
        risk_color: '#DC2626',
        actions: [],
        visualization_data: {} as any,
        calculated_at: '2024-01-01T14:00:00Z'
      })

      const analytics = await scoringService.getAnalytics(1, 'test-config')
      
      expect(analytics.total_scores).toBe(3) // Should not include the other-config score
    })
  })
})
