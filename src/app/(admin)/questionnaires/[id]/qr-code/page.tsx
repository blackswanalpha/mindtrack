'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { QRCodeGenerator } from '@/components/questionnaire/qr-code-generator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface QuestionnaireInfo {
  id: number;
  title: string;
  description?: string;
  is_active: boolean;
}

// Mock data - replace with actual API call
const mockQuestionnaireInfo: QuestionnaireInfo = {
  id: 1,
  title: 'GAD-7 Anxiety Assessment',
  description: 'Generalized Anxiety Disorder 7-item scale for measuring anxiety symptoms',
  is_active: true
};

export default function QRCodePage() {
  const params = useParams();
  const questionnaireId = parseInt(params.id as string);

  const [questionnaire, setQuestionnaire] = useState<QuestionnaireInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestionnaire = async () => {
      try {
        setLoading(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // In a real app, this would be an API call:
        // const response = await fetch(`/api/questionnaires/${questionnaireId}`);
        // const data = await response.json();
        // setQuestionnaire(data);
        
        setQuestionnaire(mockQuestionnaireInfo);
      } catch (err) {
        setError('Failed to load questionnaire information. Please try again.');
        console.error('Error fetching questionnaire:', err);
      } finally {
        setLoading(false);
      }
    };

    if (questionnaireId) {
      fetchQuestionnaire();
    }
  }, [questionnaireId]);

  const handleGenerate = async (url: string, options: any) => {
    try {
      // In a real app, you might want to save QR code generation events:
      // await fetch('/api/questionnaires/qr-code-generated', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     questionnaire_id: questionnaireId,
      //     url,
      //     options,
      //     generated_at: new Date().toISOString()
      //   })
      // });
      
      console.log('QR Code generated for:', url, 'with options:', options);
    } catch (err) {
      console.error('Error logging QR code generation:', err);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !questionnaire) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert className="max-w-2xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || 'Questionnaire not found'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!questionnaire.is_active) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert className="max-w-2xl mx-auto border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-700">
            This questionnaire is currently inactive. QR codes will still work, but users may not be able to submit responses.
          </AlertDescription>
        </Alert>
        <div className="mt-6">
          <QRCodeGenerator
            questionnaireId={questionnaireId}
            questionnaireTitle={questionnaire.title}
            onGenerate={handleGenerate}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <QRCodeGenerator
        questionnaireId={questionnaireId}
        questionnaireTitle={questionnaire.title}
        onGenerate={handleGenerate}
      />
    </div>
  );
}
