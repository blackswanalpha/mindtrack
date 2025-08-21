import { query } from './db';

// Create users table
export async function createUsersTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'user',
      profile_image VARCHAR(255),
      last_login TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
    
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
  `;
  
  try {
    await query(createTableQuery);
    console.log('Users table created successfully');
    return true;
  } catch (error) {
    console.error('Error creating users table:', error);
    return false;
  }
}

// Create organizations table
export async function createOrganizationsTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS organizations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      type VARCHAR(50),
      contact_email VARCHAR(255),
      contact_phone VARCHAR(50),
      address TEXT,
      logo_url VARCHAR(255),
      settings JSONB,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
    
    CREATE INDEX IF NOT EXISTS idx_organizations_name ON organizations(name);
  `;
  
  try {
    await query(createTableQuery);
    console.log('Organizations table created successfully');
    return true;
  } catch (error) {
    console.error('Error creating organizations table:', error);
    return false;
  }
}

// Create questionnaires table
export async function createQuestionnairesTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS questionnaires (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      type VARCHAR(50) NOT NULL DEFAULT 'standard' CHECK (type IN ('standard', 'assessment', 'screening', 'feedback', 'survey', 'clinical', 'research', 'educational')),
      category VARCHAR(50),
      estimated_time INTEGER,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      is_adaptive BOOLEAN NOT NULL DEFAULT FALSE,
      is_qr_enabled BOOLEAN NOT NULL DEFAULT TRUE,
      is_template BOOLEAN NOT NULL DEFAULT FALSE,
      is_public BOOLEAN NOT NULL DEFAULT FALSE,
      allow_anonymous BOOLEAN NOT NULL DEFAULT TRUE,
      requires_auth BOOLEAN NOT NULL DEFAULT FALSE,
      max_responses INTEGER,
      expires_at TIMESTAMP,
      version INTEGER NOT NULL DEFAULT 1,
      parent_id INTEGER REFERENCES questionnaires(id),
      tags JSONB,
      organization_id INTEGER REFERENCES organizations(id),
      created_by_id INTEGER NOT NULL REFERENCES users(id),
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_questionnaires_created_by ON questionnaires(created_by_id);
    CREATE INDEX IF NOT EXISTS idx_questionnaires_organization ON questionnaires(organization_id);
    CREATE INDEX IF NOT EXISTS idx_questionnaires_active ON questionnaires(is_active);
    CREATE INDEX IF NOT EXISTS idx_questionnaires_public ON questionnaires(is_public);
    CREATE INDEX IF NOT EXISTS idx_questionnaires_type ON questionnaires(type);
    CREATE INDEX IF NOT EXISTS idx_questionnaires_category ON questionnaires(category);
    CREATE INDEX IF NOT EXISTS idx_questionnaires_template ON questionnaires(is_template);
    CREATE INDEX IF NOT EXISTS idx_questionnaires_parent ON questionnaires(parent_id);
  `;

  try {
    await query(createTableQuery);
    console.log('Questionnaires table created successfully');
    return true;
  } catch (error) {
    console.error('Error creating questionnaires table:', error);
    return false;
  }
}

// Create questions table
export async function createQuestionsTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS questions (
      id SERIAL PRIMARY KEY,
      questionnaire_id INTEGER NOT NULL REFERENCES questionnaires(id) ON DELETE CASCADE,
      section_id INTEGER REFERENCES question_sections(id) ON DELETE SET NULL,
      text TEXT NOT NULL,
      type VARCHAR(50) NOT NULL CHECK (type IN (
        'text', 'textarea', 'rich_text', 'multiple_choice', 'single_choice', 'dropdown',
        'rating', 'likert', 'star_rating', 'nps', 'semantic_differential',
        'boolean', 'slider', 'number', 'decimal', 'date', 'time', 'datetime',
        'file_upload', 'image_upload', 'country', 'state', 'city'
      )),
      required BOOLEAN NOT NULL DEFAULT TRUE,
      order_num INTEGER NOT NULL,
      options JSONB,
      validation_rules JSONB,
      conditional_logic JSONB,
      metadata JSONB,
      help_text TEXT,
      placeholder_text TEXT,
      error_message TEXT,
      is_template BOOLEAN NOT NULL DEFAULT FALSE,
      template_category VARCHAR(100),
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_questions_questionnaire ON questions(questionnaire_id);
    CREATE INDEX IF NOT EXISTS idx_questions_section ON questions(section_id);
    CREATE INDEX IF NOT EXISTS idx_questions_order ON questions(questionnaire_id, order_num);
    CREATE INDEX IF NOT EXISTS idx_questions_type ON questions(type);
    CREATE INDEX IF NOT EXISTS idx_questions_template ON questions(is_template);
    CREATE INDEX IF NOT EXISTS idx_questions_template_category ON questions(template_category);
  `;

  try {
    await query(createTableQuery);
    console.log('Questions table created successfully');
    return true;
  } catch (error) {
    console.error('Error creating questions table:', error);
    return false;
  }
}

