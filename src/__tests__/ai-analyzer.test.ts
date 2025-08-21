import { AIAnalyzer, AnalysisOptions } from '@/lib/ai-analyzer';

// Mock questionnaire data
const mockQuestionnaire = {
  id: 1,
  title: 'Employee Satisfaction Survey',
  description: 'Annual survey to measure employee satisfaction and engagement',
  type: 'survey',
  category: 'hr',
  estimated_time: 15,
  is_active: true,
  questions: [
    {
      id: 1,
      text: 'How satisfied are you with your current role?',
      type: 'rating',
      required: true,
      order_num: 1
    },
    {
      id: 2,
      text: 'What is your gender?',
      type: 'single_choice',
      required: false,
      order_num: 2,
      options: ['Male', 'Female']
    },
    {
      id: 3,
      text: "Don't you think our company culture is amazing?",
      type: 'boolean',
      required: true,
      order_num: 3
    },
    {
      id: 4,
      text: 'What improvements would you suggest?',
      type: 'textarea',
      required: false,
      order_num: 4
    }
  ],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

// Mock response data
const mockResponse = {
  id: 1,
  questionnaire_id: 1,
  questionnaire_title: 'Employee Satisfaction Survey',
  respondent_id: 'user-123',
  answers: [
    {
      question_id: 1,
      question_text: 'How satisfied are you with your current role?',
      question_type: 'rating',
      value: 8,
      submitted_at: new Date().toISOString()
    },
    {
      question_id: 2,
      question_text: 'What is your gender?',
      question_type: 'single_choice',
      value: 'Female',
      submitted_at: new Date().toISOString()
    },
    {
      question_id: 3,
      question_text: "Don't you think our company culture is amazing?",
      question_type: 'boolean',
      value: true,
      submitted_at: new Date().toISOString()
    },
    {
      question_id: 4,
      question_text: 'What improvements would you suggest?',
      question_type: 'textarea',
      value: 'I love working here! The team is amazing and the work is very fulfilling. Maybe we could have more flexible working hours.',
      submitted_at: new Date().toISOString()
    }
  ],
  completion_time: 420, // 7 minutes
  is_complete: true,
  submitted_at: new Date().toISOString()
};

describe('AIAnalyzer', () => {
  let analyzer: AIAnalyzer;

  beforeEach(() => {
    analyzer = new AIAnalyzer();
  });

  describe('Questionnaire Analysis', () => {
    it('should analyze questionnaire structure successfully', async () => {
      const options: AnalysisOptions = {
        analysisType: 'structure',
        includeRecommendations: true,
        confidenceThreshold: 0.7,
        language: 'en'
      };

      const result = await analyzer.analyzeQuestionnaire(mockQuestionnaire, options);

      expect(result.status).toBe('success');
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.insights).toBeDefined();
      expect(result.insights.overall_score).toBeGreaterThanOrEqual(0);
      expect(result.insights.overall_score).toBeLessThanOrEqual(100);
      expect(result.insights.strengths).toBeInstanceOf(Array);
      expect(result.insights.weaknesses).toBeInstanceOf(Array);
      expect(result.insights.bias_indicators).toBeInstanceOf(Array);
      expect(result.recommendations).toBeInstanceOf(Array);
      expect(result.metadata.analyzedAt).toBeDefined();
      expect(result.metadata.processingTime).toBeGreaterThan(0);
    });

    it('should detect bias in questionnaire questions', async () => {
      const biasIndicators = await analyzer.detectBias(mockQuestionnaire.questions);

      expect(biasIndicators).toBeInstanceOf(Array);
      
      // Should detect gender bias in question 2 (limited options)
      const genderBias = biasIndicators.find(bias => 
        bias.questionId === 2 && bias.type === 'gender_bias'
      );
      expect(genderBias).toBeDefined();
      expect(genderBias?.severity).toBe('medium');

      // Should detect leading question bias in question 3
      const leadingBias = biasIndicators.find(bias => 
        bias.questionId === 3 && bias.type === 'leading_question'
      );
      expect(leadingBias).toBeDefined();
      expect(leadingBias?.severity).toBe('high');
    });

    it('should generate appropriate recommendations', async () => {
      const options: AnalysisOptions = {
        analysisType: 'bias_detection',
        includeRecommendations: true,
        confidenceThreshold: 0.7,
        language: 'en'
      };

      const result = await analyzer.analyzeQuestionnaire(mockQuestionnaire, options);

      expect(result.recommendations).toBeInstanceOf(Array);
      expect(result.recommendations.length).toBeGreaterThan(0);
      // Check if any recommendation mentions bias
      const hasBiasRecommendation = result.recommendations.some(rec =>
        rec.toLowerCase().includes('bias')
      );
      expect(hasBiasRecommendation).toBe(true);
    });
  });

  describe('Response Analysis', () => {
    it('should analyze response successfully', async () => {
      const options: AnalysisOptions = {
        analysisType: 'individual',
        includeRecommendations: true,
        confidenceThreshold: 0.7,
        language: 'en'
      };

      const result = await analyzer.analyzeResponse(mockResponse, options);

      expect(result.status).toBe('success');
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.insights).toBeDefined();
      expect(result.insights.sentiment_score).toBeGreaterThanOrEqual(0);
      expect(result.insights.sentiment_score).toBeLessThanOrEqual(10);
      expect(result.insights.completion_quality).toBeGreaterThanOrEqual(0);
      expect(result.insights.completion_quality).toBeLessThanOrEqual(100);
      expect(result.insights.response_patterns).toBeInstanceOf(Array);
      expect(result.insights.statistical_summary).toBeDefined();
      expect(result.recommendations).toBeInstanceOf(Array);
    }, 10000); // Increase timeout to 10 seconds

    it('should perform sentiment analysis on text responses', async () => {
      const positiveText = 'I love working here! The team is amazing and the work is very fulfilling.';
      const negativeText = 'I hate this job. The work is terrible and the management is awful.';
      const neutralText = 'The work is okay. Some things are good, some could be better.';

      const positiveSentiment = await analyzer.analyzeSentiment(positiveText);
      const negativeSentiment = await analyzer.analyzeSentiment(negativeText);
      const neutralSentiment = await analyzer.analyzeSentiment(neutralText);

      expect(positiveSentiment.score).toBeGreaterThan(6);
      expect(positiveSentiment.polarity).toBe('positive');
      expect(positiveSentiment.confidence).toBeGreaterThan(0.5);

      expect(negativeSentiment.score).toBeLessThan(4);
      expect(negativeSentiment.polarity).toBe('negative');
      expect(negativeSentiment.confidence).toBeGreaterThan(0.5);

      expect(neutralSentiment.score).toBeGreaterThanOrEqual(3);
      expect(neutralSentiment.score).toBeLessThanOrEqual(7);
      expect(neutralSentiment.polarity).toBe('neutral');
    });

    it('should detect response patterns', async () => {
      const patterns = await analyzer.detectPatterns(mockResponse.answers);

      expect(patterns).toBeInstanceOf(Array);
      expect(patterns.length).toBeGreaterThanOrEqual(0);

      // If patterns are found, they should have the correct structure
      if (patterns.length > 0) {
        expect(patterns[0]).toHaveProperty('patternType');
        expect(patterns[0]).toHaveProperty('description');
        expect(patterns[0]).toHaveProperty('confidence');
        expect(patterns[0].confidence).toBeGreaterThan(0);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle analysis errors gracefully', async () => {
      const options: AnalysisOptions = {
        analysisType: 'structure',
        includeRecommendations: true,
        confidenceThreshold: 0.7,
        language: 'en'
      };

      // Test with invalid questionnaire data
      const result = await analyzer.analyzeQuestionnaire(null, options);

      expect(result.status).toBe('error');
      expect(result.confidence).toBe(0);
      expect(result.errors).toBeInstanceOf(Array);
      expect(result.errors!.length).toBeGreaterThan(0);
    });

    it('should handle empty response data', async () => {
      const options: AnalysisOptions = {
        analysisType: 'individual',
        includeRecommendations: true,
        confidenceThreshold: 0.7,
        language: 'en'
      };

      const emptyResponse = {
        ...mockResponse,
        answers: []
      };

      const result = await analyzer.analyzeResponse(emptyResponse, options);

      expect(result.status).toBe('success');
      expect(result.insights.response_patterns).toBeInstanceOf(Array);
    });
  });

  describe('Performance', () => {
    it('should complete analysis within reasonable time', async () => {
      const startTime = Date.now();
      
      const options: AnalysisOptions = {
        analysisType: 'structure',
        includeRecommendations: true,
        confidenceThreshold: 0.7,
        language: 'en'
      };

      await analyzer.analyzeQuestionnaire(mockQuestionnaire, options);
      
      const endTime = Date.now();
      const processingTime = endTime - startTime;

      // Should complete within 10 seconds (allowing for simulation delays)
      expect(processingTime).toBeLessThan(10000);
    });

    it('should provide processing time metadata', async () => {
      const options: AnalysisOptions = {
        analysisType: 'individual',
        includeRecommendations: true,
        confidenceThreshold: 0.7,
        language: 'en'
      };

      const result = await analyzer.analyzeResponse(mockResponse, options);

      expect(result.metadata.processingTime).toBeGreaterThan(0);
      expect(result.metadata.version).toBeDefined();
    }, 10000); // Increase timeout to 10 seconds
  });
});
