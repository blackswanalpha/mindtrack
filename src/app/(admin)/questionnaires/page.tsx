'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QuestionnaireList, QuestionnaireListItem } from '@/components/questionnaire/questionnaire-list';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

// Mock data - replace with actual API calls
const mockQuestionnaires: QuestionnaireListItem[] = [
  {
    id: 1,
    title: 'GAD-7 Anxiety Assessment',
    description: 'Generalized Anxiety Disorder 7-item scale for measuring anxiety symptoms',
    type: 'assessment',
    category: 'mental_health',
    estimated_time: 5,
    is_active: true,
    is_public: false,
    allow_anonymous: true,
    response_count: 142,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-20T14:30:00Z',
    created_by: {
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@example.com'
    }
  },
  {
    id: 2,
    title: 'PHQ-9 Depression Screening',
    description: 'Patient Health Questionnaire-9 for depression screening and monitoring',
    type: 'screening',
    category: 'mental_health',
    estimated_time: 7,
    is_active: true,
    is_public: true,
    allow_anonymous: true,
    response_count: 89,
    created_at: '2024-01-10T09:15:00Z',
    updated_at: '2024-01-18T16:45:00Z',
    created_by: {
      name: 'Dr. Michael Chen',
      email: 'michael.chen@example.com'
    }
  },
  {
    id: 3,
    title: 'Wellness Check-in',
    description: 'Weekly wellness assessment for ongoing mental health monitoring',
    type: 'survey',
    category: 'wellness',
    estimated_time: 3,
    is_active: true,
    is_public: false,
    allow_anonymous: false,
    response_count: 256,
    created_at: '2024-01-05T11:20:00Z',
    updated_at: '2024-01-22T08:10:00Z',
    created_by: {
      name: 'Dr. Emily Rodriguez',
      email: 'emily.rodriguez@example.com'
    }
  },
  {
    id: 4,
    title: 'Stress Level Assessment',
    description: 'Comprehensive stress evaluation questionnaire for workplace wellness',
    type: 'assessment',
    category: 'wellness',
    estimated_time: 10,
    is_active: false,
    is_public: false,
    allow_anonymous: true,
    response_count: 34,
    created_at: '2024-01-01T12:00:00Z',
    updated_at: '2024-01-15T10:30:00Z',
    created_by: {
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@example.com'
    }
  },
  {
    id: 5,
    title: 'Sleep Quality Survey',
    description: 'Assessment of sleep patterns and quality for mental health evaluation',
    type: 'survey',
    category: 'assessment',
    estimated_time: 8,
    is_active: true,
    is_public: true,
    allow_anonymous: true,
    response_count: 67,
    created_at: '2023-12-28T14:45:00Z',
    updated_at: '2024-01-19T13:20:00Z',
    created_by: {
      name: 'Dr. Michael Chen',
      email: 'michael.chen@example.com'
    }
  }
];

export default function QuestionnairesPage() {
  const router = useRouter();
  const [questionnaires, setQuestionnaires] = useState<QuestionnaireListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call
    const fetchQuestionnaires = async () => {
      try {
        setLoading(true);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // In a real app, this would be an API call:
        // const response = await fetch('/api/questionnaires');
        // const data = await response.json();
        // setQuestionnaires(data);
        
        setQuestionnaires(mockQuestionnaires);
      } catch (err) {
        setError('Failed to load questionnaires. Please try again.');
        console.error('Error fetching questionnaires:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionnaires();
  }, []);

  const handleEdit = (id: number) => {
    router.push(`/questionnaires/${id}/edit`);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this questionnaire? This action cannot be undone.')) {
      return;
    }

    try {
      // In a real app, this would be an API call:
      // await fetch(`/api/questionnaires/${id}`, { method: 'DELETE' });
      
      setQuestionnaires(prev => prev.filter(q => q.id !== id));
      
      // You might want to show a success toast here
    } catch (err) {
      setError('Failed to delete questionnaire. Please try again.');
      console.error('Error deleting questionnaire:', err);
    }
  };

  const handleView = (id: number) => {
    router.push(`/questionnaires/${id}`);
  };

  const handleGenerateQR = (id: number) => {
    router.push(`/questionnaires/${id}/qr-code`);
  };

  const handleDuplicate = async (id: number) => {
    try {
      const originalQuestionnaire = questionnaires.find(q => q.id === id);
      if (!originalQuestionnaire) return;

      // In a real app, this would be an API call:
      // const response = await fetch(`/api/questionnaires/${id}/duplicate`, { method: 'POST' });
      // const duplicatedQuestionnaire = await response.json();
      
      // Simulate duplication
      const duplicatedQuestionnaire: QuestionnaireListItem = {
        ...originalQuestionnaire,
        id: Math.max(...questionnaires.map(q => q.id)) + 1,
        title: `${originalQuestionnaire.title} (Copy)`,
        response_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setQuestionnaires(prev => [duplicatedQuestionnaire, ...prev]);
      
      // You might want to show a success toast here
    } catch (err) {
      setError('Failed to duplicate questionnaire. Please try again.');
      console.error('Error duplicating questionnaire:', err);
    }
  };

  const handleCreateNew = () => {
    router.push('/questionnaires/create');
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
      <QuestionnaireList
        questionnaires={questionnaires}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        onGenerateQR={handleGenerateQR}
        onDuplicate={handleDuplicate}
        onCreateNew={handleCreateNew}
      />
    </div>
  );
}
