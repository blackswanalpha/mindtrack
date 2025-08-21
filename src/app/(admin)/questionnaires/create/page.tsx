'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  Sparkles, 
  CheckCircle, 
  AlertTriangle,
  Info
} from 'lucide-react';
import { EnhancedQuestionnaireBuilder } from '@/components/questionnaire/enhanced-questionnaire-builder';
import { CreateQuestionnaireData } from '@/types/database';

export default function CreateEnhancedQuestionnairePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async (data: CreateQuestionnaireData) => {
    setSaving(true);
    setSaveError(null);
    
    try {
      const response = await fetch('/api/questionnaires', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create questionnaire');
      }

      const result = await response.json();
      setSaveSuccess(true);
      
      // Redirect to the questionnaire details page after a short delay
      setTimeout(() => {
        router.push(`/questionnaires/${result.data.id}`);
      }, 2000);

    } catch (error) {
      console.error('Error creating questionnaire:', error);
      setSaveError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = (data: CreateQuestionnaireData) => {
    // Open preview in a new tab/window
    const previewData = encodeURIComponent(JSON.stringify(data));
    window.open(`/questionnaires/preview?data=${previewData}`, '_blank');
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-blue-600" />
              Create Enhanced Questionnaire
            </h1>
            <p className="text-gray-600 mt-1">
              Build comprehensive questionnaires with advanced features
            </p>
          </div>
        </div>
        
        <Badge variant="secondary" className="text-sm">
          Enhanced Builder
        </Badge>
      </div>

      {/* Features Overview */}
      <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg text-blue-900">Enhanced Features Available</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CheckCircle className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-blue-900">22+ Question Types</h4>
                <p className="text-sm text-blue-700">
                  Numeric, Date/Time, File Upload, Rating Scales, Geographic, and more
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-green-900">Smart Targeting</h4>
                <p className="text-sm text-green-700">
                  Organization-specific or individual targeting with access controls
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CheckCircle className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium text-purple-900">Template Library</h4>
                <p className="text-sm text-purple-700">
                  Pre-built questionnaires for common use cases (GAD-7, PHQ-9, etc.)
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Success Message */}
      {saveSuccess && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Success!</strong> Your questionnaire has been created successfully. 
            Redirecting to questionnaire details...
          </AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {saveError && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Error:</strong> {saveError}
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {saving && (
        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            Creating your questionnaire... Please wait.
          </AlertDescription>
        </Alert>
      )}

      {/* Enhanced Questionnaire Builder */}
      <EnhancedQuestionnaireBuilder
        onSave={handleSave}
        onPreview={handlePreview}
        disabled={saving}
      />

      {/* Help Section */}
      <Card className="mt-8 bg-gray-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Info className="w-5 h-5" />
            Getting Started Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Step-by-Step Process</h4>
              <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                <li><strong>Basic Info:</strong> Set title, description, and questionnaire type</li>
                <li><strong>Target Group:</strong> Choose between organization or individual targeting</li>
                <li><strong>Template:</strong> Start from scratch or use a pre-built template</li>
                <li><strong>Questions:</strong> Build your questionnaire with advanced question types</li>
              </ol>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Advanced Features</h4>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li><strong>Conditional Logic:</strong> Show/hide questions based on responses</li>
                <li><strong>Validation Rules:</strong> Ensure data quality with custom validation</li>
                <li><strong>File Uploads:</strong> Collect documents and images from respondents</li>
                <li><strong>Rating Scales:</strong> Likert scales, NPS, star ratings, and more</li>
                <li><strong>Geographic Data:</strong> Built-in country, state, and city selection</li>
                <li><strong>Numeric Inputs:</strong> Integer and decimal with range validation</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Tip:</strong> Use templates to get started quickly with validated questionnaires like GAD-7 or PHQ-9.
          </AlertDescription>
        </Alert>
        
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Tip:</strong> Set up conditional logic to create dynamic questionnaires that adapt to responses.
          </AlertDescription>
        </Alert>
        
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Tip:</strong> Use the preview feature to test your questionnaire before publishing.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
