'use client'

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Users,
  Building2,
  User,
  FileText,
  Plus,
  Eye,
  Save,
  ArrowRight,
  ArrowLeft,
  Info,
  CheckCircle
} from 'lucide-react';
import { CreateQuestionnaireData, QuestionType } from '@/types/database';
import { VisualQuestionBuilder } from '@/components/question-builder/visual-question-builder';
import { QuestionTemplateLibrary } from '@/components/question-builder/question-template-library';
import { TemplatePreviewModal } from '@/components/question-builder/template-preview-modal';
import { EnhancedQuestionBuilder } from './enhanced-question-builder';

interface EnhancedQuestionnaireBuilderProps {
  onSave: (data: CreateQuestionnaireData) => Promise<void>;
  onPreview?: (data: CreateQuestionnaireData) => void;
  disabled?: boolean;
  className?: string;
}

interface GroupSettings {
  target_type: 'organization' | 'individual';
  organization_id?: number;
  organization_name?: string;
  target_demographics?: {
    age_range?: string;
    gender?: string;
    location?: string;
    conditions?: string[];
  };
  access_settings: {
    is_public: boolean;
    requires_auth: boolean;
    allow_anonymous: boolean;
    restricted_access?: boolean;
    access_codes?: string[];
  };
}

interface TemplateSettings {
  use_template: boolean;
  template_id?: number;
  template_name?: string;
  customize_template: boolean;
  template_modifications?: string[];
}

