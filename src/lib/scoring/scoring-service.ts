/**
 * Scoring Service for MindTrack
 * Handles database operations and business logic for scoring configurations
 */

import { 
  ScoringConfiguration, 
  ScoringRule, 
  ScoreCategory, 
  ScoreResult,
  ScoringMethod,
  RiskLevel,
  VisualizationType 
} from './scoring-engine';
import { Answer, Question, Response } from '@/types/database';

// Create scoring configuration data
export interface CreateScoringConfigData {
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
  is_active?: boolean;
  is_default?: boolean;
  rules: Omit<ScoringRule, 'id' | 'created_at' | 'updated_at'>[];
}

// Update scoring configuration data
export interface UpdateScoringConfigData extends Partial<CreateScoringConfigData> {
  id: string;
}

// Create score category data
export interface CreateScoreCategoryData {
  questionnaire_id: number;
  name: string;
  description?: string;
  weight: number;
  color: string;
  order: number;
  question_ids: number[];
}

// Scoring analytics data
export interface ScoringAnalytics {
  total_scores: number;
  average_score: number;
  risk_distribution: Record<RiskLevel, number>;
  score_trends: Array<{
    date: string;
    average_score: number;
    total_responses: number;
  }>;
  category_performance?: Record<string, {
    average_score: number;
    total_responses: number;
  }>;
}

/**
 * Scoring Service Class
 */
export class ScoringService {
  // In-memory storage for development (replace with database operations)
  private configurations: Map<string, ScoringConfiguration> = new Map();
  private categories: Map<string, ScoreCategory> = new Map();
  private calculatedScores: Map<string, ScoreResult> = new Map();

  /**
   * Create a new scoring configuration
   */
  async createConfiguration(data: CreateScoringConfigData, createdBy: string): Promise<ScoringConfiguration> {
    const id = this.generateId();
    const now = new Date().toISOString();

    // If this is set as default, unset other defaults for the same questionnaire
    if (data.is_default) {
      await this.unsetDefaultConfigurations(data.questionnaire_id);
    }

    const rules: ScoringRule[] = data.rules.map(rule => ({
      ...rule,
      id: this.generateId(),
      created_at: now,
      updated_at: now
    }));

    const configuration: ScoringConfiguration = {
      id,
      questionnaire_id: data.questionnaire_id,
      name: data.name,
      description: data.description,
      scoring_method: data.scoring_method,
      weights: data.weights,
      formula: data.formula,
      formula_variables: data.formula_variables,
      max_score: data.max_score,
      min_score: data.min_score,
      passing_score: data.passing_score,
      visualization_type: data.visualization_type,
      visualization_config: data.visualization_config,
      is_active: data.is_active ?? true,
      is_default: data.is_default ?? false,
      rules,
      created_by: createdBy,
      created_at: now,
      updated_at: now
    };

    this.configurations.set(id, configuration);
    return configuration;
  }

  /**
   * Get scoring configuration by ID
   */
  async getConfiguration(id: string): Promise<ScoringConfiguration | null> {
    return this.configurations.get(id) || null;
  }

