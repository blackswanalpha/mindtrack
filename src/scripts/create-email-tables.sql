-- Email management system database tables

-- Enhanced email_templates table (if not exists or needs updates)
CREATE TABLE IF NOT EXISTS email_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    body TEXT NOT NULL,
    html_content TEXT,
    variables JSONB DEFAULT '{}',
    category VARCHAR(50) DEFAULT 'system',
    type VARCHAR(50) DEFAULT 'custom',
    is_active BOOLEAN DEFAULT true,
    organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
    created_by_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Enhanced email_logs table (if not exists or needs updates)
CREATE TABLE IF NOT EXISTS email_logs (
    id SERIAL PRIMARY KEY,
    template_id INTEGER REFERENCES email_templates(id) ON DELETE SET NULL,
    recipient VARCHAR(255) NOT NULL,
    cc_recipients TEXT,
    bcc_recipients TEXT,
    subject VARCHAR(500) NOT NULL,
    body TEXT NOT NULL,
    html_body TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    error TEXT,
    sent_by_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    organization_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL,
    response_id INTEGER REFERENCES responses(id) ON DELETE SET NULL,
    metadata JSONB,
    sent_at TIMESTAMP DEFAULT NOW(),
    delivered_at TIMESTAMP,
    opened_at TIMESTAMP,
    clicked_at TIMESTAMP,
    bounced_at TIMESTAMP
);

-- Email automation rules table
CREATE TABLE IF NOT EXISTS email_automations (
    id SERIAL PRIMARY KEY,
    trigger_type VARCHAR(100) NOT NULL,
    template_type VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    delay_minutes INTEGER DEFAULT 0,
    conditions JSONB,
    organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
    questionnaire_id INTEGER REFERENCES questionnaires(id) ON DELETE CASCADE,
    created_by_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Scheduled emails table
CREATE TABLE IF NOT EXISTS scheduled_emails (
    id SERIAL PRIMARY KEY,
    automation_id INTEGER REFERENCES email_automations(id) ON DELETE CASCADE,
    template_type VARCHAR(100) NOT NULL,
    recipient_email VARCHAR(255) NOT NULL,
    variables JSONB DEFAULT '{}',
    context_data JSONB DEFAULT '{}',
    scheduled_for TIMESTAMP NOT NULL,
    sent_at TIMESTAMP,
    email_log_id INTEGER REFERENCES email_logs(id) ON DELETE SET NULL,
    error TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Email campaigns table (for bulk emails)
CREATE TABLE IF NOT EXISTS email_campaigns (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    template_id INTEGER REFERENCES email_templates(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'draft',
    scheduled_for TIMESTAMP,
    sent_at TIMESTAMP,
    total_recipients INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    delivered_count INTEGER DEFAULT 0,
    opened_count INTEGER DEFAULT 0,
    clicked_count INTEGER DEFAULT 0,
    bounced_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
    created_by_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Email campaign recipients table
CREATE TABLE IF NOT EXISTS email_campaign_recipients (
    id SERIAL PRIMARY KEY,
    campaign_id INTEGER NOT NULL REFERENCES email_campaigns(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    variables JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'pending',
    email_log_id INTEGER REFERENCES email_logs(id) ON DELETE SET NULL,
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    opened_at TIMESTAMP,
    clicked_at TIMESTAMP,
    bounced_at TIMESTAMP,
    error TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Email unsubscribes table
CREATE TABLE IF NOT EXISTS email_unsubscribes (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    reason VARCHAR(255),
    organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
    unsubscribed_at TIMESTAMP DEFAULT NOW(),
    ip_address VARCHAR(50),
    user_agent TEXT
);

-- Email tracking table (for detailed analytics)
CREATE TABLE IF NOT EXISTS email_tracking (
    id SERIAL PRIMARY KEY,
    email_log_id INTEGER NOT NULL REFERENCES email_logs(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'complained'
    event_data JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_email_templates_type ON email_templates(type);
CREATE INDEX IF NOT EXISTS idx_email_templates_category ON email_templates(category);
CREATE INDEX IF NOT EXISTS idx_email_templates_organization ON email_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_email_templates_active ON email_templates(is_active);

CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON email_logs(recipient);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at);
CREATE INDEX IF NOT EXISTS idx_email_logs_organization ON email_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_response ON email_logs(response_id);

CREATE INDEX IF NOT EXISTS idx_email_automations_trigger ON email_automations(trigger_type);
CREATE INDEX IF NOT EXISTS idx_email_automations_active ON email_automations(is_active);
CREATE INDEX IF NOT EXISTS idx_email_automations_organization ON email_automations(organization_id);
CREATE INDEX IF NOT EXISTS idx_email_automations_questionnaire ON email_automations(questionnaire_id);

CREATE INDEX IF NOT EXISTS idx_scheduled_emails_scheduled_for ON scheduled_emails(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_scheduled_emails_sent_at ON scheduled_emails(sent_at);

CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_organization ON email_campaigns(organization_id);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_scheduled_for ON email_campaigns(scheduled_for);

CREATE INDEX IF NOT EXISTS idx_email_campaign_recipients_campaign ON email_campaign_recipients(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_campaign_recipients_email ON email_campaign_recipients(email);
CREATE INDEX IF NOT EXISTS idx_email_campaign_recipients_status ON email_campaign_recipients(status);

CREATE INDEX IF NOT EXISTS idx_email_unsubscribes_email ON email_unsubscribes(email);
CREATE INDEX IF NOT EXISTS idx_email_unsubscribes_organization ON email_unsubscribes(organization_id);

CREATE INDEX IF NOT EXISTS idx_email_tracking_email_log ON email_tracking(email_log_id);
CREATE INDEX IF NOT EXISTS idx_email_tracking_event_type ON email_tracking(event_type);
CREATE INDEX IF NOT EXISTS idx_email_tracking_created_at ON email_tracking(created_at);

-- Add some default email automation rules
INSERT INTO email_automations (trigger_type, template_type, is_active, delay_minutes, created_by_id, created_at, updated_at)
VALUES 
    ('questionnaire_completed', 'assessment_completion', true, 0, 1, NOW(), NOW()),
    ('assessment_results_ready', 'assessment_results', true, 5, 1, NOW(), NOW()),
    ('user_registered', 'welcome', true, 0, 1, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
DROP TRIGGER IF EXISTS update_email_templates_updated_at ON email_templates;
CREATE TRIGGER update_email_templates_updated_at 
    BEFORE UPDATE ON email_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_email_automations_updated_at ON email_automations;
CREATE TRIGGER update_email_automations_updated_at 
    BEFORE UPDATE ON email_automations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_email_campaigns_updated_at ON email_campaigns;
CREATE TRIGGER update_email_campaigns_updated_at 
    BEFORE UPDATE ON email_campaigns 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