// Create responses table
export async function createResponsesTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS responses (
      id SERIAL PRIMARY KEY,
      questionnaire_id INTEGER NOT NULL REFERENCES questionnaires(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id),
      patient_identifier VARCHAR(255),
      patient_name VARCHAR(255),
      patient_email VARCHAR(255),
      patient_age INTEGER,
      patient_gender VARCHAR(50),
      score INTEGER,
      risk_level VARCHAR(50),
      flagged_for_review BOOLEAN NOT NULL DEFAULT FALSE,
      completion_time INTEGER,
      completed_at TIMESTAMP,
      organization_id INTEGER REFERENCES organizations(id),
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_responses_questionnaire ON responses(questionnaire_id);
    CREATE INDEX IF NOT EXISTS idx_responses_user ON responses(user_id);
    CREATE INDEX IF NOT EXISTS idx_responses_organization ON responses(organization_id);
    CREATE INDEX IF NOT EXISTS idx_responses_patient_identifier ON responses(patient_identifier);
    CREATE INDEX IF NOT EXISTS idx_responses_patient_email ON responses(patient_email);
    CREATE INDEX IF NOT EXISTS idx_responses_risk_level ON responses(risk_level);
    CREATE INDEX IF NOT EXISTS idx_responses_completed_at ON responses(completed_at);
    CREATE INDEX IF NOT EXISTS idx_responses_flagged ON responses(flagged_for_review);
  `;

  try {
    await query(createTableQuery);
    console.log('Responses table created successfully');
    return true;
  } catch (error) {
    console.error('Error creating responses table:', error);
    return false;
  }
}

// Create answers table
export async function createAnswersTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS answers (
      id SERIAL PRIMARY KEY,
      response_id INTEGER NOT NULL REFERENCES responses(id) ON DELETE CASCADE,
      question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
      value TEXT,
      numeric_value DECIMAL,
      date_value DATE,
      time_value TIME,
      datetime_value TIMESTAMP,
      boolean_value BOOLEAN,
      json_value JSONB,
      has_files BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_answers_response ON answers(response_id);
    CREATE INDEX IF NOT EXISTS idx_answers_question ON answers(question_id);
    CREATE INDEX IF NOT EXISTS idx_answers_numeric ON answers(numeric_value);
    CREATE INDEX IF NOT EXISTS idx_answers_date ON answers(date_value);
    CREATE INDEX IF NOT EXISTS idx_answers_boolean ON answers(boolean_value);
    CREATE INDEX IF NOT EXISTS idx_answers_files ON answers(has_files);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_answers_response_question ON answers(response_id, question_id);
  `;

  try {
    await query(createTableQuery);
    console.log('Answers table created successfully');
    return true;
  } catch (error) {
    console.error('Error creating answers table:', error);
    return false;
  }
}

// Create questionnaire_versions table for version history
export async function createQuestionnaireVersionsTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS questionnaire_versions (
      id SERIAL PRIMARY KEY,
      questionnaire_id INTEGER NOT NULL REFERENCES questionnaires(id) ON DELETE CASCADE,
      version_number INTEGER NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      type VARCHAR(50) NOT NULL,
      category VARCHAR(50),
      estimated_time INTEGER,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      is_adaptive BOOLEAN NOT NULL DEFAULT FALSE,
      is_qr_enabled BOOLEAN NOT NULL DEFAULT TRUE,
      is_template BOOLEAN NOT NULL DEFAULT FALSE,
      is_public BOOLEAN NOT NULL DEFAULT FALSE,
      allow_anonymous BOOLEAN NOT NULL DEFAULT TRUE,
      requires_auth BOOLEAN NOT NULL DEFAULT FALSE,
      max_responses INTEGER,
      expires_at TIMESTAMP,
      tags JSONB,
      questions_snapshot JSONB,
      change_summary TEXT,
      created_by_id INTEGER NOT NULL REFERENCES users(id),
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_questionnaire_versions_questionnaire ON questionnaire_versions(questionnaire_id);
    CREATE INDEX IF NOT EXISTS idx_questionnaire_versions_version ON questionnaire_versions(questionnaire_id, version_number);
    CREATE INDEX IF NOT EXISTS idx_questionnaire_versions_created_by ON questionnaire_versions(created_by_id);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_questionnaire_versions_unique ON questionnaire_versions(questionnaire_id, version_number);
  `;

  try {
    await query(createTableQuery);
    console.log('Questionnaire versions table created successfully');
    return true;
  } catch (error) {
    console.error('Error creating questionnaire versions table:', error);
    return false;
  }
}

// Create question_sections table for organizing questions into sections
export async function createQuestionSectionsTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS question_sections (
      id SERIAL PRIMARY KEY,
      questionnaire_id INTEGER NOT NULL REFERENCES questionnaires(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      order_num INTEGER NOT NULL,
      is_collapsible BOOLEAN NOT NULL DEFAULT FALSE,
      is_collapsed BOOLEAN NOT NULL DEFAULT FALSE,
      conditional_logic JSONB,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_question_sections_questionnaire ON question_sections(questionnaire_id);
    CREATE INDEX IF NOT EXISTS idx_question_sections_order ON question_sections(questionnaire_id, order_num);
  `;

  try {
    await query(createTableQuery);
    console.log('Question sections table created successfully');
    return true;
  } catch (error) {
    console.error('Error creating question sections table:', error);
    return false;
  }
}

