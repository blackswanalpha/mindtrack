'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
// import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Activity,
  BarChart3,
  ArrowRight
} from 'lucide-react';

interface AIAnalysisStats {
  overview: {
    totalAnalyses: number;
    uniqueResponses: number;
    uniqueUsers: number;
    uniqueQuestionnaires: number;
    highRiskPercentage: number;
  };
  riskDistribution: Array<{
    riskLevel: string;
    count: number;
    percentage: string;
  }>;
  recentActivity: Array<{
    id: number;
    createdAt: string;
    questionnaireTitle: string;
    riskLevel: string;
  }>;
  dailyTrends: Array<{
    date: string;
    count: number;
  }>;
}

interface AIAnalysisWidgetProps {
  organizationId?: number;
  className?: string;
}

export function AIAnalysisWidget({ organizationId, className }: AIAnalysisWidgetProps) {
  const [stats, setStats] = useState<AIAnalysisStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (organizationId) {
        params.append('organization_id', organizationId.toString());
      }

      const response = await fetch(`/api/ai-analysis/stats?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load AI analysis statistics');
      }

      setStats(data.data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load statistics');
    } finally {
      setIsLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="h-3 w-3" />;
      case 'low':
        return <CheckCircle className="h-3 w-3" />;
      default:
        return <Activity className="h-3 w-3" />;
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-indigo-600" />
            AI Analysis Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-indigo-600" />
            AI Analysis Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {error || 'Failed to load AI analysis statistics'}
            </p>
            <Button variant="outline" size="sm" onClick={loadStats} className="mt-2">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-indigo-600" />
              AI Analysis Overview
            </CardTitle>
            <CardDescription>
              AI-powered insights and risk assessments
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <a href="/ai-analysis" className="flex items-center gap-1">
              View All
              <ArrowRight className="h-3 w-3" />
            </a>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-2xl font-bold text-indigo-600">
              {stats.overview.totalAnalyses.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">Total Analyses</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-green-600">
              {stats.overview.uniqueResponses.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">Responses Analyzed</p>
          </div>
        </div>

        {/* Risk Distribution */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Risk Distribution</h4>
            <Badge variant="outline" className="text-xs">
              {stats.overview.highRiskPercentage.toFixed(1)}% High Risk
            </Badge>
          </div>
          
          <div className="space-y-2">
            {stats.riskDistribution.map((risk) => (
              <div key={risk.riskLevel} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-1 rounded ${getRiskColor(risk.riskLevel)}`}>
                    {getRiskIcon(risk.riskLevel)}
                  </div>
                  <span className="text-sm">{risk.riskLevel}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getRiskColor(risk.riskLevel).replace('text-', 'bg-').replace('bg-', 'bg-').split(' ')[1]}`}
                      style={{ width: `${risk.percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-8">
                    {risk.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Recent Analyses</h4>
          <div className="space-y-2">
            {stats.recentActivity.slice(0, 3).map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {activity.questionnaireTitle}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(activity.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge 
                  variant={activity.riskLevel === 'Critical' || activity.riskLevel === 'High' ? 'destructive' : 'secondary'}
                  className="text-xs"
                >
                  {activity.riskLevel}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Trend Indicator */}
        {stats.dailyTrends.length > 1 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Analysis Trend</h4>
              <div className="flex items-center gap-1 text-xs text-green-600">
                <TrendingUp className="h-3 w-3" />
                <span>
                  {stats.dailyTrends[0]?.count || 0} today
                </span>
              </div>
            </div>
            
            <div className="flex items-end gap-1 h-8">
              {stats.dailyTrends.slice(0, 7).reverse().map((trend) => (
                <div
                  key={trend.date}
                  className="flex-1 bg-indigo-200 rounded-sm"
                  style={{
                    height: `${Math.max((trend.count / Math.max(...stats.dailyTrends.map(t => t.count))) * 100, 10)}%`
                  }}
                  title={`${trend.date}: ${trend.count} analyses`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <a href="/ai-analysis/new">
              <Brain className="h-3 w-3 mr-1" />
              New Analysis
            </a>
          </Button>
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <a href="/ai-analysis/reports">
              <BarChart3 className="h-3 w-3 mr-1" />
              Reports
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
