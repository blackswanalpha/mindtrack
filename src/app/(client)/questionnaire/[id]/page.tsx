'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { QuestionnaireForm, Questionnaire } from '@/components/questionnaire/questionnaire-form';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Clock, Users, Shield } from 'lucide-react';

// Mock data - replace with actual API call
const mockQuestionnaire: Questionnaire = {
  id: 1,
  title: 'GAD-7 Anxiety Assessment',
  description: 'This questionnaire will help assess your anxiety levels over the past two weeks. Please answer each question honestly based on how you have been feeling.',
  estimated_time: 5,
  allow_anonymous: true,
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
      text: 'Over the last 2 weeks, how often have you been bothered by worrying too much about different things?',
      type: 'single_choice',
      required: true,
      order_num: 3,
      options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day']
    },
    {
      id: 4,
      text: 'Over the last 2 weeks, how often have you been bothered by trouble relaxing?',
      type: 'single_choice',
      required: true,
      order_num: 4,
      options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day']
    },
    {
      id: 5,
      text: 'Over the last 2 weeks, how often have you been bothered by being so restless that it\'s hard to sit still?',
      type: 'single_choice',
      required: true,
      order_num: 5,
      options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day']
    },
    {
      id: 6,
      text: 'Over the last 2 weeks, how often have you been bothered by becoming easily annoyed or irritable?',
      type: 'single_choice',
      required: true,
      order_num: 6,
      options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day']
    },
    {
      id: 7,
      text: 'Over the last 2 weeks, how often have you been bothered by feeling afraid as if something awful might happen?',
      type: 'single_choice',
      required: true,
      order_num: 7,
      options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day']
    },
    {
      id: 8,
      text: 'If you checked off any problems, how difficult have these made it for you to do your work, take care of things at home, or get along with other people?',
      type: 'single_choice',
      required: false,
      order_num: 8,
      options: ['Not difficult at all', 'Somewhat difficult', 'Very difficult', 'Extremely difficult']
    }
  ]
};

export default function QuestionnaireResponsePage() {
  const params = useParams();
  const router = useRouter();
  const questionnaireId = parseInt(params.id as string);

  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savedResponses, setSavedResponses] = useState<Record<number, any>>({});

  useEffect(() => {
    const fetchQuestionnaire = async () => {
      try {
        setLoading(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // In a real app, this would be an API call:
        // const response = await fetch(`/api/questionnaires/${questionnaireId}/public`);
        // if (!response.ok) {
        //   throw new Error('Questionnaire not found or not available');
        // }
        // const data = await response.json();
        // setQuestionnaire(data);
        
        setQuestionnaire(mockQuestionnaire);

        // Load any saved draft responses from localStorage
        const savedDraft = localStorage.getItem(`questionnaire_draft_${questionnaireId}`);
        if (savedDraft) {
          try {
            const parsedDraft = JSON.parse(savedDraft);
            setSavedResponses(parsedDraft);
          } catch (err) {
            console.error('Error parsing saved draft:', err);
          }
        }
      } catch (err) {
        setError('Failed to load questionnaire. Please try again or contact support.');
        console.error('Error fetching questionnaire:', err);
      } finally {
        setLoading(false);
      }
    };

    if (questionnaireId) {
      fetchQuestionnaire();
    }
  }, [questionnaireId]);

  const handleSubmit = async (responses: Record<number, any>) => {
    try {
      // Calculate score for GAD-7
      const scoreMapping = {
        'Not at all': 0,
        'Several days': 1,
        'More than half the days': 2,
        'Nearly every day': 3
      };

      let totalScore = 0;
      for (let i = 1; i <= 7; i++) {
        const response = responses[i];
        if (response && scoreMapping[response as keyof typeof scoreMapping] !== undefined) {
          totalScore += scoreMapping[response as keyof typeof scoreMapping];
        }
      }

      // Determine risk level
      let riskLevel = 'minimal';
      if (totalScore >= 15) riskLevel = 'severe';
      else if (totalScore >= 10) riskLevel = 'moderate';
      else if (totalScore >= 5) riskLevel = 'mild';

      const submissionData = {
        questionnaire_id: questionnaireId,
        answers: Object.entries(responses).map(([questionId, value]) => ({
          question_id: parseInt(questionId),
          value: typeof value === 'string' ? value : JSON.stringify(value)
        })),
        score: totalScore,
        risk_level: riskLevel,
        completion_time: Math.floor(Math.random() * 300) + 180, // Mock completion time
        completed_at: new Date().toISOString()
      };

      // In a real app, this would be an API call:
      // const response = await fetch('/api/responses', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(submissionData),
      // });
      
      // if (!response.ok) {
      //   throw new Error('Failed to submit questionnaire');
      // }
      
      // const result = await response.json();

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Clear saved draft
      localStorage.removeItem(`questionnaire_draft_${questionnaireId}`);

      // Redirect to completion page
      router.push(`/questionnaire/complete?score=${totalScore}&risk=${riskLevel}`);

    } catch (err) {
      console.error('Error submitting questionnaire:', err);
      throw err; // Re-throw to be handled by the form component
    }
  };

  const handleSaveDraft = async (responses: Record<number, any>) => {
    try {
      // Save to localStorage
      localStorage.setItem(`questionnaire_draft_${questionnaireId}`, JSON.stringify(responses));
      
      // In a real app, you might also save to the server:
      // await fetch('/api/responses/draft', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     questionnaire_id: questionnaireId,
      //     responses,
      //     saved_at: new Date().toISOString()
      //   }),
      // });

      console.log('Draft saved successfully');
    } catch (err) {
      console.error('Error saving draft:', err);
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-2xl mx-4">
          <CardContent className="p-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              <div className="space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
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
                {error || 'Questionnaire not found or no longer available.'}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">MindTrack</h1>
              <p className="text-gray-600">Mental Health Assessment</p>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              {questionnaire.estimated_time && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {questionnaire.estimated_time} min
                </div>
              )}
              {questionnaire.allow_anonymous && (
                <div className="flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  Anonymous
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Introduction */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Welcome to the {questionnaire.title}
            </h2>
            {questionnaire.description && (
              <p className="text-gray-700 mb-4">{questionnaire.description}</p>
            )}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Before you begin:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Please answer all questions honestly</li>
                <li>• There are no right or wrong answers</li>
                <li>• Your responses will be kept confidential</li>
                <li>• You can save your progress and return later</li>
                {questionnaire.estimated_time && (
                  <li>• This should take approximately {questionnaire.estimated_time} minutes</li>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Questionnaire Form */}
        <QuestionnaireForm
          questionnaire={questionnaire}
          onSubmit={handleSubmit}
          onSaveDraft={handleSaveDraft}
          initialResponses={savedResponses}
          showProgress={true}
          allowNavigation={true}
        />

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            This assessment is for informational purposes only and should not replace professional medical advice.
          </p>
          <p className="mt-1">
            If you are experiencing a mental health emergency, please contact your local emergency services immediately.
          </p>
        </div>
      </div>
    </div>
  );
}
