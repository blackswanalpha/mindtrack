// Database entity types based on the documented schema

export interface User {
  id: number;
  name: string;
  email: string;
  password?: string; // Optional for responses, required for creation
  role: string;
  profile_image?: string;
  last_login?: string;
  settings?: UserSettings;
  created_at: string;
  updated_at: string;
}

// User Settings Interfaces
export interface UserSettings {
  profile: ProfileSettings;
  notifications: NotificationSettings;
  ui: UISettings;
  privacy: PrivacySettings;
  security: SecuritySettings;
}

export interface ProfileSettings {
  first_name?: string;
  last_name?: string;
  phone?: string;
  bio?: string;
  location?: string;
  website?: string;
  linkedin?: string;
  twitter?: string;
  github?: string;
  profile_visibility: 'public' | 'private' | 'organization';
  show_email: boolean;
  show_phone: boolean;
}

export interface NotificationSettings {
  email: {
    enabled: boolean;
    questionnaire_responses: boolean;
    organization_invites: boolean;
    system_updates: boolean;
    marketing: boolean;
    weekly_digest: boolean;
    frequency: 'immediate' | 'daily' | 'weekly' | 'never';
  };
  in_app: {
    enabled: boolean;
    questionnaire_responses: boolean;
    organization_invites: boolean;
    system_updates: boolean;
    mentions: boolean;
    sound_enabled: boolean;
  };
  push: {
    enabled: boolean;
    questionnaire_responses: boolean;
    organization_invites: boolean;
    system_updates: boolean;
    mentions: boolean;
  };
  sms: {
    enabled: boolean;
    phone_number?: string;
    critical_only: boolean;
  };
}

export interface UISettings {
  theme: 'light' | 'dark' | 'system';
  density: 'compact' | 'comfortable' | 'spacious';
  language: string;
  timezone: string;
  date_format: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  time_format: '12h' | '24h';
  sidebar_collapsed: boolean;
  animations_enabled: boolean;
  high_contrast: boolean;
  font_size: 'small' | 'medium' | 'large';
}

export interface PrivacySettings {
  analytics_opt_out: boolean;
  data_sharing_opt_out: boolean;
  profile_indexing: boolean;
  activity_tracking: boolean;
  usage_statistics: boolean;
  third_party_cookies: boolean;
  data_retention_period: number; // days
}

export interface SecuritySettings {
  two_factor_enabled: boolean;
  two_factor_method: 'app' | 'sms' | 'email';
  session_timeout: number; // minutes
  login_notifications: boolean;
  device_tracking: boolean;
  password_expiry_days: number;
  require_password_change: boolean;
  allowed_ip_addresses: string[];
  security_questions: SecurityQuestion[];
}

export interface SecurityQuestion {
  id: string;
  question: string;
  answer_hash: string;
  created_at: string;
}

// Application Settings Interfaces (Admin Only)
export interface ApplicationSettings {
  general: GeneralSettings;
  api: APISettings;
  integrations: IntegrationSettings;
  email: EmailSettings;
  system: SystemSettings;
}

export interface GeneralSettings {
  company_name: string;
  company_logo?: string;
  company_website?: string;
  support_email: string;
  default_language: string;
  default_timezone: string;
  date_format: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  time_format: '12h' | '24h';
  currency: string;
  address: {
    street?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  branding: {
    primary_color: string;
    secondary_color: string;
    accent_color: string;
    logo_url?: string;
    favicon_url?: string;
  };
}

export interface APISettings {
  keys: APIKey[];
  rate_limits: {
    requests_per_minute: number;
    requests_per_hour: number;
    requests_per_day: number;
  };
  cors_origins: string[];
  webhook_settings: {
    enabled: boolean;
    secret_key: string;
    retry_attempts: number;
    timeout_seconds: number;
  };
  documentation_url: string;
}

export interface APIKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  last_used?: string;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
  created_by: number;
}

export interface IntegrationSettings {
  google_analytics: {
    enabled: boolean;
    tracking_id?: string;
    enhanced_ecommerce: boolean;
  };
  google_oauth: {
    enabled: boolean;
    client_id?: string;
    client_secret?: string;
  };
  microsoft_oauth: {
    enabled: boolean;
    client_id?: string;
    client_secret?: string;
  };
  slack: {
    enabled: boolean;
    webhook_url?: string;
    channel?: string;
  };
  zapier: {
    enabled: boolean;
    webhook_url?: string;
  };
  custom_webhooks: CustomWebhook[];
}

