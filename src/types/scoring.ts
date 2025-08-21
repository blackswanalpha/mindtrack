/**
 * Scoring System Type Definitions
 * Enhanced types for the comprehensive scoring engine
 */

// Scoring method types
export type ScoringMethod = 'sum' | 'average' | 'weighted' | 'custom';

// Risk levels
export type RiskLevel = 'none' | 'low' | 'medium' | 'high' | 'critical';

// Visualization types
export type VisualizationType = 'gauge' | 'bar' | 'line' | 'radar' | 'pie' | 'heatmap';

// Enhanced Scoring Configuration
export interface EnhancedScoringConfig {
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
  rules: EnhancedScoringRule[];
  created_by_id: number;
  created_at: string;
  updated_at: string;
}

// Enhanced Scoring Rule
export interface EnhancedScoringRule {
  id: string;
  config_id: string;
  min_score: number;
  max_score: number;
  risk_level: RiskLevel;
  label: string;
  description?: string;
  color: string;
  actions: string[];
  order_num: number;
  created_at: string;
  updated_at: string;
}

// Score Category
export interface ScoreCategory {
  id: string;
  questionnaire_id: number;
  name: string;
  description?: string;
  weight: number;
  color: string;
  order_num: number;
  question_ids: number[];
  created_at: string;
  updated_at: string;
}

// Calculated Score
export interface CalculatedScore {
  id: string;
  response_id: number;
  config_id: string;
  questionnaire_id: number;
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
  created_at: string;
  updated_at: string;
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

// Scoring analytics
export interface ScoringAnalytics {
  total_scores: number;
  average_score: number;
  risk_distribution: Record<RiskLevel, number>;
  risk_percentage: Record<RiskLevel, number>;
  high_risk_count: number;
  trend_direction: 'up' | 'down' | 'stable' | 'insufficient_data';
  score_trends: Array<{
    date: string;
    average_score: number;
    total_responses: number;
  }>;
  category_performance?: Record<string, {
    average_score: number;
    total_responses: number;
  }>;
  last_updated: string;
}

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
  rules: Omit<EnhancedScoringRule, 'id' | 'config_id' | 'created_at' | 'updated_at'>[];
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
  order_num: number;
  question_ids: number[];
}

// Score calculation request
export interface ScoreCalculationRequest {
  response_id: number;
  config_id?: string; // If not provided, uses default config
  store_result?: boolean; // Whether to store the calculated score
}

// Score calculation response
export interface ScoreCalculationResponse {
  response_id: number;
  questionnaire_id: number;
  questionnaire_title: string;
  config_id: string;
  config_name: string;
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

// Scoring dashboard data
export interface ScoringDashboardData {
  questionnaire_id: number;
  questionnaire_title: string;
  configurations: EnhancedScoringConfig[];
  default_config?: EnhancedScoringConfig;
  recent_scores: CalculatedScore[];
  analytics: ScoringAnalytics;
  categories: ScoreCategory[];
}

// Scoring comparison data
export interface ScoringComparison {
  config_a: {
    id: string;
    name: string;
    scores: CalculatedScore[];
    analytics: ScoringAnalytics;
  };
  config_b: {
    id: string;
    name: string;
    scores: CalculatedScore[];
    analytics: ScoringAnalytics;
  };
  comparison_metrics: {
    correlation: number;
    average_difference: number;
    risk_agreement_percentage: number;
  };
}

// Scoring validation result
export interface ScoringValidationResult {
  is_valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

// Scoring export options
export interface ScoringExportOptions {
  format: 'csv' | 'xlsx' | 'json' | 'pdf';
  include_visualization: boolean;
  include_analytics: boolean;
  date_range?: {
    from: string;
    to: string;
  };
  questionnaire_ids?: number[];
  config_ids?: string[];
  risk_levels?: RiskLevel[];
}

// Scoring import data
export interface ScoringImportData {
  configurations: CreateScoringConfigData[];
  categories?: CreateScoreCategoryData[];
  validate_before_import: boolean;
  overwrite_existing: boolean;
}

// Scoring notification settings
export interface ScoringNotificationSettings {
  id: string;
  questionnaire_id: number;
  config_id: string;
  enabled: boolean;
  risk_levels: RiskLevel[];
  notification_methods: ('email' | 'sms' | 'push' | 'webhook')[];
  recipients: string[];
  message_template?: string;
  delay_minutes?: number;
  created_at: string;
  updated_at: string;
}
