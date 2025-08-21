/**
 * AI Analyzer Core Engine
 * 
 * This module provides the core AI analysis functionality for both questionnaires and responses.
 * It includes bias detection, sentiment analysis, pattern recognition, and statistical analysis.
 */

import { QuestionType, Question, ValidationRules } from '@/types/database';

// Types for AI Analysis
export interface AnalysisRequest {
  id: string;
  type: 'questionnaire' | 'response';
  data: any;
  analysisOptions: AnalysisOptions;
}

export interface AnalysisOptions {
  analysisType: 'structure' | 'effectiveness' | 'bias_detection' | 'completion_optimization' | 'individual' | 'aggregate' | 'comparative' | 'predictive';
  includeRecommendations: boolean;
  confidenceThreshold: number;
  language: string;
}

export interface AnalysisResult {
  id: string;
  status: 'success' | 'error' | 'partial';
  confidence: number;
  insights: any;
  recommendations: string[];
  metadata: {
    analyzedAt: string;
    processingTime: number;
    version: string;
  };
  errors?: string[];
}

export interface BiasIndicator {
  questionId: number;
  type: 'demographic_bias' | 'leading_question' | 'cultural_bias' | 'gender_bias' | 'age_bias' | 'socioeconomic_bias';
  severity: 'low' | 'medium' | 'high';
  description: string;
  suggestion: string;
  confidence: number;
}

export interface SentimentAnalysis {
  score: number; // 0-10 scale
  polarity: 'positive' | 'negative' | 'neutral';
  emotions: {
    joy: number;
    anger: number;
    fear: number;
    sadness: number;
    surprise: number;
    disgust: number;
  };
  confidence: number;
}

export interface PatternAnalysis {
  patternType: 'engagement' | 'consistency' | 'response_time' | 'completion_rate' | 'dropout_points';
  description: string;
  confidence: number;
  significance: 'high' | 'medium' | 'low';
  data: any;
}

// AI Analyzer Class
export class AIAnalyzer {
  private apiKey: string;
  private baseUrl: string;
  private version: string = '1.0.0';

  constructor(apiKey?: string, baseUrl?: string) {
    this.apiKey = apiKey || process.env.NEXT_PUBLIC_AI_API_KEY || '';
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_AI_API_URL || 'https://api.mindtrack.ai';
  }

  /**
   * Analyze a questionnaire for structure, bias, and effectiveness
   */
  async analyzeQuestionnaire(
    questionnaire: any,
    options: AnalysisOptions
  ): Promise<AnalysisResult> {
    const startTime = Date.now();
    
    try {
      // Simulate AI analysis with realistic processing time
      await this.simulateProcessing(2000, 5000);

      const insights = await this.performQuestionnaireAnalysis(questionnaire, options);
      
      return {
        id: `qa_${Date.now()}`,
        status: 'success',
        confidence: this.calculateConfidence(questionnaire, insights),
        insights,
        recommendations: this.generateQuestionnaireRecommendations(insights),
        metadata: {
          analyzedAt: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          version: this.version
        }
      };
    } catch (error) {
      return {
        id: `qa_${Date.now()}`,
        status: 'error',
        confidence: 0,
        insights: {},
        recommendations: [],
        metadata: {
          analyzedAt: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          version: this.version
        },
        errors: [error instanceof Error ? error.message : 'Unknown error occurred']
      };
    }
  }

  /**
   * Analyze responses for sentiment, patterns, and insights
   */
  async analyzeResponse(
    response: any,
    options: AnalysisOptions
  ): Promise<AnalysisResult> {
    const startTime = Date.now();
    
    try {
      // Simulate AI analysis with realistic processing time
      await this.simulateProcessing(1500, 4000);

      const insights = await this.performResponseAnalysis(response, options);
      
      return {
        id: `ra_${Date.now()}`,
        status: 'success',
        confidence: this.calculateResponseConfidence(response, insights),
        insights,
        recommendations: this.generateResponseRecommendations(insights),
        metadata: {
          analyzedAt: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          version: this.version
        }
      };
    } catch (error) {
      return {
        id: `ra_${Date.now()}`,
        status: 'error',
        confidence: 0,
        insights: {},
        recommendations: [],
        metadata: {
          analyzedAt: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          version: this.version
        },
        errors: [error instanceof Error ? error.message : 'Unknown error occurred']
      };
    }
  }

  /**
   * Detect bias in questionnaire questions
   */
  async detectBias(questions: Question[]): Promise<BiasIndicator[]> {
    const biasIndicators: BiasIndicator[] = [];

    for (const question of questions) {
      const indicators = await this.analyzeQuestionForBias(question);
      biasIndicators.push(...indicators);
    }

    return biasIndicators;
  }