// Create file_uploads table for handling file attachments
export async function createFileUploadsTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS file_uploads (
      id SERIAL PRIMARY KEY,
      answer_id INTEGER REFERENCES answers(id) ON DELETE CASCADE,
      original_filename VARCHAR(255) NOT NULL,
      stored_filename VARCHAR(255) NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      mime_type VARCHAR(100) NOT NULL,
      file_hash VARCHAR(64),
      is_scanned BOOLEAN NOT NULL DEFAULT FALSE,
      scan_result JSONB,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_file_uploads_answer ON file_uploads(answer_id);
    CREATE INDEX IF NOT EXISTS idx_file_uploads_hash ON file_uploads(file_hash);
    CREATE INDEX IF NOT EXISTS idx_file_uploads_mime_type ON file_uploads(mime_type);
  `;

  try {
    await query(createTableQuery);
    console.log('File uploads table created successfully');
    return true;
  } catch (error) {
    console.error('Error creating file uploads table:', error);
    return false;
  }
}

// Create question_templates table for reusable question components
export async function createQuestionTemplatesTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS question_templates (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      category VARCHAR(100),
      type VARCHAR(50) NOT NULL,
      template_data JSONB NOT NULL,
      usage_count INTEGER NOT NULL DEFAULT 0,
      is_public BOOLEAN NOT NULL DEFAULT FALSE,
      tags JSONB,
      created_by_id INTEGER NOT NULL REFERENCES users(id),
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_question_templates_category ON question_templates(category);
    CREATE INDEX IF NOT EXISTS idx_question_templates_type ON question_templates(type);
    CREATE INDEX IF NOT EXISTS idx_question_templates_public ON question_templates(is_public);
    CREATE INDEX IF NOT EXISTS idx_question_templates_created_by ON question_templates(created_by_id);
  `;

  try {
    await query(createTableQuery);
    console.log('Question templates table created successfully');
    return true;
  } catch (error) {
    console.error('Error creating question templates table:', error);
    return false;
  }
}

// Create organization_members table for managing organization membership
export async function createOrganizationMembersTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS organization_members (
      id SERIAL PRIMARY KEY,
      organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role VARCHAR(50) NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
      status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
      joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
      UNIQUE(organization_id, user_id)
    );

    CREATE INDEX IF NOT EXISTS idx_organization_members_organization ON organization_members(organization_id);
    CREATE INDEX IF NOT EXISTS idx_organization_members_user ON organization_members(user_id);
    CREATE INDEX IF NOT EXISTS idx_organization_members_role ON organization_members(role);
    CREATE INDEX IF NOT EXISTS idx_organization_members_status ON organization_members(status);
  `;

  try {
    await query(createTableQuery);
    console.log('Organization members table created successfully');
    return true;
  } catch (error) {
    console.error('Error creating organization members table:', error);
    return false;
  }
}

// Create organization_invitations table for managing member invitations
export async function createOrganizationInvitationsTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS organization_invitations (
      id SERIAL PRIMARY KEY,
      organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      email VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer')),
      token VARCHAR(255) NOT NULL UNIQUE,
      status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired', 'cancelled')),
      invited_by_id INTEGER NOT NULL REFERENCES users(id),
      expires_at TIMESTAMP NOT NULL,
      accepted_at TIMESTAMP,
      accepted_by_id INTEGER REFERENCES users(id),
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_organization_invitations_organization ON organization_invitations(organization_id);
    CREATE INDEX IF NOT EXISTS idx_organization_invitations_email ON organization_invitations(email);
    CREATE INDEX IF NOT EXISTS idx_organization_invitations_token ON organization_invitations(token);
    CREATE INDEX IF NOT EXISTS idx_organization_invitations_status ON organization_invitations(status);
    CREATE INDEX IF NOT EXISTS idx_organization_invitations_invited_by ON organization_invitations(invited_by_id);
    CREATE INDEX IF NOT EXISTS idx_organization_invitations_expires ON organization_invitations(expires_at);
  `;

  try {
    await query(createTableQuery);
    console.log('Organization invitations table created successfully');
    return true;
  } catch (error) {
    console.error('Error creating organization invitations table:', error);
    return false;
  }
}

