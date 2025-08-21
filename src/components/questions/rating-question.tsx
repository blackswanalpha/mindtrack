'use client'

import React, { useState, useEffect } from 'react';
import { Question } from '@/types/database';
import { QuestionValidationEngine, ValidationResult } from '@/lib/question-validation-engine';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { HelpCircle, AlertTriangle, CheckCircle, Star } from 'lucide-react';

interface RatingQuestionProps {
  question: Question;
  value?: number;
  onChange: (value: number) => void;
  onValidation?: (isValid: boolean, errors: string[]) => void;
  disabled?: boolean;
  showValidation?: boolean;
}

export const RatingQuestion: React.FC<RatingQuestionProps> = ({
  question,
  value,
  onChange,
  onValidation,
  disabled = false,
  showValidation = true
}) => {
  const [localValue, setLocalValue] = useState<number | undefined>(value);
  const [validation, setValidation] = useState<ValidationResult>({ isValid: true, errors: [] });
  const [isTouched, setIsTouched] = useState(false);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (isTouched && localValue !== undefined) {
      const validationResult = QuestionValidationEngine.validateAnswer(question, localValue);
      setValidation(validationResult);
      onValidation?.(validationResult.isValid, validationResult.errors);
    }
  }, [localValue, question, isTouched, onValidation]);

  const handleChange = (newValue: number) => {
    setLocalValue(newValue);
    setIsTouched(true);
    onChange(newValue);
  };

  const getMinValue = () => {
    return question.validation_rules?.min_value ?? 1;
  };

  const getMaxValue = () => {
    return question.validation_rules?.max_value ?? 5;
  };

  const getStep = () => {
    return question.validation_rules?.step ?? 1;
  };

  const getValidationIcon = () => {
    if (!isTouched) return null;
    
    if (validation.isValid) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    } else {
      return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
  };

  const renderStarRating = () => {
    const maxStars = getMaxValue();
    const minStars = getMinValue();
    
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-1">
          {Array.from({ length: maxStars }, (_, index) => {
            const starValue = index + 1;
            const isSelected = localValue !== undefined && starValue <= localValue;
            const isHalfStar = question.validation_rules?.step === 0.5 && 
                             localValue !== undefined && 
                             starValue - 0.5 === localValue;
            
            return (
              <button
                key={index}
                type="button"
                onClick={() => handleChange(starValue)}
                disabled={disabled}
                className="p-1 hover:scale-110 transition-transform disabled:cursor-not-allowed"
              >
                <Star
                  className={`w-8 h-8 ${
                    isSelected || isHalfStar
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300 hover:text-yellow-200'
                  }`}
                />
              </button>
            );
          })}
        </div>
        
        <div className="text-sm text-gray-600">
          {localValue !== undefined ? (
            <span className="font-medium">{localValue} out of {maxStars} stars</span>
          ) : (
            <span>Click to rate</span>
          )}
        </div>
      </div>
    );
  };

  const renderLikertScale = () => {
    const options = question.options as string[] || [
      'Strongly Disagree',
      'Disagree',
      'Neutral',
      'Agree',
      'Strongly Agree'
    ];
    
    return (
      <RadioGroup
        value={localValue?.toString()}
        onValueChange={(value) => handleChange(parseInt(value))}
        disabled={disabled}
        className="space-y-3"
      >
        {options.map((option, index) => {
          const value = index + 1;
          return (
            <div key={index} className="flex items-center space-x-3">
              <RadioGroupItem value={value.toString()} id={`likert-${index}`} />
              <Label 
                htmlFor={`likert-${index}`} 
                className="flex-1 cursor-pointer py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  <Badge variant="outline" className="text-xs">
                    {value}
                  </Badge>
                </div>
              </Label>
            </div>
          );
        })}
      </RadioGroup>
    );
  };

  const renderNPSScale = () => {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Not at all likely</span>
          <span>Extremely likely</span>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          {Array.from({ length: 11 }, (_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleChange(index)}
              disabled={disabled}
              className={`w-12 h-12 rounded-full border-2 text-sm font-medium transition-colors disabled:cursor-not-allowed ${
                localValue === index
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              {index}
            </button>
          ))}
        </div>
        
        <div className="text-center">
          {localValue !== undefined && (
            <div className="space-y-1">
              <div className="text-sm font-medium">
                Selected: {localValue}
              </div>
              <Badge 
                variant={
                  localValue <= 6 ? 'destructive' :
                  localValue <= 8 ? 'secondary' : 'default'
                }
                className="text-xs"
              >
                {localValue <= 6 ? 'Detractor' :
                 localValue <= 8 ? 'Passive' : 'Promoter'}
              </Badge>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderNumericRating = () => {
    const minValue = getMinValue();
    const maxValue = getMaxValue();
    const step = getStep();
    
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          {Array.from({ length: Math.floor((maxValue - minValue) / step) + 1 }, (_, index) => {
            const buttonValue = minValue + (index * step);
            return (
              <Button
                key={index}
                type="button"
                variant={localValue === buttonValue ? 'default' : 'outline'}
                onClick={() => handleChange(buttonValue)}
                disabled={disabled}
                className="min-w-[3rem]"
              >
                {buttonValue}
              </Button>
            );
          })}
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Min: {minValue}</span>
          {localValue !== undefined && (
            <span className="font-medium">Selected: {localValue}</span>
          )}
          <span>Max: {maxValue}</span>
        </div>
      </div>
    );
  };

  const renderSliderRating = () => {
    const minValue = getMinValue();
    const maxValue = getMaxValue();
    const step = getStep();
    
    return (
      <div className="space-y-4">
        <Slider
          value={[localValue ?? minValue]}
          onValueChange={(values) => handleChange(values[0])}
          min={minValue}
          max={maxValue}
          step={step}
          disabled={disabled}
          className="w-full"
        />
        
        <div className="flex justify-between text-sm text-gray-600">
          <span>{minValue}</span>
          <span className="font-medium">
            {localValue !== undefined ? localValue : 'Not selected'}
          </span>
          <span>{maxValue}</span>
        </div>
      </div>
    );
  };

  const renderSemanticDifferential = () => {
    const options = question.options as string[] || ['Poor', 'Excellent'];
    const leftLabel = options[0] || 'Poor';
    const rightLabel = options[1] || 'Excellent';
    const scale = getMaxValue() - getMinValue() + 1;
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm font-medium text-gray-700">
          <span>{leftLabel}</span>
          <span>{rightLabel}</span>
        </div>
        
        <div className="flex items-center gap-2">
          {Array.from({ length: scale }, (_, index) => {
            const value = getMinValue() + index;
            return (
              <button
                key={index}
                type="button"
                onClick={() => handleChange(value)}
                disabled={disabled}
                className={`w-8 h-8 rounded-full border-2 transition-colors disabled:cursor-not-allowed ${
                  localValue === value
                    ? 'bg-blue-500 border-blue-500'
                    : 'bg-white border-gray-300 hover:border-blue-300'
                }`}
              />
            );
          })}
        </div>
        
        <div className="text-center text-sm text-gray-600">
          {localValue !== undefined && (
            <span>Rating: {localValue} / {getMaxValue()}</span>
          )}
        </div>
      </div>
    );
  };

  const renderRatingInput = () => {
    switch (question.type) {
      case 'star_rating':
        return renderStarRating();
      case 'likert':
        return renderLikertScale();
      case 'nps':
        return renderNPSScale();
      case 'slider':
        return renderSliderRating();
      case 'semantic_differential':
        return renderSemanticDifferential();
      case 'rating':
      default:
        return renderNumericRating();
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

      {/* Rating Input */}
      {renderRatingInput()}

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
          <Badge variant="outline" className="text-xs">
            Range: {getMinValue()} - {getMaxValue()}
          </Badge>
          {question.validation_rules.step && question.validation_rules.step !== 1 && (
            <Badge variant="outline" className="text-xs">
              Step: {question.validation_rules.step}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};
