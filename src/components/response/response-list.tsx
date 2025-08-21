'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Eye, 
  Download, 
  Filter,
  Calendar,
  User,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ResponseListItem {
  id: number;
  questionnaire_id: number;
  questionnaire_title: string;
  patient_identifier?: string;
  patient_name?: string;
  patient_email?: string;
  patient_age?: number;
  patient_gender?: string;
  score?: number;
  risk_level?: string;
  flagged_for_review: boolean;
  completion_time?: number;
  completed_at?: string;
  created_at: string;
  answers_count: number;
}

export interface ResponseListProps {
  responses: ResponseListItem[];
  loading?: boolean;
  onView: (id: number) => void;
  onExport?: (responses: ResponseListItem[]) => void;
  className?: string;
}

export const ResponseList: React.FC<ResponseListProps> = ({
  responses,
  loading = false,
  onView,
  onExport,
  className
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [questionnaireFilter, setQuestionnaireFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter and sort responses
  const filteredResponses = responses
    .filter(response => {
      const matchesSearch = 
        (response.patient_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (response.patient_identifier?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (response.questionnaire_title.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesRisk = riskFilter === 'all' || response.risk_level === riskFilter;
      const matchesQuestionnaire = questionnaireFilter === 'all' || 
                                  response.questionnaire_id.toString() === questionnaireFilter;
      
      let matchesDate = true;
      if (dateFilter !== 'all') {
        const responseDate = new Date(response.created_at);
        const now = new Date();
        const daysDiff = Math.floor((now.getTime() - responseDate.getTime()) / (1000 * 60 * 60 * 24));
        
        switch (dateFilter) {
          case 'today':
            matchesDate = daysDiff === 0;
            break;
          case 'week':
            matchesDate = daysDiff <= 7;
            break;
          case 'month':
            matchesDate = daysDiff <= 30;
            break;
        }
      }
      
      return matchesSearch && matchesRisk && matchesQuestionnaire && matchesDate;
    })
    .sort((a, b) => {
      let aValue = a[sortBy as keyof ResponseListItem];
      let bValue = b[sortBy as keyof ResponseListItem];
      
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  const uniqueQuestionnaires = responses.reduce((acc, response) => {
    const existing = acc.find(q => q.id === response.questionnaire_id);
    if (!existing) {
      acc.push({ id: response.questionnaire_id, title: response.questionnaire_title });
    }
    return acc;
  }, [] as { id: number; title: string }[]);

  const getRiskLevelBadge = (riskLevel?: string) => {
    if (!riskLevel) return null;
    
    const variants = {
      minimal: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      mild: { color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
      moderate: { color: 'bg-orange-100 text-orange-800', icon: AlertTriangle },
      severe: { color: 'bg-red-100 text-red-800', icon: XCircle }
    };
    
    const variant = variants[riskLevel as keyof typeof variants] || variants.minimal;
    const IconComponent = variant.icon;
    
    return (
      <Badge className={cn(variant.color, "flex items-center gap-1")}>
        <IconComponent className="w-3 h-3" />
        {riskLevel}
      </Badge>
    );
  };

  const formatCompletionTime = (seconds?: number) => {
    if (!seconds) return 'N/A';
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  };

  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="flex gap-2">
                  <div className="h-5 bg-gray-200 rounded w-12"></div>
                  <div className="h-5 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Responses</h2>
          <p className="text-gray-600">View and manage questionnaire responses</p>
        </div>
        {onExport && (
          <Button onClick={() => onExport(filteredResponses)} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export ({filteredResponses.length})
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
                  placeholder="Search by patient name, ID, or questionnaire..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={questionnaireFilter} onValueChange={setQuestionnaireFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Questionnaires" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Questionnaires</SelectItem>
                  {uniqueQuestionnaires.map(q => (
                    <SelectItem key={q.id} value={q.id.toString()}>
                      {q.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Risk Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk</SelectItem>
                  <SelectItem value="minimal">Minimal</SelectItem>
                  <SelectItem value="mild">Mild</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="severe">Severe</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Date Created</SelectItem>
                  <SelectItem value="completed_at">Date Completed</SelectItem>
                  <SelectItem value="score">Score</SelectItem>
                  <SelectItem value="risk_level">Risk Level</SelectItem>
                  <SelectItem value="patient_name">Patient Name</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Showing {filteredResponses.length} of {responses.length} responses
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="flex items-center gap-1"
        >
          Sort {sortOrder === 'asc' ? '↑' : '↓'}
        </Button>
      </div>

      {/* Response List */}
      {filteredResponses.length === 0 ? (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No responses found</h3>
            <p className="text-gray-500 text-center">
              {searchTerm || riskFilter !== 'all' || questionnaireFilter !== 'all' || dateFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'No responses have been submitted yet'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredResponses.map((response) => (
            <Card key={response.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {response.patient_name || response.patient_identifier || 'Anonymous'}
                      </h3>
                      {response.flagged_for_review && (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Flagged
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">
                      {response.questionnaire_title}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(response.created_at).toLocaleDateString()}
                      </div>
                      
                      {response.completion_time && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatCompletionTime(response.completion_time)}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1">
                        <BarChart3 className="w-4 h-4" />
                        {response.answers_count} answers
                      </div>

                      {response.patient_age && (
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          Age {response.patient_age}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 ml-4">
                    <div className="text-right">
                      {response.score !== undefined && (
                        <div className="text-lg font-bold text-gray-900">
                          {response.score}
                        </div>
                      )}
                      {getRiskLevelBadge(response.risk_level)}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onView(response.id)}
                      className="flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
