'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Eye, 
  Save, 
  Settings,
  Type,
  List,
  Star,
  ToggleLeft,
  MessageSquare,
  Sliders
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface QuestionBuilderData {
  id?: number;
  text: string;
  type: 'text' | 'multiple_choice' | 'rating' | 'boolean' | 'textarea' | 'single_choice' | 'likert' | 'slider';
  required: boolean;
  order_num: number;
  options?: string[];
  metadata?: {
    min?: number;
    max?: number;
    step?: number;
    scale_labels?: string[];
  };
}

export interface QuestionnaireBuilderData {
  id?: number;
  title: string;
  description?: string;
  type?: string;
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
  questions: QuestionBuilderData[];
}

export interface QuestionnaireBuilderProps {
  initialData?: Partial<QuestionnaireBuilderData>;
  onSave: (data: QuestionnaireBuilderData) => Promise<void>;
  onPreview?: (data: QuestionnaireBuilderData) => void;
  disabled?: boolean;
  className?: string;
}

const questionTypeOptions = [
  { value: 'text', label: 'Short Text', icon: Type },
  { value: 'textarea', label: 'Long Text', icon: MessageSquare },
  { value: 'single_choice', label: 'Single Choice', icon: List },
  { value: 'multiple_choice', label: 'Multiple Choice', icon: List },
  { value: 'rating', label: 'Star Rating', icon: Star },
  { value: 'likert', label: 'Likert Scale', icon: Sliders },
  { value: 'slider', label: 'Slider', icon: Sliders },
  { value: 'boolean', label: 'Yes/No', icon: ToggleLeft },
];

