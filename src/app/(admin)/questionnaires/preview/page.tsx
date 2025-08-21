'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { QuestionnairePreview, PreviewQuestionnaire } from '@/components/questionnaire/questionnaire-preview';
import { CreateQuestionnaireData } from '@/types/database';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export default function PreviewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isTemp = searchParams.get('temp') === 'true';

  const [questionnaire, setQuestionnaire] = useState<PreviewQuestionnaire | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadQuestionnaire = async () => {
      try {
        setLoading(true);

        // Check for data parameter first (from enhanced questionnaire builder)
        const dataParam = searchParams.get('data');
        console.log('Preview data param:', dataParam ? 'Found' : 'Not found');
        if (dataParam) {
          try {
            const decodedData = JSON.parse(decodeURIComponent(dataParam));
            // Convert CreateQuestionnaireData to PreviewQuestionnaire format
            const previewData: PreviewQuestionnaire = {
              id: 0, // Temporary ID for preview
              title: decodedData.title || 'Untitled Questionnaire',
              description: decodedData.description || '',
              questions: decodedData.questions?.map(q => ({
                id: q.id,
                text: q.text,
                type: q.type, // Preserve original question type
                required: q.required,
                order_num: q.order_num,
                options: q.options,
                validation_rules: q.validation_rules,
                conditional_logic: q.conditional_logic,
                metadata: q.metadata,
                help_text: q.help_text,
                placeholder_text: q.placeholder_text,
                error_message: q.error_message
              })) || [],
              settings: {
                allow_anonymous: decodedData.settings?.allow_anonymous || false,
                require_authentication: decodedData.settings?.require_authentication || false,
                is_public: decodedData.settings?.is_public || true,
                response_limit: decodedData.settings?.response_limit,
                expiry_date: decodedData.settings?.expiry_date
              },
              estimated_duration: Math.max(1, Math.ceil((decodedData.questions?.length || 0) * 0.5)),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };

            // If no questions, add a sample question for preview
            if (!previewData.questions || previewData.questions.length === 0) {
              previewData.questions = [{
                id: 1,
                text: 'This is a sample question for preview purposes',
                type: 'text',
                required: false,
                order_num: 1,
                options: undefined,
                metadata: undefined
              }];
            }

            setQuestionnaire(previewData);
            return;
          } catch (parseError) {
            console.error('Error parsing preview data:', parseError);
            throw new Error('Invalid preview data format');
          }
        }

        if (isTemp) {
          // Load from session storage (temporary preview)
          const tempData = sessionStorage.getItem('previewQuestionnaire');
          if (tempData) {
            const parsedData = JSON.parse(tempData);
            setQuestionnaire(parsedData);
          } else {
            throw new Error('No preview data found');
          }
        } else {
          // Load from API (saved questionnaire preview)
          const questionnaireId = searchParams.get('id');
          if (!questionnaireId) {
            throw new Error('No questionnaire ID or preview data provided');
          }

          // In a real app, this would be an API call:
          // const response = await fetch(`/api/questionnaires/${questionnaireId}`);
          // const data = await response.json();
          // setQuestionnaire(data);

          // Mock data for demonstration
          const mockData: PreviewQuestionnaire = {
            id: parseInt(questionnaireId),
            title: 'GAD-7 Anxiety Assessment',
            description: 'Generalized Anxiety Disorder 7-item scale for measuring anxiety symptoms',
            type: 'assessment',
            category: 'mental_health',
            estimated_time: 5,
            is_active: true,
            is_public: false,
            allow_anonymous: true,
            requires_auth: false,
            questions: [
              {
                id: 1,
                text: 'Over the last 2 weeks, how often have you been bothered by feeling nervous, anxious, or on edge?',
                type: 'single_choice',
                required: true,
                order_num: 1,
                options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day']
              },
              {
                id: 2,
                text: 'Over the last 2 weeks, how often have you been bothered by not being able to stop or control worrying?',
                type: 'single_choice',
                required: true,
                order_num: 2,
                options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day']
              },
              {
                id: 3,
                text: 'Please rate your overall anxiety level on a scale of 1-10',
                type: 'slider',
                required: false,
                order_num: 3,
                metadata: { min: 1, max: 10, step: 1, scale_labels: ['Low', 'High'] }
              }
            ]
          };
          setQuestionnaire(mockData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load questionnaire preview');
        console.error('Error loading questionnaire preview:', err);
      } finally {
        setLoading(false);
      }
    };

    loadQuestionnaire();
  }, [isTemp, searchParams]);

  const handleClose = () => {
    if (isTemp) {
      // Clear session storage and close window
      sessionStorage.removeItem('previewQuestionnaire');
      window.close();
    } else {
      // Navigate back to questionnaire detail
      const questionnaireId = searchParams.get('id');
      if (questionnaireId) {
        router.push(`/questionnaires/${questionnaireId}`);
      } else {
        router.push('/questionnaires');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-2xl mx-4">
          <CardContent className="p-8">
            <div className="animate-pulse space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="flex gap-2">
                <div className="h-10 bg-gray-200 rounded w-24"></div>
                <div className="h-10 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !questionnaire) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-2xl mx-4">
          <CardContent className="p-8">
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                {error || 'Questionnaire preview not available'}
              </AlertDescription>
            </Alert>
            <div className="mt-6 flex justify-center">
              <Button onClick={handleClose} className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClose}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Questionnaire Preview</h1>
                <p className="text-sm text-gray-600">
                  {isTemp ? 'Temporary preview' : 'Saved questionnaire preview'}
                </p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Preview Mode
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <QuestionnairePreview
          questionnaire={questionnaire}
          mode="interactive"
          showMetadata={true}
          onClose={handleClose}
        />

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            This is a preview of how the questionnaire will appear to respondents.
          </p>
          {isTemp && (
            <p className="mt-1">
              Changes made in the builder will be reflected here after saving.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
