'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Plus,
  Type,
  Hash,
  Calendar,
  Upload,
  Star,
  MapPin,
  GitBranch,
  Eye,
  Settings,
  FileText,
  Info
} from 'lucide-react';
import { Question, QuestionSection, QuestionType } from '@/types/database';
import { VisualQuestionBuilder } from '@/components/question-builder/visual-question-builder-simple';
import { QuestionRenderer } from '@/components/question-builder/question-renderer';

interface EnhancedQuestionBuilderProps {
  templateId?: number;
  templateName?: string;
  allowCustomization?: boolean;
  questions: Question[];
  sections: QuestionSection[];
  onQuestionsChange: (questions: Question[]) => void;
  onSectionsChange: (sections: QuestionSection[]) => void;
}

export const EnhancedQuestionBuilder: React.FC<EnhancedQuestionBuilderProps> = ({
  templateId,
  templateName,
  allowCustomization = true,
  questions,
  sections,
  onQuestionsChange,
  onSectionsChange
}) => {
  const [activeTab, setActiveTab] = useState<'builder' | 'preview' | 'templates'>('builder');
  const [loadingTemplate, setLoadingTemplate] = useState(false);
  const [previewAnswers, setPreviewAnswers] = useState<Record<number, any>>({});

  // Enhanced question types with all requested features
  const enhancedQuestionTypes = [
    // Text Types
    { 
      type: 'text' as QuestionType, 
      label: 'Short Text', 
      icon: Type, 
      category: 'Text Input',
      description: 'Single line text input with validation'
    },
    { 
      type: 'textarea' as QuestionType, 
      label: 'Long Text', 
      icon: Type, 
      category: 'Text Input',
      description: 'Multi-line text area for detailed responses'
    },
    { 
      type: 'rich_text' as QuestionType, 
      label: 'Rich Text', 
      icon: Type, 
      category: 'Text Input',
      description: 'Formatted text with styling options'
    },

    // Numeric Types
    { 
      type: 'number' as QuestionType, 
      label: 'Integer Number', 
      icon: Hash, 
      category: 'Numeric',
      description: 'Whole number input with range validation'
    },
    { 
      type: 'decimal' as QuestionType, 
      label: 'Decimal Number', 
      icon: Hash, 
      category: 'Numeric',
      description: 'Decimal number with precision control'
    },

    // Date/Time Types
    { 
      type: 'date' as QuestionType, 
      label: 'Date Picker', 
      icon: Calendar, 
      category: 'Date/Time',
      description: 'Date selection with calendar interface'
    },
    { 
      type: 'time' as QuestionType, 
      label: 'Time Picker', 
      icon: Calendar, 
      category: 'Date/Time',
      description: 'Time selection with hour/minute picker'
    },
    { 
      type: 'datetime' as QuestionType, 
      label: 'Date & Time', 
      icon: Calendar, 
      category: 'Date/Time',
      description: 'Combined date and time selection'
    },

    // File Upload Types
    { 
      type: 'file_upload' as QuestionType, 
      label: 'Document Upload', 
      icon: Upload, 
      category: 'File Upload',
      description: 'Upload documents with type and size validation'
    },
    { 
      type: 'image_upload' as QuestionType, 
      label: 'Image Upload', 
      icon: Upload, 
      category: 'File Upload',
      description: 'Upload images with preview and validation'
    },

    // Rating Scale Types
    { 
      type: 'rating' as QuestionType, 
      label: 'Numeric Rating', 
      icon: Star, 
      category: 'Rating Scales',
      description: 'Numeric scale rating (1-10, 1-5, etc.)'
    },
    { 
      type: 'star_rating' as QuestionType, 
      label: 'Star Rating', 
      icon: Star, 
      category: 'Rating Scales',
      description: 'Interactive star rating system'
    },
    { 
      type: 'likert' as QuestionType, 
      label: 'Likert Scale', 
      icon: Star, 
      category: 'Rating Scales',
      description: 'Agreement scale (Strongly Agree to Strongly Disagree)'
    },
    { 
      type: 'nps' as QuestionType, 
      label: 'Net Promoter Score', 
      icon: Star, 
      category: 'Rating Scales',
      description: '0-10 recommendation likelihood scale'
    },
    { 
      type: 'semantic_differential' as QuestionType, 
      label: 'Semantic Differential', 
      icon: Star, 
      category: 'Rating Scales',
      description: 'Bipolar scale between two concepts'
    },
    { 
      type: 'slider' as QuestionType, 
      label: 'Slider Scale', 
      icon: Star, 
      category: 'Rating Scales',
      description: 'Continuous slider for range selection'
    },

    // Choice Types
    { 
      type: 'single_choice' as QuestionType, 
      label: 'Single Choice', 
      icon: Type, 
      category: 'Choice',
      description: 'Radio buttons for single selection'
    },
    { 
      type: 'multiple_choice' as QuestionType, 
      label: 'Multiple Choice', 
      icon: Type, 
      category: 'Choice',
      description: 'Checkboxes for multiple selections'
    },
    { 
      type: 'dropdown' as QuestionType, 
      label: 'Dropdown', 
      icon: Type, 
      category: 'Choice',
      description: 'Dropdown menu for single selection'
    },

    // Geographic Types
    { 
      type: 'country' as QuestionType, 
      label: 'Country Selection', 
      icon: MapPin, 
      category: 'Geographic',
      description: 'Built-in country dropdown with flags'
    },
    { 
      type: 'state' as QuestionType, 
      label: 'State/Province', 
      icon: MapPin, 
      category: 'Geographic',
      description: 'State or province selection'
    },
    { 
      type: 'city' as QuestionType, 
      label: 'City', 
      icon: MapPin, 
      category: 'Geographic',
      description: 'City selection with autocomplete'
    },

    // Basic Types
    { 
      type: 'boolean' as QuestionType, 
      label: 'Yes/No', 
      icon: Type, 
      category: 'Basic',
      description: 'Simple yes/no or true/false question'
    }
  ];

  // Group question types by category
  const questionTypesByCategory = enhancedQuestionTypes.reduce((acc, type) => {
    if (!acc[type.category]) {
      acc[type.category] = [];
    }
    acc[type.category].push(type);
    return acc;
  }, {} as Record<string, typeof enhancedQuestionTypes>);

  useEffect(() => {
    if (templateId && templateName) {
      loadTemplateQuestions();
    }
  }, [templateId, templateName]);

  const loadTemplateQuestions = async () => {
    setLoadingTemplate(true);
    try {
      // Simulate loading template questions
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock template questions based on template ID
      const mockTemplateQuestions = getTemplateQuestions(templateId!);
      onQuestionsChange(mockTemplateQuestions);
      
    } catch (error) {
      console.error('Error loading template:', error);
    } finally {
      setLoadingTemplate(false);
    }
  };

  const getTemplateQuestions = (templateId: number): Question[] => {
    // Mock template questions
    const templates: Record<number, Question[]> = {
      1: [ // GAD-7 Anxiety Assessment
        {
          id: 1,
          questionnaire_id: 1,
          text: 'Over the last 2 weeks, how often have you been bothered by feeling nervous, anxious, or on edge?',
          type: 'likert',
          required: true,
          order_num: 1,
          options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
          validation_rules: undefined,
          conditional_logic: undefined,
          metadata: undefined,
          help_text: 'Select the option that best describes your experience',
          placeholder_text: undefined,
          error_message: undefined,
          is_template: false,
          template_category: undefined,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          questionnaire_id: 1,
          text: 'Over the last 2 weeks, how often have you been bothered by not being able to stop or control worrying?',
          type: 'likert',
          required: true,
          order_num: 2,
          options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
          validation_rules: undefined,
          conditional_logic: undefined,
          metadata: undefined,
          help_text: 'Select the option that best describes your experience',
          placeholder_text: undefined,
          error_message: undefined,
          is_template: false,
          template_category: undefined,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ],
      2: [ // PHQ-9 Depression Screening
        {
          id: 3,
          questionnaire_id: 1,
          text: 'Over the last 2 weeks, how often have you been bothered by little interest or pleasure in doing things?',
          type: 'likert',
          required: true,
          order_num: 1,
          options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
          validation_rules: undefined,
          conditional_logic: undefined,
          metadata: undefined,
          help_text: undefined,
          placeholder_text: undefined,
          error_message: undefined,
          is_template: false,
          template_category: undefined,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
    };

    return templates[templateId] || [];
  };

  const renderQuestionTypeLibrary = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Enhanced Question Types</h3>
        <p className="text-gray-600">Choose from our comprehensive collection of question types</p>
      </div>

      {Object.entries(questionTypesByCategory).map(([category, types]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="text-base">{category}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {types.map(type => {
                const Icon = type.icon;
                return (
                  <Card 
                    key={type.type}
                    className="cursor-pointer hover:shadow-md transition-shadow border-dashed"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Icon className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm">{type.label}</h4>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {type.description}
                          </p>
                          <Badge variant="outline" className="text-xs mt-2">
                            {type.type}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Template Info */}
      {templateId && templateName && (
        <Alert>
          <FileText className="h-4 w-4" />
          <AlertDescription>
            <strong>Using Template:</strong> {templateName}
            {allowCustomization ? ' (Customizable)' : ' (Read-only)'}
            {loadingTemplate && ' - Loading questions...'}
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="builder" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Builder
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Question Types
          </TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="space-y-4">
          <VisualQuestionBuilder
            questionnaireId={1}
            questions={questions}
            sections={sections}
            onQuestionsChange={onQuestionsChange}
            onSectionsChange={onSectionsChange}
          />
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Questionnaire Preview
              </CardTitle>
              <p className="text-sm text-gray-600">
                This is how respondents will see your questionnaire
              </p>
            </CardHeader>
            <CardContent>
              {questions.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                  <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No Questions Added Yet</h3>
                  <p className="text-sm">Add questions in the Builder tab to see the preview</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Preview Header */}
                  <div className="border-b pb-4 space-y-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        {templateName || 'Your Questionnaire'}
                      </h2>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{questions.length} question{questions.length !== 1 ? 's' : ''}</span>
                        <span>•</span>
                        <span>{questions.filter(q => q.required).length} required</span>
                        <span>•</span>
                        <span>Est. {Math.max(1, Math.ceil(questions.length * 0.5))} min</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="text-gray-900 font-medium">
                          {Object.keys(previewAnswers).length} of {questions.length} answered
                        </span>
                      </div>
                      <Progress
                        value={questions.length > 0 ? (Object.keys(previewAnswers).length / questions.length) * 100 : 0}
                        className="h-2"
                      />
                    </div>
                  </div>

                  {/* Questions Preview */}
                  <div className="space-y-8">
                    {questions
                      .sort((a, b) => a.order_num - b.order_num)
                      .map((question, index) => (
                        <div key={question.id} className="space-y-3">
                          {/* Question Number */}
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </div>

                            <div className="flex-1 space-y-4">
                              {/* Question Renderer */}
                              <QuestionRenderer
                                question={question}
                                value={previewAnswers[question.id]}
                                onChange={(value) => setPreviewAnswers(prev => ({
                                  ...prev,
                                  [question.id]: value
                                }))}
                                disabled={false}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Preview Footer */}
                  <div className="border-t pt-6">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        Preview Mode - Responses are not saved
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setPreviewAnswers({})}>
                          Clear Answers
                        </Button>
                        <Button>
                          Submit (Preview)
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          {renderQuestionTypeLibrary()}
        </TabsContent>
      </Tabs>

      {/* Conditional Logic Info */}
      <Alert>
        <GitBranch className="h-4 w-4" />
        <AlertDescription>
          <strong>Conditional Logic Available:</strong> All question types support dynamic show/hide logic, 
          skip patterns, and branching based on previous answers. Configure in the question settings panel.
        </AlertDescription>
      </Alert>
    </div>
  );
};
