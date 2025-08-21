-- Scoring System Database Schema for MindTrack
-- This schema supports comprehensive scoring configurations, rules, and analytics

-- Scoring Configurations Table
CREATE TABLE IF NOT EXISTS scoring_configs (
    id VARCHAR(255) PRIMARY KEY,
    questionnaire_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    scoring_method VARCHAR(50) NOT NULL CHECK (scoring_method IN ('sum', 'average', 'weighted', 'custom')),
    weights JSONB,
    formula TEXT,
    formula_variables JSONB,
    max_score DECIMAL(10,2) NOT NULL,
    min_score DECIMAL(10,2) NOT NULL DEFAULT 0,
    passing_score DECIMAL(10,2),
    visualization_type VARCHAR(50) NOT NULL CHECK (visualization_type IN ('gauge', 'bar', 'line', 'radar', 'pie', 'heatmap')),
    visualization_config JSONB,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_by_id INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints (assuming these tables exist)
    FOREIGN KEY (questionnaire_id) REFERENCES questionnaires(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Constraints
    CONSTRAINT scoring_configs_score_range CHECK (max_score > min_score),
    CONSTRAINT scoring_configs_passing_score CHECK (passing_score IS NULL OR (passing_score >= min_score AND passing_score <= max_score)),
    CONSTRAINT scoring_configs_unique_default UNIQUE (questionnaire_id, is_default) DEFERRABLE INITIALLY DEFERRED
);

-- Scoring Rules Table
CREATE TABLE IF NOT EXISTS scoring_rules (
    id VARCHAR(255) PRIMARY KEY,
    config_id VARCHAR(255) NOT NULL,
    min_score DECIMAL(10,2) NOT NULL,
    max_score DECIMAL(10,2) NOT NULL,
    risk_level VARCHAR(50) NOT NULL CHECK (risk_level IN ('none', 'low', 'medium', 'high', 'critical')),
    label VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7) NOT NULL, -- Hex color code
    actions JSONB NOT NULL DEFAULT '[]',
    order_num INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    FOREIGN KEY (config_id) REFERENCES scoring_configs(id) ON DELETE CASCADE,
    
    -- Constraints
    CONSTRAINT scoring_rules_score_range CHECK (max_score >= min_score),
    CONSTRAINT scoring_rules_color_format CHECK (color ~ '^#[0-9A-Fa-f]{6}$')
);

-- Score Categories Table
CREATE TABLE IF NOT EXISTS score_categories (
    id VARCHAR(255) PRIMARY KEY,
    questionnaire_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    weight DECIMAL(5,2) NOT NULL DEFAULT 1.0,
    color VARCHAR(7) NOT NULL,
    order_num INTEGER NOT NULL DEFAULT 0,
    question_ids JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    FOREIGN KEY (questionnaire_id) REFERENCES questionnaires(id) ON DELETE CASCADE,
    
    -- Constraints
    CONSTRAINT score_categories_weight_positive CHECK (weight > 0),
    CONSTRAINT score_categories_color_format CHECK (color ~ '^#[0-9A-Fa-f]{6}$')
);

-- Calculated Scores Table
CREATE TABLE IF NOT EXISTS calculated_scores (
    id VARCHAR(255) PRIMARY KEY,
    response_id INTEGER NOT NULL,
    config_id VARCHAR(255) NOT NULL,
    questionnaire_id INTEGER NOT NULL,
    total_score DECIMAL(10,2) NOT NULL,
    normalized_score DECIMAL(10,2) NOT NULL,
    percentage DECIMAL(5,2) NOT NULL,
    risk_level VARCHAR(50) NOT NULL CHECK (risk_level IN ('none', 'low', 'medium', 'high', 'critical')),
    risk_label VARCHAR(255) NOT NULL,
    risk_color VARCHAR(7) NOT NULL,
    actions JSONB NOT NULL DEFAULT '[]',
    category_scores JSONB,
    visualization_data JSONB NOT NULL,
    calculated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    FOREIGN KEY (response_id) REFERENCES responses(id) ON DELETE CASCADE,
    FOREIGN KEY (config_id) REFERENCES scoring_configs(id) ON DELETE CASCADE,
    FOREIGN KEY (questionnaire_id) REFERENCES questionnaires(id) ON DELETE CASCADE,
    
    -- Constraints
    CONSTRAINT calculated_scores_percentage_range CHECK (percentage >= 0 AND percentage <= 100),
    CONSTRAINT calculated_scores_color_format CHECK (risk_color ~ '^#[0-9A-Fa-f]{6}$')
);

