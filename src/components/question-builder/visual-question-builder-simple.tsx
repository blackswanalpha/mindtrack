'use client'

import React, { useState } from 'react';
import { Question, QuestionSection, CreateQuestionData, QuestionType } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Edit, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Type, 
  CheckSquare, 
  Star, 
  Calendar, 
  Upload, 
  MapPin,
  Info
} from 'lucide-react';

interface VisualQuestionBuilderProps {
  questionnaireId: number;
  questions: Question[];
  sections: QuestionSection[];
  onQuestionsChange: (questions: Question[]) => void;
  onSectionsChange: (sections: QuestionSection[]) => void;
  className?: string;
}

export const VisualQuestionBuilder: React.FC<VisualQuestionBuilderProps> = ({
  questionnaireId,
  questions,
  sections,
  onQuestionsChange,
  onSectionsChange,
  className
}) => {
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionType, setNewQuestionType] = useState<QuestionType>('text');
  const [newQuestionRequired, setNewQuestionRequired] = useState(true);

  // Question type icons mapping
  const questionTypeIcons: Record<QuestionType, React.ReactNode> = {
    // Text Input Types
    text: <Type className="w-4 h-4" />,
    textarea: <Type className="w-4 h-4" />,
    rich_text: <Type className="w-4 h-4" />,

    // Choice Types
    single_choice: <CheckSquare className="w-4 h-4" />,
    multiple_choice: <CheckSquare className="w-4 h-4" />,
    dropdown: <CheckSquare className="w-4 h-4" />,

    // Rating Scale Types
    rating: <Star className="w-4 h-4" />,
    star_rating: <Star className="w-4 h-4" />,
    likert: <Star className="w-4 h-4" />,
    nps: <Star className="w-4 h-4" />,
    semantic_differential: <Star className="w-4 h-4" />,
    slider: <Star className="w-4 h-4" />,

    // Numeric Types
    number: <Type className="w-4 h-4" />,
    decimal: <Type className="w-4 h-4" />,

    // Date/Time Types
    date: <Calendar className="w-4 h-4" />,
    time: <Calendar className="w-4 h-4" />,
    datetime: <Calendar className="w-4 h-4" />,

    // File Upload Types
    file_upload: <Upload className="w-4 h-4" />,
    image_upload: <Upload className="w-4 h-4" />,

    // Geographic Types
    country: <MapPin className="w-4 h-4" />,
    state: <MapPin className="w-4 h-4" />,
    city: <MapPin className="w-4 h-4" />,

    // Basic Types
    boolean: <CheckSquare className="w-4 h-4" />
  };

  const questionTypes: { value: QuestionType; label: string }[] = [
    // Text Input Types
    { value: 'text', label: 'Short Text' },
    { value: 'textarea', label: 'Long Text' },
    { value: 'rich_text', label: 'Rich Text' },

    // Choice Types
    { value: 'single_choice', label: 'Single Choice' },
    { value: 'multiple_choice', label: 'Multiple Choice' },
    { value: 'dropdown', label: 'Dropdown' },

    // Rating Scale Types
    { value: 'rating', label: 'Rating Scale' },
    { value: 'star_rating', label: 'Star Rating' },
    { value: 'likert', label: 'Likert Scale' },
    { value: 'nps', label: 'NPS' },
    { value: 'semantic_differential', label: 'Semantic Differential' },
    { value: 'slider', label: 'Slider' },

    // Numeric Types
    { value: 'number', label: 'Number' },
    { value: 'decimal', label: 'Decimal' },

    // Date/Time Types
    { value: 'date', label: 'Date' },
    { value: 'time', label: 'Time' },
    { value: 'datetime', label: 'Date & Time' },

    // File Upload Types
    { value: 'file_upload', label: 'File Upload' },
    { value: 'image_upload', label: 'Image Upload' },

    // Geographic Types
    { value: 'country', label: 'Country' },
    { value: 'state', label: 'State/Province' },
    { value: 'city', label: 'City' },

    // Basic Types
    { value: 'boolean', label: 'Yes/No' }
  ];

  const moveQuestion = (questionId: number, direction: 'up' | 'down') => {
    const currentIndex = questions.findIndex(q => q.id === questionId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= questions.length) return;

    const newQuestions = [...questions];
    [newQuestions[currentIndex], newQuestions[newIndex]] = [newQuestions[newIndex], newQuestions[currentIndex]];
    
    // Update order numbers
    const updatedQuestions = newQuestions.map((q, index) => ({
      ...q,
      order_num: index + 1
    }));
    onQuestionsChange(updatedQuestions);
  };

  const deleteQuestion = (questionId: number) => {
    const updatedQuestions = questions
      .filter(q => q.id !== questionId)
      .map((q, index) => ({ ...q, order_num: index + 1 }));
    onQuestionsChange(updatedQuestions);
  };

  const toggleRequired = (questionId: number) => {
    const updatedQuestions = questions.map(q =>
      q.id === questionId ? { ...q, required: !q.required } : q
    );
    onQuestionsChange(updatedQuestions);
  };

  const addQuestion = () => {
    if (!newQuestionText.trim()) return;

    const newQuestion: Question = {
      id: Math.max(...questions.map(q => q.id), 0) + 1,
      questionnaire_id: questionnaireId,
      text: newQuestionText,
      type: newQuestionType,
      required: newQuestionRequired,
      order_num: questions.length + 1,
      options: undefined,
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
    };

    onQuestionsChange([...questions, newQuestion]);
    setNewQuestionText('');
    setNewQuestionType('text');
    setNewQuestionRequired(true);
    setShowAddQuestion(false);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Question Builder</h3>
          <p className="text-sm text-gray-600">
            Add and organize questions for your questionnaire
          </p>
          {questions.length > 0 && (
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="destructive" className="text-xs">
                  {questions.filter(q => q.required).length} Required
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {questions.filter(q => !q.required).length} Optional
                </Badge>
              </div>
              <span className="text-xs text-gray-500">
                Total: {questions.length} question{questions.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
        <Button onClick={() => setShowAddQuestion(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Question
        </Button>
      </div>

      {/* Add Question Form */}
      {showAddQuestion && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Question</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Question Text</label>
              <Input
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
                placeholder="Enter your question..."
              />
            </div>
            <div>
              <label className="text-sm font-medium">Question Type</label>
              <Select value={newQuestionType} onValueChange={(value) => setNewQuestionType(value as QuestionType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {questionTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        {questionTypeIcons[type.value]}
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="required-checkbox"
                  checked={newQuestionRequired}
                  onCheckedChange={(checked) => setNewQuestionRequired(checked as boolean)}
                />
                <Label
                  htmlFor="required-checkbox"
                  className="text-sm font-medium cursor-pointer"
                >
                  Required question
                </Label>
              </div>
              <p className="text-xs text-gray-500 ml-6">
                {newQuestionRequired
                  ? "Respondents must answer this question to continue"
                  : "This question is optional for respondents"
                }
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={addQuestion} disabled={!newQuestionText.trim()}>
                Add Question
              </Button>
              <Button variant="outline" onClick={() => {
                setShowAddQuestion(false);
                setNewQuestionText('');
                setNewQuestionType('text');
                setNewQuestionRequired(true);
              }}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Questions List */}
      {questions.length === 0 ? (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            No questions added yet. Click "Add Question" to get started.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-3">
          {questions
            .sort((a, b) => a.order_num - b.order_num)
            .map((question, index) => (
              <Card key={question.id} className="transition-shadow hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      {questionTypeIcons[question.type]}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">
                            {question.text}
                          </h4>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {question.type}
                            </Badge>
                            <button
                              onClick={() => toggleRequired(question.id)}
                              className="transition-colors"
                            >
                              {question.required ? (
                                <Badge variant="destructive" className="text-xs cursor-pointer hover:bg-red-600">
                                  Required
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs cursor-pointer hover:bg-gray-100">
                                  Optional
                                </Badge>
                              )}
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveQuestion(question.id, 'up')}
                            disabled={index === 0}
                          >
                            <ArrowUp className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveQuestion(question.id, 'down')}
                            disabled={index === questions.length - 1}
                          >
                            <ArrowDown className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedQuestion(question)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteQuestion(question.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      {/* Help Notes */}
      <div className="space-y-3">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Tip:</strong> Click on the "Required" or "Optional" badges to toggle whether a question is mandatory for respondents.
          </AlertDescription>
        </Alert>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Note:</strong> This is a simplified version of the question builder.
            To enable drag-and-drop functionality, install the required dependencies:
            <code className="ml-1">npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities</code>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};
