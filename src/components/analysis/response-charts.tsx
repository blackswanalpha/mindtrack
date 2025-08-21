'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Activity,
  Target,
  Clock,
  MessageSquare
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

interface ResponseChartsProps {
  analysis: ResponseAnalysis;
  response: Response;
}

export const ResponseCharts: React.FC<ResponseChartsProps> = ({
  analysis,
  response
}) => {
  // Generate chart data based on response and analysis
  const generateResponseTimeChart = () => {
    const avgTime = 8; // minutes - mock average
    const userTime = response.completion_time / 60;
    
    return [
      { label: 'Your Response', time: userTime, color: 'bg-blue-500' },
      { label: 'Average Response', time: avgTime, color: 'bg-gray-400' },
      { label: 'Fast Response', time: 3, color: 'bg-green-500' },
      { label: 'Slow Response', time: 15, color: 'bg-red-500' }
    ];
  };

  const generateSentimentBreakdown = () => {
    const score = analysis.insights.sentiment_score;
    return [
      { category: 'Very Positive', value: score >= 8 ? 100 : 0, color: 'bg-green-600' },
      { category: 'Positive', value: score >= 6 && score < 8 ? 100 : 0, color: 'bg-green-400' },
      { category: 'Neutral', value: score >= 4 && score < 6 ? 100 : 0, color: 'bg-yellow-400' },
      { category: 'Negative', value: score < 4 ? 100 : 0, color: 'bg-red-400' }
    ];
  };

  const generateQuestionTypeBreakdown = () => {
    const typeCount = response.answers.reduce((acc, answer) => {
      acc[answer.question_type] = (acc[answer.question_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(typeCount).map(([type, count]) => ({
      type: type.replace('_', ' '),
      count,
      percentage: Math.round((count / response.answers.length) * 100)
    }));
  };

  const generateQualityMetrics = () => {
    return [
      { 
        metric: 'Completeness', 
        score: response.is_complete ? 100 : 80, 
        color: 'bg-green-500',
        description: 'All questions answered'
      },
      { 
        metric: 'Thoughtfulness', 
        score: analysis.insights.completion_quality, 
        color: 'bg-blue-500',
        description: 'Quality of responses'
      },
      { 
        metric: 'Consistency', 
        score: 85, 
        color: 'bg-purple-500',
        description: 'Response consistency'
      },
      { 
        metric: 'Engagement', 
        score: Math.round(analysis.insights.sentiment_score * 10), 
        color: 'bg-orange-500',
        description: 'Level of engagement'
      }
    ];
  };

  const responseTimeData = generateResponseTimeChart();
  const sentimentData = generateSentimentBreakdown();
  const questionTypeData = generateQuestionTypeBreakdown();
  const qualityMetrics = generateQualityMetrics();

  return (
    <div className="space-y-6">
      {/* Response Time Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            Response Time Analysis
          </CardTitle>
          <CardDescription>
            Comparison of completion time with benchmarks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {responseTimeData.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.label}</span>
                  <span className="text-sm text-gray-600">{item.time.toFixed(1)} min</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full ${item.color} transition-all duration-500`}
                    style={{ width: `${Math.min((item.time / 20) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Analysis:</strong> Your completion time of {(response.completion_time / 60).toFixed(1)} minutes is{' '}
              {response.completion_time / 60 < 8 ? 'faster than' : 'slower than'} average, indicating{' '}
              {response.completion_time / 60 < 8 ? 'efficient' : 'thoughtful'} response behavior.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Sentiment Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Sentiment Analysis
          </CardTitle>
          <CardDescription>
            Emotional tone and sentiment breakdown
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {analysis.insights.sentiment_score.toFixed(1)}/10
              </div>
              <Badge className={
                analysis.insights.sentiment_score >= 8 ? 'bg-green-100 text-green-800' :
                analysis.insights.sentiment_score >= 6 ? 'bg-blue-100 text-blue-800' :
                analysis.insights.sentiment_score >= 4 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }>
                {analysis.insights.sentiment_score >= 8 ? 'Very Positive' :
                 analysis.insights.sentiment_score >= 6 ? 'Positive' :
                 analysis.insights.sentiment_score >= 4 ? 'Neutral' : 'Negative'}
              </Badge>
            </div>
            
            <div className="space-y-3">
              {sentimentData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 ${item.color} rounded`} />
                    <span className="text-sm font-medium">{item.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${item.color}`}
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-8">
                      {item.value > 0 ? '✓' : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question Type Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-purple-500" />
            Question Type Distribution
          </CardTitle>
          <CardDescription>
            Breakdown of question types in responses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {questionTypeData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-purple-500 rounded" />
                  <span className="text-sm font-medium capitalize">{item.type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{item.count} questions</span>
                  <Badge variant="outline">{item.percentage}%</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quality Metrics Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-orange-500" />
            Response Quality Metrics
          </CardTitle>
          <CardDescription>
            Multi-dimensional quality assessment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {qualityMetrics.map((metric, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{metric.metric}</span>
                  <span className="text-sm text-gray-600">{metric.score}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full ${metric.color} transition-all duration-500`}
                    style={{ width: `${metric.score}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600">{metric.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Response Pattern Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-500" />
            Response Patterns
          </CardTitle>
          <CardDescription>
            Identified patterns in response behavior
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
                  <Badge variant="outline">
                    {Math.round(pattern.confidence * 100)}%
                  </Badge>
                </div>
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-indigo-500"
                      style={{ width: `${pattern.confidence * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Trend Visualization */}
      {analysis.insights.trends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-teal-500" />
              Trend Analysis
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
                    <div className={`w-3 h-3 rounded-full ${
                      trend.direction === 'increasing' ? 'bg-green-500' :
                      trend.direction === 'decreasing' ? 'bg-red-500' : 'bg-gray-500'
                    }`} />
                    <div>
                      <h4 className="font-medium capitalize text-gray-900">
                        {trend.metric.replace('_', ' ')}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {trend.direction === 'increasing' ? '↗ Increasing' : 
                         trend.direction === 'decreasing' ? '↘ Decreasing' : '→ Stable'}
                        {trend.change_rate > 0 && ` (${(trend.change_rate * 100).toFixed(1)}%)`}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {trend.significance}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chart Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-gray-500" />
            Chart Interpretation Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Quality Metrics</h4>
              <ul className="space-y-1">
                <li>• <strong>Completeness:</strong> Percentage of questions answered</li>
                <li>• <strong>Thoughtfulness:</strong> Quality and depth of responses</li>
                <li>• <strong>Consistency:</strong> Logical consistency across answers</li>
                <li>• <strong>Engagement:</strong> Level of respondent engagement</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Pattern Analysis</h4>
              <ul className="space-y-1">
                <li>• <strong>Confidence:</strong> AI certainty in pattern detection</li>
                <li>• <strong>Trends:</strong> Changes over time or across responses</li>
                <li>• <strong>Sentiment:</strong> Emotional tone of responses</li>
                <li>• <strong>Distribution:</strong> Spread of response values</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