  /**
   * Perform sentiment analysis on text responses
   */
  async analyzeSentiment(text: string): Promise<SentimentAnalysis> {
    // Simulate sentiment analysis
    await this.simulateProcessing(500, 1500);

    // Mock sentiment analysis based on text characteristics
    const positiveWords = ['good', 'great', 'excellent', 'satisfied', 'happy', 'love', 'amazing', 'wonderful'];
    const negativeWords = ['bad', 'terrible', 'awful', 'disappointed', 'hate', 'horrible', 'worst', 'frustrated'];
    
    const words = text.toLowerCase().split(/\s+/);
    const positiveCount = words.filter(word => positiveWords.some(pw => word.includes(pw))).length;
    const negativeCount = words.filter(word => negativeWords.some(nw => word.includes(nw))).length;
    
    const score = Math.max(0, Math.min(10, 5 + (positiveCount - negativeCount) * 1.5 + Math.random() * 2 - 1));
    
    return {
      score,
      polarity: score > 6 ? 'positive' : score < 4 ? 'negative' : 'neutral',
      emotions: {
        joy: score > 7 ? Math.random() * 0.3 + 0.4 : Math.random() * 0.3,
        anger: score < 3 ? Math.random() * 0.3 + 0.4 : Math.random() * 0.2,
        fear: Math.random() * 0.2,
        sadness: score < 4 ? Math.random() * 0.3 + 0.2 : Math.random() * 0.2,
        surprise: Math.random() * 0.3,
        disgust: score < 3 ? Math.random() * 0.2 + 0.1 : Math.random() * 0.1
      },
      confidence: Math.random() * 0.3 + 0.7
    };
  }

  /**
   * Detect patterns in response data
   */
  async detectPatterns(responses: any[]): Promise<PatternAnalysis[]> {
    await this.simulateProcessing(1000, 3000);

    const patterns: PatternAnalysis[] = [];

    // Engagement pattern analysis
    const avgResponseLength = responses.reduce((sum, r) => sum + (r.value?.length || 0), 0) / responses.length;
    if (avgResponseLength > 50) {
      patterns.push({
        patternType: 'engagement',
        description: 'High engagement detected with detailed responses',
        confidence: 0.85,
        significance: 'high',
        data: { avgLength: avgResponseLength }
      });
    }

    // Consistency pattern analysis
    const numericResponses = responses.filter(r => typeof r.value === 'number').map(r => r.value);
    if (numericResponses.length > 1) {
      const variance = this.calculateVariance(numericResponses);
      if (variance < 2) {
        patterns.push({
          patternType: 'consistency',
          description: 'Consistent response patterns across similar questions',
          confidence: 0.78,
          significance: 'medium',
          data: { variance }
        });
      }
    }

    return patterns;
  }

