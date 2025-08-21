'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ResponseDetailComponent, ResponseDetail } from '@/components/response/response-detail';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

// Mock data - replace with actual API call
const mockResponseDetail: ResponseDetail = {
  id: 1,
  questionnaire_id: 1,
  questionnaire_title: 'GAD-7 Anxiety Assessment',
  questionnaire_description: 'Generalized Anxiety Disorder 7-item scale for measuring anxiety symptoms',
  patient_name: 'Anonymous',
  patient_identifier: 'PT-001',
  patient_age: 28,
  patient_gender: 'female',
  score: 12,
  risk_level: 'moderate',
  flagged_for_review: false,
  completion_time: 245,
  completed_at: '2024-01-22T09:15:00Z',
  created_at: '2024-01-22T09:15:00Z',
  updated_at: '2024-01-22T09:15:00Z',
  answers: [
    {
      id: 1,
      question_id: 1,
      question_text: 'Over the last 2 weeks, how often have you been bothered by feeling nervous, anxious, or on edge?',
      question_type: 'single_choice',
      value: 'Several days',
      question_order: 1
    },
    {
      id: 2,
      question_id: 2,
      question_text: 'Over the last 2 weeks, how often have you been bothered by not being able to stop or control worrying?',
      question_type: 'single_choice',
      value: 'More than half the days',
      question_order: 2
    },
    {
      id: 3,
      question_id: 3,
      question_text: 'Over the last 2 weeks, how often have you been bothered by worrying too much about different things?',
      question_type: 'single_choice',
      value: 'More than half the days',
      question_order: 3
    },
    {
      id: 4,
      question_id: 4,
      question_text: 'Over the last 2 weeks, how often have you been bothered by trouble relaxing?',
      question_type: 'single_choice',
      value: 'Several days',
      question_order: 4
    },
    {
      id: 5,
      question_id: 5,
      question_text: 'Over the last 2 weeks, how often have you been bothered by being so restless that it\'s hard to sit still?',
      question_type: 'single_choice',
      value: 'Not at all',
      question_order: 5
    },
    {
      id: 6,
      question_id: 6,
      question_text: 'Over the last 2 weeks, how often have you been bothered by becoming easily annoyed or irritable?',
      question_type: 'single_choice',
      value: 'Several days',
      question_order: 6
    },
    {
      id: 7,
      question_id: 7,
      question_text: 'Over the last 2 weeks, how often have you been bothered by feeling afraid as if something awful might happen?',
      question_type: 'single_choice',
      value: 'Not at all',
      question_order: 7
    }
  ]
};

export default function ResponseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const responseId = parseInt(params.id as string);

  const [response, setResponse] = useState<ResponseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResponse = async () => {
      try {
        setLoading(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // In a real app, this would be an API call:
        // const response = await fetch(`/api/responses/${responseId}`);
        // if (!response.ok) {
        //   throw new Error('Response not found');
        // }
        // const data = await response.json();
        // setResponse(data);
        
        setResponse(mockResponseDetail);
      } catch (err) {
        setError('Failed to load response details. Please try again.');
        console.error('Error fetching response:', err);
      } finally {
        setLoading(false);
      }
    };

    if (responseId) {
      fetchResponse();
    }
  }, [responseId]);

  const handleFlag = async (id: number, flagged: boolean) => {
    try {
      // In a real app, this would be an API call:
      // await fetch(`/api/responses/${id}/flag`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ flagged_for_review: flagged })
      // });

      // Update local state
      setResponse(prev => prev ? { ...prev, flagged_for_review: flagged } : null);
      
      console.log(`Response ${id} ${flagged ? 'flagged' : 'unflagged'} for review`);
    } catch (err) {
      setError('Failed to update flag status. Please try again.');
      console.error('Error updating flag:', err);
    }
  };

  const handleSendEmail = (email: string) => {
    // In a real app, this might open an email client or send via API
    const subject = encodeURIComponent('Follow-up on your mental health assessment');
    const body = encodeURIComponent(`Dear Patient,

Thank you for completing the ${response?.questionnaire_title}. 

Based on your responses, we would like to schedule a follow-up consultation to discuss your results and provide appropriate support.

Please contact us at your earliest convenience to schedule an appointment.

Best regards,
MindTrack Team`);
    
    window.open(`mailto:${email}?subject=${subject}&body=${body}`);
  };

  const handleExport = (response: ResponseDetail) => {
    try {
      // Create detailed response report
      const reportContent = `
RESPONSE REPORT
===============

Response ID: ${response.id}
Questionnaire: ${response.questionnaire_title}
Patient: ${response.patient_name || 'Anonymous'}
Patient ID: ${response.patient_identifier || 'N/A'}
Completed: ${new Date(response.created_at).toLocaleString()}
Score: ${response.score || 'N/A'}
Risk Level: ${response.risk_level || 'N/A'}
Flagged: ${response.flagged_for_review ? 'Yes' : 'No'}

RESPONSES
=========

${response.answers.map((answer, index) => `
${index + 1}. ${answer.question_text}
   Answer: ${answer.value}
`).join('')}

---
Generated on ${new Date().toLocaleString()}
      `.trim();

      // Create and download file
      const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `response-${response.id}-report.txt`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      setError('Failed to export response. Please try again.');
      console.error('Error exporting response:', err);
    }
  };

  const handleViewQuestionnaire = (questionnaireId: number) => {
    router.push(`/questionnaires/${questionnaireId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-6">
              <div className="h-48 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !response) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert className="max-w-2xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || 'Response not found'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ResponseDetailComponent
        response={response}
        onFlag={handleFlag}
        onSendEmail={handleSendEmail}
        onExport={handleExport}
        onViewQuestionnaire={handleViewQuestionnaire}
      />
    </div>
  );
}