-- Scoring Notifications Table (for automated alerts)
CREATE TABLE IF NOT EXISTS scoring_notifications (
    id VARCHAR(255) PRIMARY KEY,
    questionnaire_id INTEGER NOT NULL,
    config_id VARCHAR(255) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT true,
    risk_levels JSONB NOT NULL DEFAULT '[]',
    notification_methods JSONB NOT NULL DEFAULT '[]',
    recipients JSONB NOT NULL DEFAULT '[]',
    message_template TEXT,
    delay_minutes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    FOREIGN KEY (questionnaire_id) REFERENCES questionnaires(id) ON DELETE CASCADE,
    FOREIGN KEY (config_id) REFERENCES scoring_configs(id) ON DELETE CASCADE,
    
    -- Constraints
    CONSTRAINT scoring_notifications_delay_positive CHECK (delay_minutes >= 0)
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_scoring_configs_questionnaire ON scoring_configs(questionnaire_id);
CREATE INDEX IF NOT EXISTS idx_scoring_configs_active ON scoring_configs(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_scoring_configs_default ON scoring_configs(questionnaire_id, is_default) WHERE is_default = true;

CREATE INDEX IF NOT EXISTS idx_scoring_rules_config ON scoring_rules(config_id);
CREATE INDEX IF NOT EXISTS idx_scoring_rules_risk_level ON scoring_rules(risk_level);
CREATE INDEX IF NOT EXISTS idx_scoring_rules_order ON scoring_rules(config_id, order_num);

CREATE INDEX IF NOT EXISTS idx_score_categories_questionnaire ON score_categories(questionnaire_id);
CREATE INDEX IF NOT EXISTS idx_score_categories_order ON score_categories(questionnaire_id, order_num);

CREATE INDEX IF NOT EXISTS idx_calculated_scores_response ON calculated_scores(response_id);
CREATE INDEX IF NOT EXISTS idx_calculated_scores_config ON calculated_scores(config_id);
CREATE INDEX IF NOT EXISTS idx_calculated_scores_questionnaire ON calculated_scores(questionnaire_id);
CREATE INDEX IF NOT EXISTS idx_calculated_scores_risk_level ON calculated_scores(risk_level);
CREATE INDEX IF NOT EXISTS idx_calculated_scores_calculated_at ON calculated_scores(calculated_at);
CREATE INDEX IF NOT EXISTS idx_calculated_scores_composite ON calculated_scores(questionnaire_id, config_id, calculated_at);

CREATE INDEX IF NOT EXISTS idx_scoring_notifications_questionnaire ON scoring_notifications(questionnaire_id);
CREATE INDEX IF NOT EXISTS idx_scoring_notifications_config ON scoring_notifications(config_id);
CREATE INDEX IF NOT EXISTS idx_scoring_notifications_enabled ON scoring_notifications(enabled) WHERE enabled = true;

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_scoring_configs_updated_at BEFORE UPDATE ON scoring_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_scoring_rules_updated_at BEFORE UPDATE ON scoring_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_score_categories_updated_at BEFORE UPDATE ON score_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_calculated_scores_updated_at BEFORE UPDATE ON calculated_scores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_scoring_notifications_updated_at BEFORE UPDATE ON scoring_notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Views for common queries
CREATE OR REPLACE VIEW scoring_configs_with_rules AS
SELECT 
    sc.*,
    COALESCE(
        JSON_AGG(
            JSON_BUILD_OBJECT(
                'id', sr.id,
                'min_score', sr.min_score,
                'max_score', sr.max_score,
                'risk_level', sr.risk_level,
                'label', sr.label,
                'description', sr.description,
                'color', sr.color,
                'actions', sr.actions,
                'order_num', sr.order_num
            ) ORDER BY sr.order_num
        ) FILTER (WHERE sr.id IS NOT NULL),
        '[]'::json
    ) as rules
FROM scoring_configs sc
LEFT JOIN scoring_rules sr ON sc.id = sr.config_id
GROUP BY sc.id;

CREATE OR REPLACE VIEW scoring_analytics_summary AS
SELECT 
    cs.questionnaire_id,
    cs.config_id,
    COUNT(*) as total_scores,
    AVG(cs.normalized_score) as average_score,
    MIN(cs.normalized_score) as min_score,
    MAX(cs.normalized_score) as max_score,
    COUNT(*) FILTER (WHERE cs.risk_level = 'none') as none_count,
    COUNT(*) FILTER (WHERE cs.risk_level = 'low') as low_count,
    COUNT(*) FILTER (WHERE cs.risk_level = 'medium') as medium_count,
    COUNT(*) FILTER (WHERE cs.risk_level = 'high') as high_count,
    COUNT(*) FILTER (WHERE cs.risk_level = 'critical') as critical_count,
    COUNT(*) FILTER (WHERE cs.risk_level IN ('high', 'critical')) as high_risk_count,
    DATE_TRUNC('day', cs.calculated_at) as calculation_date
FROM calculated_scores cs
GROUP BY cs.questionnaire_id, cs.config_id, DATE_TRUNC('day', cs.calculated_at);

-- Sample data insertion (for development/testing)
-- This would typically be handled by the application, but included for reference

-- Insert sample scoring configuration for GAD-7
INSERT INTO scoring_configs (
    id, questionnaire_id, name, description, scoring_method, 
    max_score, min_score, visualization_type, is_default, created_by_id
) VALUES (
    'gad7_default_config', 1, 'GAD-7 Standard Scoring', 
    'Standard scoring configuration for GAD-7 questionnaire',
    'sum', 21, 0, 'gauge', true, 1
) ON CONFLICT (id) DO NOTHING;

-- Insert sample scoring rules for GAD-7
INSERT INTO scoring_rules (id, config_id, min_score, max_score, risk_level, label, color, actions, order_num) VALUES
('gad7_rule_1', 'gad7_default_config', 0, 4, 'low', 'Minimal Anxiety', '#10B981', '["No clinical intervention needed", "Continue monitoring"]', 1),
('gad7_rule_2', 'gad7_default_config', 5, 9, 'medium', 'Mild Anxiety', '#F59E0B', '["Consider counseling", "Lifestyle modifications"]', 2),
('gad7_rule_3', 'gad7_default_config', 10, 14, 'high', 'Moderate Anxiety', '#EF4444', '["Recommend therapy", "Consider medication evaluation"]', 3),
('gad7_rule_4', 'gad7_default_config', 15, 21, 'critical', 'Severe Anxiety', '#DC2626', '["Immediate clinical attention", "Comprehensive treatment plan"]', 4)
ON CONFLICT (id) DO NOTHING;
