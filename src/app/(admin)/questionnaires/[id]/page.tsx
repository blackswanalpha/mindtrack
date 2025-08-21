'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Edit, 
  QrCode, 
  Copy, 
  Trash2, 
  Eye, 
  Users, 
  Calendar, 
  BarChart3,
  Settings,
  AlertCircle,
  CheckCircle,
  Clock,
  Globe,
  Lock,
  UserCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuestionnaireDetail {
  id: number;
  title: string;
  description?: string;
  type: string;
  category?: string;
  estimated_time?: number;
  is_active: boolean;
  is_adaptive: boolean;
  is_qr_enabled: boolean;
  is_template: boolean;
  is_public: boolean;
  allow_anonymous: boolean;
  requires_auth: boolean;
  max_responses?: number;
  expires_at?: string;
  version: number;
  response_count: number;
  completion_rate: number;
  average_completion_time: number;
  created_at: string;
  updated_at: string;
  created_by: {
    id: number;
    name: string;
    email: string;
  };
  questions: Array<{
    id: number;
    text: string;
    type: string;
    required: boolean;
    order_num: number;
    options?: string[];
  }>;
  recent_responses: Array<{
    id: number;
    completed_at: string;
    score?: number;
    risk_level?: string;
    patient_name?: string;
  }>;
}

// Mock data - replace with actual API call
const mockQuestionnaireDetail: QuestionnaireDetail = {
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
  version: 1,
  response_count: 142,
  completion_rate: 87.3,
  average_completion_time: 4.2,
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-20T14:30:00Z',
  created_by: {
    id: 1,
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@example.com'
  },
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
    }
  ],
  recent_responses: [
    {
      id: 1,
      completed_at: '2024-01-22T09:15:00Z',
      score: 12,
      risk_level: 'moderate',
      patient_name: 'Anonymous'
    },
    {
      id: 2,
      completed_at: '2024-01-22T08:30:00Z',
      score: 6,
      risk_level: 'mild',
      patient_name: 'Anonymous'
    },
    {
      id: 3,
      completed_at: '2024-01-21T16:45:00Z',
      score: 18,
      risk_level: 'severe',
      patient_name: 'Anonymous'
    }
  ]
};

