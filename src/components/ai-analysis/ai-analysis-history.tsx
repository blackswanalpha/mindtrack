'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  Search, 
  Filter, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  Loader2,
  Eye,
  MoreHorizontal
} from 'lucide-react';
import { AIAnalysis } from '@/types/database';

interface AIAnalysisHistoryProps {
  organizationId?: number;
  userId?: number;
  onAnalysisSelect?: (analysis: AIAnalysis) => void;
  className?: string;
}

interface HistoryState {
  analyses: AIAnalysis[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;
}

export function AIAnalysisHistory({ 
  organizationId, 
  userId,
  onAnalysisSelect,
  className 
}: AIAnalysisHistoryProps) {
  const [state, setState] = useState<HistoryState>({
    analyses: [],
    isLoading: true,
    error: null,
    hasMore: true,
    page: 0
  });

  const [filters, setFilters] = useState({
    search: '',
    riskLevel: 'all',
    dateRange: '30'
  });

  useEffect(() => {
    loadAnalysisHistory();
  }, [organizationId, userId]);

  const loadAnalysisHistory = async (page = 0, reset = true) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const params = new URLSearchParams({
        limit: '20',
        offset: (page * 20).toString()
      });

      if (organizationId) params.append('organization_id', organizationId.toString());
      if (userId) params.append('user_id', userId.toString());

      const response = await fetch(`/api/ai-analysis/history?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load analysis history');
      }

      setState(prev => ({
        ...prev,
        analyses: reset ? data.data.analyses : [...prev.analyses, ...data.data.analyses],
        isLoading: false,
        hasMore: data.data.pagination.hasMore,
        page
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load analysis history'
      }));
    }
  };

  const handleLoadMore = () => {
    if (!state.isLoading && state.hasMore) {
      loadAnalysisHistory(state.page + 1, false);
    }
  };

  const getRiskLevel = (riskAssessment?: string) => {
    if (!riskAssessment) return { level: 'Unknown', color: 'gray' };
    
    const text = riskAssessment.toLowerCase();
    if (text.includes('critical')) return { level: 'Critical', color: 'red' };
    if (text.includes('high')) return { level: 'High', color: 'orange' };
    if (text.includes('medium') || text.includes('moderate')) return { level: 'Medium', color: 'yellow' };
    if (text.includes('low')) return { level: 'Low', color: 'green' };
    return { level: 'Unknown', color: 'gray' };
  };

  const filteredAnalyses = state.analyses.filter(analysis => {
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const matchesSearch = 
        analysis.analysis.toLowerCase().includes(searchTerm) ||
        (analysis.recommendations && analysis.recommendations.toLowerCase().includes(searchTerm)) ||
        (analysis.risk_assessment && analysis.risk_assessment.toLowerCase().includes(searchTerm));
      
      if (!matchesSearch) return false;
    }

    // Risk level filter
    if (filters.riskLevel !== 'all') {
      const riskInfo = getRiskLevel(analysis.risk_assessment);
      if (riskInfo.level.toLowerCase() !== filters.riskLevel) return false;
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const daysAgo = parseInt(filters.dateRange);
      const analysisDate = new Date(analysis.created_at);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
      
      if (analysisDate < cutoffDate) return false;
    }

    return true;
  });

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-indigo-600" />
          AI Analysis History
        </CardTitle>
        <CardDescription>
          View and manage previous AI analysis results
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search analyses..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select 
            value={filters.riskLevel} 
            onValueChange={(value) => setFilters(prev => ({ ...prev, riskLevel: value }))}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Risk Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risks</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select 
            value={filters.dateRange} 
            onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Error State */}
        {state.error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}

        {/* Analysis List */}
        <div className="space-y-3">
          {filteredAnalyses.length === 0 && !state.isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No AI analyses found</p>
              <p className="text-sm">Try adjusting your filters or generate new analyses</p>
            </div>
          ) : (
            filteredAnalyses.map((analysis) => {
              const riskInfo = getRiskLevel(analysis.risk_assessment);
              
              return (
                <Card key={analysis.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          ID: {analysis.id}
                        </Badge>
                        <Badge 
                          variant={riskInfo.level === 'Critical' || riskInfo.level === 'High' ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {riskInfo.level === 'Critical' || riskInfo.level === 'High' ? (
                            <AlertTriangle className="h-3 w-3 mr-1" />
                          ) : riskInfo.level === 'Low' ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : null}
                          {riskInfo.level}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {analysis.model_used}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {analysis.analysis.substring(0, 150)}...
                      </p>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(analysis.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onAnalysisSelect?.(analysis)}
                        className="flex items-center gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        View
                      </Button>
                      
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* Load More */}
        {state.hasMore && !state.isLoading && (
          <div className="text-center">
            <Button variant="outline" onClick={handleLoadMore}>
              Load More Analyses
            </Button>
          </div>
        )}

        {/* Loading State */}
        {state.isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span className="text-muted-foreground">Loading analyses...</span>
          </div>
        )}

        {/* Summary */}
        <div className="text-xs text-muted-foreground text-center pt-4 border-t">
          Showing {filteredAnalyses.length} of {state.analyses.length} analyses
        </div>
      </CardContent>
    </Card>
  );
}
