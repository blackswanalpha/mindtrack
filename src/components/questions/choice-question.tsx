'use client'

import React, { useState, useEffect } from 'react';
import { Question, QuestionOption } from '@/types/database';
import { QuestionValidationEngine, ValidationResult } from '@/lib/question-validation-engine';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { HelpCircle, AlertTriangle, CheckCircle, Search, Plus } from 'lucide-react';

interface ChoiceQuestionProps {
  question: Question;
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  onValidation?: (isValid: boolean, errors: string[]) => void;
  disabled?: boolean;
  showValidation?: boolean;
}

export const ChoiceQuestion: React.FC<ChoiceQuestionProps> = ({
  question,
  value,
  onChange,
  onValidation,
  disabled = false,
  showValidation = true
}) => {
  const [localValue, setLocalValue] = useState<string | string[]>(
    question.type === 'multiple_choice' ? (Array.isArray(value) ? value : []) : (value as string || '')
  );
  const [validation, setValidation] = useState<ValidationResult>({ isValid: true, errors: [] });
  const [isTouched, setIsTouched] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [otherValue, setOtherValue] = useState('');
  const [showOtherInput, setShowOtherInput] = useState(false);

  useEffect(() => {
    if (question.type === 'multiple_choice') {
      setLocalValue(Array.isArray(value) ? value : []);
    } else {
      setLocalValue(value as string || '');
    }
  }, [value, question.type]);

  useEffect(() => {
    if (isTouched) {
      const validationResult = QuestionValidationEngine.validateAnswer(question, localValue);
      setValidation(validationResult);
      onValidation?.(validationResult.isValid, validationResult.errors);
    }
  }, [localValue, question, isTouched, onValidation]);

  const handleChange = (newValue: string | string[]) => {
    setLocalValue(newValue);
    setIsTouched(true);
    onChange(newValue);
  };

  const getOptions = (): (string | QuestionOption)[] => {
    if (!question.options) return [];
    return question.options;
  };

  const getFilteredOptions = () => {
    const options = getOptions();
    if (!searchTerm) return options;
    
    return options.filter(option => {
      const label = typeof option === 'string' ? option : option.label;
      return label.toLowerCase().includes(searchTerm.toLowerCase());
    });
  };

  const getOptionLabel = (option: string | QuestionOption): string => {
    return typeof option === 'string' ? option : option.label;
  };

  const getOptionValue = (option: string | QuestionOption): string => {
    return typeof option === 'string' ? option : option.value.toString();
  };

  const hasOtherOption = () => {
    const options = getOptions();
    return options.some(option => 
      typeof option === 'object' && option.is_other
    );
  };

  const handleMultipleChoiceChange = (optionValue: string, checked: boolean) => {
    const currentValues = Array.isArray(localValue) ? localValue : [];
    let newValues: string[];
    
    if (checked) {
      newValues = [...currentValues, optionValue];
    } else {
      newValues = currentValues.filter(v => v !== optionValue);
    }
    
    // Check selection limits
    const minSelections = question.validation_rules?.min_selections;
    const maxSelections = question.validation_rules?.max_selections;
    
    if (maxSelections && newValues.length > maxSelections) {
      return; // Don't allow more selections than the limit
    }
    
    handleChange(newValues);
  };

  const handleSingleChoiceChange = (optionValue: string) => {
    if (optionValue === 'other') {
      setShowOtherInput(true);
    } else {
      setShowOtherInput(false);
      setOtherValue('');
    }
    handleChange(optionValue);
  };

  const handleOtherValueChange = (value: string) => {
    setOtherValue(value);
    handleChange(`other:${value}`);
  };

  const getValidationIcon = () => {
    if (!isTouched) return null;
    
    if (validation.isValid) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    } else {
      return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
  };

  const renderMultipleChoice = () => {
    const currentValues = Array.isArray(localValue) ? localValue : [];
    const filteredOptions = getFilteredOptions();
    
    return (
      <div className="space-y-3">
        {/* Search for dropdown with many options */}
        {filteredOptions.length > 10 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search options..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        )}
        
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {filteredOptions.map((option, index) => {
            const optionValue = getOptionValue(option);
            const optionLabel = getOptionLabel(option);
            const isChecked = currentValues.includes(optionValue);
            
            return (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`option-${index}`}
                  checked={isChecked}
                  onCheckedChange={(checked) => handleMultipleChoiceChange(optionValue, checked as boolean)}
                  disabled={disabled}
                />
                <Label 
                  htmlFor={`option-${index}`} 
                  className="flex-1 cursor-pointer"
                >
                  {optionLabel}
                </Label>
              </div>
            );
          })}
        </div>
        
        {/* Other option */}
        {hasOtherOption() && (
          <div className="flex items-center space-x-2">
            <Checkbox
              id="other-option"
              checked={currentValues.some(v => v.startsWith('other:'))}
              onCheckedChange={(checked) => {
                if (checked) {
                  setShowOtherInput(true);
                } else {
                  setShowOtherInput(false);
                  setOtherValue('');
                  const newValues = currentValues.filter(v => !v.startsWith('other:'));
                  handleChange(newValues);
                }
              }}
              disabled={disabled}
            />
            <Label htmlFor="other-option" className="cursor-pointer">
              Other
            </Label>
          </div>
        )}
        
        {showOtherInput && (
          <Input
            placeholder="Please specify..."
            value={otherValue}
            onChange={(e) => {
              setOtherValue(e.target.value);
              const newValues = currentValues.filter(v => !v.startsWith('other:'));
              if (e.target.value) {
                newValues.push(`other:${e.target.value}`);
              }
              handleChange(newValues);
            }}
            disabled={disabled}
          />
        )}
      </div>
    );
  };

  const renderSingleChoice = () => {
    const filteredOptions = getFilteredOptions();
    
    return (
      <RadioGroup
        value={typeof localValue === 'string' ? localValue : ''}
        onValueChange={handleSingleChoiceChange}
        disabled={disabled}
        className="space-y-2"
      >
        {filteredOptions.map((option, index) => {
          const optionValue = getOptionValue(option);
          const optionLabel = getOptionLabel(option);
          
          return (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem value={optionValue} id={`option-${index}`} />
              <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                {optionLabel}
              </Label>
            </div>
          );
        })}
        
        {hasOtherOption() && (
          <>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="other" id="other-option" />
              <Label htmlFor="other-option" className="cursor-pointer">
                Other
              </Label>
            </div>
            {showOtherInput && (
              <Input
                placeholder="Please specify..."
                value={otherValue}
                onChange={(e) => handleOtherValueChange(e.target.value)}
                disabled={disabled}
                className="ml-6"
              />
            )}
          </>
        )}
      </RadioGroup>
    );
  };

  const renderDropdown = () => {
    const filteredOptions = getFilteredOptions();
    
    return (
      <Select
        value={typeof localValue === 'string' ? localValue : ''}
        onValueChange={handleSingleChoiceChange}
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValue placeholder={question.placeholder_text || 'Select an option...'} />
        </SelectTrigger>
        <SelectContent>
          {filteredOptions.map((option, index) => {
            const optionValue = getOptionValue(option);
            const optionLabel = getOptionLabel(option);
            
            return (
              <SelectItem key={index} value={optionValue}>
                {optionLabel}
              </SelectItem>
            );
          })}
          {hasOtherOption() && (
            <SelectItem value="other">Other</SelectItem>
          )}
        </SelectContent>
      </Select>
    );
  };

  const renderChoiceInput = () => {
    switch (question.type) {
      case 'multiple_choice':
        return renderMultipleChoice();
      case 'single_choice':
        return renderSingleChoice();
      case 'dropdown':
        return renderDropdown();
      default:
        return null;
    }
  };

  const getSelectionCount = () => {
    if (question.type === 'multiple_choice' && Array.isArray(localValue)) {
      return localValue.length;
    }
    return 0;
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

      {/* Selection Limits Info */}
      {question.type === 'multiple_choice' && (question.validation_rules?.min_selections || question.validation_rules?.max_selections) && (
        <div className="text-sm text-gray-600">
          {question.validation_rules.min_selections && question.validation_rules.max_selections ? (
            <span>Select {question.validation_rules.min_selections}-{question.validation_rules.max_selections} options</span>
          ) : question.validation_rules.min_selections ? (
            <span>Select at least {question.validation_rules.min_selections} option(s)</span>
          ) : (
            <span>Select up to {question.validation_rules.max_selections} option(s)</span>
          )}
          <span className="ml-2">({getSelectionCount()} selected)</span>
        </div>
      )}

      {/* Choice Input */}
      {renderChoiceInput()}

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
      {question.validation_rules && question.type === 'multiple_choice' && (
        <div className="flex flex-wrap gap-2">
          {question.validation_rules.min_selections && (
            <Badge variant="outline" className="text-xs">
              Min {question.validation_rules.min_selections} selections
            </Badge>
          )}
          {question.validation_rules.max_selections && (
            <Badge variant="outline" className="text-xs">
              Max {question.validation_rules.max_selections} selections
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};
