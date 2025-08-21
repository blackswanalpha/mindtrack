/**
 * Comprehensive Unit Tests for Scoring Engine
 * Tests all scoring methods, configurations, and edge cases
 */

import { 
  ScoringEngine, 
  ScoreCalculator, 
  ScoringConfiguration, 
  ScoringRule,
  ScoreResult 
} from '@/lib/scoring/scoring-engine'
import { Answer, Question, Response } from '@/types/database'

describe('ScoringEngine', () => {
  let scoringEngine: ScoringEngine
  let mockConfiguration: ScoringConfiguration
  let mockQuestions: Question[]
  let mockAnswers: Answer[]
  let mockResponse: Response

  beforeEach(() => {
    scoringEngine = new ScoringEngine()
    
    // Mock configuration for GAD-7
    mockConfiguration = {
      id: 'test-config',
      questionnaire_id: 1,
      name: 'Test GAD-7 Configuration',
      description: 'Test configuration for GAD-7',
      scoring_method: 'sum',
      max_score: 21,
      min_score: 0,
      visualization_type: 'gauge',
      is_active: true,
      is_default: true,
      rules: [
        {
          id: 'rule-1',
          min_score: 0,
          max_score: 4,
          risk_level: 'low',
          label: 'Minimal Anxiety',
          color: '#10B981',
          actions: ['No intervention needed'],
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        {
          id: 'rule-2',
          min_score: 5,
          max_score: 9,
          risk_level: 'medium',
          label: 'Mild Anxiety',
          color: '#F59E0B',
          actions: ['Consider counseling'],
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        {
          id: 'rule-3',
          min_score: 10,
          max_score: 14,
          risk_level: 'high',
          label: 'Moderate Anxiety',
          color: '#EF4444',
          actions: ['Recommend therapy'],
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        {
          id: 'rule-4',
          min_score: 15,
          max_score: 21,
          risk_level: 'critical',
          label: 'Severe Anxiety',
          color: '#DC2626',
          actions: ['Immediate attention required'],
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ],
      created_by: 'test-user',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }

    // Mock GAD-7 questions
    mockQuestions = Array.from({ length: 7 }, (_, i) => ({
      id: i + 1,
      questionnaire_id: 1,
      text: `GAD-7 Question ${i + 1}`,
      type: 'single_choice',
      required: true,
      order_num: i + 1,
      options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
      metadata: {
        scoring: {
          points: [0, 1, 2, 3]
        }
      },
      is_template: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }))

    // Mock response
    mockResponse = {
      id: 1,
      questionnaire_id: 1,
      user_id: null,
      organization_id: 1,
      status: 'completed',
      started_at: '2024-01-01T10:00:00Z',
      completed_at: '2024-01-01T10:15:00Z',
      created_at: '2024-01-01T10:00:00Z',
      updated_at: '2024-01-01T10:15:00Z'
    }

    // Mock answers for moderate anxiety (score = 12)
    mockAnswers = mockQuestions.map((question, index) => ({
      id: index + 1,
      response_id: 1,
      question_id: question.id,
      value: index < 4 ? 'More than half the days' : 'Several days', // Mix of 2s and 1s
      numeric_value: null,
      boolean_value: null,
      json_value: null,
      date_value: null,
      time_value: null,
      datetime_value: null,
      has_files: false,
      created_at: '2024-01-01T10:00:00Z',
      updated_at: '2024-01-01T10:00:00Z'
    }))

    scoringEngine.addConfiguration(mockConfiguration)
  })

  describe('Configuration Management', () => {
    test('should add and retrieve configuration', () => {
      const retrieved = scoringEngine.getConfiguration('test-config')
      expect(retrieved).toEqual(mockConfiguration)
    })

    test('should get default configuration for questionnaire', () => {
      const defaultConfig = scoringEngine.getDefaultConfiguration(1)
      expect(defaultConfig).toEqual(mockConfiguration)
    })

    test('should return undefined for non-existent configuration', () => {
      const retrieved = scoringEngine.getConfiguration('non-existent')
      expect(retrieved).toBeUndefined()
    })
  })

  describe('Configuration Validation', () => {
    test('should validate valid configuration', () => {
      const errors = scoringEngine.validateConfiguration(mockConfiguration)
      expect(errors).toHaveLength(0)
    })

    test('should detect missing name', () => {
      const invalidConfig = { ...mockConfiguration, name: '' }
      const errors = scoringEngine.validateConfiguration(invalidConfig)
      expect(errors).toContain('Configuration name is required')
    })

    test('should detect invalid score range', () => {
      const invalidConfig = { ...mockConfiguration, max_score: 5, min_score: 10 }
      const errors = scoringEngine.validateConfiguration(invalidConfig)
      expect(errors).toContain('Maximum score must be greater than minimum score')
    })

    test('should detect missing rules', () => {
      const invalidConfig = { ...mockConfiguration, rules: [] }
      const errors = scoringEngine.validateConfiguration(invalidConfig)
      expect(errors).toContain('At least one scoring rule is required')
    })

    test('should detect gaps in rule coverage', () => {
      const invalidConfig = {
        ...mockConfiguration,
        rules: [
          { ...mockConfiguration.rules[0], min_score: 0, max_score: 4 },
          { ...mockConfiguration.rules[1], min_score: 6, max_score: 10 } // Gap at score 5
        ]
      }
      const errors = scoringEngine.validateConfiguration(invalidConfig)
      expect(errors.some(error => error.includes('Gap found at score 5'))).toBe(true)
    })
  })

  describe('Score Calculation', () => {
    test('should calculate sum method correctly', () => {
      const result = scoringEngine.calculateScore(mockResponse, mockAnswers, mockQuestions, 'test-config')
      
      // Expected score: 4 questions with "More than half the days" (2 points) + 3 questions with "Several days" (1 point) = 11
      expect(result.total_score).toBe(11)
      expect(result.normalized_score).toBe(11)
      expect(result.risk_level).toBe('high')
      expect(result.risk_label).toBe('Moderate Anxiety')
    })

    test('should calculate average method correctly', () => {
      const avgConfig = {
        ...mockConfiguration,
        id: 'avg-config',
        scoring_method: 'average' as const
      }
      scoringEngine.addConfiguration(avgConfig)

      const result = scoringEngine.calculateScore(mockResponse, mockAnswers, mockQuestions, 'avg-config')
      
      // Expected average: 11 / 7 ≈ 1.57
      expect(result.total_score).toBeCloseTo(1.57, 1)
    })

    test('should calculate weighted method correctly', () => {
      const weightedConfig = {
        ...mockConfiguration,
        id: 'weighted-config',
        scoring_method: 'weighted' as const,
        weights: {
          'question_1': 2,
          'question_2': 2,
          'question_3': 1,
          'question_4': 1,
          'question_5': 1,
          'question_6': 1,
          'question_7': 1
        }
      }
      scoringEngine.addConfiguration(weightedConfig)

      const result = scoringEngine.calculateScore(mockResponse, mockAnswers, mockQuestions, 'weighted-config')
      
      // Weighted calculation should consider the weights
      expect(result.total_score).toBeGreaterThan(0)
      expect(result.normalized_score).toBeGreaterThan(0)
    })

    test('should calculate custom formula correctly', () => {
      const customConfig = {
        ...mockConfiguration,
        id: 'custom-config',
        scoring_method: 'custom' as const,
        formula: 'total * 2',
        formula_variables: {}
      }
      scoringEngine.addConfiguration(customConfig)

      const result = scoringEngine.calculateScore(mockResponse, mockAnswers, mockQuestions, 'custom-config')
      
      // Expected: 11 * 2 = 22, but clamped to max_score (21)
      expect(result.normalized_score).toBe(21)
    })

    test('should handle empty answers gracefully', () => {
      const result = scoringEngine.calculateScore(mockResponse, [], mockQuestions, 'test-config')
      
      expect(result.total_score).toBe(0)
      expect(result.normalized_score).toBe(0)
      expect(result.risk_level).toBe('low')
    })

    test('should throw error for non-existent configuration', () => {
      expect(() => {
        scoringEngine.calculateScore(mockResponse, mockAnswers, mockQuestions, 'non-existent')
      }).toThrow('Scoring configuration not found: non-existent')
    })
  })

  describe('Risk Level Determination', () => {
    test('should determine low risk correctly', () => {
      const lowAnswers = mockQuestions.map((question, index) => ({
        ...mockAnswers[index],
        value: 'Not at all' // 0 points each
      }))

      const result = scoringEngine.calculateScore(mockResponse, lowAnswers, mockQuestions, 'test-config')
      
      expect(result.total_score).toBe(0)
      expect(result.risk_level).toBe('low')
      expect(result.risk_label).toBe('Minimal Anxiety')
      expect(result.actions).toContain('No intervention needed')
    })

    test('should determine medium risk correctly', () => {
      const mediumAnswers = mockQuestions.map((question, index) => ({
        ...mockAnswers[index],
        value: 'Several days' // 1 point each, total = 7
      }))

      const result = scoringEngine.calculateScore(mockResponse, mediumAnswers, mockQuestions, 'test-config')
      
      expect(result.total_score).toBe(7)
      expect(result.risk_level).toBe('medium')
      expect(result.risk_label).toBe('Mild Anxiety')
    })

    test('should determine critical risk correctly', () => {
      const criticalAnswers = mockQuestions.map((question, index) => ({
        ...mockAnswers[index],
        value: 'Nearly every day' // 3 points each, total = 21
      }))

      const result = scoringEngine.calculateScore(mockResponse, criticalAnswers, mockQuestions, 'test-config')
      
      expect(result.total_score).toBe(21)
      expect(result.risk_level).toBe('critical')
      expect(result.risk_label).toBe('Severe Anxiety')
    })
  })

  describe('Visualization Data Generation', () => {
    test('should generate correct visualization data', () => {
      const result = scoringEngine.calculateScore(mockResponse, mockAnswers, mockQuestions, 'test-config')
      
      expect(result.visualization_data).toBeDefined()
      expect(result.visualization_data.score).toBe(result.normalized_score)
      expect(result.visualization_data.max_score).toBe(21)
      expect(result.visualization_data.min_score).toBe(0)
      expect(result.visualization_data.visualization_type).toBe('gauge')
      expect(result.visualization_data.zones).toHaveLength(4)
      expect(result.visualization_data.percentage).toBeCloseTo(52.38, 1) // 11/21 * 100
    })

    test('should generate correct zone data', () => {
      const result = scoringEngine.calculateScore(mockResponse, mockAnswers, mockQuestions, 'test-config')
      const zones = result.visualization_data.zones
      
      expect(zones[0]).toMatchObject({
        min: 0,
        max: expect.closeTo(19.05, 1), // 4/21 * 100
        color: '#10B981',
        label: 'Minimal Anxiety',
        risk_level: 'low'
      })
    })
  })

  describe('Edge Cases', () => {
    test('should handle questions without scoring metadata', () => {
      const questionsWithoutScoring = mockQuestions.map(q => ({
        ...q,
        metadata: undefined
      }))

      const result = scoringEngine.calculateScore(
        mockResponse, 
        mockAnswers, 
        questionsWithoutScoring, 
        'test-config'
      )
      
      // Should default to index-based scoring for single_choice
      expect(result.total_score).toBeGreaterThanOrEqual(0)
    })

    test('should handle numeric questions', () => {
      const numericQuestions = mockQuestions.map(q => ({
        ...q,
        type: 'rating' as const,
        options: undefined
      }))

      const numericAnswers = mockAnswers.map(a => ({
        ...a,
        value: null,
        numeric_value: 3
      }))

      const result = scoringEngine.calculateScore(
        mockResponse, 
        numericAnswers, 
        numericQuestions, 
        'test-config'
      )
      
      expect(result.total_score).toBe(21) // 7 questions * 3 points each
    })

    test('should handle boolean questions', () => {
      const booleanQuestions = mockQuestions.map(q => ({
        ...q,
        type: 'boolean' as const,
        options: undefined
      }))

      const booleanAnswers = mockAnswers.map(a => ({
        ...a,
        value: null,
        boolean_value: true
      }))

      const result = scoringEngine.calculateScore(
        mockResponse, 
        booleanAnswers, 
        booleanQuestions, 
        'test-config'
      )
      
      expect(result.total_score).toBe(7) // 7 questions * 1 point each (true)
    })

    test('should handle formula evaluation errors gracefully', () => {
      const invalidFormulaConfig = {
        ...mockConfiguration,
        id: 'invalid-formula-config',
        scoring_method: 'custom' as const,
        formula: 'invalid_variable + undefined_function()',
        formula_variables: {}
      }
      scoringEngine.addConfiguration(invalidFormulaConfig)

      const result = scoringEngine.calculateScore(
        mockResponse, 
        mockAnswers, 
        mockQuestions, 
        'invalid-formula-config'
      )
      
      // Should fallback to 0 on formula error
      expect(result.total_score).toBe(0)
      expect(result.normalized_score).toBe(0)
    })
  })
})

describe('ScoreCalculator', () => {
  let calculator: ScoreCalculator
  let mockConfiguration: ScoringConfiguration
  let mockQuestions: Question[]

  beforeEach(() => {
    mockConfiguration = {
      id: 'test-config',
      questionnaire_id: 1,
      name: 'Test Configuration',
      scoring_method: 'sum',
      max_score: 10,
      min_score: 0,
      visualization_type: 'gauge',
      is_active: true,
      is_default: true,
      rules: [
        {
          id: 'rule-1',
          min_score: 0,
          max_score: 5,
          risk_level: 'low',
          label: 'Low Risk',
          color: '#10B981',
          actions: ['Monitor'],
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        {
          id: 'rule-2',
          min_score: 6,
          max_score: 10,
          risk_level: 'high',
          label: 'High Risk',
          color: '#EF4444',
          actions: ['Intervene'],
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ],
      created_by: 'test-user',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }

    mockQuestions = [
      {
        id: 1,
        questionnaire_id: 1,
        text: 'Test Question',
        type: 'single_choice',
        required: true,
        order_num: 1,
        options: ['Option 1', 'Option 2', 'Option 3'],
        is_template: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ]

    calculator = new ScoreCalculator(mockConfiguration, mockQuestions)
  })

  test('should be instantiated correctly', () => {
    expect(calculator).toBeInstanceOf(ScoreCalculator)
  })

  test('should throw error for unsupported scoring method', () => {
    const invalidConfig = {
      ...mockConfiguration,
      scoring_method: 'unsupported' as any
    }
    
    const invalidCalculator = new ScoreCalculator(invalidConfig, mockQuestions)
    const mockResponse = { id: 1, questionnaire_id: 1 } as Response
    const mockAnswers: Answer[] = []

    expect(() => {
      invalidCalculator.calculate(mockResponse, mockAnswers)
    }).toThrow('Unsupported scoring method: unsupported')
  })
})
