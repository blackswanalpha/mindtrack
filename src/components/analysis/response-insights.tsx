'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Brain, 
  Target, 
  Users,
  BarChart3,
  MessageSquare,
  Clock,
  CheckCircle
} from 'lucide-react';

interface ResponseAnalysis {
  id: string;
  response_id: string;
  analysis_type: 'individual' | 'aggregate' | 'comparative' | 'predictive';
  insights: {
    sentiment_score: number;
    completion_quality: number;
    response_patterns: Array<{
      pattern_type: string;
      description: string;
      confidence: number;
    }>;
    statistical_summary: {
      mean_scores: Record<string, number>;
      distributions: Record<string, Array<{ value: string; count: number }>>;
      correlations: Array<{
        question_1: string;
        question_2: string;
        correlation: number;
        significance: number;
      }>;
    };
    trends: Array<{
      metric: string;
      direction: 'increasing' | 'decreasing' | 'stable';
      change_rate: number;
      significance: string;
    }>;
    recommendations: string[];
  };
  metadata: {
    analyzed_at: string;
    analysis_version: string;
    confidence_score: number;
    sample_size: number;
  };
}

interface Response {
  id: number;
  questionnaire_id: number;
  questionnaire_title: string;
  respondent_id?: string;
  answers: Array<{
    question_id: number;
    question_text: string;
    question_type: string;
    value: any;
    submitted_at: string;
  }>;
  completion_time: number;
  is_complete: boolean;
  submitted_at: string;
}

interface ResponseInsightsProps {
  analysis: ResponseAnalysis;
  response: Response;
}

export const ResponseInsights: React.FC<ResponseInsightsProps> = ({
  analysis,
  response
}) => {
  const getSentimentLevel = (score: number) => {
    if (score >= 8) return { level: 'Very Positive', color: 'text-green-600', bgColor: 'bg-green-50' };
    if (score >= 6) return { level: 'Positive', color: 'text-green-600', bgColor: 'bg-green-50' };
    if (score >= 4) return { level: 'Neutral', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
    return { level: 'Negative', color: 'text-red-600', bgColor: 'bg-red-50' };
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'increasing': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'decreasing': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSignificanceColor = (significance: string) => {
    switch (significance) {
      case 'high': return 'text-green-600 bg-green-50';
      case 'moderate': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const sentiment = getSentimentLevel(analysis.insights.sentiment_score);

  return (
    <div className="space-y-6">
      {/* Response Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-500" />
            Response Overview
          </CardTitle>
          <CardDescription>
            Detailed analysis of response characteristics and quality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Sentiment</span>
                <Brain className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold">{analysis.insights.sentiment_score.toFixed(1)}/10</div>
              <div className={`text-xs px-2 py-1 rounded ${sentiment.bgColor} ${sentiment.color}`}>
                {sentiment.level}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Quality Score</span>
                <Target className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold">{analysis.insights.completion_quality}%</div>
              <Progress value={analysis.insights.completion_quality} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Completion Time</span>
                <Clock className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold">{Math.floor(response.completion_time / 60)}m</div>
              <p className="text-xs text-gray-600">{response.completion_time % 60}s</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Completeness</span>
                <CheckCircle className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold">
                {response.answers.length}/{response.answers.length}
              </div>
              <p className="text-xs text-green-600">All questions answered</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Response Patterns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-500" />
            Response Patterns
          </CardTitle>
          <CardDescription>
            AI-detected patterns in response behavior
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analysis.insights.response_patterns.map((pattern, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium capitalize text-gray-900">
                      {pattern.pattern_type.replace('_', ' ')}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">{pattern.description}</p>
                  </div>
                  <Badge variant="outline" className="ml-2">
                    {Math.round(pattern.confidence * 100)}% confidence
                  </Badge>
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>Confidence Level</span>
                    <span>{Math.round(pattern.confidence * 100)}%</span>
                  </div>
                  <Progress value={pattern.confidence * 100} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Statistical Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-green-500" />
            Statistical Summary
          </CardTitle>
          <CardDescription>
            Key metrics and statistical measures
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Mean Scores */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Mean Scores</h4>
              <div className="space-y-3">
                {Object.entries(analysis.insights.statistical_summary.mean_scores).map(([metric, score]) => (
                  <div key={metric} className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">{metric.replace('_', ' ')}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-blue-500"
                          style={{ width: `${(score / 10) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-12 text-right">
                        {score.toFixed(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Correlations */}
            {analysis.insights.statistical_summary.correlations.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Question Correlations</h4>
                <div className="space-y-3">
                  {analysis.insights.statistical_summary.correlations.map((correlation, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm">
                          <span className="font-medium">{correlation.question_1}</span>
                          <span className="text-gray-500"> ↔ </span>
                          <span className="font-medium">{correlation.question_2}</span>
                        </div>
                        <Badge variant={correlation.correlation > 0.5 ? "default" : "secondary"}>
                          r = {correlation.correlation.toFixed(3)}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-600">
                        Significance: p = {correlation.significance.toFixed(4)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Trends Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            Trends Analysis
          </CardTitle>
          <CardDescription>
            Identified trends and changes over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analysis.insights.trends.map((trend, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getTrendIcon(trend.direction)}
                  <div>
                    <h4 className="font-medium capitalize text-gray-900">
                      {trend.metric.replace('_', ' ')}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {trend.direction === 'increasing' ? 'Increasing' : 
                       trend.direction === 'decreasing' ? 'Decreasing' : 'Stable'} 
                      {trend.change_rate > 0 && ` by ${(trend.change_rate * 100).toFixed(1)}%`}
                    </p>
                  </div>
                </div>
                <Badge className={getSignificanceColor(trend.significance)}>
                  {trend.significance} significance
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500" />
            AI Recommendations
          </CardTitle>
          <CardDescription>
            Actionable insights based on response analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analysis.insights.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                  {index + 1}
                </div>
                <p className="text-sm text-blue-900">{recommendation}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Analysis Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-500" />
            Analysis Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Analysis Type:</span>
              <p className="text-gray-600 capitalize">{analysis.analysis_type}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Sample Size:</span>
              <p className="text-gray-600">{analysis.metadata.sample_size} responses</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Confidence:</span>
              <p className="text-gray-600">{Math.round(analysis.metadata.confidence_score * 100)}%</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Analyzed:</span>
              <p className="text-gray-600">
                {new Date(analysis.metadata.analyzed_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
