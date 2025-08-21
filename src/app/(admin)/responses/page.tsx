'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ResponseList, ResponseListItem } from '@/components/response/response-list';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

// Mock data - replace with actual API calls
const mockResponses: ResponseListItem[] = [
  {
    id: 1,
    questionnaire_id: 1,
    questionnaire_title: 'GAD-7 Anxiety Assessment',
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
    answers_count: 7
  },
  {
    id: 2,
    questionnaire_id: 1,
    questionnaire_title: 'GAD-7 Anxiety Assessment',
    patient_name: 'Anonymous',
    patient_identifier: 'PT-002',
    patient_age: 35,
    patient_gender: 'male',
    score: 6,
    risk_level: 'mild',
    flagged_for_review: false,
    completion_time: 180,
    completed_at: '2024-01-22T08:30:00Z',
    created_at: '2024-01-22T08:30:00Z',
    answers_count: 7
  },
  {
    id: 3,
    questionnaire_id: 1,
    questionnaire_title: 'GAD-7 Anxiety Assessment',
    patient_name: 'Anonymous',
    patient_identifier: 'PT-003',
    patient_age: 42,
    patient_gender: 'female',
    score: 18,
    risk_level: 'severe',
    flagged_for_review: true,
    completion_time: 320,
    completed_at: '2024-01-21T16:45:00Z',
    created_at: '2024-01-21T16:45:00Z',
    answers_count: 7
  },
  {
    id: 4,
    questionnaire_id: 2,
    questionnaire_title: 'PHQ-9 Depression Screening',
    patient_name: 'Anonymous',
    patient_identifier: 'PT-004',
    patient_age: 31,
    patient_gender: 'non-binary',
    score: 14,
    risk_level: 'moderate',
    flagged_for_review: false,
    completion_time: 280,
    completed_at: '2024-01-21T14:20:00Z',
    created_at: '2024-01-21T14:20:00Z',
    answers_count: 9
  },
  {
    id: 5,
    questionnaire_id: 3,
    questionnaire_title: 'Wellness Check-in',
    patient_name: 'Anonymous',
    patient_identifier: 'PT-005',
    patient_age: 26,
    patient_gender: 'male',
    score: 3,
    risk_level: 'minimal',
    flagged_for_review: false,
    completion_time: 120,
    completed_at: '2024-01-21T11:30:00Z',
    created_at: '2024-01-21T11:30:00Z',
    answers_count: 5
  },
  {
    id: 6,
    questionnaire_id: 2,
    questionnaire_title: 'PHQ-9 Depression Screening',
    patient_name: 'Anonymous',
    patient_identifier: 'PT-006',
    patient_email: 'patient@example.com',
    patient_age: 39,
    patient_gender: 'female',
    score: 21,
    risk_level: 'severe',
    flagged_for_review: true,
    completion_time: 410,
    completed_at: '2024-01-20T15:45:00Z',
    created_at: '2024-01-20T15:45:00Z',
    answers_count: 9
  },
  {
    id: 7,
    questionnaire_id: 3,
    questionnaire_title: 'Wellness Check-in',
    patient_name: 'Anonymous',
    patient_identifier: 'PT-007',
    patient_age: 33,
    patient_gender: 'male',
    score: 8,
    risk_level: 'mild',
    flagged_for_review: false,
    completion_time: 95,
    completed_at: '2024-01-20T10:15:00Z',
    created_at: '2024-01-20T10:15:00Z',
    answers_count: 5
  },
  {
    id: 8,
    questionnaire_id: 1,
    questionnaire_title: 'GAD-7 Anxiety Assessment',
    patient_name: 'Anonymous',
    patient_identifier: 'PT-008',
    patient_age: 29,
    patient_gender: 'female',
    score: 2,
    risk_level: 'minimal',
    flagged_for_review: false,
    completion_time: 165,
    completed_at: '2024-01-19T16:30:00Z',
    created_at: '2024-01-19T16:30:00Z',
    answers_count: 7
  }
];

export default function ResponsesPage() {
  const router = useRouter();
  const [responses, setResponses] = useState<ResponseListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        setLoading(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // In a real app, this would be an API call:
        // const response = await fetch('/api/responses');
        // const data = await response.json();
        // setResponses(data);
        
        setResponses(mockResponses);
      } catch (err) {
        setError('Failed to load responses. Please try again.');
        console.error('Error fetching responses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResponses();
  }, []);

  const handleView = (id: number) => {
    router.push(`/responses/${id}`);
  };

  const handleExport = async (responses: ResponseListItem[]) => {
    try {
      // Create CSV content
      const headers = [
        'ID',
        'Questionnaire',
        'Patient ID',
        'Patient Name',
        'Age',
        'Gender',
        'Score',
        'Risk Level',
        'Completion Time',
        'Completed At',
        'Flagged'
      ];

      const csvContent = [
        headers.join(','),
        ...responses.map(response => [
          response.id,
          `"${response.questionnaire_title}"`,
          response.patient_identifier || '',
          response.patient_name || '',
          response.patient_age || '',
          response.patient_gender || '',
          response.score || '',
          response.risk_level || '',
          response.completion_time || '',
          response.completed_at || response.created_at,
          response.flagged_for_review ? 'Yes' : 'No'
        ].join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `responses-export-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // In a real app, you might also want to log the export:
      // await fetch('/api/exports', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     type: 'responses',
      //     count: responses.length,
      //     exported_at: new Date().toISOString()
      //   })
      // });

    } catch (err) {
      setError('Failed to export responses. Please try again.');
      console.error('Error exporting responses:', err);
    }
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert className="max-w-2xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ResponseList
        responses={responses}
        loading={loading}
        onView={handleView}
        onExport={handleExport}
      />
    </div>
  );
}
