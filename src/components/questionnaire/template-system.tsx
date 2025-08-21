'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileTemplate, 
  Copy, 
  Star, 
  Download, 
  Upload,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ConditionalRule, ConditionalRuleBuilder } from './conditional-logic';

export interface QuestionnaireTemplate {
  id: string;
  name: string;
  description: string;
  category: 'mental_health' | 'wellness' | 'assessment' | 'screening' | 'research' | 'custom';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimated_time: number;
  question_count: number;
  is_featured: boolean;
  is_validated: boolean;
  created_by: string;
  created_at: string;
  usage_count: number;
  rating: number;
  tags: string[];
  questions: any[];
  conditional_rules: ConditionalRule[];
  adaptive_config?: {
    enabled: boolean;
    min_questions: number;
    max_questions: number;
    confidence_threshold: number;
  };
}

export interface TemplateSystemProps {
  onSelectTemplate: (template: QuestionnaireTemplate) => void;
  onCreateFromTemplate: (template: QuestionnaireTemplate) => void;
  onSaveAsTemplate?: (questionnaire: any) => void;
  className?: string;
}

// Predefined templates
const PREDEFINED_TEMPLATES: QuestionnaireTemplate[] = [
  {
    id: 'gad7-standard',
    name: 'GAD-7 Anxiety Assessment',
    description: 'Generalized Anxiety Disorder 7-item scale for measuring anxiety symptoms over the past 2 weeks.',
    category: 'mental_health',
    difficulty: 'beginner',
    estimated_time: 5,
    question_count: 7,
    is_featured: true,
    is_validated: true,
    created_by: 'MindTrack Team',
    created_at: '2024-01-01T00:00:00Z',
    usage_count: 1250,
    rating: 4.8,
    tags: ['anxiety', 'screening', 'validated', 'clinical'],
    questions: [
      {
        id: 1,
        text: 'Over the last 2 weeks, how often have you been bothered by feeling nervous, anxious, or on edge?',
        type: 'single_choice',
        required: true,
        order_num: 1,
        options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day']
      },
      // ... other GAD-7 questions
    ],
    conditional_rules: ConditionalRuleBuilder.GAD7WithFollowUp || []
  },
  {
    id: 'phq9-standard',
    name: 'PHQ-9 Depression Screening',
    description: 'Patient Health Questionnaire-9 for depression screening and severity assessment.',
    category: 'mental_health',
    difficulty: 'intermediate',
    estimated_time: 7,
    question_count: 9,
    is_featured: true,
    is_validated: true,
    created_by: 'MindTrack Team',
    created_at: '2024-01-01T00:00:00Z',
    usage_count: 980,
    rating: 4.9,
    tags: ['depression', 'screening', 'validated', 'clinical', 'suicide-risk'],
    questions: [],
    conditional_rules: ConditionalRuleBuilder.PHQ9WithSuicideRisk || []
  },
  {
    id: 'wellness-checkin',
    name: 'Daily Wellness Check-in',
    description: 'Quick daily assessment for monitoring overall mental wellness and mood.',
    category: 'wellness',
    difficulty: 'beginner',
    estimated_time: 3,
    question_count: 5,
    is_featured: false,
    is_validated: false,
    created_by: 'MindTrack Team',
    created_at: '2024-01-01T00:00:00Z',
    usage_count: 2100,
    rating: 4.6,
    tags: ['wellness', 'daily', 'mood', 'quick'],
    questions: [],
    conditional_rules: ConditionalRuleBuilder.AdaptiveWellness || []
  },
  {
    id: 'stress-assessment',
    name: 'Comprehensive Stress Assessment',
    description: 'Detailed evaluation of stress levels, sources, and coping mechanisms.',
    category: 'assessment',
    difficulty: 'advanced',
    estimated_time: 15,
    question_count: 25,
    is_featured: true,
    is_validated: true,
    created_by: 'Dr. Sarah Johnson',
    created_at: '2024-01-01T00:00:00Z',
    usage_count: 450,
    rating: 4.7,
    tags: ['stress', 'comprehensive', 'coping', 'workplace'],
    questions: [],
    conditional_rules: [],
    adaptive_config: {
      enabled: true,
      min_questions: 10,
      max_questions: 25,
      confidence_threshold: 0.8
    }
  },
  {
    id: 'sleep-quality',
    name: 'Sleep Quality Index',
    description: 'Assessment of sleep patterns, quality, and impact on daily functioning.',
    category: 'wellness',
    difficulty: 'intermediate',
    estimated_time: 8,
    question_count: 12,
    is_featured: false,
    is_validated: true,
    created_by: 'Sleep Research Lab',
    created_at: '2024-01-01T00:00:00Z',
    usage_count: 720,
    rating: 4.5,
    tags: ['sleep', 'quality', 'patterns', 'insomnia'],
    questions: [],
    conditional_rules: []
  }
];

