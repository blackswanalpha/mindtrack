'use client'

import React, { useState, useEffect } from 'react';
import { Question, QuestionType, ValidationRules, ConditionalLogic } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Plus, 
  Trash2, 
  Settings, 
  Eye, 
  AlertTriangle,
  HelpCircle,
  Save
} from 'lucide-react';

interface QuestionConfigPanelProps {
  question: Question;
  onUpdate: (question: Question) => void;
  onClose: () => void;
}

export const QuestionConfigPanel: React.FC<QuestionConfigPanelProps> = ({
  question,
  onUpdate,
  onClose
}) => {
  const [localQuestion, setLocalQuestion] = useState<Question>(question);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    setLocalQuestion(question);
    setHasUnsavedChanges(false);
  }, [question]);

  const handleChange = (field: keyof Question, value: any) => {
    setLocalQuestion(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    onUpdate(localQuestion);
    setHasUnsavedChanges(false);
  };

  const handleValidationRuleChange = (field: keyof ValidationRules, value: any) => {
    const newRules = { ...localQuestion.validation_rules, [field]: value };
    handleChange('validation_rules', newRules);
  };

  const addOption = () => {
    const currentOptions = Array.isArray(localQuestion.options) ? localQuestion.options : [];
    const newOptions = [...currentOptions, `Option ${currentOptions.length + 1}`];
    handleChange('options', newOptions);
  };

  const updateOption = (index: number, value: string) => {
    const currentOptions = Array.isArray(localQuestion.options) ? localQuestion.options : [];
    const newOptions = [...currentOptions];
    newOptions[index] = value;
    handleChange('options', newOptions);
  };

  const removeOption = (index: number) => {
    const currentOptions = Array.isArray(localQuestion.options) ? localQuestion.options : [];
    const newOptions = currentOptions.filter((_, i) => i !== index);
    handleChange('options', newOptions);
  };

  const questionTypes: { value: QuestionType; label: string; category: string }[] = [
    { value: 'text', label: 'Short Text', category: 'Text Input' },
    { value: 'textarea', label: 'Long Text', category: 'Text Input' },
    { value: 'rich_text', label: 'Rich Text', category: 'Text Input' },
    { value: 'multiple_choice', label: 'Multiple Choice', category: 'Choice' },
    { value: 'single_choice', label: 'Single Choice', category: 'Choice' },
    { value: 'dropdown', label: 'Dropdown', category: 'Choice' },
    { value: 'rating', label: 'Rating Scale', category: 'Rating' },
    { value: 'likert', label: 'Likert Scale', category: 'Rating' },
    { value: 'star_rating', label: 'Star Rating', category: 'Rating' },
    { value: 'nps', label: 'Net Promoter Score', category: 'Rating' },
    { value: 'boolean', label: 'Yes/No', category: 'Basic' },
    { value: 'slider', label: 'Slider', category: 'Basic' },
    { value: 'number', label: 'Number', category: 'Numeric' },
    { value: 'decimal', label: 'Decimal', category: 'Numeric' },
    { value: 'date', label: 'Date', category: 'Date/Time' },
    { value: 'time', label: 'Time', category: 'Date/Time' },
    { value: 'datetime', label: 'Date & Time', category: 'Date/Time' },
    { value: 'file_upload', label: 'File Upload', category: 'File' },
    { value: 'image_upload', label: 'Image Upload', category: 'File' },
    { value: 'country', label: 'Country', category: 'Geographic' },
    { value: 'state', label: 'State/Province', category: 'Geographic' },
    { value: 'city', label: 'City', category: 'Geographic' }
  ];

  const groupedTypes = questionTypes.reduce((acc, type) => {
    if (!acc[type.category]) {
      acc[type.category] = [];
    }
    acc[type.category].push(type);
    return acc;
  }, {} as Record<string, typeof questionTypes>);

  const needsOptions = ['multiple_choice', 'single_choice', 'dropdown'].includes(localQuestion.type);
  const needsNumericValidation = ['number', 'decimal', 'rating', 'likert', 'slider'].includes(localQuestion.type);
  const needsTextValidation = ['text', 'textarea', 'rich_text'].includes(localQuestion.type);
  const needsDateValidation = ['date', 'time', 'datetime'].includes(localQuestion.type);
  const needsFileValidation = ['file_upload', 'image_upload'].includes(localQuestion.type);

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg">Question Settings</CardTitle>
        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <Badge variant="secondary" className="text-xs">
              Unsaved changes
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="validation">Validation</TabsTrigger>
            <TabsTrigger value="logic">Logic</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            {/* Question Type */}
            <div className="space-y-2">
              <Label>Question Type</Label>
              <Select
                value={localQuestion.type}
                onValueChange={(value: QuestionType) => handleChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(groupedTypes).map(([category, types]) => (
                    <div key={category}>
                      <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">
                        {category}
                      </div>
                      {types.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                      <Separator className="my-1" />
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Question Text */}
            <div className="space-y-2">
              <Label>Question Text</Label>
              <Textarea
                value={localQuestion.text}
                onChange={(e) => handleChange('text', e.target.value)}
                placeholder="Enter your question..."
                rows={3}
              />
            </div>

            {/* Help Text */}
            <div className="space-y-2">
              <Label>Help Text (Optional)</Label>
              <Input
                value={localQuestion.help_text || ''}
                onChange={(e) => handleChange('help_text', e.target.value)}
                placeholder="Additional guidance for respondents..."
              />
            </div>

            {/* Placeholder Text */}
            <div className="space-y-2">
              <Label>Placeholder Text (Optional)</Label>
              <Input
                value={localQuestion.placeholder_text || ''}
                onChange={(e) => handleChange('placeholder_text', e.target.value)}
                placeholder="Placeholder text..."
              />
            </div>

            {/* Required Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Required Question</Label>
                <div className="text-sm text-gray-500">
                  Respondents must answer this question
                </div>
              </div>
              <Switch
                checked={localQuestion.required}
                onCheckedChange={(checked) => handleChange('required', checked)}
              />
            </div>

            {/* Options for Choice Questions */}
            {needsOptions && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Answer Options</Label>
                  <Button variant="outline" size="sm" onClick={addOption}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Option
                  </Button>
                </div>
                <div className="space-y-2">
                  {Array.isArray(localQuestion.options) && localQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={typeof option === 'string' ? option : option.label}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOption(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="validation" className="space-y-4">
            {/* Text Validation */}
            {needsTextValidation && (
              <>
                <div className="space-y-2">
                  <Label>Minimum Length</Label>
                  <Input
                    type="number"
                    value={localQuestion.validation_rules?.min_length || ''}
                    onChange={(e) => handleValidationRuleChange('min_length', parseInt(e.target.value) || undefined)}
                    placeholder="Minimum characters"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Maximum Length</Label>
                  <Input
                    type="number"
                    value={localQuestion.validation_rules?.max_length || ''}
                    onChange={(e) => handleValidationRuleChange('max_length', parseInt(e.target.value) || undefined)}
                    placeholder="Maximum characters"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Pattern (Regex)</Label>
                  <Input
                    value={localQuestion.validation_rules?.pattern || ''}
                    onChange={(e) => handleValidationRuleChange('pattern', e.target.value)}
                    placeholder="Regular expression pattern"
                  />
                </div>
              </>
            )}

            {/* Numeric Validation */}
            {needsNumericValidation && (
              <>
                <div className="space-y-2">
                  <Label>Minimum Value</Label>
                  <Input
                    type="number"
                    value={localQuestion.validation_rules?.min_value || ''}
                    onChange={(e) => handleValidationRuleChange('min_value', parseFloat(e.target.value) || undefined)}
                    placeholder="Minimum value"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Maximum Value</Label>
                  <Input
                    type="number"
                    value={localQuestion.validation_rules?.max_value || ''}
                    onChange={(e) => handleValidationRuleChange('max_value', parseFloat(e.target.value) || undefined)}
                    placeholder="Maximum value"
                  />
                </div>
                {localQuestion.type === 'decimal' && (
                  <div className="space-y-2">
                    <Label>Decimal Places</Label>
                    <Input
                      type="number"
                      value={localQuestion.validation_rules?.decimal_places || ''}
                      onChange={(e) => handleValidationRuleChange('decimal_places', parseInt(e.target.value) || undefined)}
                      placeholder="Number of decimal places"
                    />
                  </div>
                )}
              </>
            )}

            {/* File Validation */}
            {needsFileValidation && (
              <>
                <div className="space-y-2">
                  <Label>Maximum File Size (MB)</Label>
                  <Input
                    type="number"
                    value={localQuestion.validation_rules?.max_file_size ? localQuestion.validation_rules.max_file_size / (1024 * 1024) : ''}
                    onChange={(e) => handleValidationRuleChange('max_file_size', parseFloat(e.target.value) * 1024 * 1024 || undefined)}
                    placeholder="Maximum file size in MB"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Allowed File Types</Label>
                  <Input
                    value={localQuestion.validation_rules?.allowed_file_types?.join(', ') || ''}
                    onChange={(e) => handleValidationRuleChange('allowed_file_types', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                    placeholder="e.g., image/jpeg, image/png, application/pdf"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Maximum Files</Label>
                  <Input
                    type="number"
                    value={localQuestion.validation_rules?.max_files || ''}
                    onChange={(e) => handleValidationRuleChange('max_files', parseInt(e.target.value) || undefined)}
                    placeholder="Maximum number of files"
                  />
                </div>
              </>
            )}

            {/* Custom Error Message */}
            <div className="space-y-2">
              <Label>Custom Error Message</Label>
              <Input
                value={localQuestion.error_message || ''}
                onChange={(e) => handleChange('error_message', e.target.value)}
                placeholder="Custom error message for validation failures"
              />
            </div>
          </TabsContent>

          <TabsContent value="logic" className="space-y-4">
            <div className="text-center text-gray-500 py-8">
              <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Conditional Logic</h3>
              <p className="text-sm">
                Advanced conditional logic configuration will be available in the next update.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={handleSave} disabled={!hasUnsavedChanges}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
