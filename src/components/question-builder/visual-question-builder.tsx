'use client'

import React, { useState, useCallback } from 'react';
// Note: @dnd-kit packages need to be installed with: npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
// For now, using a simplified version without drag-and-drop
// import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCenter } from '@dnd-kit/core';
// import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { Question, QuestionSection, CreateQuestionData, CreateQuestionSectionData, QuestionType } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  GripVertical, 
  Settings, 
  Eye, 
  Trash2, 
  Copy, 
  ChevronDown, 
  ChevronRight,
  Type,
  CheckSquare,
  Star,
  Calendar,
  Upload,
  MapPin
} from 'lucide-react';
// import { SortableQuestionItem } from './sortable-question-item';
import { QuestionPreview } from './question-preview';
import { QuestionConfigPanel } from './question-config-panel';

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
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Set<number>>(new Set());

  // Question type icons mapping
  const questionTypeIcons: Record<QuestionType, React.ReactNode> = {
    text: <Type className="w-4 h-4" />,
    textarea: <Type className="w-4 h-4" />,
    rich_text: <Type className="w-4 h-4" />,
    multiple_choice: <CheckSquare className="w-4 h-4" />,
    single_choice: <CheckSquare className="w-4 h-4" />,
    dropdown: <CheckSquare className="w-4 h-4" />,
    rating: <Star className="w-4 h-4" />,
    likert: <Star className="w-4 h-4" />,
    star_rating: <Star className="w-4 h-4" />,
    nps: <Star className="w-4 h-4" />,
    semantic_differential: <Star className="w-4 h-4" />,
    boolean: <CheckSquare className="w-4 h-4" />,
    slider: <Star className="w-4 h-4" />,
    number: <Type className="w-4 h-4" />,
    decimal: <Type className="w-4 h-4" />,
    date: <Calendar className="w-4 h-4" />,
    time: <Calendar className="w-4 h-4" />,
    datetime: <Calendar className="w-4 h-4" />,
    file_upload: <Upload className="w-4 h-4" />,
    image_upload: <Upload className="w-4 h-4" />,
    country: <MapPin className="w-4 h-4" />,
    state: <MapPin className="w-4 h-4" />,
    city: <MapPin className="w-4 h-4" />
  };

  // Simplified handlers without drag and drop
  const handleDragStart = (event: any) => {
    // Placeholder for future drag and drop implementation
  };

  const handleDragEnd = (event: any) => {
    // Placeholder for future drag and drop implementation
  };

  const addQuestion = useCallback((type: QuestionType, sectionId?: number) => {
    const newQuestion: Question = {
      id: Date.now(), // Temporary ID
      questionnaire_id: questionnaireId,
      section_id: sectionId,
      text: `New ${type.replace('_', ' ')} question`,
      type,
      required: true,
      order_num: questions.length + 1,
      options: type.includes('choice') || type === 'dropdown' ? ['Option 1', 'Option 2'] : undefined,
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
    setSelectedQuestion(newQuestion);
  }, [questions, questionnaireId, onQuestionsChange]);

  const addSection = useCallback(() => {
    const newSection: QuestionSection = {
      id: Date.now(), // Temporary ID
      questionnaire_id: questionnaireId,
      title: 'New Section',
      description: undefined,
      order_num: sections.length + 1,
      is_collapsible: true,
      is_collapsed: false,
      conditional_logic: undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    onSectionsChange([...sections, newSection]);
  }, [sections, questionnaireId, onSectionsChange]);

  const deleteQuestion = useCallback((questionId: number) => {
    const updatedQuestions = questions.filter(q => q.id !== questionId);
    onQuestionsChange(updatedQuestions);
    if (selectedQuestion?.id === questionId) {
      setSelectedQuestion(null);
    }
  }, [questions, selectedQuestion, onQuestionsChange]);

  const duplicateQuestion = useCallback((question: Question) => {
    const duplicatedQuestion: Question = {
      ...question,
      id: Date.now(), // Temporary ID
      text: `${question.text} (Copy)`,
      order_num: questions.length + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    onQuestionsChange([...questions, duplicatedQuestion]);
  }, [questions, onQuestionsChange]);

  const updateQuestion = useCallback((updatedQuestion: Question) => {
    const updatedQuestions = questions.map(q => 
      q.id === updatedQuestion.id ? updatedQuestion : q
    );
    onQuestionsChange(updatedQuestions);
    setSelectedQuestion(updatedQuestion);
  }, [questions, onQuestionsChange]);

  const toggleSectionCollapse = useCallback((sectionId: number) => {
    const newCollapsed = new Set(collapsedSections);
    if (newCollapsed.has(sectionId)) {
      newCollapsed.delete(sectionId);
    } else {
      newCollapsed.add(sectionId);
    }
    setCollapsedSections(newCollapsed);
  }, [collapsedSections]);

  const getQuestionsForSection = (sectionId?: number) => {
    return questions.filter(q => q.section_id === sectionId);
  };

  const renderQuestionTypeButtons = (sectionId?: number) => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-4 bg-gray-50 rounded-lg">
      <Button
        variant="outline"
        size="sm"
        onClick={() => addQuestion('text', sectionId)}
        className="flex items-center gap-2"
      >
        <Type className="w-4 h-4" />
        Text
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => addQuestion('multiple_choice', sectionId)}
        className="flex items-center gap-2"
      >
        <CheckSquare className="w-4 h-4" />
        Multiple Choice
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => addQuestion('rating', sectionId)}
        className="flex items-center gap-2"
      >
        <Star className="w-4 h-4" />
        Rating
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => addQuestion('date', sectionId)}
        className="flex items-center gap-2"
      >
        <Calendar className="w-4 h-4" />
        Date
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => addQuestion('file_upload', sectionId)}
        className="flex items-center gap-2"
      >
        <Upload className="w-4 h-4" />
        File Upload
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => addQuestion('country', sectionId)}
        className="flex items-center gap-2"
      >
        <MapPin className="w-4 h-4" />
        Country
      </Button>
    </div>
  );

  return (
    <div className={`flex gap-6 ${className}`}>
      {/* Main Builder Area */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Question Builder</h2>
          <div className="flex gap-2">
            <Button
              variant={previewMode ? 'default' : 'outline'}
              onClick={() => setPreviewMode(!previewMode)}
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              {previewMode ? 'Edit Mode' : 'Preview Mode'}
            </Button>
            <Button onClick={addSection} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Section
            </Button>
          </div>
        </div>

        {previewMode ? (
          <QuestionPreview questions={questions} sections={sections} />
        ) : (
          <div>
            <div className="space-y-6">
              {/* Questions without sections */}
              {getQuestionsForSection(undefined).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Questions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      {getQuestionsForSection(undefined).map(question => (
                        <QuestionItem
                          key={question.id}
                          question={question}
                          icon={questionTypeIcons[question.type]}
                          onEdit={() => setSelectedQuestion(question)}
                          onDelete={() => deleteQuestion(question.id)}
                          onDuplicate={() => duplicateQuestion(question)}
                        />
                      ))}
                    </div>
                    {renderQuestionTypeButtons()}
                  </CardContent>
                </Card>
              )}

              {/* Sections with questions */}
              {sections.map(section => (
                <Card key={section.id}>
                  <CardHeader className="cursor-pointer" onClick={() => toggleSectionCollapse(section.id)}>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {collapsedSections.has(section.id) ? (
                          <ChevronRight className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                        {section.title}
                        <Badge variant="outline">
                          {getQuestionsForSection(section.id).length} questions
                        </Badge>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </CardTitle>
                    {section.description && (
                      <p className="text-sm text-gray-600">{section.description}</p>
                    )}
                  </CardHeader>
                  
                  {!collapsedSections.has(section.id) && (
                    <CardContent className="space-y-4">
                      <div>
                        {getQuestionsForSection(section.id).map(question => (
                          <QuestionItem
                            key={question.id}
                            question={question}
                            icon={questionTypeIcons[question.type]}
                            onEdit={() => setSelectedQuestion(question)}
                            onDelete={() => deleteQuestion(question.id)}
                            onDuplicate={() => duplicateQuestion(question)}
                          />
                        ))}
                      </div>
                      {renderQuestionTypeButtons(section.id)}
                    </CardContent>
                  )}
                </Card>
              ))}

              {/* Add first section if no sections exist */}
              {sections.length === 0 && getQuestionsForSection(undefined).length === 0 && (
                <Card className="border-dashed">
                  <CardContent className="p-12 text-center">
                    <div className="text-gray-500">
                      <Plus className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-2">Start Building Your Questionnaire</h3>
                      <p className="mb-4">Add questions directly or organize them into sections.</p>
                      <div className="flex gap-2 justify-center">
                        <Button onClick={addSection} variant="outline">
                          Add Section
                        </Button>
                        <Button onClick={() => addQuestion('text')}>
                          Add Question
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

          </div>
        )}
      </div>

      {/* Configuration Panel */}
      {selectedQuestion && !previewMode && (
        <div className="w-96">
          <QuestionConfigPanel
            question={selectedQuestion}
            onUpdate={updateQuestion}
            onClose={() => setSelectedQuestion(null)}
          />
        </div>
      )}
    </div>
  );
};

// Simple QuestionItem component to replace SortableQuestionItem
const QuestionItem = ({ question, icon, onEdit, onDelete, onDuplicate }: {
  question: Question;
  icon?: React.ReactNode;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) => {
  return (
    <div className="bg-white border rounded-lg p-4 hover:shadow-sm transition-shadow mb-2">
      <div className="flex items-center gap-3">
        <GripVertical className="w-4 h-4 text-gray-400" />
        {icon}
        <div className="flex-1">
          <div className="font-medium">{question.text}</div>
          <div className="text-sm text-gray-500 capitalize">{question.type.replace('_', ' ')}</div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Settings className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onDuplicate}>
            <Copy className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VisualQuestionBuilder;
