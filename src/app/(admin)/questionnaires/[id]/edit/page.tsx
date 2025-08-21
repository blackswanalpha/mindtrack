'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { QuestionnaireBuilder, QuestionnaireBuilderData } from '@/components/questionnaire/questionnaire-builder';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';

// Mock data - replace with actual API call
const mockQuestionnaireData: QuestionnaireBuilderData = {
  id: 1,
  title: 'GAD-7 Anxiety Assessment',
  description: 'Generalized Anxiety Disorder 7-item scale for measuring anxiety symptoms and severity',
  type: 'assessment',
  category: 'mental_health',
  estimated_time: 5,
  is_active: true,
  is_adaptive: false,
  is_qr_enabled: true,
  is_template: false,
  is_public: false,
  allow_anonymous: true,
  requires_auth: false,
  max_responses: undefined,
  expires_at: undefined,
  questions: [
    {
      id: 1,
      text: 'Feeling nervous, anxious, or on edge',
      type: 'likert',
      required: true,
      order_num: 1,
      options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day']
    },
    {
      id: 2,
      text: 'Not being able to stop or control worrying',
      type: 'likert',
      required: true,
      order_num: 2,
      options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day']
    },
    {
      id: 3,
      text: 'Worrying too much about different things',
      type: 'likert',
      required: true,
      order_num: 3,
      options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day']
    },
    {
      id: 4,
      text: 'Trouble relaxing',
      type: 'likert',
      required: true,
      order_num: 4,
      options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day']
    },
    {
      id: 5,
      text: 'Being so restless that it is hard to sit still',
      type: 'likert',
      required: true,
      order_num: 5,
      options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day']
    },
    {
      id: 6,
      text: 'Becoming easily annoyed or irritable',
      type: 'likert',
      required: true,
      order_num: 6,
      options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day']
    },
    {
      id: 7,
      text: 'Feeling afraid, as if something awful might happen',
      type: 'likert',
      required: true,
      order_num: 7,
      options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day']
    }
  ]
};

export default function EditQuestionnairePage() {
  const router = useRouter();
  const params = useParams();
  const questionnaireId = params.id as string;

  const [initialData, setInitialData] = useState<QuestionnaireBuilderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestionnaire = async () => {
      try {
        setLoading(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // In a real app, this would be an API call:
        // const response = await fetch(`/api/questionnaires/${questionnaireId}`);
        // const data = await response.json();
        // setInitialData(data);
        
        setInitialData(mockQuestionnaireData);
      } catch (err) {
        setError('Failed to load questionnaire. Please try again.');
        console.error('Error fetching questionnaire:', err);
      } finally {
        setLoading(false);
      }
    };

    if (questionnaireId) {
      fetchQuestionnaire();
    }
  }, [questionnaireId]);

  const handleSave = async (data: QuestionnaireBuilderData) => {
    try {
      setError(null);
      setSuccess(null);

      // Validate required fields
      if (!data.title.trim()) {
        throw new Error('Questionnaire title is required');
      }

      if (data.questions.length === 0) {
        throw new Error('At least one question is required');
      }

      // Validate questions
      for (let i = 0; i < data.questions.length; i++) {
        const question = data.questions[i];
        if (!question.text.trim()) {
          throw new Error(`Question ${i + 1} text is required`);
        }

        // Validate options for choice questions
        if (['single_choice', 'multiple_choice', 'likert'].includes(question.type)) {
          if (!question.options || question.options.length === 0) {
            throw new Error(`Question ${i + 1} requires at least one option`);
          }

          const validOptions = question.options.filter(opt => opt.trim());
          if (validOptions.length === 0) {
            throw new Error(`Question ${i + 1} requires at least one non-empty option`);
          }
        }
      }

      // In a real app, this would be an API call:
      // const response = await fetch(`/api/questionnaires/${questionnaireId}`, {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(data),
      // });
      
      // if (!response.ok) {
      //   throw new Error('Failed to update questionnaire');
      // }
      
      // const updatedQuestionnaire = await response.json();

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      setSuccess('Questionnaire updated successfully!');

      // Redirect to the questionnaire detail page after a short delay
      setTimeout(() => {
        router.push(`/questionnaires/${questionnaireId}`);
      }, 2000);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update questionnaire';
      setError(errorMessage);
      console.error('Error updating questionnaire:', err);
    }
  };

  const handlePreview = (data: QuestionnaireBuilderData) => {
    // Store the questionnaire data in session storage for preview
    sessionStorage.setItem('previewQuestionnaire', JSON.stringify(data));
    
    // Open preview in a new tab/window
    const previewUrl = `/questionnaires/preview?temp=true`;
    window.open(previewUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !initialData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert className="max-w-2xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!initialData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert className="max-w-2xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Questionnaire not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">{success}</AlertDescription>
        </Alert>
      )}

      <QuestionnaireBuilder
        initialData={initialData}
        onSave={handleSave}
        onPreview={handlePreview}
      />
    </div>
  );
}
