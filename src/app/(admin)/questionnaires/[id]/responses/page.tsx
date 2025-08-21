'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ResponseList, ResponseListItem } from '@/components/response/response-list';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertCircle, 
  ArrowLeft, 
  BarChart3, 
  Users, 
  TrendingUp, 
  Clock,
  Eye
} from 'lucide-react';

interface QuestionnaireInfo {
  id: number;
  title: string;
  description?: string;
  total_responses: number;
  completion_rate: number;
  average_score: number;
  average_completion_time: number;
}

// Mock data - replace with actual API calls
const mockQuestionnaireInfo: QuestionnaireInfo = {
  id: 1,
  title: 'GAD-7 Anxiety Assessment',
  description: 'Generalized Anxiety Disorder 7-item scale for measuring anxiety symptoms',
  total_responses: 142,
  completion_rate: 87.3,
  average_score: 8.4,
  average_completion_time: 245
};

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

export default function QuestionnaireResponsesPage() {
  const params = useParams();
  const router = useRouter();
  const questionnaireId = parseInt(params.id as string);

  const [questionnaireInfo, setQuestionnaireInfo] = useState<QuestionnaireInfo | null>(null);
  const [responses, setResponses] = useState<ResponseListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Simulate API calls
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // In a real app, these would be API calls:
        // const [questionnaireResponse, responsesResponse] = await Promise.all([
        //   fetch(`/api/questionnaires/${questionnaireId}`),
        //   fetch(`/api/questionnaires/${questionnaireId}/responses`)
        // ]);
        // const questionnaireData = await questionnaireResponse.json();
        // const responsesData = await responsesResponse.json();
        
        setQuestionnaireInfo(mockQuestionnaireInfo);
        setResponses(mockResponses);
      } catch (err) {
        setError('Failed to load questionnaire responses. Please try again.');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (questionnaireId) {
      fetchData();
    }
  }, [questionnaireId]);

  const handleView = (id: number) => {
    router.push(`/responses/${id}`);
  };

  const handleExport = async (responses: ResponseListItem[]) => {
    try {
      // Create CSV content
      const headers = [
        'ID',
        'Patient ID',
        'Patient Name',
        'Age',
        'Gender',
        'Score',
        'Risk Level',
        'Completion Time (seconds)',
        'Completed At',
        'Flagged'
      ];

      const csvContent = [
        headers.join(','),
        ...responses.map(response => [
          response.id,
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
      link.setAttribute('download', `${questionnaireInfo?.title.replace(/\s+/g, '-').toLowerCase()}-responses-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      setError('Failed to export responses. Please try again.');
      console.error('Error exporting responses:', err);
    }
  };

  const formatCompletionTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  };

  const getRiskDistribution = () => {
    const distribution = responses.reduce((acc, response) => {
      const risk = response.risk_level || 'unknown';
      acc[risk] = (acc[risk] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(distribution).map(([risk, count]) => ({
      risk,
      count,
      percentage: ((count / responses.length) * 100).toFixed(1)
    }));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !questionnaireInfo) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert className="max-w-2xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || 'Questionnaire not found'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const riskDistribution = getRiskDistribution();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/questionnaires/${questionnaireId}`)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Questionnaire
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{questionnaireInfo.title}</h1>
          <p className="text-gray-600">Response Analytics & Management</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Responses</p>
                <p className="text-2xl font-bold text-gray-900">{questionnaireInfo.total_responses}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{questionnaireInfo.completion_rate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-gray-900">{questionnaireInfo.average_score}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg. Time</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCompletionTime(questionnaireInfo.average_completion_time)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Distribution */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Risk Level Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {riskDistribution.map(({ risk, count, percentage }) => {
              const colors = {
                minimal: 'bg-green-100 text-green-800',
                mild: 'bg-yellow-100 text-yellow-800',
                moderate: 'bg-orange-100 text-orange-800',
                severe: 'bg-red-100 text-red-800',
                unknown: 'bg-gray-100 text-gray-800'
              };
              
              return (
                <div key={risk} className="text-center">
                  <Badge className={colors[risk as keyof typeof colors] || colors.unknown}>
                    {risk}
                  </Badge>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{count}</p>
                  <p className="text-sm text-gray-600">{percentage}%</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Response List */}
      <ResponseList
        responses={responses}
        loading={false}
        onView={handleView}
        onExport={handleExport}
      />
    </div>
  );
}
