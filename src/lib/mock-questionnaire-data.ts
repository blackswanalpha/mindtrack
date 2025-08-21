import { Questionnaire, Question, Response, Answer, QuestionnaireVersion, QuestionnaireType } from '@/types/database';

// Mock questionnaire data with all 8 required types
export const mockQuestionnaires: Questionnaire[] = [
  {
    id: 1,
    title: 'GAD-7 Anxiety Assessment',
    description: 'Generalized Anxiety Disorder 7-item scale for measuring anxiety symptoms',
    type: 'assessment',
    category: 'mental_health',
    estimated_time: 5,
    is_active: true,
    is_adaptive: false,
    is_qr_enabled: true,
    is_template: false,
    is_public: true,
    allow_anonymous: true,
    requires_auth: false,
    max_responses: 1000,
    expires_at: '2024-12-31T23:59:59Z',
    version: 2,
    parent_id: null,
    tags: ['anxiety', 'screening', 'validated', 'clinical'],
    organization_id: 1,
    created_by_id: 1,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-20T14:30:00Z'
  },
  {
    id: 2,
    title: 'Depression Screening Tool',
    description: 'PHQ-9 Patient Health Questionnaire for depression screening',
    type: 'screening',
    category: 'mental_health',
    estimated_time: 7,
    is_active: true,
    is_adaptive: true,
    is_qr_enabled: true,
    is_template: false,
    is_public: false,
    allow_anonymous: false,
    requires_auth: true,
    max_responses: 500,
    expires_at: null,
    version: 1,
    parent_id: null,
    tags: ['depression', 'screening', 'phq9'],
    organization_id: 1,
    created_by_id: 2,
    created_at: '2024-01-10T09:00:00Z',
    updated_at: '2024-01-10T09:00:00Z'
  },
  {
    id: 3,
    title: 'Patient Feedback Survey',
    description: 'Collect feedback on patient experience and satisfaction',
    type: 'feedback',
    category: 'satisfaction',
    estimated_time: 10,
    is_active: true,
    is_adaptive: false,
    is_qr_enabled: true,
    is_template: true,
    is_public: true,
    allow_anonymous: true,
    requires_auth: false,
    max_responses: null,
    expires_at: null,
    version: 1,
    parent_id: null,
    tags: ['feedback', 'satisfaction', 'template'],
    organization_id: null,
    created_by_id: 1,
    created_at: '2024-01-05T08:00:00Z',
    updated_at: '2024-01-05T08:00:00Z'
  },
  {
    id: 4,
    title: 'Research Study Questionnaire',
    description: 'Data collection for mental health research study',
    type: 'research',
    category: 'research',
    estimated_time: 20,
    is_active: true,
    is_adaptive: false,
    is_qr_enabled: false,
    is_template: false,
    is_public: false,
    allow_anonymous: true,
    requires_auth: false,
    max_responses: 200,
    expires_at: '2024-06-30T23:59:59Z',
    version: 1,
    parent_id: null,
    tags: ['research', 'study', 'data-collection'],
    organization_id: 2,
    created_by_id: 3,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 5,
    title: 'Clinical Assessment Battery',
    description: 'Comprehensive clinical assessment for diagnostic purposes',
    type: 'clinical',
    category: 'diagnosis',
    estimated_time: 45,
    is_active: true,
    is_adaptive: true,
    is_qr_enabled: false,
    is_template: false,
    is_public: false,
    allow_anonymous: false,
    requires_auth: true,
    max_responses: 100,
    expires_at: null,
    version: 3,
    parent_id: null,
    tags: ['clinical', 'diagnosis', 'comprehensive'],
    organization_id: 1,
    created_by_id: 2,
    created_at: '2023-12-01T00:00:00Z',
    updated_at: '2024-01-25T16:00:00Z'
  },
  {
    id: 6,
    title: 'Employee Wellness Survey',
    description: 'Standard survey for employee wellness and engagement',
    type: 'survey',
    category: 'wellness',
    estimated_time: 12,
    is_active: true,
    is_adaptive: false,
    is_qr_enabled: true,
    is_template: true,
    is_public: true,
    allow_anonymous: true,
    requires_auth: false,
    max_responses: null,
    expires_at: null,
    version: 1,
    parent_id: null,
    tags: ['wellness', 'employee', 'survey', 'template'],
    organization_id: null,
    created_by_id: 1,
    created_at: '2024-01-12T12:00:00Z',
    updated_at: '2024-01-12T12:00:00Z'
  },
  {
    id: 7,
    title: 'Mental Health Education Quiz',
    description: 'Educational questionnaire about mental health awareness',
    type: 'educational',
    category: 'education',
    estimated_time: 15,
    is_active: true,
    is_adaptive: false,
    is_qr_enabled: true,
    is_template: false,
    is_public: true,
    allow_anonymous: true,
    requires_auth: false,
    max_responses: null,
    expires_at: null,
    version: 1,
    parent_id: null,
    tags: ['education', 'awareness', 'quiz'],
    organization_id: null,
    created_by_id: 4,
    created_at: '2024-01-08T14:00:00Z',
    updated_at: '2024-01-08T14:00:00Z'
  },
  {
    id: 8,
    title: 'Basic Health Check',
    description: 'Standard health assessment questionnaire',
    type: 'standard',
    category: 'health',
    estimated_time: 8,
    is_active: true,
    is_adaptive: false,
    is_qr_enabled: true,
    is_template: true,
    is_public: true,
    allow_anonymous: true,
    requires_auth: false,
    max_responses: null,
    expires_at: null,
    version: 1,
    parent_id: null,
    tags: ['health', 'standard', 'template'],
    organization_id: null,
    created_by_id: 1,
    created_at: '2024-01-03T10:00:00Z',
    updated_at: '2024-01-03T10:00:00Z'
  }
];

