/**
 * Core Scoring Engine for MindTrack
 * Provides comprehensive scoring capabilities for mental health questionnaires
 */

import { Answer, Question, Response } from '@/types/database';

// Scoring method types
export type ScoringMethod = 'sum' | 'average' | 'weighted' | 'custom';

// Risk levels
export type RiskLevel = 'none' | 'low' | 'medium' | 'high' | 'critical';

// Visualization types
export type VisualizationType = 'gauge' | 'bar' | 'line' | 'radar' | 'pie' | 'heatmap';

// Scoring configuration interface
export interface ScoringConfiguration {
  id: string;
  questionnaire_id: number;
  name: string;
  description?: string;
  scoring_method: ScoringMethod;
  weights?: Record<string, number>;
  formula?: string;
  formula_variables?: Record<string, number>;
  max_score: number;
  min_score: number;
  passing_score?: number;
  visualization_type: VisualizationType;
  visualization_config?: Record<string, any>;
  is_active: boolean;
  is_default: boolean;
  rules: ScoringRule[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Scoring rule interface
export interface ScoringRule {
  id: string;
  min_score: number;
  max_score: number;
  risk_level: RiskLevel;
  label: string;
  description?: string;
  color: string;
  actions: string[];
  created_at: string;
  updated_at: string;
}

// Score category interface
export interface ScoreCategory {
  id: string;
  questionnaire_id: number;
  name: string;
  description?: string;
  weight: number;
  color: string;
  order: number;
  question_ids: number[];
}

// Calculated score result
export interface ScoreResult {
  response_id: number;
  config_id: string;
  total_score: number;
  normalized_score: number;
  percentage: number;
  risk_level: RiskLevel;
  risk_label: string;
  risk_color: string;
  actions: string[];
  category_scores?: Record<string, number>;
  visualization_data: VisualizationData;
  calculated_at: string;
}

// Visualization data
export interface VisualizationData {
  score: number;
  max_score: number;
  min_score: number;
  passing_score?: number;
  risk_level: RiskLevel;
  label: string;
  visualization_type: VisualizationType;
  percentage: number;
  zones: VisualizationZone[];
}

// Visualization zone
export interface VisualizationZone {
  min: number;
  max: number;
  color: string;
  label: string;
  risk_level: RiskLevel;
}

/**
 * Core Scoring Engine Class
 */
export class ScoringEngine {
  private configurations: Map<string, ScoringConfiguration> = new Map();
  private categories: Map<string, ScoreCategory> = new Map();

  /**
   * Add a scoring configuration
   */
  addConfiguration(config: ScoringConfiguration): void {
    this.configurations.set(config.id, config);
  }

  /**
   * Get scoring configuration by ID
   */
  getConfiguration(configId: string): ScoringConfiguration | undefined {
    return this.configurations.get(configId);
  }

  /**
   * Get default configuration for a questionnaire
   */
  getDefaultConfiguration(questionnaireId: number): ScoringConfiguration | undefined {
    for (const config of this.configurations.values()) {
      if (config.questionnaire_id === questionnaireId && config.is_default) {
        return config;
      }
    }
    return undefined;
  }

  /**
   * Calculate score for a response using specified configuration
   */
  calculateScore(
    response: Response,
    answers: Answer[],
    questions: Question[],
    configId: string
  ): ScoreResult {
    const config = this.getConfiguration(configId);
    if (!config) {
      throw new Error(`Scoring configuration not found: ${configId}`);
    }

    const calculator = new ScoreCalculator(config, questions);
    return calculator.calculate(response, answers);
  }

  /**
   * Calculate score using default configuration
   */
  calculateDefaultScore(
    response: Response,
    answers: Answer[],
    questions: Question[]
  ): ScoreResult {
    const config = this.getDefaultConfiguration(response.questionnaire_id);
    if (!config) {
      throw new Error(`No default scoring configuration found for questionnaire: ${response.questionnaire_id}`);
    }

    return this.calculateScore(response, answers, questions, config.id);
  }

  /**
   * Validate scoring configuration
   */
  validateConfiguration(config: ScoringConfiguration): string[] {
    const errors: string[] = [];

    if (!config.name?.trim()) {
      errors.push('Configuration name is required');
    }

    if (config.max_score <= config.min_score) {
      errors.push('Maximum score must be greater than minimum score');
    }

    if (config.passing_score !== undefined && 
        (config.passing_score < config.min_score || config.passing_score > config.max_score)) {
      errors.push('Passing score must be between minimum and maximum scores');
    }

    if (config.rules.length === 0) {
      errors.push('At least one scoring rule is required');
    }

    // Validate rules coverage
    const sortedRules = [...config.rules].sort((a, b) => a.min_score - b.min_score);
    let expectedMin = config.min_score;
    
    for (const rule of sortedRules) {
      if (rule.min_score !== expectedMin) {
        errors.push(`Scoring rules must cover all score ranges. Gap found at score ${expectedMin}`);
        break;
      }
      expectedMin = rule.max_score + 1;
    }

    if (expectedMin <= config.max_score) {
      errors.push(`Scoring rules must cover all score ranges. Missing coverage from ${expectedMin} to ${config.max_score}`);
    }

    return errors;
  }

  /**
   * Add score category
   */
  addCategory(category: ScoreCategory): void {
    this.categories.set(category.id, category);
  }

  /**
   * Get categories for questionnaire
   */
  getCategories(questionnaireId: number): ScoreCategory[] {
    return Array.from(this.categories.values())
      .filter(cat => cat.questionnaire_id === questionnaireId)
      .sort((a, b) => a.order - b.order);
  }
}

/**
 * Score Calculator Class
 */
export class ScoreCalculator {
  constructor(
    private config: ScoringConfiguration,
    private questions: Question[]
  ) {}

  /**
   * Calculate score for a response
   */
  calculate(response: Response, answers: Answer[]): ScoreResult {
    const answerMap = new Map(answers.map(a => [a.question_id, a]));
    let totalScore = 0;
    let categoryScores: Record<string, number> = {};

    switch (this.config.scoring_method) {
      case 'sum':
        totalScore = this.calculateSum(answerMap);
        break;
      case 'average':
        totalScore = this.calculateAverage(answerMap);
        break;
      case 'weighted':
        totalScore = this.calculateWeighted(answerMap);
        break;
      case 'custom':
        totalScore = this.calculateCustom(answerMap);
        break;
      default:
        throw new Error(`Unsupported scoring method: ${this.config.scoring_method}`);
    }

    // Normalize score to configuration range
    const normalizedScore = Math.max(this.config.min_score, 
      Math.min(this.config.max_score, Math.round(totalScore)));

    // Calculate percentage
    const percentage = ((normalizedScore - this.config.min_score) / 
      (this.config.max_score - this.config.min_score)) * 100;

    // Determine risk level and actions
    const riskInfo = this.determineRiskLevel(normalizedScore);

    // Generate visualization data
    const visualizationData = this.generateVisualizationData(normalizedScore, riskInfo);

    return {
      response_id: response.id,
      config_id: this.config.id,
      total_score: totalScore,
      normalized_score: normalizedScore,
      percentage: Math.round(percentage * 100) / 100,
      risk_level: riskInfo.risk_level,
      risk_label: riskInfo.label,
      risk_color: riskInfo.color,
      actions: riskInfo.actions,
      category_scores: Object.keys(categoryScores).length > 0 ? categoryScores : undefined,
      visualization_data: visualizationData,
      calculated_at: new Date().toISOString()
    };
  }

  /**
   * Calculate sum of all answer scores
   */
  private calculateSum(answerMap: Map<number, Answer>): number {
    let sum = 0;
    for (const question of this.questions) {
      const answer = answerMap.get(question.id);
      if (answer) {
        sum += this.getAnswerScore(question, answer);
      }
    }
    return sum;
  }

  /**
   * Calculate average of all answer scores
   */
  private calculateAverage(answerMap: Map<number, Answer>): number {
    const sum = this.calculateSum(answerMap);
    const count = Array.from(answerMap.values()).length;
    return count > 0 ? sum / count : 0;
  }

  /**
   * Calculate weighted sum of answer scores
   */
  private calculateWeighted(answerMap: Map<number, Answer>): number {
    let weightedSum = 0;
    let totalWeight = 0;

    for (const question of this.questions) {
      const answer = answerMap.get(question.id);
      if (answer) {
        const weight = this.config.weights?.[`question_${question.id}`] || 
                      this.config.weights?.[`q_${question.id}`] || 1;
        weightedSum += this.getAnswerScore(question, answer) * weight;
        totalWeight += weight;
      }
    }

    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }

  /**
   * Calculate score using custom formula
   */
  private calculateCustom(answerMap: Map<number, Answer>): number {
    if (!this.config.formula) {
      throw new Error('Custom formula is required for custom scoring method');
    }

    // Prepare variables for formula evaluation
    const variables: Record<string, number> = {
      total: this.calculateSum(answerMap),
      count: Array.from(answerMap.values()).length,
      average: this.calculateAverage(answerMap),
      ...this.config.formula_variables
    };

    // Add question-specific variables
    for (const question of this.questions) {
      const answer = answerMap.get(question.id);
      if (answer) {
        variables[`q_${question.id}`] = this.getAnswerScore(question, answer);
      }
    }

    // Evaluate formula (simplified implementation)
    return this.evaluateFormula(this.config.formula, variables);
  }

  /**
   * Get score for a specific answer
   */
  private getAnswerScore(question: Question, answer: Answer): number {
    // Handle different question types and scoring metadata
    if (question.metadata?.scoring) {
      const scoring = question.metadata.scoring;
      
      if (Array.isArray(scoring.points)) {
        // Use predefined points array
        const index = this.getAnswerIndex(question, answer);
        return scoring.points[index] || 0;
      }
      
      if (typeof scoring.points === 'number') {
        return scoring.points;
      }
    }

    // Default scoring based on question type
    switch (question.type) {
      case 'single_choice':
      case 'multiple_choice':
        return this.getChoiceScore(question, answer);
      case 'rating':
      case 'slider':
        return answer.numeric_value || 0;
      case 'boolean':
        return answer.boolean_value ? 1 : 0;
      case 'likert':
        return this.getLikertScore(question, answer);
      default:
        return 0;
    }
  }

  /**
   * Get answer index for choice questions
   */
  private getAnswerIndex(question: Question, answer: Answer): number {
    if (question.type === 'single_choice' && question.options && answer.value) {
      return question.options.indexOf(answer.value);
    }
    return 0;
  }

  /**
   * Get score for choice questions
   */
  private getChoiceScore(question: Question, answer: Answer): number {
    const index = this.getAnswerIndex(question, answer);
    return index >= 0 ? index : 0;
  }

  /**
   * Get score for Likert scale questions
   */
  private getLikertScore(question: Question, answer: Answer): number {
    if (answer.numeric_value !== null && answer.numeric_value !== undefined) {
      return answer.numeric_value;
    }
    
    // Convert text response to numeric if needed
    if (answer.value && question.options) {
      const index = question.options.indexOf(answer.value);
      return index >= 0 ? index : 0;
    }
    
    return 0;
  }

  /**
   * Determine risk level based on score
   */
  private determineRiskLevel(score: number): {
    risk_level: RiskLevel;
    label: string;
    color: string;
    actions: string[];
  } {
    for (const rule of this.config.rules) {
      if (score >= rule.min_score && score <= rule.max_score) {
        return {
          risk_level: rule.risk_level,
          label: rule.label,
          color: rule.color,
          actions: rule.actions
        };
      }
    }

    // Default fallback
    return {
      risk_level: 'none',
      label: 'No Risk Assessment',
      color: '#gray',
      actions: []
    };
  }

  /**
   * Generate visualization data
   */
  private generateVisualizationData(score: number, riskInfo: any): VisualizationData {
    const percentage = ((score - this.config.min_score) / 
      (this.config.max_score - this.config.min_score)) * 100;

    const zones: VisualizationZone[] = this.config.rules.map(rule => ({
      min: ((rule.min_score - this.config.min_score) / 
            (this.config.max_score - this.config.min_score)) * 100,
      max: ((rule.max_score - this.config.min_score) / 
            (this.config.max_score - this.config.min_score)) * 100,
      color: rule.color,
      label: rule.label,
      risk_level: rule.risk_level
    }));

    return {
      score,
      max_score: this.config.max_score,
      min_score: this.config.min_score,
      passing_score: this.config.passing_score,
      risk_level: riskInfo.risk_level,
      label: riskInfo.label,
      visualization_type: this.config.visualization_type,
      percentage: Math.round(percentage * 100) / 100,
      zones
    };
  }

  /**
   * Evaluate custom formula (simplified implementation)
   */
  private evaluateFormula(formula: string, variables: Record<string, number>): number {
    try {
      // Replace variables in formula
      let evaluableFormula = formula;
      for (const [key, value] of Object.entries(variables)) {
        evaluableFormula = evaluableFormula.replace(new RegExp(`\\b${key}\\b`, 'g'), value.toString());
      }

      // Basic math operations only (security consideration)
      const allowedChars = /^[0-9+\-*/.() ]+$/;
      if (!allowedChars.test(evaluableFormula)) {
        throw new Error('Invalid characters in formula');
      }

      // Evaluate using Function constructor (controlled environment)
      const result = new Function(`return ${evaluableFormula}`)();
      return typeof result === 'number' && !isNaN(result) ? result : 0;
    } catch (error) {
      console.error('Formula evaluation error:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const scoringEngine = new ScoringEngine();
