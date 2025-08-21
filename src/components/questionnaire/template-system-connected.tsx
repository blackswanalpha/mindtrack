'use client'

import React, { useState } from 'react';
import { useTemplates, useQuestionnaireActions } from '@/hooks/use-questionnaires';
import { QuestionnaireType } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Filter, Star, Eye, Copy, Clock, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TemplateSystemConnectedProps {
  onSelectTemplate?: (template: any) => void;
  onCreateFromTemplate?: (template: any) => void;
  className?: string;
}

export const TemplateSystemConnected: React.FC<TemplateSystemConnectedProps> = ({
  onSelectTemplate,
  onCreateFromTemplate,
  className
}) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<QuestionnaireType | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Build filters for API call
  const filters = {
    search: searchTerm || undefined,
    type: typeFilter !== 'all' ? typeFilter : undefined,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
    is_public: true, // Only show public templates
    page: currentPage,
    limit: 12
  };

  const { templates, pagination, loading, error, refetch } = useTemplates(filters);
  const { duplicateQuestionnaire, loading: actionLoading } = useQuestionnaireActions();

  const handleSelectTemplate = (template: any) => {
    if (onSelectTemplate) {
      onSelectTemplate(template);
    } else {
      router.push(`/questionnaires/templates/${template.id}`);
    }
  };

  const handleCreateFromTemplate = async (template: any) => {
    if (onCreateFromTemplate) {
      onCreateFromTemplate(template);
      return;
    }

    // Default behavior: duplicate the template
    const newTitle = `New ${template.title}`;
    const result = await duplicateQuestionnaire(template.id, { 
      title: newTitle, 
      copy_questions: true,
      make_template: false
    });
    
    if (result) {
      router.push(`/questionnaires/${result.questionnaire.id}/edit`);
    }
  };

  const questionnaireTypes: QuestionnaireType[] = [
    'standard', 'assessment', 'screening', 'feedback', 
    'survey', 'clinical', 'research', 'educational'
  ];

  const categories = [
    'mental_health', 'wellness', 'satisfaction', 'research', 
    'diagnosis', 'education', 'health'
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'assessment': 'bg-blue-100 text-blue-800',
      'screening': 'bg-purple-100 text-purple-800',
      'clinical': 'bg-red-100 text-red-800',
      'research': 'bg-indigo-100 text-indigo-800',
      'survey': 'bg-green-100 text-green-800',
      'feedback': 'bg-orange-100 text-orange-800',
      'educational': 'bg-teal-100 text-teal-800',
      'standard': 'bg-gray-100 text-gray-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Error loading templates: {error}</p>
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
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Template Library</h2>
        <p className="text-gray-600">Choose from professionally designed questionnaire templates</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Find Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search templates..."
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
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      {pagination && (
        <div className="flex gap-4 mb-6">
          <Badge variant="outline" className="px-3 py-1">
            {pagination.total} Templates
          </Badge>
          <Badge variant="outline" className="px-3 py-1">
            {templates.filter(t => t.is_featured).length} Featured
          </Badge>
          <Badge variant="outline" className="px-3 py-1">
            {templates.filter(t => t.is_validated).length} Validated
          </Badge>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Loading templates...
            </div>
          </CardContent>
        </Card>
      )}

      {/* Template Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg font-semibold text-gray-900 truncate flex items-center gap-2">
                      {template.title}
                      {template.is_featured && (
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      )}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {template.description}
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Metadata */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {template.estimated_time} min
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {template.usage_count} uses
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  <Badge className={getTypeColor(template.type)}>
                    {template.type}
                  </Badge>
                  <Badge className={getDifficultyColor(template.difficulty)}>
                    {template.difficulty}
                  </Badge>
                  {template.is_validated && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Validated
                    </Badge>
                  )}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {template.tags?.slice(0, 3).map((tag: string) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {template.tags?.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{template.tags.length - 3}
                    </Badge>
                  )}
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.floor(template.rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {template.rating} ({template.question_count} questions)
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => handleSelectTemplate(template)}
                    className="flex-1 flex items-center gap-2"
                    size="sm"
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </Button>
                  <Button
                    onClick={() => handleCreateFromTemplate(template)}
                    variant="outline"
                    className="flex-1 flex items-center gap-2"
                    size="sm"
                    disabled={actionLoading}
                  >
                    <Copy className="w-4 h-4" />
                    Use Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && templates.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No templates found</h3>
              <p>Try adjusting your search criteria or browse all templates.</p>
            </div>
          </CardContent>
        </Card>
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