  /**
   * Get all configurations for a questionnaire
   */
  async getConfigurationsByQuestionnaire(questionnaireId: number): Promise<ScoringConfiguration[]> {
    return Array.from(this.configurations.values())
      .filter(config => config.questionnaire_id === questionnaireId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  /**
   * Get default configuration for a questionnaire
   */
  async getDefaultConfiguration(questionnaireId: number): Promise<ScoringConfiguration | null> {
    const configs = await this.getConfigurationsByQuestionnaire(questionnaireId);
    return configs.find(config => config.is_default) || null;
  }

  /**
   * Update scoring configuration
   */
  async updateConfiguration(data: UpdateScoringConfigData): Promise<ScoringConfiguration> {
    const existing = this.configurations.get(data.id);
    if (!existing) {
      throw new Error(`Scoring configuration not found: ${data.id}`);
    }

    // If this is being set as default, unset other defaults
    if (data.is_default && !existing.is_default) {
      await this.unsetDefaultConfigurations(existing.questionnaire_id);
    }

    const updated: ScoringConfiguration = {
      ...existing,
      ...data,
      updated_at: new Date().toISOString()
    };

    this.configurations.set(data.id, updated);
    return updated;
  }

  /**
   * Delete scoring configuration
   */
  async deleteConfiguration(id: string): Promise<boolean> {
    return this.configurations.delete(id);
  }

  /**
   * Set configuration as default
   */
  async setDefaultConfiguration(id: string): Promise<ScoringConfiguration> {
    const config = this.configurations.get(id);
    if (!config) {
      throw new Error(`Scoring configuration not found: ${id}`);
    }

    // Unset other defaults for the same questionnaire
    await this.unsetDefaultConfigurations(config.questionnaire_id);

    // Set this as default
    const updated = {
      ...config,
      is_default: true,
      updated_at: new Date().toISOString()
    };

    this.configurations.set(id, updated);
    return updated;
  }

  /**
   * Unset default configurations for a questionnaire
   */
  private async unsetDefaultConfigurations(questionnaireId: number): Promise<void> {
    for (const [id, config] of this.configurations.entries()) {
      if (config.questionnaire_id === questionnaireId && config.is_default) {
        this.configurations.set(id, {
          ...config,
          is_default: false,
          updated_at: new Date().toISOString()
        });
      }
    }
  }

  /**
   * Add scoring rule to configuration
   */
  async addRule(configId: string, ruleData: Omit<ScoringRule, 'id' | 'created_at' | 'updated_at'>): Promise<ScoringRule> {
    const config = this.configurations.get(configId);
    if (!config) {
      throw new Error(`Scoring configuration not found: ${configId}`);
    }

    const rule: ScoringRule = {
      ...ruleData,
      id: this.generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const updatedConfig = {
      ...config,
      rules: [...config.rules, rule],
      updated_at: new Date().toISOString()
    };

    this.configurations.set(configId, updatedConfig);
    return rule;
  }

  /**
   * Update scoring rule
   */
  async updateRule(configId: string, ruleId: string, ruleData: Partial<ScoringRule>): Promise<ScoringRule> {
    const config = this.configurations.get(configId);
    if (!config) {
      throw new Error(`Scoring configuration not found: ${configId}`);
    }

    const ruleIndex = config.rules.findIndex(rule => rule.id === ruleId);
    if (ruleIndex === -1) {
      throw new Error(`Scoring rule not found: ${ruleId}`);
    }

    const updatedRule = {
      ...config.rules[ruleIndex],
      ...ruleData,
      updated_at: new Date().toISOString()
    };

    const updatedRules = [...config.rules];
    updatedRules[ruleIndex] = updatedRule;

    const updatedConfig = {
      ...config,
      rules: updatedRules,
      updated_at: new Date().toISOString()
    };

    this.configurations.set(configId, updatedConfig);
    return updatedRule;
  }

  /**
   * Delete scoring rule
   */
  async deleteRule(configId: string, ruleId: string): Promise<boolean> {
    const config = this.configurations.get(configId);
    if (!config) {
      throw new Error(`Scoring configuration not found: ${configId}`);
    }

    const updatedRules = config.rules.filter(rule => rule.id !== ruleId);
    if (updatedRules.length === config.rules.length) {
      return false; // Rule not found
    }

    const updatedConfig = {
      ...config,
      rules: updatedRules,
      updated_at: new Date().toISOString()
    };

    this.configurations.set(configId, updatedConfig);
    return true;
  }

  /**
   * Create score category
   */
  async createCategory(data: CreateScoreCategoryData): Promise<ScoreCategory> {
    const id = this.generateId();
    const category: ScoreCategory = {
      id,
      ...data
    };

    this.categories.set(id, category);
    return category;
  }

  /**
   * Get categories for questionnaire
   */
  async getCategories(questionnaireId: number): Promise<ScoreCategory[]> {
    return Array.from(this.categories.values())
      .filter(cat => cat.questionnaire_id === questionnaireId)
      .sort((a, b) => a.order - b.order);
  }

  /**
   * Store calculated score
   */
  async storeScore(score: ScoreResult): Promise<ScoreResult> {
    const key = `${score.response_id}_${score.config_id}`;
    this.calculatedScores.set(key, score);
    return score;
  }

  /**
   * Get calculated score
   */
  async getScore(responseId: number, configId: string): Promise<ScoreResult | null> {
    const key = `${responseId}_${configId}`;
    return this.calculatedScores.get(key) || null;
  }

  /**
   * Get scores for response (all configurations)
   */
  async getScoresForResponse(responseId: number): Promise<ScoreResult[]> {
    return Array.from(this.calculatedScores.values())
      .filter(score => score.response_id === responseId);
  }

  /**
   * Get scoring analytics for questionnaire
   */
  async getAnalytics(questionnaireId: number, configId?: string): Promise<ScoringAnalytics> {
    const scores = Array.from(this.calculatedScores.values())
      .filter(score => {
        // Filter by config if specified
        if (configId && score.config_id !== configId) {
          return false;
        }
        // TODO: Add questionnaire_id filtering when available in ScoreResult
        return true;
      });

    if (scores.length === 0) {
      return {
        total_scores: 0,
        average_score: 0,
        risk_distribution: {
          none: 0,
          low: 0,
          medium: 0,
          high: 0,
          critical: 0
        },
        score_trends: []
      };
    }

    const totalScores = scores.length;
    const averageScore = scores.reduce((sum, score) => sum + score.normalized_score, 0) / totalScores;

    // Calculate risk distribution
    const riskDistribution: Record<RiskLevel, number> = {
      none: 0,
      low: 0,
      medium: 0,
      high: 0,
      critical: 0
    };

    scores.forEach(score => {
      riskDistribution[score.risk_level]++;
    });

    // Calculate score trends (simplified - group by date)
    const trendMap = new Map<string, { total: number; count: number }>();
    scores.forEach(score => {
      const date = score.calculated_at.split('T')[0]; // Get date part
      const existing = trendMap.get(date) || { total: 0, count: 0 };
      trendMap.set(date, {
        total: existing.total + score.normalized_score,
        count: existing.count + 1
      });
    });

    const scoreTrends = Array.from(trendMap.entries())
      .map(([date, data]) => ({
        date,
        average_score: data.total / data.count,
        total_responses: data.count
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      total_scores: totalScores,
      average_score: Math.round(averageScore * 100) / 100,
      risk_distribution: riskDistribution,
      score_trends: scoreTrends
    };
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `scoring_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const scoringService = new ScoringService();

// Initialize with some default configurations for common questionnaire types
export async function initializeDefaultConfigurations(): Promise<void> {
  // GAD-7 Default Configuration
  await scoringService.createConfiguration({
    questionnaire_id: 1, // Assuming GAD-7 has ID 1
    name: 'GAD-7 Standard Scoring',
    description: 'Standard scoring for Generalized Anxiety Disorder 7-item scale',
    scoring_method: 'sum',
    max_score: 21,
    min_score: 0,
    visualization_type: 'gauge',
    is_default: true,
    rules: [
      {
        min_score: 0,
        max_score: 4,
        risk_level: 'low',
        label: 'Minimal Anxiety',
        description: 'Minimal anxiety symptoms',
        color: '#10B981',
        actions: ['No clinical intervention needed', 'Continue monitoring']
      },
      {
        min_score: 5,
        max_score: 9,
        risk_level: 'medium',
        label: 'Mild Anxiety',
        description: 'Mild anxiety symptoms',
        color: '#F59E0B',
        actions: ['Consider counseling', 'Lifestyle modifications', 'Follow-up in 2-4 weeks']
      },
      {
        min_score: 10,
        max_score: 14,
        risk_level: 'high',
        label: 'Moderate Anxiety',
        description: 'Moderate anxiety symptoms',
        color: '#EF4444',
        actions: ['Recommend therapy', 'Consider medication evaluation', 'Weekly follow-up']
      },
      {
        min_score: 15,
        max_score: 21,
        risk_level: 'critical',
        label: 'Severe Anxiety',
        description: 'Severe anxiety symptoms',
        color: '#DC2626',
        actions: ['Immediate clinical attention', 'Comprehensive treatment plan', 'Daily monitoring']
      }
    ]
  }, 'system');

  // PHQ-9 Default Configuration
  await scoringService.createConfiguration({
    questionnaire_id: 2, // Assuming PHQ-9 has ID 2
    name: 'PHQ-9 Standard Scoring',
    description: 'Standard scoring for Patient Health Questionnaire-9',
    scoring_method: 'sum',
    max_score: 27,
    min_score: 0,
    visualization_type: 'gauge',
    is_default: true,
    rules: [
      {
        min_score: 0,
        max_score: 4,
        risk_level: 'low',
        label: 'Minimal Depression',
        description: 'Minimal depressive symptoms',
        color: '#10B981',
        actions: ['No clinical intervention needed', 'Continue monitoring']
      },
      {
        min_score: 5,
        max_score: 9,
        risk_level: 'medium',
        label: 'Mild Depression',
        description: 'Mild depressive symptoms',
        color: '#F59E0B',
        actions: ['Consider counseling', 'Lifestyle modifications', 'Follow-up in 2-4 weeks']
      },
      {
        min_score: 10,
        max_score: 14,
        risk_level: 'high',
        label: 'Moderate Depression',
        description: 'Moderate depressive symptoms',
        color: '#EF4444',
        actions: ['Recommend therapy', 'Consider medication evaluation', 'Weekly follow-up']
      },
      {
        min_score: 15,
        max_score: 19,
        risk_level: 'critical',
        label: 'Moderately Severe Depression',
        description: 'Moderately severe depressive symptoms',
        color: '#DC2626',
        actions: ['Immediate clinical attention', 'Comprehensive treatment plan', 'Frequent monitoring']
      },
      {
        min_score: 20,
        max_score: 27,
        risk_level: 'critical',
        label: 'Severe Depression',
        description: 'Severe depressive symptoms',
        color: '#991B1B',
        actions: ['Urgent clinical attention', 'Intensive treatment plan', 'Daily monitoring', 'Safety assessment']
      }
    ]
  }, 'system');
}
