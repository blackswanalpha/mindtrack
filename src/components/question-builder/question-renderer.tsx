'use client'

import React, { useState } from 'react';
import { Question, Answer, QuestionOption } from '@/types/database';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { 
  Star, 
  Calendar as CalendarIcon, 
  Upload, 
  Image as ImageIcon,
  MapPin,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { CountryQuestion } from '@/components/questions/country-question';

interface QuestionRendererProps {
  question: Question;
  value?: Answer;
  onChange: (value: any) => void;
  disabled?: boolean;
}

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  value,
  onChange,
  disabled = false
}) => {
  const [filePreview, setFilePreview] = useState<string[]>([]);

  const getCurrentValue = () => {
    if (!value) return undefined;
    
    switch (question.type) {
      case 'boolean':
        return value.boolean_value;
      case 'number':
      case 'decimal':
      case 'rating':
      case 'likert':
      case 'star_rating':
      case 'slider':
        return value.numeric_value;
      case 'date':
        return value.date_value ? new Date(value.date_value) : undefined;
      case 'time':
        return value.time_value;
      case 'datetime':
        return value.datetime_value ? new Date(value.datetime_value) : undefined;
      case 'multiple_choice':
        return value.json_value || [];
      default:
        return value.value;
    }
  };

  const handleFileChange = (files: FileList | null) => {
    if (!files) return;
    
    const fileArray = Array.from(files);
    onChange(fileArray);
    
    // Generate previews for images
    if (question.type === 'image_upload') {
      const previews: string[] = [];
      fileArray.forEach(file => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            previews.push(e.target?.result as string);
            setFilePreview([...previews]);
          };
          reader.readAsDataURL(file);
        }
      });
    }
  };

  const renderStarRating = (maxStars: number = 5) => {
    const currentRating = getCurrentValue() as number || 0;
    
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: maxStars }, (_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onChange(index + 1)}
            disabled={disabled}
            className="p-1 hover:scale-110 transition-transform"
          >
            <Star
              className={`w-6 h-6 ${
                index < currentRating
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {currentRating > 0 ? `${currentRating}/${maxStars}` : 'Not rated'}
        </span>
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
        value={getCurrentValue() as string}
        onValueChange={onChange}
        disabled={disabled}
        className="flex flex-col space-y-2"
      >
        {options.map((option, index) => (
          <div key={index} className="flex items-center space-x-2">
            <RadioGroupItem value={option} id={`option-${index}`} />
            <Label htmlFor={`option-${index}`} className="flex-1">
              {option}
            </Label>
          </div>
        ))}
      </RadioGroup>
    );
  };

  const renderNPSScale = () => {
    const currentValue = getCurrentValue() as number || 0;
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Not at all likely</span>
          <span>Extremely likely</span>
        </div>
        <div className="flex items-center gap-2">
          {Array.from({ length: 11 }, (_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => onChange(index)}
              disabled={disabled}
              className={`w-10 h-10 rounded-full border-2 text-sm font-medium transition-colors ${
                currentValue === index
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
              }`}
            >
              {index}
            </button>
          ))}
        </div>
        <div className="text-center text-sm text-gray-600">
          {currentValue !== undefined && (
            <span>
              Selected: {currentValue} - {
                currentValue <= 6 ? 'Detractor' :
                currentValue <= 8 ? 'Passive' : 'Promoter'
              }
            </span>
          )}
        </div>
      </div>
    );
  };

  const renderSemanticDifferential = () => {
    const currentValue = getCurrentValue() as number;
    const scale = question.validation_rules?.max_value || 7;
    const leftLabel = question.metadata?.left_label || 'Negative';
    const rightLabel = question.metadata?.right_label || 'Positive';

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span className="font-medium">{leftLabel}</span>
          <span className="font-medium">{rightLabel}</span>
        </div>
        <div className="flex gap-1 justify-center">
          {Array.from({ length: scale }, (_, i) => {
            const value = i + 1;
            return (
              <Button
                key={i}
                variant={currentValue === value ? "default" : "outline"}
                size="sm"
                onClick={() => onChange(value)}
                disabled={disabled}
                className="w-8 h-8 p-0"
              >
                {value}
              </Button>
            );
          })}
        </div>
        <div className="text-xs text-gray-500 text-center">
          Selected: {currentValue || 'None'} {currentValue && `(${currentValue <= Math.floor(scale/2) ? leftLabel : rightLabel})`}
        </div>
      </div>
    );
  };

  const renderCountrySelect = () => {
    return (
      <CountryQuestion
        question={question}
        value={getCurrentValue() as string}
        onChange={onChange}
        disabled={disabled}
      />
    );
  };

  switch (question.type) {
    case 'text':
      return (
        <Input
          value={getCurrentValue() as string || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder_text}
          disabled={disabled}
          maxLength={question.validation_rules?.max_length}
        />
      );

    case 'textarea':
      return (
        <div className="space-y-2">
          <Textarea
            value={getCurrentValue() as string || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder_text}
            disabled={disabled}
            rows={4}
            maxLength={question.validation_rules?.max_length}
          />
          {question.validation_rules?.max_length && (
            <div className="text-xs text-gray-500 text-right">
              {(getCurrentValue() as string || '').length} / {question.validation_rules.max_length}
            </div>
          )}
        </div>
      );

    case 'rich_text':
      return (
        <div className="space-y-2">
          <Textarea
            value={getCurrentValue() as string || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder_text || 'Enter rich text content...'}
            disabled={disabled}
            rows={6}
            className="font-mono text-sm"
          />
          <div className="text-xs text-gray-500">
            Rich text editor would be implemented here with formatting options
          </div>
        </div>
      );

    case 'number':
      return (
        <Input
          type="number"
          value={getCurrentValue() as number || ''}
          onChange={(e) => onChange(parseFloat(e.target.value) || undefined)}
          placeholder={question.placeholder_text}
          disabled={disabled}
          min={question.validation_rules?.min_value}
          max={question.validation_rules?.max_value}
          step={question.validation_rules?.step || 1}
        />
      );

    case 'decimal':
      return (
        <Input
          type="number"
          value={getCurrentValue() as number || ''}
          onChange={(e) => onChange(parseFloat(e.target.value) || undefined)}
          placeholder={question.placeholder_text}
          disabled={disabled}
          min={question.validation_rules?.min_value}
          max={question.validation_rules?.max_value}
          step={question.validation_rules?.step || 0.01}
        />
      );

    case 'boolean':
      return (
        <RadioGroup
          value={getCurrentValue()?.toString()}
          onValueChange={(value) => onChange(value === 'true')}
          disabled={disabled}
          className="flex gap-6"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="true" id="yes" />
            <Label htmlFor="yes">Yes</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="false" id="no" />
            <Label htmlFor="no">No</Label>
          </div>
        </RadioGroup>
      );

    case 'single_choice':
      return (
        <RadioGroup
          value={getCurrentValue() as string}
          onValueChange={onChange}
          disabled={disabled}
          className="space-y-2"
        >
          {(question.options as string[] || []).map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem value={option} id={`option-${index}`} />
              <Label htmlFor={`option-${index}`}>{option}</Label>
            </div>
          ))}
        </RadioGroup>
      );

    case 'multiple_choice':
      const selectedOptions = getCurrentValue() as string[] || [];
      return (
        <div className="space-y-2">
          {(question.options as string[] || []).map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Checkbox
                id={`option-${index}`}
                checked={selectedOptions.includes(option)}
                onCheckedChange={(checked) => {
                  const newSelection = checked
                    ? [...selectedOptions, option]
                    : selectedOptions.filter(o => o !== option);
                  onChange(newSelection);
                }}
                disabled={disabled}
              />
              <Label htmlFor={`option-${index}`}>{option}</Label>
            </div>
          ))}
        </div>
      );

    case 'dropdown':
      return (
        <Select value={getCurrentValue() as string} onValueChange={onChange} disabled={disabled}>
          <SelectTrigger>
            <SelectValue placeholder={question.placeholder_text || 'Select an option...'} />
          </SelectTrigger>
          <SelectContent>
            {(question.options as string[] || []).map((option, index) => (
              <SelectItem key={index} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    case 'rating':
      const maxRating = question.validation_rules?.max_value || 5;
      const minRating = question.validation_rules?.min_value || 1;
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {Array.from({ length: maxRating - minRating + 1 }, (_, index) => {
              const value = minRating + index;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => onChange(value)}
                  disabled={disabled}
                  className={`px-3 py-2 rounded-md border transition-colors ${
                    getCurrentValue() === value
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                  }`}
                >
                  {value}
                </button>
              );
            })}
          </div>
          <div className="text-sm text-gray-600">
            Selected: {getCurrentValue() || 'None'}
          </div>
        </div>
      );

    case 'likert':
      return renderLikertScale();

    case 'star_rating':
      return renderStarRating(question.validation_rules?.max_value || 5);

    case 'nps':
      return renderNPSScale();

    case 'semantic_differential':
      return renderSemanticDifferential();

    case 'slider':
      const sliderMin = question.validation_rules?.min_value || 0;
      const sliderMax = question.validation_rules?.max_value || 100;
      const sliderStep = question.validation_rules?.step || 1;
      return (
        <div className="space-y-4">
          <Slider
            value={[getCurrentValue() as number || sliderMin]}
            onValueChange={(values) => onChange(values[0])}
            min={sliderMin}
            max={sliderMax}
            step={sliderStep}
            disabled={disabled}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>{sliderMin}</span>
            <span className="font-medium">Value: {getCurrentValue() || sliderMin}</span>
            <span>{sliderMax}</span>
          </div>
        </div>
      );

    case 'date':
      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
              disabled={disabled}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {getCurrentValue() ? format(getCurrentValue() as Date, 'PPP') : 'Pick a date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={getCurrentValue() as Date}
              onSelect={onChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      );

    case 'time':
      return (
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <Input
            type="time"
            value={getCurrentValue() as string || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
          />
        </div>
      );

    case 'datetime':
      return (
        <div className="space-y-2">
          <Input
            type="datetime-local"
            value={getCurrentValue() ? format(getCurrentValue() as Date, "yyyy-MM-dd'T'HH:mm") : ''}
            onChange={(e) => onChange(new Date(e.target.value))}
            disabled={disabled}
          />
        </div>
      );

    case 'file_upload':
      return (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <div className="text-sm text-gray-600 mb-2">
              Click to upload or drag and drop
            </div>
            <input
              type="file"
              onChange={(e) => handleFileChange(e.target.files)}
              disabled={disabled}
              multiple={question.validation_rules?.max_files !== 1}
              accept={question.validation_rules?.allowed_file_types?.join(',')}
              className="hidden"
              id="file-upload"
            />
            <Label htmlFor="file-upload" className="cursor-pointer">
              <Button variant="outline" size="sm" asChild>
                <span>Choose Files</span>
              </Button>
            </Label>
          </div>
          {question.validation_rules?.max_file_size && (
            <div className="text-xs text-gray-500">
              Maximum file size: {Math.round(question.validation_rules.max_file_size / (1024 * 1024))}MB
            </div>
          )}
        </div>
      );

    case 'image_upload':
      return (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <div className="text-sm text-gray-600 mb-2">
              Upload images
            </div>
            <input
              type="file"
              onChange={(e) => handleFileChange(e.target.files)}
              disabled={disabled}
              multiple={question.validation_rules?.max_files !== 1}
              accept="image/*"
              className="hidden"
              id="image-upload"
            />
            <Label htmlFor="image-upload" className="cursor-pointer">
              <Button variant="outline" size="sm" asChild>
                <span>Choose Images</span>
              </Button>
            </Label>
          </div>
          {filePreview.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {filePreview.map((preview, index) => (
                <img
                  key={index}
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg border"
                />
              ))}
            </div>
          )}
        </div>
      );

    case 'country':
      return renderCountrySelect();

    case 'state':
    case 'city':
      return (
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-400" />
          <Input
            value={getCurrentValue() as string || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder_text || `Enter ${question.type}...`}
            disabled={disabled}
          />
        </div>
      );

    default:
      return (
        <div className="p-4 bg-gray-100 rounded-lg text-center text-gray-500">
          Question type "{question.type}" not implemented yet
        </div>
      );
  }
};
