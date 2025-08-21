'use client'

import React, { useState, useEffect } from 'react';
import { Question, ValidationRules } from '@/types/database';
import { QuestionValidationEngine, ValidationResult } from '@/lib/question-validation-engine';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { HelpCircle, AlertTriangle, CheckCircle } from 'lucide-react';

interface TextQuestionProps {
  question: Question;
  value?: string;
  onChange: (value: string) => void;
  onValidation?: (isValid: boolean, errors: string[]) => void;
  disabled?: boolean;
  showValidation?: boolean;
}

export const TextQuestion: React.FC<TextQuestionProps> = ({
  question,
  value = '',
  onChange,
  onValidation,
  disabled = false,
  showValidation = true
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [validation, setValidation] = useState<ValidationResult>({ isValid: true, errors: [] });
  const [isTouched, setIsTouched] = useState(false);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (isTouched || value) {
      const validationResult = QuestionValidationEngine.validateAnswer(question, localValue);
      setValidation(validationResult);
      onValidation?.(validationResult.isValid, validationResult.errors);
    }
  }, [localValue, question, isTouched, onValidation]);

  const handleChange = (newValue: string) => {
    setLocalValue(newValue);
    setIsTouched(true);
    onChange(newValue);
  };

  const handleBlur = () => {
    setIsTouched(true);
  };

  const getCharacterCount = () => {
    return localValue.length;
  };

  const getMaxLength = () => {
    return question.validation_rules?.max_length;
  };

  const getMinLength = () => {
    return question.validation_rules?.min_length;
  };

  const isOverLimit = () => {
    const maxLength = getMaxLength();
    return maxLength ? getCharacterCount() > maxLength : false;
  };

  const isUnderLimit = () => {
    const minLength = getMinLength();
    return minLength ? getCharacterCount() < minLength : false;
  };

  const getValidationIcon = () => {
    if (!isTouched && !value) return null;
    
    if (validation.isValid) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    } else {
      return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
  };

  const renderInput = () => {
    const commonProps = {
      value: localValue,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => handleChange(e.target.value),
      onBlur: handleBlur,
      disabled,
      placeholder: question.placeholder_text || undefined,
      maxLength: getMaxLength() || undefined,
      className: `${validation.isValid ? '' : 'border-red-500'} ${isOverLimit() ? 'border-red-500' : ''}`
    };

    switch (question.type) {
      case 'text':
        return <Input {...commonProps} />;
      
      case 'textarea':
        return (
          <Textarea 
            {...commonProps}
            rows={4}
            className={`resize-none ${commonProps.className}`}
          />
        );
      
      case 'rich_text':
        return (
          <div className="space-y-2">
            <Textarea 
              {...commonProps}
              rows={6}
              className={`font-mono text-sm ${commonProps.className}`}
            />
            <div className="text-xs text-gray-500">
              Rich text editor with formatting options would be implemented here
            </div>
          </div>
        );
      
      default:
        return <Input {...commonProps} />;
    }
  };

  return (
    <div className="space-y-3">
      {/* Question Label */}
      <div className="flex items-start gap-2">
        <Label className="text-base font-medium leading-relaxed">
          {question.text}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {getValidationIcon()}
      </div>

      {/* Help Text */}
      {question.help_text && (
        <div className="flex items-start gap-2 text-sm text-gray-600">
          <HelpCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{question.help_text}</span>
        </div>
      )}

      {/* Input Field */}
      <div className="space-y-2">
        {renderInput()}
        
        {/* Character Count */}
        {(getMaxLength() || getMinLength()) && (
          <div className="flex items-center justify-between text-xs">
            <div className="text-gray-500">
              {getMinLength() && (
                <span className={isUnderLimit() ? 'text-red-500' : ''}>
                  Min: {getMinLength()} characters
                </span>
              )}
            </div>
            <div className={`${isOverLimit() ? 'text-red-500' : 'text-gray-500'}`}>
              {getCharacterCount()}{getMaxLength() && ` / ${getMaxLength()}`} characters
            </div>
          </div>
        )}
      </div>

      {/* Validation Messages */}
      {showValidation && isTouched && !validation.isValid && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {validation.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Validation Rules Display */}
      {question.validation_rules && (
        <div className="flex flex-wrap gap-2">
          {question.validation_rules.min_length && (
            <Badge variant="outline" className="text-xs">
              Min {question.validation_rules.min_length} chars
            </Badge>
          )}
          {question.validation_rules.max_length && (
            <Badge variant="outline" className="text-xs">
              Max {question.validation_rules.max_length} chars
            </Badge>
          )}
          {question.validation_rules.pattern && (
            <Badge variant="outline" className="text-xs">
              Pattern validation
            </Badge>
          )}
        </div>
      )}

      {/* Custom Error Message */}
      {question.error_message && !validation.isValid && isTouched && (
        <div className="text-sm text-red-600 font-medium">
          {question.error_message}
        </div>
      )}
    </div>
  );
};
