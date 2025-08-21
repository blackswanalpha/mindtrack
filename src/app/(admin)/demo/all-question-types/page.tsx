'use client'

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { QuestionRenderer } from '@/components/question-builder/question-renderer';
import { Question, QuestionType } from '@/types/database';
import { 
  Type, 
  CheckSquare, 
  Star, 
  Calendar, 
  Upload, 
  MapPin,
  Hash,
  RefreshCw
} from 'lucide-react';

export default function AllQuestionTypesDemo() {
  const [answers, setAnswers] = useState<Record<number, any>>({});

  // All 22 question types with sample data
  const allQuestionTypes: Array<{
    category: string;
    icon: React.ReactNode;
    questions: Question[];
  }> = [
    {
      category: 'Text Input',
      icon: <Type className="w-5 h-5" />,
      questions: [
        {
          id: 1,
          questionnaire_id: 1,
          text: 'What is your name?',
          type: 'text' as QuestionType,
          required: true,
          order_num: 1,
          placeholder_text: 'Enter your full name',
          validation_rules: { max_length: 100 },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          questionnaire_id: 1,
          text: 'Please describe your experience in detail',
          type: 'textarea' as QuestionType,
          required: false,
          order_num: 2,
          placeholder_text: 'Share your thoughts...',
          validation_rules: { max_length: 500 },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 3,
          questionnaire_id: 1,
          text: 'Write a formatted response with rich text',
          type: 'rich_text' as QuestionType,
          required: false,
          order_num: 3,
          help_text: 'You can use formatting options here',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
    },
    {
      category: 'Choice Questions',
      icon: <CheckSquare className="w-5 h-5" />,
      questions: [
        {
          id: 4,
          questionnaire_id: 1,
          text: 'What is your preferred programming language?',
          type: 'single_choice' as QuestionType,
          required: true,
          order_num: 4,
          options: ['JavaScript', 'Python', 'Java', 'C++', 'Other'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 5,
          questionnaire_id: 1,
          text: 'Which technologies do you use? (Select all that apply)',
          type: 'multiple_choice' as QuestionType,
          required: false,
          order_num: 5,
          options: ['React', 'Vue', 'Angular', 'Node.js', 'Express', 'Next.js'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 6,
          questionnaire_id: 1,
          text: 'Select your experience level',
          type: 'dropdown' as QuestionType,
          required: true,
          order_num: 6,
          options: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
    },
    {
      category: 'Rating Scales',
      icon: <Star className="w-5 h-5" />,
      questions: [
        {
          id: 7,
          questionnaire_id: 1,
          text: 'Rate your satisfaction (1-10)',
          type: 'rating' as QuestionType,
          required: true,
          order_num: 7,
          validation_rules: { min_value: 1, max_value: 10 },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 8,
          questionnaire_id: 1,
          text: 'Give us a star rating',
          type: 'star_rating' as QuestionType,
          required: false,
          order_num: 8,
          validation_rules: { max_value: 5 },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 9,
          questionnaire_id: 1,
          text: 'I am satisfied with this service',
          type: 'likert' as QuestionType,
          required: true,
          order_num: 9,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 10,
          questionnaire_id: 1,
          text: 'How likely are you to recommend us?',
          type: 'nps' as QuestionType,
          required: true,
          order_num: 10,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 11,
          questionnaire_id: 1,
          text: 'Rate this product on the scale below',
          type: 'semantic_differential' as QuestionType,
          required: false,
          order_num: 11,
          validation_rules: { max_value: 7 },
          metadata: { left_label: 'Poor', right_label: 'Excellent' },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 12,
          questionnaire_id: 1,
          text: 'Adjust the slider to your preference',
          type: 'slider' as QuestionType,
          required: false,
          order_num: 12,
          validation_rules: { min_value: 0, max_value: 100, step: 5 },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
    },
    {
      category: 'Numeric Input',
      icon: <Hash className="w-5 h-5" />,
      questions: [
        {
          id: 13,
          questionnaire_id: 1,
          text: 'How many years of experience do you have?',
          type: 'number' as QuestionType,
          required: true,
          order_num: 13,
          validation_rules: { min_value: 0, max_value: 50 },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 14,
          questionnaire_id: 1,
          text: 'What is your hourly rate? (USD)',
          type: 'decimal' as QuestionType,
          required: false,
          order_num: 14,
          validation_rules: { min_value: 0, max_value: 1000, step: 0.01 },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
    },
    {
      category: 'Date & Time',
      icon: <Calendar className="w-5 h-5" />,
      questions: [
        {
          id: 15,
          questionnaire_id: 1,
          text: 'What is your birth date?',
          type: 'date' as QuestionType,
          required: false,
          order_num: 15,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 16,
          questionnaire_id: 1,
          text: 'What time do you usually wake up?',
          type: 'time' as QuestionType,
          required: false,
          order_num: 16,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 17,
          questionnaire_id: 1,
          text: 'When would you like to schedule a meeting?',
          type: 'datetime' as QuestionType,
          required: false,
          order_num: 17,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
    },
    {
      category: 'File Upload',
      icon: <Upload className="w-5 h-5" />,
      questions: [
        {
          id: 18,
          questionnaire_id: 1,
          text: 'Upload your resume',
          type: 'file_upload' as QuestionType,
          required: false,
          order_num: 18,
          help_text: 'Accepted formats: PDF, DOC, DOCX',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 19,
          questionnaire_id: 1,
          text: 'Upload your profile picture',
          type: 'image_upload' as QuestionType,
          required: false,
          order_num: 19,
          help_text: 'Accepted formats: JPG, PNG, GIF',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
    },
    {
      category: 'Geographic',
      icon: <MapPin className="w-5 h-5" />,
      questions: [
        {
          id: 20,
          questionnaire_id: 1,
          text: 'Which country are you from?',
          type: 'country' as QuestionType,
          required: true,
          order_num: 20,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 21,
          questionnaire_id: 1,
          text: 'Which state/province?',
          type: 'state' as QuestionType,
          required: false,
          order_num: 21,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 22,
          questionnaire_id: 1,
          text: 'Which city?',
          type: 'city' as QuestionType,
          required: false,
          order_num: 22,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
    },
    {
      category: 'Basic',
      icon: <CheckSquare className="w-5 h-5" />,
      questions: [
        {
          id: 23,
          questionnaire_id: 1,
          text: 'Do you agree to the terms and conditions?',
          type: 'boolean' as QuestionType,
          required: true,
          order_num: 23,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
    }
  ];

  const totalQuestions = allQuestionTypes.reduce((sum, category) => sum + category.questions.length, 0);
  const answeredQuestions = Object.keys(answers).length;

  const clearAllAnswers = () => {
    setAnswers({});
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            All Question Types Demo
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Interactive demonstration of all 22 supported question types
          </p>
          
          {/* Stats */}
          <div className="flex items-center justify-center gap-6 mb-6">
            <Badge variant="outline" className="text-sm px-3 py-1">
              {totalQuestions} Total Questions
            </Badge>
            <Badge variant="secondary" className="text-sm px-3 py-1">
              {answeredQuestions} Answered
            </Badge>
            <Badge variant="outline" className="text-sm px-3 py-1">
              {Math.round((answeredQuestions / totalQuestions) * 100)}% Complete
            </Badge>
          </div>

          <Button onClick={clearAllAnswers} variant="outline" className="mb-8">
            <RefreshCw className="w-4 h-4 mr-2" />
            Clear All Answers
          </Button>
        </div>

        {/* Question Categories */}
        <div className="space-y-8">
          {allQuestionTypes.map((category, categoryIndex) => (
            <Card key={categoryIndex}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  {category.icon}
                  {category.category}
                  <Badge variant="outline" className="ml-auto">
                    {category.questions.length} question{category.questions.length !== 1 ? 's' : ''}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {category.questions.map((question, questionIndex) => (
                  <div key={question.id}>
                    {questionIndex > 0 && <Separator className="my-6" />}
                    <div className="space-y-4">
                      {/* Question Header */}
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-medium">
                          {question.id}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {question.type}
                            </Badge>
                            {question.required && (
                              <Badge variant="destructive" className="text-xs">
                                Required
                              </Badge>
                            )}
                          </div>
                          
                          {/* Question Renderer */}
                          <QuestionRenderer
                            question={question}
                            value={answers[question.id]}
                            onChange={(value) => setAnswers(prev => ({
                              ...prev,
                              [question.id]: value
                            }))}
                            disabled={false}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 p-6 bg-white rounded-lg border">
          <h3 className="text-lg font-semibold mb-2">All Question Types Implemented!</h3>
          <p className="text-gray-600">
            This demo shows all 22 question types working in the enhanced questionnaire system.
            Each type has proper validation, styling, and functionality.
          </p>
        </div>
      </div>
    </div>
  );
}