// Create audit_logs table for tracking important actions
export async function createAuditLogsTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS audit_logs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      organization_id INTEGER REFERENCES organizations(id),
      action VARCHAR(255) NOT NULL,
      entity_type VARCHAR(50) NOT NULL,
      entity_id INTEGER,
      details JSONB,
      ip_address VARCHAR(50),
      user_agent TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_organization ON audit_logs(organization_id);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
  `;

  try {
    await query(createTableQuery);
    console.log('Audit logs table created successfully');
    return true;
  } catch (error) {
    console.error('Error creating audit logs table:', error);
    return false;
  }
}

// Create notifications table for user notifications
export async function createNotificationsTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      type VARCHAR(50) NOT NULL CHECK (type IN ('invitation', 'role_change', 'organization_update', 'system', 'reminder')),
      is_read BOOLEAN NOT NULL DEFAULT FALSE,
      entity_type VARCHAR(50),
      entity_id INTEGER,
      action_url VARCHAR(500),
      expires_at TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      read_at TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_organization ON notifications(organization_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
    CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
    CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
    CREATE INDEX IF NOT EXISTS idx_notifications_expires_at ON notifications(expires_at);
  `;

  try {
    await query(createTableQuery);
    console.log('Notifications table created successfully');
    return true;
  } catch (error) {
    console.error('Error creating notifications table:', error);
    return false;
  }
}

// Create ai_analyses table for storing AI analysis results
export async function createAIAnalysesTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS ai_analyses (
      id SERIAL PRIMARY KEY,
      response_id INTEGER NOT NULL REFERENCES responses(id) ON DELETE CASCADE,
      prompt TEXT NOT NULL,
      analysis TEXT NOT NULL,
      recommendations TEXT,
      risk_assessment TEXT,
      model_used VARCHAR(255) NOT NULL,
      created_by_id INTEGER REFERENCES users(id),
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_ai_analyses_response_id ON ai_analyses(response_id);
    CREATE INDEX IF NOT EXISTS idx_ai_analyses_created_by_id ON ai_analyses(created_by_id);
    CREATE INDEX IF NOT EXISTS idx_ai_analyses_created_at ON ai_analyses(created_at);
    CREATE INDEX IF NOT EXISTS idx_ai_analyses_model_used ON ai_analyses(model_used);
  `;

  try {
    await query(createTableQuery);
    console.log('AI analyses table created successfully');
    return true;
  } catch (error) {
    console.error('Error creating ai_analyses table:', error);
    return false;
  }
}

// Create ai_analysis_prompts table for storing custom analysis prompts
export async function createAIAnalysisPromptsTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS ai_analysis_prompts (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      prompt_template TEXT NOT NULL,
      analysis_type VARCHAR(50) NOT NULL DEFAULT 'comprehensive' CHECK (analysis_type IN ('comprehensive', 'sentiment', 'risk', 'recommendations')),
      is_default BOOLEAN NOT NULL DEFAULT FALSE,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_by_id INTEGER REFERENCES users(id),
      organization_id INTEGER REFERENCES organizations(id),
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_ai_analysis_prompts_analysis_type ON ai_analysis_prompts(analysis_type);
    CREATE INDEX IF NOT EXISTS idx_ai_analysis_prompts_is_active ON ai_analysis_prompts(is_active);
    CREATE INDEX IF NOT EXISTS idx_ai_analysis_prompts_organization_id ON ai_analysis_prompts(organization_id);
  `;

  try {
    await query(createTableQuery);
    console.log('AI analysis prompts table created successfully');
    return true;
  } catch (error) {
    console.error('Error creating ai_analysis_prompts table:', error);
    return false;
  }
}

// Initialize all basic tables
export async function initializeDatabase() {
  console.log('Initializing database tables...');

  const results = await Promise.all([
    createUsersTable(),
    createOrganizationsTable(),
    createQuestionnairesTable(),
    createQuestionSectionsTable(),
    createQuestionsTable(),
    createResponsesTable(),
    createAnswersTable(),
    createFileUploadsTable(),
    createQuestionTemplatesTable(),
    createQuestionnaireVersionsTable(),
    createOrganizationMembersTable(),
    createOrganizationInvitationsTable(),
    createAuditLogsTable(),
    createNotificationsTable(),
    createAIAnalysesTable(),
    createAIAnalysisPromptsTable()
  ]);

  const allSuccessful = results.every(result => result);

  if (allSuccessful) {
    console.log('Database initialization completed successfully');
  } else {
    console.error('Some tables failed to create');
  }

  return allSuccessful;
}
