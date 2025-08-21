'use client'

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Type, 
  Hash, 
  Calendar, 
  Upload, 
  Star, 
  MapPin, 
  GitBranch,
  CheckSquare,
  ToggleLeft
} from 'lucide-react';
import { Question, QuestionType } from '@/types/database';
import { QuestionRenderer } from '@/components/question-builder/question-renderer';

export const EnhancedQuestionTypesDemo: React.FC = () => {
  const [answers, setAnswers] = useState<Record<number, any>>({});

  // Demo questions showcasing all enhanced question types
  const demoQuestions: Question[] = [
    // Text Input Types
    {
      id: 1,
      questionnaire_id: 1,
      text: 'What is your full name?',
      type: 'text',
      required: true,
      order_num: 1,
      validation_rules: { min_length: 2, max_length: 50 },
      help_text: 'Enter your first and last name',
      placeholder_text: 'John Doe',
      options: undefined,
      conditional_logic: undefined,
      metadata: undefined,
      error_message: undefined,
      is_template: false,
      template_category: undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 2,
      questionnaire_id: 1,
      text: 'Please describe your symptoms in detail',
      type: 'textarea',
      required: false,
      order_num: 2,
      validation_rules: { max_length: 500 },
      help_text: 'Include duration, severity, and any triggers',
      placeholder_text: 'Describe your symptoms...',
      options: undefined,
      conditional_logic: undefined,
      metadata: undefined,
      error_message: undefined,
      is_template: false,
      template_category: undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },

    // Numeric Types
    {
      id: 3,
      questionnaire_id: 1,
      text: 'How many hours of sleep do you get per night?',
      type: 'number',
      required: true,
      order_num: 3,
      validation_rules: { min_value: 0, max_value: 24 },
      help_text: 'Enter a whole number of hours',
      options: undefined,
      conditional_logic: undefined,
      metadata: undefined,
      error_message: undefined,
      is_template: false,
      template_category: undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 4,
      questionnaire_id: 1,
      text: 'What is your current weight in kg?',
      type: 'decimal',
      required: false,
      order_num: 4,
      validation_rules: { min_value: 20, max_value: 300, decimal_places: 1 },
      help_text: 'Enter your weight to one decimal place',
      placeholder_text: '70.5',
      options: undefined,
      conditional_logic: undefined,
      metadata: undefined,
      error_message: undefined,
      is_template: false,
      template_category: undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },

    // Date/Time Types
    {
      id: 5,
      questionnaire_id: 1,
      text: 'When did your symptoms first appear?',
      type: 'date',
      required: true,
      order_num: 5,
      validation_rules: { max_date: new Date().toISOString().split('T')[0] },
      help_text: 'Select the date when you first noticed symptoms',
      options: undefined,
      conditional_logic: undefined,
      metadata: undefined,
      error_message: undefined,
      is_template: false,
      template_category: undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 6,
      questionnaire_id: 1,
      text: 'What time do you usually go to bed?',
      type: 'time',
      required: false,
      order_num: 6,
      help_text: 'Select your typical bedtime',
      options: undefined,
      validation_rules: undefined,
      conditional_logic: undefined,
      metadata: undefined,
      error_message: undefined,
      is_template: false,
      template_category: undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },

    // Rating Scale Types
    {
      id: 7,
      questionnaire_id: 1,
      text: 'How would you rate your overall mood today?',
      type: 'star_rating',
      required: true,
      order_num: 7,
      validation_rules: { min_value: 1, max_value: 5 },
      help_text: '1 star = very poor, 5 stars = excellent',
      options: undefined,
      conditional_logic: undefined,
      metadata: undefined,
      error_message: undefined,
      is_template: false,
      template_category: undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 8,
      questionnaire_id: 1,
      text: 'I feel confident about my future',
      type: 'likert',
      required: true,
      order_num: 8,
      options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
      help_text: 'Select the option that best represents your feelings',
      validation_rules: undefined,
      conditional_logic: undefined,
      metadata: undefined,
      error_message: undefined,
      is_template: false,
      template_category: undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 9,
      questionnaire_id: 1,
      text: 'How likely are you to recommend our service?',
      type: 'nps',
      required: true,
      order_num: 9,
      validation_rules: { min_value: 0, max_value: 10 },
      help_text: '0 = Not at all likely, 10 = Extremely likely',
      options: undefined,
      conditional_logic: undefined,
      metadata: undefined,
      error_message: undefined,
      is_template: false,
      template_category: undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },

    // Choice Types
    {
      id: 10,
      questionnaire_id: 1,
      text: 'Which symptoms are you currently experiencing? (Select all that apply)',
      type: 'multiple_choice',
      required: true,
      order_num: 10,
      options: ['Headaches', 'Fatigue', 'Nausea', 'Dizziness', 'Sleep problems', 'Anxiety'],
      validation_rules: { min_selections: 1, max_selections: 6 },
      help_text: 'Select all symptoms that apply to you',
      conditional_logic: undefined,
      metadata: undefined,
      error_message: undefined,
      is_template: false,
      template_category: undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 11,
      questionnaire_id: 1,
      text: 'What is your primary concern?',
      type: 'single_choice',
      required: true,
      order_num: 11,
      options: ['Physical health', 'Mental health', 'Work stress', 'Relationships', 'Financial concerns'],
      help_text: 'Choose your main area of concern',
      validation_rules: undefined,
      conditional_logic: undefined,
      metadata: undefined,
      error_message: undefined,
      is_template: false,
      template_category: undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },

    // Geographic Types
    {
      id: 12,
      questionnaire_id: 1,
      text: 'What country are you located in?',
      type: 'country',
      required: true,
      order_num: 12,
      help_text: 'Select your country of residence',
      options: undefined,
      validation_rules: undefined,
      conditional_logic: undefined,
      metadata: undefined,
      error_message: undefined,
      is_template: false,
      template_category: undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },

    // File Upload Types
    {
      id: 13,
      questionnaire_id: 1,
      text: 'Please upload any relevant medical documents',
      type: 'file_upload',
      required: false,
      order_num: 13,
      validation_rules: {
        max_file_size: 5 * 1024 * 1024, // 5MB
        allowed_file_types: ['application/pdf', 'image/jpeg', 'image/png'],
        max_files: 3
      },
      help_text: 'Accepted formats: PDF, JPEG, PNG. Maximum 5MB per file.',
      options: undefined,
      conditional_logic: undefined,
      metadata: undefined,
      error_message: undefined,
      is_template: false,
      template_category: undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },

    // Boolean Type
    {
      id: 14,
      questionnaire_id: 1,
      text: 'Are you currently taking any medications?',
      type: 'boolean',
      required: true,
      order_num: 14,
      help_text: 'Include prescription and over-the-counter medications',
      options: undefined,
      validation_rules: undefined,
      conditional_logic: undefined,
      metadata: undefined,
      error_message: undefined,
      is_template: false,
      template_category: undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  const questionTypeCategories = {
    'Text Input': demoQuestions.filter(q => ['text', 'textarea', 'rich_text'].includes(q.type)),
    'Numeric': demoQuestions.filter(q => ['number', 'decimal'].includes(q.type)),
    'Date/Time': demoQuestions.filter(q => ['date', 'time', 'datetime'].includes(q.type)),
    'Rating Scales': demoQuestions.filter(q => ['rating', 'star_rating', 'likert', 'nps', 'slider'].includes(q.type)),
    'Choice': demoQuestions.filter(q => ['single_choice', 'multiple_choice', 'dropdown'].includes(q.type)),
    'Geographic': demoQuestions.filter(q => ['country', 'state', 'city'].includes(q.type)),
    'File Upload': demoQuestions.filter(q => ['file_upload', 'image_upload'].includes(q.type)),
    'Basic': demoQuestions.filter(q => ['boolean'].includes(q.type))
  };

  const getTypeIcon = (type: QuestionType) => {
    const iconMap: Record<string, React.ComponentType<any>> = {
      text: Type, textarea: Type, rich_text: Type,
      number: Hash, decimal: Hash,
      date: Calendar, time: Calendar, datetime: Calendar,
      star_rating: Star, likert: Star, nps: Star, rating: Star, slider: Star,
      single_choice: CheckSquare, multiple_choice: CheckSquare, dropdown: CheckSquare,
      country: MapPin, state: MapPin, city: MapPin,
      file_upload: Upload, image_upload: Upload,
      boolean: ToggleLeft
    };
    const Icon = iconMap[type] || Type;
    return <Icon className="w-4 h-4" />;
  };

  const handleAnswerChange = (questionId: number, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Enhanced Question Types Demo</h2>
        <p className="text-gray-600">
          Explore all 22+ question types with live examples and interactive features
        </p>
      </div>

      <Tabs defaultValue="Text Input" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          {Object.keys(questionTypeCategories).map(category => (
            <TabsTrigger key={category} value={category} className="text-xs">
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(questionTypeCategories).map(([category, questions]) => (
          <TabsContent key={category} value={category} className="space-y-4">
            <div className="text-center mb-4">
              <Badge variant="outline" className="text-sm">
                {questions.length} question type{questions.length !== 1 ? 's' : ''} in {category}
              </Badge>
            </div>

            <div className="grid gap-6">
              {questions.map(question => (
                <Card key={question.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      {getTypeIcon(question.type)}
                      <span className="flex-1">{question.text}</span>
                      <Badge variant="secondary" className="text-xs">
                        {question.type}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <QuestionRenderer
                      question={question}
                      value={answers[question.id]}
                      onChange={(value) => handleAnswerChange(question.id, value)}
                    />
                    
                    {/* Show current value for debugging */}
                    {answers[question.id] !== undefined && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm font-medium text-gray-700 mb-1">Current Value:</div>
                        <div className="text-sm text-gray-600 font-mono">
                          {JSON.stringify(answers[question.id], null, 2)}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Conditional Logic Demo */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <GitBranch className="w-5 h-5" />
            Conditional Logic Available
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-blue-800 mb-4">
            All question types support advanced conditional logic features:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-blue-900 mb-2">Show/Hide Logic</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Show questions based on previous answers</li>
                <li>• Hide irrelevant questions dynamically</li>
                <li>• Support for AND/OR conditions</li>
                <li>• Multiple condition combinations</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-900 mb-2">Advanced Features</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Skip patterns and branching</li>
                <li>• Dynamic question text</li>
                <li>• Required field logic</li>
                <li>• Progress calculation</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
