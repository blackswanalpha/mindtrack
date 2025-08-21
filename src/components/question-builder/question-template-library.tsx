'use client'

import React, { useState, useEffect } from 'react';
import { QuestionTemplate, QuestionType, CreateQuestionData } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  Star, 
  Copy, 
  Eye, 
  Heart,
  TrendingUp,
  Clock,
  Users,
  Tag
} from 'lucide-react';

interface QuestionTemplateLibraryProps {
  onSelectTemplate: (template: QuestionTemplate) => void;
  onUseTemplate: (templateData: CreateQuestionData) => void;
  className?: string;
}

export const QuestionTemplateLibrary: React.FC<QuestionTemplateLibraryProps> = ({
  onSelectTemplate,
  onUseTemplate,
  className
}) => {
  const [templates, setTemplates] = useState<QuestionTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<QuestionTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<QuestionType | 'all'>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'name'>('popular');

  // Mock data - in real app, this would come from API
  const mockTemplates: QuestionTemplate[] = [
    {
      id: 1,
      name: 'Basic Text Input',
      description: 'Simple text input question with character limit',
      category: 'text_input',
      type: 'text',
      template_data: {
        text: 'Please enter your response',
        validation_rules: { max_length: 255 },
        placeholder_text: 'Type your answer here...'
      },
      usage_count: 150,
      is_public: true,
      tags: ['basic', 'text', 'input'],
      created_by_id: 1,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 2,
      name: 'Yes/No Question',
      description: 'Simple boolean question template',
      category: 'basic',
      type: 'boolean',
      template_data: {
        text: 'Do you agree with the statement?',
        required: true
      },
      usage_count: 200,
      is_public: true,
      tags: ['boolean', 'yes-no', 'basic'],
      created_by_id: 1,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 3,
      name: '5-Point Likert Scale',
      description: 'Standard 5-point Likert scale for agreement',
      category: 'rating',
      type: 'likert',
      template_data: {
        text: 'Please rate your level of agreement',
        options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
        metadata: {
          likert_scale: {
            scale_type: '5_point',
            labels: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
            neutral_option: true
          }
        }
      },
      usage_count: 300,
      is_public: true,
      tags: ['likert', 'rating', 'agreement', '5-point'],
      created_by_id: 1,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 4,
      name: 'Star Rating',
      description: '5-star rating system',
      category: 'rating',
      type: 'star_rating',
      template_data: {
        text: 'How would you rate this?',
        validation_rules: { min_value: 1, max_value: 5 },
        metadata: {
          rating_scale: {
            min: 1,
            max: 5,
            show_numbers: false
          }
        }
      },
      usage_count: 180,
      is_public: true,
      tags: ['star', 'rating', '5-star'],
      created_by_id: 1,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 5,
      name: 'NPS Question',
      description: 'Net Promoter Score question template',
      category: 'rating',
      type: 'nps',
      template_data: {
        text: 'How likely are you to recommend us to a friend or colleague?',
        validation_rules: { min_value: 0, max_value: 10 },
        metadata: {
          nps_config: {
            detractor_range: [0, 6],
            passive_range: [7, 8],
            promoter_range: [9, 10]
          }
        }
      },
      usage_count: 120,
      is_public: true,
      tags: ['nps', 'recommendation', 'loyalty'],
      created_by_id: 1,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      setTemplates(mockTemplates);
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    let filtered = [...templates];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchLower) ||
        template.description?.toLowerCase().includes(searchLower) ||
        template.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    // Apply type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(template => template.type === selectedType);
    }

    // Apply sorting
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => b.usage_count - a.usage_count);
        break;
      case 'recent':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    setFilteredTemplates(filtered);
  }, [templates, searchTerm, selectedCategory, selectedType, sortBy]);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'text_input', label: 'Text Input' },
    { value: 'basic', label: 'Basic' },
    { value: 'rating', label: 'Rating' },
    { value: 'choice', label: 'Choice' },
    { value: 'file', label: 'File Upload' },
    { value: 'geographic', label: 'Geographic' }
  ];

  const questionTypes: { value: QuestionType | 'all'; label: string }[] = [
    { value: 'all', label: 'All Types' },
    { value: 'text', label: 'Text' },
    { value: 'textarea', label: 'Long Text' },
    { value: 'multiple_choice', label: 'Multiple Choice' },
    { value: 'single_choice', label: 'Single Choice' },
    { value: 'rating', label: 'Rating' },
    { value: 'likert', label: 'Likert Scale' },
    { value: 'star_rating', label: 'Star Rating' },
    { value: 'nps', label: 'NPS' },
    { value: 'boolean', label: 'Yes/No' },
    { value: 'date', label: 'Date' },
    { value: 'file_upload', label: 'File Upload' },
    { value: 'country', label: 'Country' }
  ];

  const handleUseTemplate = (template: QuestionTemplate) => {
    const questionData: CreateQuestionData = {
      text: template.template_data.text || template.name,
      type: template.type,
      required: template.template_data.required,
      options: template.template_data.options,
      validation_rules: template.template_data.validation_rules,
      metadata: template.template_data.metadata,
      help_text: template.template_data.help_text,
      placeholder_text: template.template_data.placeholder_text,
      error_message: template.template_data.error_message
    };

    onUseTemplate(questionData);
  };

  const getTypeIcon = (type: QuestionType) => {
    // Return appropriate icon based on type
    switch (type) {
      case 'star_rating':
        return <Star className="w-4 h-4" />;
      case 'nps':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Tag className="w-4 h-4" />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Question Template Library</h2>
          <p className="text-gray-600">Choose from pre-built question templates to speed up your questionnaire creation</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Find Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Type Filter */}
            <Select value={selectedType} onValueChange={(value) => setSelectedType(value as QuestionType | 'all')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {questionTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'popular' | 'recent' | 'name')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredTemplates.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or browse all templates.</p>
          </div>
        ) : (
          filteredTemplates.map(template => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg font-semibold text-gray-900 truncate flex items-center gap-2">
                      {getTypeIcon(template.type)}
                      {template.name}
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
                    <Users className="w-4 h-4" />
                    {template.usage_count} uses
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {template.type}
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {template.tags?.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {template.tags && template.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{template.tags.length - 3}
                    </Badge>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSelectTemplate(template)}
                    className="flex-1 flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleUseTemplate(template)}
                    className="flex-1 flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Use Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Stats */}
      {!loading && (
        <div className="text-center text-sm text-gray-500">
          Showing {filteredTemplates.length} of {templates.length} templates
        </div>
      )}
    </div>
  );
};
