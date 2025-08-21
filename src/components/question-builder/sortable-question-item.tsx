'use client'

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Question } from '@/types/database';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  GripVertical, 
  Settings, 
  Trash2, 
  Copy, 
  Eye,
  AlertTriangle,
  HelpCircle
} from 'lucide-react';

interface SortableQuestionItemProps {
  question: Question;
  icon: React.ReactNode;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

export const SortableQuestionItem: React.FC<SortableQuestionItemProps> = ({
  question,
  icon,
  onEdit,
  onDelete,
  onDuplicate
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: question.id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  const getQuestionTypeLabel = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const hasValidationRules = question.validation_rules && 
    Object.keys(question.validation_rules).length > 0;

  const hasConditionalLogic = question.conditional_logic && 
    question.conditional_logic.conditions.length > 0;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`transition-all duration-200 ${
        isDragging ? 'shadow-lg ring-2 ring-blue-500' : 'hover:shadow-md'
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
          >
            <GripVertical className="w-4 h-4 text-gray-400" />
          </div>

          {/* Question Icon */}
          <div className="flex-shrink-0 p-2 bg-blue-50 rounded-lg text-blue-600">
            {icon}
          </div>

          {/* Question Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 truncate">
                  {question.text}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {getQuestionTypeLabel(question.type)}
                  </Badge>
                  {question.required && (
                    <Badge variant="destructive" className="text-xs">
                      Required
                    </Badge>
                  )}
                  {hasValidationRules && (
                    <Badge variant="secondary" className="text-xs flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Validation
                    </Badge>
                  )}
                  {hasConditionalLogic && (
                    <Badge variant="secondary" className="text-xs flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      Conditional
                    </Badge>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onEdit}
                  className="h-8 w-8 p-0"
                  title="Edit question"
                >
                  <Settings className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDuplicate}
                  className="h-8 w-8 p-0"
                  title="Duplicate question"
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDelete}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  title="Delete question"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Question Details */}
            <div className="space-y-2">
              {/* Options Preview */}
              {question.options && Array.isArray(question.options) && question.options.length > 0 && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Options: </span>
                  {question.options.slice(0, 3).map((option, index) => (
                    <span key={index}>
                      {typeof option === 'string' ? option : option.label}
                      {index < Math.min(question.options!.length - 1, 2) && ', '}
                    </span>
                  ))}
                  {question.options.length > 3 && (
                    <span className="text-gray-400"> +{question.options.length - 3} more</span>
                  )}
                </div>
              )}

              {/* Help Text */}
              {question.help_text && (
                <div className="flex items-start gap-1 text-sm text-gray-600">
                  <HelpCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span className="truncate">{question.help_text}</span>
                </div>
              )}

              {/* Placeholder Text */}
              {question.placeholder_text && (
                <div className="text-sm text-gray-500 italic">
                  Placeholder: "{question.placeholder_text}"
                </div>
              )}

              {/* Validation Rules Summary */}
              {hasValidationRules && (
                <div className="text-xs text-gray-500">
                  <span className="font-medium">Validation: </span>
                  {question.validation_rules?.min_length && (
                    <span>Min {question.validation_rules.min_length} chars, </span>
                  )}
                  {question.validation_rules?.max_length && (
                    <span>Max {question.validation_rules.max_length} chars, </span>
                  )}
                  {question.validation_rules?.min_value !== undefined && (
                    <span>Min {question.validation_rules.min_value}, </span>
                  )}
                  {question.validation_rules?.max_value !== undefined && (
                    <span>Max {question.validation_rules.max_value}, </span>
                  )}
                  {question.validation_rules?.pattern && (
                    <span>Pattern validation, </span>
                  )}
                  {question.validation_rules?.allowed_file_types && (
                    <span>File types: {question.validation_rules.allowed_file_types.join(', ')}</span>
                  )}
                </div>
              )}

              {/* Conditional Logic Summary */}
              {hasConditionalLogic && (
                <div className="text-xs text-gray-500">
                  <span className="font-medium">Logic: </span>
                  {question.conditional_logic!.action} when {question.conditional_logic!.conditions.length} condition(s) met
                  {question.conditional_logic!.operator === 'AND' ? ' (all)' : ' (any)'}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