export default function QuestionnaireDetailPage() {
  const router = useRouter();
  const params = useParams();
  const questionnaireId = params.id as string;

  const [questionnaire, setQuestionnaire] = useState<QuestionnaireDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestionnaire = async () => {
      try {
        setLoading(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // In a real app, this would be an API call:
        // const response = await fetch(`/api/questionnaires/${questionnaireId}`);
        // const data = await response.json();
        // setQuestionnaire(data);
        
        setQuestionnaire(mockQuestionnaireDetail);
      } catch (err) {
        setError('Failed to load questionnaire details. Please try again.');
        console.error('Error fetching questionnaire:', err);
      } finally {
        setLoading(false);
      }
    };

    if (questionnaireId) {
      fetchQuestionnaire();
    }
  }, [questionnaireId]);

  const handleEdit = () => {
    router.push(`/questionnaires/${questionnaireId}/edit`);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this questionnaire? This action cannot be undone.')) {
      return;
    }

    try {
      // In a real app, this would be an API call:
      // await fetch(`/api/questionnaires/${questionnaireId}`, { method: 'DELETE' });
      
      router.push('/questionnaires');
    } catch (err) {
      setError('Failed to delete questionnaire. Please try again.');
      console.error('Error deleting questionnaire:', err);
    }
  };

  const handleGenerateQR = () => {
    router.push(`/questionnaires/${questionnaireId}/qr-code`);
  };

  const handleViewResponses = () => {
    router.push(`/questionnaires/${questionnaireId}/responses`);
  };

  const handlePreview = () => {
    window.open(`/questionnaire/${questionnaireId}`, '_blank');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRiskLevelBadge = (riskLevel: string) => {
    const variants = {
      minimal: 'bg-green-100 text-green-800',
      mild: 'bg-yellow-100 text-yellow-800',
      moderate: 'bg-orange-100 text-orange-800',
      severe: 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={variants[riskLevel as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {riskLevel}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </CardContent>
              </Card>
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{questionnaire.title}</h1>
          <p className="text-gray-600 mt-2">Created by {questionnaire.created_by.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handlePreview} className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Preview
          </Button>
          <Button variant="outline" onClick={handleEdit} className="flex items-center gap-2">
            <Edit className="w-4 h-4" />
            Edit
          </Button>
          <Button variant="outline" onClick={handleGenerateQR} className="flex items-center gap-2">
            <QrCode className="w-4 h-4" />
            QR Code
          </Button>
          <Button variant="outline" onClick={handleDelete} className="flex items-center gap-2 text-red-600 hover:text-red-700">
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {questionnaire.description && (
                <p className="text-gray-700">{questionnaire.description}</p>
              )}
              
              <div className="flex flex-wrap gap-2">
                <Badge variant={questionnaire.is_active ? 'default' : 'secondary'}>
                  {questionnaire.is_active ? 'Active' : 'Inactive'}
                </Badge>
                {questionnaire.is_public && <Badge className="bg-green-100 text-green-800">Public</Badge>}
                {questionnaire.allow_anonymous && <Badge className="bg-blue-100 text-blue-800">Anonymous</Badge>}
                {questionnaire.is_qr_enabled && <Badge className="bg-purple-100 text-purple-800">QR Enabled</Badge>}
                {questionnaire.is_template && <Badge className="bg-gray-100 text-gray-800">Template</Badge>}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{questionnaire.response_count}</div>
                  <div className="text-sm text-gray-500">Total Responses</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{questionnaire.completion_rate}%</div>
                  <div className="text-sm text-gray-500">Completion Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{questionnaire.average_completion_time}m</div>
                  <div className="text-sm text-gray-500">Avg. Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{questionnaire.questions.length}</div>
                  <div className="text-sm text-gray-500">Questions</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Questions */}
          <Card>
            <CardHeader>
              <CardTitle>Questions ({questionnaire.questions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {questionnaire.questions.map((question, index) => (
                  <div key={question.id} className="border rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Badge variant="outline">{index + 1}</Badge>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{question.text}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {question.type.replace('_', ' ')}
                          </Badge>
                          {question.required && (
                            <Badge variant="outline" className="text-xs">Required</Badge>
                          )}
                        </div>
                        {question.options && question.options.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-600 mb-1">Options:</p>
                            <div className="flex flex-wrap gap-1">
                              {question.options.map((option, optIndex) => (
                                <Badge key={optIndex} variant="outline" className="text-xs">
                                  {option}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Responses */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Responses</CardTitle>
                <Button variant="outline" size="sm" onClick={handleViewResponses}>
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {questionnaire.recent_responses.map((response) => (
                  <div key={response.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{response.patient_name}</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(response.completed_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {response.score !== undefined && (
                        <Badge variant="outline">Score: {response.score}</Badge>
                      )}
                      {response.risk_level && getRiskLevelBadge(response.risk_level)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" onClick={handleViewResponses}>
                <Users className="w-4 h-4 mr-2" />
                View Responses
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={handleGenerateQR}>
                <QrCode className="w-4 h-4 mr-2" />
                Generate QR Code
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={handlePreview}>
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Button>
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Created:</span>
                  <span>{formatDate(questionnaire.created_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Updated:</span>
                  <span>{formatDate(questionnaire.updated_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Version:</span>
                  <span>{questionnaire.version}</span>
                </div>
                {questionnaire.estimated_time && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Est. Time:</span>
                    <span>{questionnaire.estimated_time} minutes</span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Access Settings</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Public Access</span>
                    {questionnaire.is_public ? (
                      <Globe className="w-4 h-4 text-green-600" />
                    ) : (
                      <Lock className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Anonymous</span>
                    {questionnaire.allow_anonymous ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <UserCheck className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