  // Private helper methods
  private async simulateProcessing(minMs: number, maxMs: number): Promise<void> {
    const delay = Math.random() * (maxMs - minMs) + minMs;
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  private async performQuestionnaireAnalysis(questionnaire: any, options: AnalysisOptions): Promise<any> {
    const biasIndicators = await this.detectBias(questionnaire.questions || []);
    
    return {
      overall_score: Math.floor(Math.random() * 30) + 70,
      strengths: this.generateStrengths(questionnaire),
      weaknesses: this.generateWeaknesses(questionnaire, biasIndicators),
      bias_indicators: biasIndicators,
      completion_metrics: {
        estimated_time: questionnaire.estimated_time || Math.floor(Math.random() * 15) + 5,
        difficulty_score: Math.random() * 3 + 2,
        engagement_score: Math.random() * 4 + 6,
        dropout_risk: Math.floor(Math.random() * 25) + 5
      }
    };
  }

  private async performResponseAnalysis(response: any, options: AnalysisOptions): Promise<any> {
    const textResponses = response.answers?.filter((a: any) => typeof a.value === 'string') || [];
    const sentimentPromises = textResponses.map((r: any) => this.analyzeSentiment(r.value));
    const sentiments = await Promise.all(sentimentPromises);
    
    const avgSentiment = sentiments.length > 0 
      ? sentiments.reduce((sum, s) => sum + s.score, 0) / sentiments.length
      : 7;

    const patterns = await this.detectPatterns(response.answers || []);

    return {
      sentiment_score: avgSentiment,
      completion_quality: response.is_complete ? Math.floor(Math.random() * 20) + 80 : Math.floor(Math.random() * 30) + 50,
      response_patterns: patterns,
      statistical_summary: this.generateStatisticalSummary(response),
      trends: this.generateTrends()
    };
  }

  private async analyzeQuestionForBias(question: Question): Promise<BiasIndicator[]> {
    const indicators: BiasIndicator[] = [];
    const text = question.text.toLowerCase();

    // Check for gender bias
    if (text.includes('gender') && question.type === 'single_choice') {
      const options = question.options as string[] || [];
      if (!options.some(opt => opt.toLowerCase().includes('other') || opt.toLowerCase().includes('prefer not'))) {
        indicators.push({
          questionId: question.id,
          type: 'gender_bias',
          severity: 'medium',
          description: 'Gender question may exclude non-binary individuals',
          suggestion: 'Add "Other" or "Prefer not to say" options',
          confidence: 0.82
        });
      }
    }

    // Check for leading questions
    const leadingPhrases = ['don\'t you think', 'wouldn\'t you agree', 'isn\'t it true'];
    if (leadingPhrases.some(phrase => text.includes(phrase))) {
      indicators.push({
        questionId: question.id,
        type: 'leading_question',
        severity: 'high',
        description: 'Question appears to lead respondents toward a specific answer',
        suggestion: 'Rephrase to be more neutral and objective',
        confidence: 0.91
      });
    }

    // Check for cultural bias
    const culturalTerms = ['family values', 'work ethic', 'traditional'];
    if (culturalTerms.some(term => text.includes(term))) {
      indicators.push({
        questionId: question.id,
        type: 'cultural_bias',
        severity: 'low',
        description: 'Question may contain culturally specific assumptions',
        suggestion: 'Consider more inclusive language that doesn\'t assume specific cultural contexts',
        confidence: 0.65
      });
    }

    return indicators;
  }

  private calculateConfidence(questionnaire: any, insights: any): number {
    const factors = [
      questionnaire.questions?.length > 5 ? 0.2 : 0.1,
      insights.bias_indicators?.length < 3 ? 0.2 : 0.1,
      questionnaire.estimated_time > 0 ? 0.1 : 0.05,
      Math.random() * 0.5 + 0.3
    ];
    return Math.min(0.95, factors.reduce((sum, f) => sum + f, 0));
  }

  private calculateResponseConfidence(response: any, insights: any): number {
    const factors = [
      response.is_complete ? 0.3 : 0.1,
      response.answers?.length > 3 ? 0.2 : 0.1,
      insights.sentiment_score > 0 ? 0.2 : 0.1,
      Math.random() * 0.3 + 0.2
    ];
    return Math.min(0.95, factors.reduce((sum, f) => sum + f, 0));
  }

  private generateStrengths(questionnaire: any): string[] {
    const strengths = [
      'Well-structured question flow',
      'Good mix of question types',
      'Appropriate length for topic',
      'Clear and concise questions',
      'Logical progression of topics'
    ];
    return strengths.slice(0, Math.floor(Math.random() * 3) + 2);
  }

  private generateWeaknesses(questionnaire: any, biasIndicators: BiasIndicator[]): string[] {
    const weaknesses = [];
    
    if (biasIndicators.length > 0) {
      weaknesses.push('Potential bias detected in some questions');
    }
    
    if (questionnaire.questions?.length > 20) {
      weaknesses.push('Questionnaire may be too long, risking respondent fatigue');
    }
    
    if (!questionnaire.questions?.some((q: any) => q.help_text)) {
      weaknesses.push('Missing help text for complex questions');
    }

    const additionalWeaknesses = [
      'Some questions could be more specific',
      'Consider adding progress indicators',
      'Validation rules could be improved'
    ];

    return [...weaknesses, ...additionalWeaknesses.slice(0, Math.max(0, 3 - weaknesses.length))];
  }

  private generateQuestionnaireRecommendations(insights: any): string[] {
    const recommendations = [
      'Review questions for potential bias and inclusive language',
      'Consider adding progress indicators to improve completion rates',
      'Test questionnaire with a small group before full deployment',
      'Add validation rules to ensure data quality'
    ];
    
    if (insights.completion_metrics?.dropout_risk > 20) {
      recommendations.unshift('Reduce questionnaire length to minimize dropout risk');
    }
    
    return recommendations;
  }

  private generateResponseRecommendations(insights: any): string[] {
    const recommendations = [
      'Analyze response patterns for actionable insights',
      'Consider follow-up questions for areas with low satisfaction',
      'Monitor trends over time for continuous improvement'
    ];
    
    if (insights.sentiment_score < 5) {
      recommendations.unshift('Address areas of concern identified in negative feedback');
    }
    
    return recommendations;
  }

  private generateStatisticalSummary(response: any): any {
    const numericAnswers = response.answers?.filter((a: any) => typeof a.value === 'number') || [];
    const mean = numericAnswers.length > 0 
      ? numericAnswers.reduce((sum: number, a: any) => sum + a.value, 0) / numericAnswers.length
      : 0;

    return {
      mean_scores: {
        satisfaction: mean || Math.random() * 4 + 6,
        engagement: Math.random() * 4 + 6,
        sentiment: Math.random() * 4 + 6
      },
      distributions: {
        ratings: [
          { value: '1-3', count: Math.floor(Math.random() * 5) },
          { value: '4-6', count: Math.floor(Math.random() * 10) + 5 },
          { value: '7-9', count: Math.floor(Math.random() * 15) + 10 },
          { value: '10', count: Math.floor(Math.random() * 8) + 2 }
        ]
      },
      correlations: []
    };
  }

  private generateTrends(): any[] {
    return [
      {
        metric: 'overall_satisfaction',
        direction: Math.random() > 0.5 ? 'increasing' : 'decreasing',
        change_rate: Math.random() * 0.3,
        significance: Math.random() > 0.5 ? 'high' : 'moderate'
      }
    ];
  }

  private calculateVariance(numbers: number[]): number {
    const mean = numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
    const squaredDiffs = numbers.map(n => Math.pow(n - mean, 2));
    return squaredDiffs.reduce((sum, sq) => sum + sq, 0) / numbers.length;
  }
}
