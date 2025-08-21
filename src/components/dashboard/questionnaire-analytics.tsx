'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  TrendingDown,
  Clock, 
  AlertTriangle,
  CheckCircle,
  Eye,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AnalyticsData {
  questionnaire_id: number;
  questionnaire_title: string;
  total_responses: number;
  completion_rate: number;
  average_score: number;
  average_completion_time: number;
  risk_distribution: {
    minimal: number;
    mild: number;
    moderate: number;
    severe: number;
  };
  recent_trend: 'up' | 'down' | 'stable';
  flagged_responses: number;
  last_response_at?: string;
}

export interface QuestionnaireAnalyticsProps {
  analytics: AnalyticsData[];
  loading?: boolean;
  onViewDetails?: (questionnaireId: number) => void;
  onExportData?: (questionnaireId: number) => void;
  className?: string;
}

export const QuestionnaireAnalytics: React.FC<QuestionnaireAnalyticsProps> = ({
  analytics,
  loading = false,
  onViewDetails,
  onExportData,
  className
}) => {
  const getTotalResponses = () => {
    return analytics.reduce((sum, item) => sum + item.total_responses, 0);
  };

  const getAverageCompletionRate = () => {
    if (analytics.length === 0) return 0;
    const total = analytics.reduce((sum, item) => sum + item.completion_rate, 0);
    return Math.round(total / analytics.length);
  };

  const getTotalFlagged = () => {
    return analytics.reduce((sum, item) => sum + item.flagged_responses, 0);
  };

  const formatCompletionTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  };

  const getRiskLevelColor = (level: string) => {
    const colors = {
      minimal: 'bg-green-100 text-green-800',
      mild: 'bg-yellow-100 text-yellow-800',
      moderate: 'bg-orange-100 text-orange-800',
      severe: 'bg-red-100 text-red-800'
    };
    return colors[level as keyof typeof colors] || colors.minimal;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
    }
  };

  if (loading) {
    return (
      <div className={cn("space-y-6", className)}>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Analytics Cards */}
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="h-16 bg-gray-200 rounded"></div>
                    <div className="h-16 bg-gray-200 rounded"></div>
                    <div className="h-16 bg-gray-200 rounded"></div>
                    <div className="h-16 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Responses</p>
                <p className="text-2xl font-bold text-gray-900">{getTotalResponses()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg. Completion</p>
                <p className="text-2xl font-bold text-gray-900">{getAverageCompletionRate()}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Flagged</p>
                <p className="text-2xl font-bold text-gray-900">{getTotalFlagged()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Questionnaires</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Individual Questionnaire Analytics */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Questionnaire Performance</h3>
        
        {analytics.map((item) => (
          <Card key={item.questionnaire_id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-lg">{item.questionnaire_title}</CardTitle>
                  {getTrendIcon(item.recent_trend)}
                </div>
                <div className="flex items-center gap-2">
                  {item.flagged_responses > 0 && (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {item.flagged_responses} flagged
                    </Badge>
                  )}
                  {onViewDetails && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewDetails(item.questionnaire_id)}
                      className="flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Button>
                  )}
                  {onExportData && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onExportData(item.questionnaire_id)}
                      className="flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Export
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{item.total_responses}</div>
                  <div className="text-sm text-gray-500">Responses</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{item.completion_rate}%</div>
                  <div className="text-sm text-gray-500">Completion</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{item.average_score}</div>
                  <div className="text-sm text-gray-500">Avg. Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatCompletionTime(item.average_completion_time)}
                  </div>
                  <div className="text-sm text-gray-500">Avg. Time</div>
                </div>
              </div>

              {/* Risk Distribution */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Risk Level Distribution</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(item.risk_distribution).map(([level, count]) => (
                    <div key={level} className="text-center">
                      <Badge className={getRiskLevelColor(level)}>
                        {level}
                      </Badge>
                      <div className="text-lg font-semibold text-gray-900 mt-1">{count}</div>
                      <div className="text-xs text-gray-500">
                        {item.total_responses > 0 
                          ? `${Math.round((count / item.total_responses) * 100)}%`
                          : '0%'
                        }
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Last Response */}
              {item.last_response_at && (
                <div className="mt-4 pt-4 border-t text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Last response: {new Date(item.last_response_at).toLocaleDateString()}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {analytics.length === 0 && (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No analytics data</h3>
            <p className="text-gray-500 text-center">
              Analytics will appear here once questionnaires start receiving responses.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
