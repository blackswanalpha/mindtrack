'use client'

import React, { useState } from 'react';
import { useQuestionnaires, useQuestionnaireActions } from '@/hooks/use-questionnaires';
import { QuestionnaireList } from './questionnaire-list';
import { QuestionnaireType } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Search, Filter } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface QuestionnaireListConnectedProps {
  className?: string;
}

export const QuestionnaireListConnected: React.FC<QuestionnaireListConnectedProps> = ({
  className
}) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<QuestionnaireType | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [templateFilter, setTemplateFilter] = useState<'all' | 'templates' | 'questionnaires'>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Build filters for API call
  const filters = {
    search: searchTerm || undefined,
    type: typeFilter !== 'all' ? typeFilter : undefined,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
    is_active: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
    is_template: templateFilter === 'templates' ? true : templateFilter === 'questionnaires' ? false : undefined,
    page: currentPage,
    limit: 20
  };

  const { questionnaires, pagination, loading, error, refetch } = useQuestionnaires(filters);
  const { deleteQuestionnaire, duplicateQuestionnaire, loading: actionLoading } = useQuestionnaireActions();

  // Handle actions
  const handleEdit = (id: number) => {
    router.push(`/questionnaires/${id}/edit`);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this questionnaire?')) {
      const success = await deleteQuestionnaire(id);
      if (success) {
        refetch(); // Refresh the list
      }
    }
  };

  const handleView = (id: number) => {
    router.push(`/questionnaires/${id}`);
  };

  const handleGenerateQR = (id: number) => {
    router.push(`/questionnaires/${id}/qr`);
  };

  const handleDuplicate = async (id: number) => {
    const originalQuestionnaire = questionnaires.find(q => q.id === id);
    if (!originalQuestionnaire) return;

    const newTitle = `Copy of ${originalQuestionnaire.title}`;
    const result = await duplicateQuestionnaire(id, { 
      title: newTitle, 
      copy_questions: true 
    });
    
    if (result) {
      refetch(); // Refresh the list
      router.push(`/questionnaires/${result.questionnaire.id}/edit`);
    }
  };

  const handleCreateNew = () => {
    router.push('/questionnaires/new');
  };

  // Convert questionnaires to the format expected by QuestionnaireList
  const questionnaireListItems = questionnaires.map(q => ({
    ...q,
    response_count: Math.floor(Math.random() * 500), // Mock response count
    created_by: {
      name: 'Mock User',
      email: 'user@example.com'
    }
  }));

  const questionnaireTypes: QuestionnaireType[] = [
    'standard', 'assessment', 'screening', 'feedback', 
    'survey', 'clinical', 'research', 'educational'
  ];

  const categories = [
    'mental_health', 'wellness', 'satisfaction', 'research', 
    'diagnosis', 'education', 'health'
  ];

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Error loading questionnaires: {error}</p>
            <Button onClick={refetch} className="mt-4">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Questionnaires</h1>
          <p className="text-gray-600">Manage your mental health assessments and surveys</p>
        </div>
        <Button onClick={handleCreateNew} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create New
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search questionnaires..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Type Filter */}
            <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as QuestionnaireType | 'all')}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {questionnaireTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category.replace('_', ' ').charAt(0).toUpperCase() + category.replace('_', ' ').slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as 'all' | 'active' | 'inactive')}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            {/* Template Filter */}
            <Select value={templateFilter} onValueChange={(value) => setTemplateFilter(value as 'all' | 'templates' | 'questionnaires')}>
              <SelectTrigger>
                <SelectValue placeholder="All Items" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Items</SelectItem>
                <SelectItem value="questionnaires">Questionnaires</SelectItem>
                <SelectItem value="templates">Templates</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      {pagination && (
        <div className="flex gap-4 mb-6">
          <Badge variant="outline" className="px-3 py-1">
            Total: {pagination.total}
          </Badge>
          <Badge variant="outline" className="px-3 py-1">
            Page: {pagination.page} of {pagination.pages}
          </Badge>
          <Badge variant="outline" className="px-3 py-1">
            Active: {questionnaires.filter(q => q.is_active).length}
          </Badge>
          <Badge variant="outline" className="px-3 py-1">
            Templates: {questionnaires.filter(q => q.is_template).length}
          </Badge>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Loading questionnaires...
            </div>
          </CardContent>
        </Card>
      )}

      {/* Questionnaire List */}
      {!loading && (
        <QuestionnaireList
          questionnaires={questionnaireListItems}
          loading={actionLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          onGenerateQR={handleGenerateQR}
          onDuplicate={handleDuplicate}
          onCreateNew={handleCreateNew}
        />
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="flex items-center px-4">
              Page {currentPage} of {pagination.pages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.min(pagination.pages, currentPage + 1))}
              disabled={currentPage === pagination.pages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