export interface CustomWebhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  headers: Record<string, string>;
  is_active: boolean;
  created_at: string;
}

export interface EmailSettings {
  smtp: {
    host: string;
    port: number;
    username: string;
    password: string;
    use_tls: boolean;
    use_ssl: boolean;
  };
  default_sender: {
    name: string;
    email: string;
  };
  reply_to?: string;
  bounce_handling: {
    enabled: boolean;
    webhook_url?: string;
  };
  templates: {
    welcome_email: string;
    password_reset: string;
    invitation: string;
    notification: string;
  };
  automation: {
    enabled: boolean;
    welcome_series: boolean;
    abandoned_questionnaire: boolean;
    follow_up_reminders: boolean;
  };
}

export interface SystemSettings {
  maintenance_mode: boolean;
  maintenance_message?: string;
  feature_flags: Record<string, boolean>;
  max_file_upload_size: number; // bytes
  session_timeout: number; // minutes
  password_policy: {
    min_length: number;
    require_uppercase: boolean;
    require_lowercase: boolean;
    require_numbers: boolean;
    require_symbols: boolean;
    expiry_days: number;
  };
  backup_settings: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    retention_days: number;
    storage_location: string;
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    retention_days: number;
    include_user_actions: boolean;
  };
}

// Settings Update Types
export interface UpdateUserSettingsData {
  profile?: Partial<ProfileSettings>;
  notifications?: Partial<NotificationSettings>;
  ui?: Partial<UISettings>;
  privacy?: Partial<PrivacySettings>;
  security?: Partial<SecuritySettings>;
}

export interface UpdateApplicationSettingsData {
  general?: Partial<GeneralSettings>;
  api?: Partial<APISettings>;
  integrations?: Partial<IntegrationSettings>;
  email?: Partial<EmailSettings>;
  system?: Partial<SystemSettings>;
}

// Settings Response Types
export interface UserSettingsResponse {
  success: boolean;
  data: {
    settings: UserSettings;
    user: Pick<User, 'id' | 'name' | 'email' | 'role' | 'profile_image'>;
  };
  message?: string;
}

export interface ApplicationSettingsResponse {
  success: boolean;
  data: {
    settings: ApplicationSettings;
  };
  message?: string;
}

// Password Change Types
export interface ChangePasswordData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

// Profile Picture Upload Types
export interface ProfilePictureUploadResponse {
  success: boolean;
  data: {
    profile_image_url: string;
  };
  message?: string;
}

// Settings Validation Types
export interface SettingsValidationError {
  field: string;
  message: string;
  code: string;
}

export interface SettingsValidationResponse {
  success: boolean;
  errors?: SettingsValidationError[];
  message?: string;
}

export interface Organization {
  id: number;
  name: string;
  description?: string;
  type?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  logo_url?: string;
  settings?: any;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: number;
  organization_id: number;
  user_id: number;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  status: 'active' | 'inactive' | 'suspended';
  joined_at: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
    profile_image?: string;
  };
  organization?: {
    id: number;
    name: string;
  };
}