export const EnhancedQuestionnaireBuilder: React.FC<EnhancedQuestionnaireBuilderProps> = ({
  onSave,
  onPreview,
  disabled = false,
  className
}) => {
  const [currentStep, setCurrentStep] = useState<'basic' | 'group' | 'template' | 'questions'>('basic');
  const [basicInfo, setBasicInfo] = useState({
    title: '',
    description: '',
    type: 'assessment' as const,
    category: 'mental_health',
    estimated_time: 5
  });

  const [groupSettings, setGroupSettings] = useState<GroupSettings>({
    target_type: 'individual',
    access_settings: {
      is_public: false,
      requires_auth: false,
      allow_anonymous: true
    }
  });

  const [templateSettings, setTemplateSettings] = useState<TemplateSettings>({
    use_template: false,
    customize_template: false
  });

  const [questions, setQuestions] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);

  const steps = [
    { id: 'basic', title: 'Basic Info', icon: Info },
    { id: 'group', title: 'Target Group', icon: Users },
    { id: 'template', title: 'Template', icon: FileText },
    { id: 'questions', title: 'Questions', icon: Plus }
  ];

  const handleNext = () => {
    const stepOrder = ['basic', 'group', 'template', 'questions'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1] as any);
    }
  };

  const handlePrevious = () => {
    const stepOrder = ['basic', 'group', 'template', 'questions'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1] as any);
    }
  };

  const handleSave = async () => {
    const questionnaireData: CreateQuestionnaireData = {
      title: basicInfo.title,
      description: basicInfo.description,
      type: basicInfo.type,
      category: basicInfo.category,
      estimated_time: basicInfo.estimated_time,
      is_active: true,
      is_adaptive: false,
      is_qr_enabled: true,
      is_template: false,
      is_public: groupSettings.access_settings.is_public,
      allow_anonymous: groupSettings.access_settings.allow_anonymous,
      requires_auth: groupSettings.access_settings.requires_auth,
      max_responses: undefined,
      expires_at: undefined,
      tags: [],
      organization_id: groupSettings.organization_id,
      metadata: {
        group_settings: groupSettings,
        template_settings: templateSettings,
        creation_flow: 'enhanced'
      }
    };

    await onSave(questionnaireData);
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => {
        const isActive = step.id === currentStep;
        const isCompleted = steps.findIndex(s => s.id === currentStep) > index;
        const Icon = step.icon;

        return (
          <React.Fragment key={step.id}>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isActive ? 'bg-blue-100 text-blue-700' : 
              isCompleted ? 'bg-green-100 text-green-700' : 
              'bg-gray-100 text-gray-500'
            }`}>
              <Icon className="w-4 h-4" />
              <span className="font-medium">{step.title}</span>
              {isCompleted && <CheckCircle className="w-4 h-4" />}
            </div>
            {index < steps.length - 1 && (
              <ArrowRight className="w-4 h-4 text-gray-400 mx-2" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );

  const renderBasicInfo = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="w-5 h-5" />
          Basic Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Questionnaire Title *</Label>
          <Input
            id="title"
            value={basicInfo.title}
            onChange={(e) => setBasicInfo(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter questionnaire title"
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={basicInfo.description}
            onChange={(e) => setBasicInfo(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe the purpose and content of this questionnaire"
            rows={3}
            disabled={disabled}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={basicInfo.type}
              onValueChange={(value) => setBasicInfo(prev => ({ ...prev, type: value as any }))}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="assessment">Assessment</SelectItem>
                <SelectItem value="survey">Survey</SelectItem>
                <SelectItem value="screening">Screening</SelectItem>
                <SelectItem value="feedback">Feedback</SelectItem>
                <SelectItem value="research">Research</SelectItem>
                <SelectItem value="clinical">Clinical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={basicInfo.category}
              onValueChange={(value) => setBasicInfo(prev => ({ ...prev, category: value }))}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mental_health">Mental Health</SelectItem>
                <SelectItem value="physical_health">Physical Health</SelectItem>
                <SelectItem value="wellness">Wellness</SelectItem>
                <SelectItem value="satisfaction">Satisfaction</SelectItem>
                <SelectItem value="research">Research</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="estimated_time">Estimated Time (minutes)</Label>
            <Input
              id="estimated_time"
              type="number"
              value={basicInfo.estimated_time}
              onChange={(e) => setBasicInfo(prev => ({ ...prev, estimated_time: parseInt(e.target.value) || 5 }))}
              min="1"
              max="120"
              disabled={disabled}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderGroupSettings = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Target Group & Access Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Target Type Selection */}
        <div className="space-y-4">
          <Label>Who is this questionnaire for?</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card 
              className={`cursor-pointer transition-colors ${
                groupSettings.target_type === 'organization' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
              }`}
              onClick={() => setGroupSettings(prev => ({ ...prev, target_type: 'organization' }))}
            >
              <CardContent className="p-4 text-center">
                <Building2 className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <h3 className="font-medium">Organization</h3>
                <p className="text-sm text-gray-600">For specific organizations, clinics, or institutions</p>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-colors ${
                groupSettings.target_type === 'individual' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
              }`}
              onClick={() => setGroupSettings(prev => ({ ...prev, target_type: 'individual' }))}
            >
              <CardContent className="p-4 text-center">
                <User className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <h3 className="font-medium">Individual</h3>
                <p className="text-sm text-gray-600">For general public or individual use</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Organization Settings */}
        {groupSettings.target_type === 'organization' && (
          <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
            <div className="space-y-2">
              <Label htmlFor="organization">Organization</Label>
              <Select
                value={groupSettings.organization_id?.toString()}
                onValueChange={(value) => setGroupSettings(prev => ({ 
                  ...prev, 
                  organization_id: parseInt(value),
                  organization_name: value === '1' ? 'MindTrack Clinic' : 'Research Institute'
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select organization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">MindTrack Clinic</SelectItem>
                  <SelectItem value="2">Research Institute</SelectItem>
                  <SelectItem value="3">University Hospital</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Access Settings */}
        <div className="space-y-4">
          <Label>Access Settings</Label>
          <div className="space-y-4 p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <Label>Public Access</Label>
                <p className="text-sm text-gray-600">Allow anyone to access this questionnaire</p>
              </div>
              <Switch
                checked={groupSettings.access_settings.is_public}
                onCheckedChange={(checked) => setGroupSettings(prev => ({
                  ...prev,
                  access_settings: { ...prev.access_settings, is_public: checked }
                }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Require Authentication</Label>
                <p className="text-sm text-gray-600">Users must log in to access</p>
              </div>
              <Switch
                checked={groupSettings.access_settings.requires_auth}
                onCheckedChange={(checked) => setGroupSettings(prev => ({
                  ...prev,
                  access_settings: { ...prev.access_settings, requires_auth: checked }
                }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Allow Anonymous Responses</Label>
                <p className="text-sm text-gray-600">Collect responses without identifying users</p>
              </div>
              <Switch
                checked={groupSettings.access_settings.allow_anonymous}
                onCheckedChange={(checked) => setGroupSettings(prev => ({
                  ...prev,
                  access_settings: { ...prev.access_settings, allow_anonymous: checked }
                }))}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {renderStepIndicator()}

      {currentStep === 'basic' && renderBasicInfo()}
      {currentStep === 'group' && renderGroupSettings()}
      {currentStep === 'template' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Template Selection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Use Template Toggle */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label>Use Existing Template</Label>
                <p className="text-sm text-gray-600">Start with a pre-built questionnaire template</p>
              </div>
              <Switch
                checked={templateSettings.use_template}
                onCheckedChange={(checked) => setTemplateSettings(prev => ({
                  ...prev,
                  use_template: checked,
                  template_id: checked ? prev.template_id : undefined,
                  template_name: checked ? prev.template_name : undefined
                }))}
              />
            </div>

            {templateSettings.use_template ? (
              <div className="space-y-4">
                {/* Template Categories */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { id: 'mental_health', name: 'Mental Health', count: 12 },
                    { id: 'satisfaction', name: 'Satisfaction', count: 8 },
                    { id: 'research', name: 'Research', count: 15 },
                    { id: 'clinical', name: 'Clinical', count: 6 }
                  ].map(category => (
                    <Card key={category.id} className="cursor-pointer hover:bg-gray-50 transition-colors">
                      <CardContent className="p-3 text-center">
                        <h4 className="font-medium text-sm">{category.name}</h4>
                        <p className="text-xs text-gray-600">{category.count} templates</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Popular Templates */}
                <div className="space-y-3">
                  <Label>Popular Templates</Label>
                  <div className="space-y-2">
                    {[
                      { id: 1, name: 'GAD-7 Anxiety Assessment', description: 'Validated 7-item anxiety screening tool', category: 'Mental Health', questions: 7 },
                      { id: 2, name: 'PHQ-9 Depression Screening', description: 'Standard depression assessment questionnaire', category: 'Mental Health', questions: 9 },
                      { id: 3, name: 'Customer Satisfaction Survey', description: 'Comprehensive satisfaction measurement', category: 'Satisfaction', questions: 12 },
                      { id: 4, name: 'Employee Wellness Check', description: 'Workplace wellness assessment', category: 'Wellness', questions: 15 }
                    ].map(template => (
                      <Card
                        key={template.id}
                        className={`cursor-pointer transition-colors ${
                          templateSettings.template_id === template.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setTemplateSettings(prev => ({
                          ...prev,
                          template_id: template.id,
                          template_name: template.name
                        }))}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium">{template.name}</h4>
                              <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                              <div className="flex items-center gap-4 mt-2">
                                <Badge variant="outline" className="text-xs">{template.category}</Badge>
                                <span className="text-xs text-gray-500">{template.questions} questions</span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTemplate(template);
                                setShowTemplatePreview(true);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Customization Options */}
                {templateSettings.template_id && (
                  <div className="p-4 bg-blue-50 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Customize Template</Label>
                        <p className="text-sm text-gray-600">Modify questions and settings after import</p>
                      </div>
                      <Switch
                        checked={templateSettings.customize_template}
                        onCheckedChange={(checked) => setTemplateSettings(prev => ({
                          ...prev,
                          customize_template: checked
                        }))}
                      />
                    </div>

                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Selected: <strong>{templateSettings.template_name}</strong>
                        {templateSettings.customize_template
                          ? ' - You can modify questions in the next step'
                          : ' - Template will be used as-is'
                        }
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </div>
            ) : (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  You'll start with a blank questionnaire and build questions from scratch.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
      {currentStep === 'questions' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Questions & Content
              </CardTitle>
              {onPreview && questions.length > 0 && (
                <Button variant="outline" size="sm" onClick={() => {
                  const previewData: CreateQuestionnaireData = {
                    title: basicInfo.title,
                    description: basicInfo.description,
                    type: basicInfo.type,
                    is_active: true,
                    settings: {
                      allow_anonymous: groupSettings.allow_anonymous,
                      require_authentication: groupSettings.require_authentication,
                      is_public: groupSettings.is_public,
                      access_code: groupSettings.access_code,
                      target_organization_id: groupSettings.target_organization_id,
                      target_demographics: groupSettings.target_demographics,
                      response_limit: groupSettings.response_limit,
                      expiry_date: groupSettings.expiry_date
                    },
                    questions: questions,
                    sections: sections
                  };
                  onPreview(previewData);
                }}>
                  <Eye className="w-4 h-4 mr-2" />
                  Quick Preview
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <EnhancedQuestionBuilder
              templateId={templateSettings.template_id}
              templateName={templateSettings.template_name}
              allowCustomization={templateSettings.customize_template}
              questions={questions}
              sections={sections}
              onQuestionsChange={setQuestions}
              onSectionsChange={setSections}
            />
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 'basic' || disabled}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </Button>

        <div className="flex gap-2">
          {currentStep === 'questions' ? (
            <>
              {onPreview && (
                <Button variant="outline" onClick={() => {
                  const previewData: CreateQuestionnaireData = {
                    title: basicInfo.title,
                    description: basicInfo.description,
                    type: basicInfo.type,
                    is_active: true,
                    settings: {
                      allow_anonymous: groupSettings.allow_anonymous,
                      require_authentication: groupSettings.require_authentication,
                      is_public: groupSettings.is_public,
                      access_code: groupSettings.access_code,
                      target_organization_id: groupSettings.target_organization_id,
                      target_demographics: groupSettings.target_demographics,
                      response_limit: groupSettings.response_limit,
                      expiry_date: groupSettings.expiry_date
                    },
                    questions: questions,
                    sections: sections
                  };
                  onPreview(previewData);
                }} disabled={disabled || !basicInfo.title}>
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
              )}
              <Button onClick={handleSave} disabled={disabled || !basicInfo.title}>
                <Save className="w-4 h-4 mr-2" />
                Save Questionnaire
              </Button>
            </>
          ) : (
            <Button
              onClick={handleNext}
              disabled={disabled || (currentStep === 'basic' && !basicInfo.title)}
              className="flex items-center gap-2"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Template Preview Modal */}
      {selectedTemplate && (
        <TemplatePreviewModal
          template={selectedTemplate}
          isOpen={showTemplatePreview}
          onClose={() => {
            setShowTemplatePreview(false);
            setSelectedTemplate(null);
          }}
          onUseTemplate={(templateData) => {
            setTemplateSettings(prev => ({
              ...prev,
              template_id: selectedTemplate.id,
              template_name: selectedTemplate.name,
              use_template: true
            }));
            setShowTemplatePreview(false);
            setSelectedTemplate(null);
          }}
        />
      )}
    </div>
  );
};