export const TemplateSystem: React.FC<TemplateSystemProps> = ({
  onSelectTemplate,
  onCreateFromTemplate,
  onSaveAsTemplate,
  className
}) => {
  const [templates] = useState<QuestionnaireTemplate[]>(PREDEFINED_TEMPLATES);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);

  // Filter and sort templates
  const filteredTemplates = templates
    .filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
      const matchesDifficulty = difficultyFilter === 'all' || template.difficulty === difficultyFilter;
      
      return matchesSearch && matchesCategory && matchesDifficulty;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'featured':
          if (a.is_featured && !b.is_featured) return -1;
          if (!a.is_featured && b.is_featured) return 1;
          return b.usage_count - a.usage_count;
        case 'popular':
          return b.usage_count - a.usage_count;
        case 'rating':
          return b.rating - a.rating;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'recent':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return 0;
      }
    });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'mental_health':
        return 'bg-blue-100 text-blue-800';
      case 'wellness':
        return 'bg-green-100 text-green-800';
      case 'assessment':
        return 'bg-purple-100 text-purple-800';
      case 'screening':
        return 'bg-orange-100 text-orange-800';
      case 'research':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={cn(
              "w-3 h-3",
              i < Math.floor(rating) ? "text-yellow-400 fill-current" : "text-gray-300"
            )}
          />
        ))}
        <span className="text-xs text-gray-500 ml-1">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileTemplate className="w-6 h-6" />
            Questionnaire Templates
          </h2>
          <p className="text-gray-600">Choose from validated templates or create your own</p>
        </div>
        {onSaveAsTemplate && (
          <Button onClick={() => setShowCreateTemplate(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Save as Template
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search templates, tags, or descriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="mental_health">Mental Health</SelectItem>
                  <SelectItem value="wellness">Wellness</SelectItem>
                  <SelectItem value="assessment">Assessment</SelectItem>
                  <SelectItem value="screening">Screening</SelectItem>
                  <SelectItem value="research">Research</SelectItem>
                </SelectContent>
              </Select>

              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="popular">Popular</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="recent">Recent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Showing {filteredTemplates.length} of {templates.length} templates
        </span>
        <div className="flex items-center gap-4">
          <span>{templates.filter(t => t.is_featured).length} featured</span>
          <span>{templates.filter(t => t.is_validated).length} validated</span>
        </div>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg font-semibold text-gray-900 truncate flex items-center gap-2">
                    {template.name}
                    {template.is_featured && (
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    )}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {template.description}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge className={getCategoryColor(template.category)}>
                  {template.category.replace('_', ' ')}
                </Badge>
                <Badge className={getDifficultyColor(template.difficulty)}>
                  {template.difficulty}
                </Badge>
                {template.is_validated && (
                  <Badge className="bg-green-100 text-green-800">
                    Validated
                  </Badge>
                )}
                {template.adaptive_config?.enabled && (
                  <Badge className="bg-purple-100 text-purple-800">
                    Adaptive
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="space-y-3">
                {/* Metrics */}
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">{template.question_count}</div>
                    <div className="text-gray-500">Questions</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">{template.estimated_time}m</div>
                    <div className="text-gray-500">Est. Time</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">{template.usage_count}</div>
                    <div className="text-gray-500">Uses</div>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center justify-center">
                  {renderStars(template.rating)}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {template.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {template.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{template.tags.length - 3}
                    </Badge>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => onSelectTemplate(template)}
                    className="flex-1 flex items-center gap-2"
                    size="sm"
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </Button>
                  <Button
                    onClick={() => onCreateFromTemplate(template)}
                    variant="outline"
                    className="flex-1 flex items-center gap-2"
                    size="sm"
                  >
                    <Copy className="w-4 h-4" />
                    Use
                  </Button>
                </div>

                {/* Creator */}
                <div className="text-xs text-gray-500 text-center pt-2 border-t">
                  Created by {template.created_by}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-500 text-center">
              Try adjusting your search or filters to find the template you're looking for.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