// Mock questions for questionnaires
export const mockQuestions: Question[] = [
  // GAD-7 Questions (Questionnaire ID: 1)
  {
    id: 1,
    questionnaire_id: 1,
    text: 'Over the last 2 weeks, how often have you been bothered by feeling nervous, anxious, or on edge?',
    type: 'single_choice',
    required: true,
    order_num: 1,
    options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
    conditional_logic: null,
    metadata: { scoring: [0, 1, 2, 3] },
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 2,
    questionnaire_id: 1,
    text: 'Over the last 2 weeks, how often have you been bothered by not being able to stop or control worrying?',
    type: 'single_choice',
    required: true,
    order_num: 2,
    options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
    conditional_logic: null,
    metadata: { scoring: [0, 1, 2, 3] },
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  // Depression Screening Questions (Questionnaire ID: 2)
  {
    id: 3,
    questionnaire_id: 2,
    text: 'Over the last 2 weeks, how often have you been bothered by little interest or pleasure in doing things?',
    type: 'single_choice',
    required: true,
    order_num: 1,
    options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
    conditional_logic: null,
    metadata: { scoring: [0, 1, 2, 3] },
    created_at: '2024-01-10T09:00:00Z',
    updated_at: '2024-01-10T09:00:00Z'
  },
  // Patient Feedback Questions (Questionnaire ID: 3)
  {
    id: 4,
    questionnaire_id: 3,
    section_id: undefined,
    text: 'How would you rate your overall experience with our service?',
    type: 'rating',
    required: true,
    order_num: 1,
    options: undefined,
    validation_rules: {
      min_value: 1,
      max_value: 5,
      step: 1
    },
    conditional_logic: null,
    metadata: { min: 1, max: 5, labels: ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'] },
    created_at: '2024-01-05T08:00:00Z',
    updated_at: '2024-01-05T08:00:00Z'
  },
  {
    id: 5,
    questionnaire_id: 3,
    text: 'Please provide any additional comments or suggestions:',
    type: 'textarea',
    required: false,
    order_num: 2,
    options: null,
    conditional_logic: null,
    metadata: { max_length: 500 },
    created_at: '2024-01-05T08:00:00Z',
    updated_at: '2024-01-05T08:00:00Z'
  },

  // Enhanced Question Types Examples (Questionnaire ID: 7)
  {
    id: 20,
    questionnaire_id: 7,
    section_id: 1,
    text: 'What is your full name?',
    type: 'text',
    required: true,
    order_num: 1,
    options: undefined,
    validation_rules: {
      min_length: 2,
      max_length: 100,
      pattern: '^[a-zA-Z\\s]+$'
    },
    conditional_logic: undefined,
    metadata: undefined,
    help_text: 'Please enter your first and last name',
    placeholder_text: 'Enter your full name',
    error_message: 'Please enter a valid name with only letters and spaces',
    is_template: false,
    template_category: undefined,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 21,
    questionnaire_id: 7,
    section_id: 1,
    text: 'Please describe your current symptoms in detail',
    type: 'textarea',
    required: true,
    order_num: 2,
    options: undefined,
    validation_rules: {
      min_length: 10,
      max_length: 1000
    },
    conditional_logic: undefined,
    metadata: undefined,
    help_text: 'Include when symptoms started, severity, and any triggers',
    placeholder_text: 'Describe your symptoms...',
    error_message: undefined,
    is_template: false,
    template_category: undefined,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 22,
    questionnaire_id: 7,
    section_id: 2,
    text: 'Which of the following symptoms have you experienced? (Select all that apply)',
    type: 'multiple_choice',
    required: true,
    order_num: 3,
    options: [
      'Persistent sadness',
      'Loss of interest in activities',
      'Fatigue or low energy',
      'Difficulty concentrating',
      'Changes in appetite',
      'Sleep disturbances',
      'Feelings of worthlessness',
      'Thoughts of self-harm'
    ],
    validation_rules: {
      min_selections: 1,
      max_selections: 8
    },
    conditional_logic: undefined,
    metadata: undefined,
    help_text: 'Select all symptoms that apply to your current situation',
    placeholder_text: undefined,
    error_message: 'Please select at least one symptom',
    is_template: false,
    template_category: undefined,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 23,
    questionnaire_id: 7,
    section_id: 2,
    text: 'Please rate your agreement: "I feel hopeful about the future"',
    type: 'likert',
    required: true,
    order_num: 4,
    options: [
      'Strongly Disagree',
      'Disagree',
      'Neutral',
      'Agree',
      'Strongly Agree'
    ],
    validation_rules: undefined,
    conditional_logic: undefined,
    metadata: {
      likert_scale: {
        scale_type: '5_point',
        labels: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
        neutral_option: true
      }
    },
    help_text: 'Select the option that best represents your feelings',
    placeholder_text: undefined,
    error_message: undefined,
    is_template: false,
    template_category: undefined,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 24,
    questionnaire_id: 7,
    section_id: 2,
    text: 'How would you rate the quality of your sleep last night?',
    type: 'star_rating',
    required: true,
    order_num: 5,
    options: undefined,
    validation_rules: {
      min_value: 1,
      max_value: 5,
      step: 1
    },
    conditional_logic: undefined,
    metadata: {
      rating_scale: {
        min: 1,
        max: 5,
        show_numbers: false
      }
    },
    help_text: 'Rate from 1 star (very poor) to 5 stars (excellent)',
    placeholder_text: undefined,
    error_message: undefined,
    is_template: false,
    template_category: undefined,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 25,
    questionnaire_id: 7,
    section_id: 3,
    text: 'How likely are you to recommend our service to a friend or colleague?',
    type: 'nps',
    required: true,
    order_num: 6,
    options: undefined,
    validation_rules: {
      min_value: 0,
      max_value: 10,
      step: 1
    },
    conditional_logic: undefined,
    metadata: {
      nps_config: {
        detractor_range: [0, 6],
        passive_range: [7, 8],
        promoter_range: [9, 10]
      }
    },
    help_text: '0 = Not at all likely, 10 = Extremely likely',
    placeholder_text: undefined,
    error_message: undefined,
    is_template: false,
    template_category: undefined,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  }
];

// Mock questionnaire versions for version control
export const mockQuestionnaireVersions: QuestionnaireVersion[] = [
  {
    id: 1,
    questionnaire_id: 1,
    version_number: 1,
    title: 'GAD-7 Anxiety Assessment',
    description: 'Initial version of GAD-7 assessment',
    type: 'assessment',
    category: 'mental_health',
    estimated_time: 5,
    is_active: true,
    is_adaptive: false,
    is_qr_enabled: true,
    is_template: false,
    is_public: true,
    allow_anonymous: true,
    requires_auth: false,
    max_responses: 1000,
    expires_at: '2024-12-31T23:59:59Z',
    tags: ['anxiety', 'screening'],
    questions_snapshot: null,
    change_summary: 'Initial version',
    created_by_id: 1,
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 2,
    questionnaire_id: 1,
    version_number: 2,
    title: 'GAD-7 Anxiety Assessment',
    description: 'Generalized Anxiety Disorder 7-item scale for measuring anxiety symptoms',
    type: 'assessment',
    category: 'mental_health',
    estimated_time: 5,
    is_active: true,
    is_adaptive: false,
    is_qr_enabled: true,
    is_template: false,
    is_public: true,
    allow_anonymous: true,
    requires_auth: false,
    max_responses: 1000,
    expires_at: '2024-12-31T23:59:59Z',
    tags: ['anxiety', 'screening', 'validated', 'clinical'],
    questions_snapshot: null,
    change_summary: 'Updated description and added clinical validation tags',
    created_by_id: 1,
    created_at: '2024-01-20T14:30:00Z'
  }
];

// Mock responses
export const mockResponses: Response[] = [
  {
    id: 1,
    questionnaire_id: 1,
    user_id: null,
    patient_identifier: 'ANON_001',
    patient_name: null,
    patient_email: null,
    patient_age: 28,
    patient_gender: 'female',
    score: 12,
    risk_level: 'moderate',
    flagged_for_review: false,
    completion_time: 4,
    completed_at: '2024-01-21T10:30:00Z',
    organization_id: 1,
    created_at: '2024-01-21T10:26:00Z',
    updated_at: '2024-01-21T10:30:00Z'
  }
];

// Mock answers
export const mockAnswers: Answer[] = [
  {
    id: 1,
    response_id: 1,
    question_id: 1,
    value: '2',
    created_at: '2024-01-21T10:27:00Z',
    updated_at: '2024-01-21T10:27:00Z'
  },
  {
    id: 2,
    response_id: 1,
    question_id: 2,
    value: '1',
    created_at: '2024-01-21T10:28:00Z',
    updated_at: '2024-01-21T10:28:00Z'
  }
];

// Helper functions for mock data operations
export class MockQuestionnaireService {
  static getAllQuestionnaires(filters?: {
    is_active?: boolean;
    is_public?: boolean;
    is_template?: boolean;
    type?: QuestionnaireType;
    category?: string;
    search?: string;
  }) {
    let filtered = [...mockQuestionnaires];

    if (filters) {
      if (filters.is_active !== undefined) {
        filtered = filtered.filter(q => q.is_active === filters.is_active);
      }
      if (filters.is_public !== undefined) {
        filtered = filtered.filter(q => q.is_public === filters.is_public);
      }
      if (filters.is_template !== undefined) {
        filtered = filtered.filter(q => q.is_template === filters.is_template);
      }
      if (filters.type) {
        filtered = filtered.filter(q => q.type === filters.type);
      }
      if (filters.category) {
        filtered = filtered.filter(q => q.category === filters.category);
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter(q => 
          q.title.toLowerCase().includes(searchLower) ||
          (q.description && q.description.toLowerCase().includes(searchLower))
        );
      }
    }

    return filtered;
  }

  static getQuestionnaireById(id: number) {
    return mockQuestionnaires.find(q => q.id === id);
  }

  static getQuestionsByQuestionnaireId(questionnaireId: number) {
    return mockQuestions.filter(q => q.questionnaire_id === questionnaireId);
  }

  static getQuestionnaireVersions(questionnaireId: number) {
    return mockQuestionnaireVersions.filter(v => v.questionnaire_id === questionnaireId);
  }

  static getTemplates() {
    return mockQuestionnaires.filter(q => q.is_template);
  }

  static duplicateQuestionnaire(id: number, newTitle: string) {
    const original = this.getQuestionnaireById(id);
    if (!original) return null;

    const newId = Math.max(...mockQuestionnaires.map(q => q.id)) + 1;
    const duplicate: Questionnaire = {
      ...original,
      id: newId,
      title: newTitle,
      version: 1,
      parent_id: id,
      is_template: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    mockQuestionnaires.push(duplicate);
    return duplicate;
  }
}