export interface OrganizationInvitation {
  id: number;
  organization_id: number;
  email: string;
  role: 'admin' | 'member' | 'viewer';
  token: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired' | 'cancelled';
  invited_by_id: number;
  expires_at: string;
  accepted_at?: string;
  accepted_by_id?: number;
  created_at: string;
  updated_at: string;
  organization?: {
    id: number;
    name: string;
  };
  invited_by?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface Notification {
  id: number;
  user_id: number;
  organization_id?: number;
  title: string;
  message: string;
  type: 'invitation' | 'role_change' | 'organization_update' | 'system' | 'reminder';
  is_read: boolean;
  entity_type?: string;
  entity_id?: number;
  action_url?: string;
  expires_at?: string;
  created_at: string;
  read_at?: string;
}

export type QuestionnaireType = 'standard' | 'assessment' | 'screening' | 'feedback' | 'survey' | 'clinical' | 'research' | 'educational';

export interface Questionnaire {
  id: number;
  title: string;
  description?: string;
  type: QuestionnaireType;
  category?: string;
  estimated_time?: number;
  is_active: boolean;
  is_adaptive: boolean;
  is_qr_enabled: boolean;
  is_template: boolean;
  is_public: boolean;
  allow_anonymous: boolean;
  requires_auth: boolean;
  max_responses?: number;
  expires_at?: string;
  version: number;
  parent_id?: number;
  tags?: string[];
  organization_id?: number;
  created_by_id: number;
  created_at: string;
  updated_at: string;
}

// Enhanced question types
export type QuestionType =
  // Text input types
  | 'text' | 'textarea' | 'rich_text'
  // Choice types
  | 'multiple_choice' | 'single_choice' | 'dropdown'
  // Rating types
  | 'rating' | 'likert' | 'star_rating' | 'nps' | 'semantic_differential'
  // Basic types
  | 'boolean' | 'slider'
  // Numeric types
  | 'number' | 'decimal'
  // Date/time types
  | 'date' | 'time' | 'datetime'
  // File types
  | 'file_upload' | 'image_upload'
  // Geographic types
  | 'country' | 'state' | 'city';

// Question option interface for enhanced choice questions
export interface QuestionOption {
  value: string | number;
  label: string;
  description?: string;
  image_url?: string;
  is_other?: boolean;
  conditional_logic?: ConditionalLogic;
}

// Validation rules for different question types
export interface ValidationRules {
  // Text validation
  min_length?: number;
  max_length?: number;
  pattern?: string; // regex pattern

  // Numeric validation
  min_value?: number;
  max_value?: number;
  decimal_places?: number;
  step?: number;

  // Date validation
  min_date?: string;
  max_date?: string;
  date_format?: string;

  // File validation
  max_file_size?: number; // in bytes
  allowed_file_types?: string[];
  max_files?: number;

  // Choice validation
  min_selections?: number;
  max_selections?: number;

  // Custom validation
  custom_validation?: {
    function: string;
    message: string;
  };
}

// Conditional logic for show/hide and branching
export interface ConditionalLogic {
  conditions: LogicCondition[];
  operator: 'AND' | 'OR';
  action: 'show' | 'hide' | 'require' | 'skip_to';
  target_question_id?: number;
  target_section_id?: number;
}

export interface LogicCondition {
  question_id: number;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty';
  value: string | number | boolean | string[];
}

// Question metadata for different types
export interface QuestionMetadata {
  // Rating metadata
  rating_scale?: {
    min: number;
    max: number;
    step?: number;
    labels?: string[];
    show_numbers?: boolean;
  };

  // Likert scale metadata
  likert_scale?: {
    scale_type: '3_point' | '5_point' | '7_point' | '10_point' | 'custom';
    labels: string[];
    neutral_option?: boolean;
  };

  // NPS metadata
  nps_config?: {
    detractor_range: [number, number];
    passive_range: [number, number];
    promoter_range: [number, number];
    follow_up_questions?: {
      detractor_question?: string;
      passive_question?: string;
      promoter_question?: string;
    };
  };

  // File upload metadata
  file_config?: {
    upload_path: string;
    preview_enabled: boolean;
    multiple_files: boolean;
    drag_drop_enabled: boolean;
  };

  // Rich text metadata
  rich_text_config?: {
    toolbar_options: string[];
    max_length?: number;
    allow_images?: boolean;
    allow_links?: boolean;
  };

  // Geographic metadata
  geographic_config?: {
    default_country?: string;
    restrict_countries?: string[];
    include_flags?: boolean;
    autocomplete_enabled?: boolean;
  };

  // Scoring metadata
  scoring?: {
    points: number[];
    weight: number;
    reverse_score?: boolean;
  };

