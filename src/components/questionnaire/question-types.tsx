'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Star, ThumbsUp, ThumbsDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface QuestionProps {
  question: {
    id: number;
    text: string;
    type: 'text' | 'multiple_choice' | 'rating' | 'boolean' | 'textarea' | 'single_choice' | 'likert' | 'slider';
    required: boolean;
    options?: string[];
    metadata?: {
      min?: number;
      max?: number;
      step?: number;
      scale_labels?: string[];
    };
  };
  value?: any;
  onChange: (value: any) => void;
  error?: string;
  disabled?: boolean;
}

export const TextQuestion: React.FC<QuestionProps> = ({
  question,
  value = '',
  onChange,
  error,
  disabled = false
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2">
        <Label htmlFor={`question-${question.id}`} className="text-base font-medium text-gray-900 leading-relaxed">
          {question.text}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      </div>
      <Input
        id={`question-${question.id}`}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={cn(
          "w-full",
          error && "border-red-500 focus:border-red-500 focus:ring-red-500"
        )}
        placeholder="Enter your answer..."
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};

export const TextareaQuestion: React.FC<QuestionProps> = ({
  question,
  value = '',
  onChange,
  error,
  disabled = false
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2">
        <Label htmlFor={`question-${question.id}`} className="text-base font-medium text-gray-900 leading-relaxed">
          {question.text}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      </div>
      <Textarea
        id={`question-${question.id}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={cn(
          "w-full min-h-[100px] resize-y",
          error && "border-red-500 focus:border-red-500 focus:ring-red-500"
        )}
        placeholder="Please provide your detailed response..."
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};

export const SingleChoiceQuestion: React.FC<QuestionProps> = ({
  question,
  value = '',
  onChange,
  error,
  disabled = false
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2">
        <Label className="text-base font-medium text-gray-900 leading-relaxed">
          {question.text}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      </div>
      <RadioGroup
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        className="space-y-3"
      >
        {question.options?.map((option, index) => (
          <div key={index} className="flex items-center space-x-3">
            <RadioGroupItem
              value={option}
              id={`question-${question.id}-option-${index}`}
              className={cn(error && "border-red-500")}
            />
            <Label
              htmlFor={`question-${question.id}-option-${index}`}
              className="text-sm font-normal text-gray-700 cursor-pointer flex-1"
            >
              {option}
            </Label>
          </div>
        ))}
      </RadioGroup>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};

export const MultipleChoiceQuestion: React.FC<QuestionProps> = ({
  question,
  value = [],
  onChange,
  error,
  disabled = false
}) => {
  const handleOptionChange = (option: string, checked: boolean) => {
    const currentValue = Array.isArray(value) ? value : [];
    if (checked) {
      onChange([...currentValue, option]);
    } else {
      onChange(currentValue.filter((v: string) => v !== option));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2">
        <Label className="text-base font-medium text-gray-900 leading-relaxed">
          {question.text}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      </div>
      <div className="space-y-3">
        {question.options?.map((option, index) => (
          <div key={index} className="flex items-center space-x-3">
            <Checkbox
              id={`question-${question.id}-option-${index}`}
              checked={Array.isArray(value) && value.includes(option)}
              onCheckedChange={(checked) => handleOptionChange(option, !!checked)}
              disabled={disabled}
              className={cn(error && "border-red-500")}
            />
            <Label
              htmlFor={`question-${question.id}-option-${index}`}
              className="text-sm font-normal text-gray-700 cursor-pointer flex-1"
            >
              {option}
            </Label>
          </div>
        ))}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};

export const BooleanQuestion: React.FC<QuestionProps> = ({
  question,
  value,
  onChange,
  error,
  disabled = false
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2">
        <Label className="text-base font-medium text-gray-900 leading-relaxed">
          {question.text}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      </div>
      <div className="flex gap-4">
        <Button
          type="button"
          variant={value === true ? "default" : "outline"}
          onClick={() => onChange(true)}
          disabled={disabled}
          className="flex items-center gap-2"
        >
          <ThumbsUp className="w-4 h-4" />
          Yes
        </Button>
        <Button
          type="button"
          variant={value === false ? "default" : "outline"}
          onClick={() => onChange(false)}
          disabled={disabled}
          className="flex items-center gap-2"
        >
          <ThumbsDown className="w-4 h-4" />
          No
        </Button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};

export const RatingQuestion: React.FC<QuestionProps> = ({
  question,
  value = 0,
  onChange,
  error,
  disabled = false
}) => {
  const maxRating = question.metadata?.max || 5;
  const stars = Array.from({ length: maxRating }, (_, i) => i + 1);

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2">
        <Label className="text-base font-medium text-gray-900 leading-relaxed">
          {question.text}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      </div>
      <div className="flex gap-1">
        {stars.map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            disabled={disabled}
            className="p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Star
              className={cn(
                "w-8 h-8 transition-colors",
                star <= value
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300 hover:text-yellow-300"
              )}
            />
          </button>
        ))}
      </div>
      {value > 0 && (
        <p className="text-sm text-gray-600">
          Rating: {value} out of {maxRating}
        </p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};

export const LikertQuestion: React.FC<QuestionProps> = ({
  question,
  value = '',
  onChange,
  error,
  disabled = false
}) => {
  const defaultOptions = [
    'Strongly Disagree',
    'Disagree',
    'Neutral',
    'Agree',
    'Strongly Agree'
  ];
  
  const options = question.options || defaultOptions;

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2">
        <Label className="text-base font-medium text-gray-900 leading-relaxed">
          {question.text}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
        {options.map((option, index) => (
          <Button
            key={index}
            type="button"
            variant={value === option ? "default" : "outline"}
            onClick={() => onChange(option)}
            disabled={disabled}
            className="text-xs px-2 py-3 h-auto text-center"
          >
            {option}
          </Button>
        ))}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};

export const SliderQuestion: React.FC<QuestionProps> = ({
  question,
  value = [0],
  onChange,
  error,
  disabled = false
}) => {
  const min = question.metadata?.min || 0;
  const max = question.metadata?.max || 100;
  const step = question.metadata?.step || 1;
  const labels = question.metadata?.scale_labels || [];

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2">
        <Label className="text-base font-medium text-gray-900 leading-relaxed">
          {question.text}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      </div>
      <div className="px-3">
        <Slider
          value={Array.isArray(value) ? value : [value]}
          onValueChange={(newValue) => onChange(newValue[0])}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className="w-full"
        />
        <div className="flex justify-between text-sm text-gray-500 mt-2">
          <span>{labels[0] || min}</span>
          <span className="font-medium">
            {Array.isArray(value) ? value[0] : value}
          </span>
          <span>{labels[1] || max}</span>
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};