export const QuestionnaireBuilder: React.FC<QuestionnaireBuilderProps> = ({
  initialData,
  onSave,
  onPreview,
  disabled = false,
  className
}) => {
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireBuilderData>({
    title: '',
    description: '',
    type: 'assessment',
    category: 'mental_health',
    estimated_time: 5,
    is_active: true,
    is_adaptive: false,
    is_qr_enabled: true,
    is_template: false,
    is_public: false,
    allow_anonymous: true,
    requires_auth: false,
    questions: [],
    ...initialData
  });

  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'questions' | 'settings'>('basic');

  const addQuestion = () => {
    const newQuestion: QuestionBuilderData = {
      text: '',
      type: 'text',
      required: false,
      order_num: questionnaire.questions.length + 1,
      options: []
    };

    setQuestionnaire(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  const updateQuestion = (index: number, updates: Partial<QuestionBuilderData>) => {
    setQuestionnaire(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === index ? { ...q, ...updates } : q
      )
    }));
  };

  const removeQuestion = (index: number) => {
    setQuestionnaire(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
        .map((q, i) => ({ ...q, order_num: i + 1 }))
    }));
  };

  const moveQuestion = (fromIndex: number, toIndex: number) => {
    const questions = [...questionnaire.questions];
    const [movedQuestion] = questions.splice(fromIndex, 1);
    questions.splice(toIndex, 0, movedQuestion);
    
    setQuestionnaire(prev => ({
      ...prev,
      questions: questions.map((q, i) => ({ ...q, order_num: i + 1 }))
    }));
  };

  const addOption = (questionIndex: number) => {
    const question = questionnaire.questions[questionIndex];
    const newOptions = [...(question.options || []), ''];
    updateQuestion(questionIndex, { options: newOptions });
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const question = questionnaire.questions[questionIndex];
    const newOptions = [...(question.options || [])];
    newOptions[optionIndex] = value;
    updateQuestion(questionIndex, { options: newOptions });
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const question = questionnaire.questions[questionIndex];
    const newOptions = (question.options || []).filter((_, i) => i !== optionIndex);
    updateQuestion(questionIndex, { options: newOptions });
  };

  const handleSave = async () => {
    if (isSaving) return;

    setIsSaving(true);
    try {
      await onSave(questionnaire);
    } catch (error) {
      console.error('Failed to save questionnaire:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    if (onPreview) {
      onPreview(questionnaire);
    }
  };

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={questionnaire.title}
            onChange={(e) => setQuestionnaire(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter questionnaire title..."
            disabled={disabled}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={questionnaire.category}
            onValueChange={(value) => setQuestionnaire(prev => ({ ...prev, category: value }))}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mental_health">Mental Health</SelectItem>
              <SelectItem value="wellness">Wellness</SelectItem>
              <SelectItem value="assessment">Assessment</SelectItem>
              <SelectItem value="survey">Survey</SelectItem>
              <SelectItem value="feedback">Feedback</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={questionnaire.description}
          onChange={(e) => setQuestionnaire(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe the purpose and content of this questionnaire..."
          disabled={disabled}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="estimated_time">Estimated Time (minutes)</Label>
          <Input
            id="estimated_time"
            type="number"
            value={questionnaire.estimated_time}
            onChange={(e) => setQuestionnaire(prev => ({ 
              ...prev, 
              estimated_time: parseInt(e.target.value) || 0 
            }))}
            min="1"
            max="120"
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="max_responses">Max Responses (optional)</Label>
          <Input
            id="max_responses"
            type="number"
            value={questionnaire.max_responses || ''}
            onChange={(e) => setQuestionnaire(prev => ({ 
              ...prev, 
              max_responses: e.target.value ? parseInt(e.target.value) : undefined 
            }))}
            min="1"
            placeholder="Unlimited"
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );

  const renderQuestionBuilder = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Questions ({questionnaire.questions.length})</h3>
        <Button onClick={addQuestion} disabled={disabled} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Question
        </Button>
      </div>

      {questionnaire.questions.length === 0 ? (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
              <Plus className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No questions yet</h3>
            <p className="text-gray-500 text-center mb-4">
              Start building your questionnaire by adding your first question.
            </p>
            <Button onClick={addQuestion} disabled={disabled}>
              Add First Question
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {questionnaire.questions.map((question, index) => (
            <QuestionEditor
              key={index}
              question={question}
              index={index}
              onUpdate={(updates) => updateQuestion(index, updates)}
              onRemove={() => removeQuestion(index)}
              onMoveUp={index > 0 ? () => moveQuestion(index, index - 1) : undefined}
              onMoveDown={index < questionnaire.questions.length - 1 ? () => moveQuestion(index, index + 1) : undefined}
              onAddOption={() => addOption(index)}
              onUpdateOption={(optionIndex, value) => updateOption(index, optionIndex, value)}
              onRemoveOption={(optionIndex) => removeOption(index, optionIndex)}
              disabled={disabled}
            />
          ))}
        </div>
      )}
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Access Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Public Access</Label>
                <p className="text-sm text-gray-500">Allow anyone to access this questionnaire</p>
              </div>
              <Switch
                checked={questionnaire.is_public}
                onCheckedChange={(checked) => setQuestionnaire(prev => ({ ...prev, is_public: checked }))}
                disabled={disabled}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Anonymous Responses</Label>
                <p className="text-sm text-gray-500">Allow responses without user accounts</p>
              </div>
              <Switch
                checked={questionnaire.allow_anonymous}
                onCheckedChange={(checked) => setQuestionnaire(prev => ({ ...prev, allow_anonymous: checked }))}
                disabled={disabled}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Require Authentication</Label>
                <p className="text-sm text-gray-500">Users must be logged in to respond</p>
              </div>
              <Switch
                checked={questionnaire.requires_auth}
                onCheckedChange={(checked) => setQuestionnaire(prev => ({ ...prev, requires_auth: checked }))}
                disabled={disabled}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Active</Label>
                <p className="text-sm text-gray-500">Questionnaire is available for responses</p>
              </div>
              <Switch
                checked={questionnaire.is_active}
                onCheckedChange={(checked) => setQuestionnaire(prev => ({ ...prev, is_active: checked }))}
                disabled={disabled}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>QR Code Enabled</Label>
                <p className="text-sm text-gray-500">Generate QR codes for easy access</p>
              </div>
              <Switch
                checked={questionnaire.is_qr_enabled}
                onCheckedChange={(checked) => setQuestionnaire(prev => ({ ...prev, is_qr_enabled: checked }))}
                disabled={disabled}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Adaptive</Label>
                <p className="text-sm text-gray-500">Questions adapt based on responses</p>
              </div>
              <Switch
                checked={questionnaire.is_adaptive}
                onCheckedChange={(checked) => setQuestionnaire(prev => ({ ...prev, is_adaptive: checked }))}
                disabled={disabled}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Template</Label>
                <p className="text-sm text-gray-500">Save as reusable template</p>
              </div>
              <Switch
                checked={questionnaire.is_template}
                onCheckedChange={(checked) => setQuestionnaire(prev => ({ ...prev, is_template: checked }))}
                disabled={disabled}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className={cn("max-w-6xl mx-auto", className)}>
      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">
              {questionnaire.id ? 'Edit Questionnaire' : 'Create New Questionnaire'}
            </CardTitle>
            <div className="flex items-center gap-3">
              {onPreview && (
                <Button variant="outline" onClick={handlePreview} disabled={disabled}>
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
              )}
              <Button onClick={handleSave} disabled={isSaving || disabled}>
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="flex border-b">
            {[
              { key: 'basic', label: 'Basic Info' },
              { key: 'questions', label: 'Questions' },
              { key: 'settings', label: 'Settings' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={cn(
                  "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                  activeTab === tab.key
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent>
          {activeTab === 'basic' && renderBasicInfo()}
          {activeTab === 'questions' && renderQuestionBuilder()}
          {activeTab === 'settings' && renderSettings()}
        </CardContent>
      </Card>
    </div>
  );
};

// Question Editor Component
interface QuestionEditorProps {
  question: QuestionBuilderData;
  index: number;
  onUpdate: (updates: Partial<QuestionBuilderData>) => void;
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onAddOption: () => void;
  onUpdateOption: (optionIndex: number, value: string) => void;
  onRemoveOption: (optionIndex: number) => void;
  disabled?: boolean;
}

const QuestionEditor: React.FC<QuestionEditorProps> = ({
  question,
  index,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
  onAddOption,
  onUpdateOption,
  onRemoveOption,
  disabled = false
}) => {
  const questionType = questionTypeOptions.find(opt => opt.value === question.type);
  const needsOptions = ['single_choice', 'multiple_choice', 'likert'].includes(question.type);

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
              <Badge variant="outline">Q{index + 1}</Badge>
            </div>
            <div className="flex items-center gap-2">
              {questionType && <questionType.icon className="w-4 h-4 text-gray-500" />}
              <span className="text-sm text-gray-600">{questionType?.label}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onMoveUp && (
              <Button variant="ghost" size="sm" onClick={onMoveUp} disabled={disabled}>
                ↑
              </Button>
            )}
            {onMoveDown && (
              <Button variant="ghost" size="sm" onClick={onMoveDown} disabled={disabled}>
                ↓
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onRemove} disabled={disabled} className="text-red-600 hover:text-red-700">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Question Text *</Label>
            <Textarea
              value={question.text}
              onChange={(e) => onUpdate({ text: e.target.value })}
              placeholder="Enter your question..."
              disabled={disabled}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Question Type</Label>
            <Select
              value={question.type}
              onValueChange={(value) => onUpdate({ type: value as any })}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {questionTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <option.icon className="w-4 h-4" />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id={`required-${index}`}
              checked={question.required}
              onCheckedChange={(checked) => onUpdate({ required: checked })}
              disabled={disabled}
            />
            <Label htmlFor={`required-${index}`}>Required</Label>
          </div>
        </div>

        {needsOptions && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Options</Label>
              <Button variant="outline" size="sm" onClick={onAddOption} disabled={disabled}>
                <Plus className="w-4 h-4 mr-1" />
                Add Option
              </Button>
            </div>
            <div className="space-y-2">
              {(question.options || []).map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center gap-2">
                  <Input
                    value={option}
                    onChange={(e) => onUpdateOption(optionIndex, e.target.value)}
                    placeholder={`Option ${optionIndex + 1}`}
                    disabled={disabled}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveOption(optionIndex)}
                    disabled={disabled}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {(question.type === 'rating' || question.type === 'slider') && (
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Min Value</Label>
              <Input
                type="number"
                value={question.metadata?.min || 0}
                onChange={(e) => onUpdate({
                  metadata: { ...question.metadata, min: parseInt(e.target.value) || 0 }
                })}
                disabled={disabled}
              />
            </div>
            <div className="space-y-2">
              <Label>Max Value</Label>
              <Input
                type="number"
                value={question.metadata?.max || (question.type === 'rating' ? 5 : 100)}
                onChange={(e) => onUpdate({
                  metadata: { ...question.metadata, max: parseInt(e.target.value) || 5 }
                })}
                disabled={disabled}
              />
            </div>
            {question.type === 'slider' && (
              <div className="space-y-2">
                <Label>Step</Label>
                <Input
                  type="number"
                  value={question.metadata?.step || 1}
                  onChange={(e) => onUpdate({
                    metadata: { ...question.metadata, step: parseInt(e.target.value) || 1 }
                  })}
                  disabled={disabled}
                />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