  // Display metadata
  display?: {
    columns?: number;
    orientation?: 'horizontal' | 'vertical';
    randomize_options?: boolean;
    show_progress?: boolean;
  };
}

export interface Question {
  id: number;
  questionnaire_id: number;
  section_id?: number;
  text: string;
  type: QuestionType;
  required: boolean;
  order_num: number;
  options?: string[] | QuestionOption[];
  validation_rules?: ValidationRules;
  conditional_logic?: ConditionalLogic;
  metadata?: QuestionMetadata;
  help_text?: string;
  placeholder_text?: string;
  error_message?: string;
  is_template: boolean;
  template_category?: string;
  created_at: string;
  updated_at: string;
}

export interface Response {
  id: number;
  questionnaire_id: number;
  user_id?: number;
  patient_identifier?: string;
  patient_name?: string;
  patient_email?: string;
  patient_age?: number;
  patient_gender?: string;
  score?: number;
  risk_level?: string;
  flagged_for_review: boolean;
  completion_time?: number;
  completed_at?: string;
  organization_id?: number;
  created_at: string;
  updated_at: string;
}

export interface Answer {
  id: number;
  response_id: number;
  question_id: number;
  value?: string;
  numeric_value?: number;
  date_value?: string;
  time_value?: string;
  datetime_value?: string;
  boolean_value?: boolean;
  json_value?: any;
  has_files: boolean;
  created_at: string;
  updated_at: string;
}

// Question sections for organizing questions
export interface QuestionSection {
  id: number;
  questionnaire_id: number;
  title: string;
  description?: string;
  order_num: number;
  is_collapsible: boolean;
  is_collapsed: boolean;
  conditional_logic?: ConditionalLogic;
  created_at: string;
  updated_at: string;
}

// File uploads for file-based questions
export interface FileUpload {
  id: number;
  answer_id: number;
  original_filename: string;
  stored_filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  file_hash?: string;
  is_scanned: boolean;
  scan_result?: any;
  created_at: string;
}

// Question templates for reusability
export interface QuestionTemplate {
  id: number;
  name: string;
  description?: string;
  category?: string;
  type: QuestionType;
  template_data: any;
  usage_count: number;
  is_public: boolean;
  tags?: string[];
  created_by_id: number;
  created_at: string;
  updated_at: string;
}

export interface QuestionnaireVersion {
  id: number;
  questionnaire_id: number;
  version_number: number;
  title: string;
  description?: string;
  type: string;
  category?: string;
  estimated_time?: number;
  is_active: boolean;
  is_adaptive: boolean;
  is_qr_enabled: boolean;
  is_template: boolean;
  is_public: boolean;
  allow_anonymous: boolean;
  requires_auth: boolean;
  max_responses?: number;
  expires_at?: string;
  tags?: string[];
  questions_snapshot?: any;
  change_summary?: string;
  created_by_id: number;
  created_at: string;
}

export interface Response {
  id: number;
  questionnaire_id: number;
  user_id?: number;
  patient_identifier?: string;
  patient_name?: string;
  patient_email?: string;
  patient_age?: number;
  patient_gender?: string;
  score?: number;
  risk_level?: string;
  flagged_for_review: boolean;
  completion_time?: number;
  completed_at?: string;
  organization_id?: number;
  created_at: string;
  updated_at: string;
}



export interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  body: string;
  html_content?: string;
  variables: string | Record<string, any>;
  category?: string;
  type?: string;
  is_active: boolean;
  organization_id?: number;
  created_by_id: number;
  created_at: string;
  updated_at: string;
}

export interface EmailLog {
  id: number;
  template_id?: number;
  recipient: string;
  cc_recipients?: string;
  bcc_recipients?: string;
  subject: string;
  body: string;
  html_body?: string;
  status: string;
  error?: string;
  sent_by_id?: number;
  organization_id?: number;
  response_id?: number;
  metadata?: Record<string, any>;
  sent_at: string;
  delivered_at?: string;
  opened_at?: string;
  clicked_at?: string;
  bounced_at?: string;
}

// Enhanced Scoring Configuration
export interface ScoringConfig {
  id: string;
  questionnaire_id: number;
  name: string;
  description?: string;
  scoring_method: 'sum' | 'average' | 'weighted' | 'custom';
  weights?: Record<string, number>;
  formula?: string;
  formula_variables?: Record<string, number>;
  max_score: number;
  min_score: number;
  passing_score?: number;
  visualization_type: 'gauge' | 'bar' | 'line' | 'radar' | 'pie' | 'heatmap';
  visualization_config?: Record<string, any>;
  is_active: boolean;
  is_default: boolean;
  rules: ScoringRule[];
  created_by_id: number;
  created_at: string;
  updated_at: string;
}

