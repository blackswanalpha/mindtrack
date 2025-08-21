'use client'

import React from 'react';
import { QuestionTemplate, Question, CreateQuestionData } from '@/types/database';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { QuestionRenderer } from './question-renderer';
import { 
  Copy, 
  Star, 
  Users, 
  Clock, 
  Tag, 
  Info,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface TemplatePreviewModalProps {
  template: QuestionTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onUseTemplate: (templateData: CreateQuestionData) => void;
}

export const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  template,
  isOpen,
  onClose,
  onUseTemplate
}) => {
  if (!template) return null;

  const handleUseTemplate = () => {
    const questionData: CreateQuestionData = {
      text: template.template_data.text || template.name,
      type: template.type,
      required: template.template_data.required,
      options: template.template_data.options,
      validation_rules: template.template_data.validation_rules,
      metadata: template.template_data.metadata,
      help_text: template.template_data.help_text,
      placeholder_text: template.template_data.placeholder_text,
      error_message: template.template_data.error_message
    };

    onUseTemplate(questionData);
    onClose();
  };

  // Create a mock question for preview
  const mockQuestion: Question = {
    id: 0,
    questionnaire_id: 0,
    text: template.template_data.text || template.name,
    type: template.type,
    required: template.template_data.required || false,
    order_num: 1,
    options: template.template_data.options,
    validation_rules: template.template_data.validation_rules,
    conditional_logic: undefined,
    metadata: template.template_data.metadata,
    help_text: template.template_data.help_text,
    placeholder_text: template.template_data.placeholder_text,
    error_message: template.template_data.error_message,
    is_template: false,
    template_category: undefined,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'star_rating':
        return <Star className="w-4 h-4" />;
      case 'nps':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Tag className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'text': 'bg-blue-100 text-blue-800',
      'textarea': 'bg-blue-100 text-blue-800',
      'multiple_choice': 'bg-green-100 text-green-800',
      'single_choice': 'bg-green-100 text-green-800',
      'rating': 'bg-yellow-100 text-yellow-800',
      'likert': 'bg-yellow-100 text-yellow-800',
      'star_rating': 'bg-yellow-100 text-yellow-800',
      'nps': 'bg-purple-100 text-purple-800',
      'boolean': 'bg-gray-100 text-gray-800',
      'date': 'bg-indigo-100 text-indigo-800',
      'file_upload': 'bg-orange-100 text-orange-800',
      'country': 'bg-teal-100 text-teal-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {getTypeIcon(template.type)}
            <div>
              <div className="text-xl font-semibold">{template.name}</div>
              <div className="text-sm text-gray-600 font-normal">
                {template.description}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Metadata */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-sm text-gray-600 mb-1">
                <Users className="w-4 h-4" />
                Usage
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {template.usage_count}
              </div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-sm text-gray-600 mb-1">
                <Tag className="w-4 h-4" />
                Type
              </div>
              <Badge className={getTypeColor(template.type)}>
                {template.type.replace('_', ' ')}
              </Badge>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-sm text-gray-600 mb-1">
                <Clock className="w-4 h-4" />
                Created
              </div>
              <div className="text-sm font-medium text-gray-900">
                {formatDate(template.created_at)}
              </div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-sm text-gray-600 mb-1">
                <Info className="w-4 h-4" />
                Category
              </div>
              <div className="text-sm font-medium text-gray-900">
                {template.category?.replace('_', ' ') || 'General'}
              </div>
            </div>
          </div>

          {/* Tags */}
          {template.tags && template.tags.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {template.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Question Preview */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Question Preview
            </h3>
            
            <div className="border rounded-lg p-6 bg-white">
              <QuestionRenderer
                question={mockQuestion}
                onChange={() => {}} // No-op for preview
                disabled={false}
              />
            </div>
          </div>

          {/* Template Configuration */}
          {(template.template_data.validation_rules || template.template_data.metadata) && (
            <>
              <Separator />
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Configuration</h4>
                
                <div className="space-y-4">
                  {/* Validation Rules */}
                  {template.template_data.validation_rules && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Validation Rules</h5>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                          {JSON.stringify(template.template_data.validation_rules, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Metadata */}
                  {template.template_data.metadata && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Metadata</h5>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                          {JSON.stringify(template.template_data.metadata, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Options */}
                  {template.template_data.options && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Options</h5>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <ul className="text-sm text-gray-600 space-y-1">
                          {Array.isArray(template.template_data.options) && 
                           template.template_data.options.map((option, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                              {typeof option === 'string' ? option : option.label}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Usage Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-blue-900 mb-1">Usage Tips</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• This template will create a new question with the same configuration</li>
                  <li>• You can modify the question text, options, and validation rules after adding it</li>
                  <li>• The template includes pre-configured settings optimized for this question type</li>
                  {template.template_data.help_text && (
                    <li>• Help text is included to guide respondents</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Used {template.usage_count} times by the community
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleUseTemplate} className="flex items-center gap-2">
              <Copy className="w-4 h-4" />
              Use This Template
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