// Scoring Rule
export interface ScoringRule {
  id: string;
  config_id: string;
  min_score: number;
  max_score: number;
  risk_level: 'none' | 'low' | 'medium' | 'high' | 'critical';
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
  total_score: number;
  normalized_score: number;
  percentage: number;
  risk_level: 'none' | 'low' | 'medium' | 'high' | 'critical';
  risk_label: string;
  risk_color: string;
  actions: string[];
  category_scores?: Record<string, number>;
  visualization_data: any;
  calculated_at: string;
  created_at: string;
  updated_at: string;
}

export interface AIAnalysis {
  id: number;
  response_id: number;
  prompt: string;
  analysis: string;
  recommendations?: string;
  risk_assessment?: string;
  model_used: string;
  created_by_id?: number;
  created_at: string;
}

export interface Session {
  id: string;
  user_id: number;
  ip_address?: string;
  user_agent?: string;
  expires_at: string;
  created_at: string;
}

export interface AuditLog {
  id: number;
  user_id?: number;
  organization_id?: number;
  action: string;
  entity_type: string;
  entity_id?: number;
  details?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  organization?: {
    id: number;
    name: string;
  };
}

// Request/Response types for API
export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface CreateQuestionnaireData {
  title: string;
  description?: string;
  type?: QuestionnaireType;
  category?: string;
  estimated_time?: number;
  is_active?: boolean;
  is_adaptive?: boolean;
  is_qr_enabled?: boolean;
  is_template?: boolean;
  is_public?: boolean;
  allow_anonymous?: boolean;
  requires_auth?: boolean;
  max_responses?: number;
  expires_at?: string;
  organization_id?: number;
}

export interface CreateQuestionData {
  text: string;
  type: QuestionType;
  section_id?: number;
  required?: boolean;
  order_num?: number;
  options?: string[] | QuestionOption[];
  validation_rules?: ValidationRules;
  conditional_logic?: ConditionalLogic;
  metadata?: QuestionMetadata;
  help_text?: string;
  placeholder_text?: string;
  error_message?: string;
  is_template?: boolean;
  template_category?: string;
}

export interface CreateQuestionSectionData {
  title: string;
  description?: string;
  order_num?: number;
  is_collapsible?: boolean;
  is_collapsed?: boolean;
  conditional_logic?: ConditionalLogic;
}

export interface CreateQuestionTemplateData {
  name: string;
  description?: string;
  category?: string;
  type: QuestionType;
  template_data: any;
  is_public?: boolean;
  tags?: string[];
}

export interface CreateResponseData {
  questionnaire_id: number;
  patient_identifier?: string;
  patient_name?: string;
  patient_email?: string;
  patient_age?: number;
  patient_gender?: string;
  score?: number;
  risk_level?: string;
  flagged_for_review?: boolean;
  completion_time?: number;
  answers: {
    question_id: number;
    value: string;
  }[];
}

export interface CreateOrganizationData {
  name: string;
  description?: string;
  type?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  logo_url?: string;
  settings?: any;
}

export interface UpdateOrganizationData {
  name?: string;
  description?: string;
  type?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  logo_url?: string;
  settings?: any;
}

export interface InviteMemberData {
  email: string;
  role: 'admin' | 'member' | 'viewer';
  message?: string;
}

export interface UpdateMemberRoleData {
  role: 'owner' | 'admin' | 'member' | 'viewer';
}

export interface OrganizationStats {
  member_count: number;
  questionnaire_count: number;
  response_count: number;
  active_questionnaire_count: number;
  recent_activity_count: number;
}

export interface OrganizationWithStats extends Organization {
  stats: OrganizationStats;
  user_role?: string;
  user_status?: string;
}

export interface CreateNotificationData {
  user_id: number;
  organization_id?: number;
  title: string;
  message: string;
  type: 'invitation' | 'role_change' | 'organization_update' | 'system' | 'reminder';
  entity_type?: string;
  entity_id?: number;
  action_url?: string;
  expires_at?: string;
}

export interface CreateAuditLogData {
  user_id?: number;
  organization_id?: number;
  action: string;
  entity_type: string;
  entity_id?: number;
  details?: any;
  ip_address?: string;
  user_agent?: string;
}
