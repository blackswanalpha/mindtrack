'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Target,
  Clock,
  Users
} from 'lucide-react';

interface QuestionnaireAnalysis {
  id: string;
  questionnaire_id: string;
  analysis_type: string;
  insights: {
    overall_score: number;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    bias_indicators: Array<{
      question_id: number;
      type: string;
      severity: 'low' | 'medium' | 'high';
      description: string;
      suggestion: string;
    }>;
    completion_metrics: {
      estimated_time: number;
      difficulty_score: number;
      engagement_score: number;
      dropout_risk: number;
    };
  };
  metadata: {
    analyzed_at: string;
    analysis_version: string;
    confidence_score: number;
  };
}

interface Questionnaire {
  id: number;
  title: string;
  description: string;
  questions: Array<{
    id: number;
    text: string;
    type: string;
    required: boolean;
    order_num: number;
  }>;
}

interface AnalysisChartsProps {
  analysis: QuestionnaireAnalysis;
  questionnaire: Questionnaire;
}

export const AnalysisCharts: React.FC<AnalysisChartsProps> = ({
  analysis,
  questionnaire
}) => {
  // Generate mock chart data based on analysis
  const questionTypeDistribution = questionnaire.questions.reduce((acc, question) => {
    acc[question.type] = (acc[question.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const biasDistribution = analysis.insights.bias_indicators.reduce((acc, bias) => {
    acc[bias.severity] = (acc[bias.severity] || 0) + 1;
    return acc;
  }, { low: 0, medium: 0, high: 0 } as Record<string, number>);

  const scoreBreakdown = {
    'Structure': Math.floor(analysis.insights.overall_score * 0.9 + Math.random() * 10),
    'Clarity': Math.floor(analysis.insights.overall_score * 0.95 + Math.random() * 10),
    'Engagement': Math.floor(analysis.insights.completion_metrics.engagement_score * 10),
    'Bias-Free': Math.max(0, 100 - analysis.insights.bias_indicators.length * 20),
  };

  const completionForecast = [
    { time: '0-5 min', percentage: 85 },
    { time: '5-10 min', percentage: 70 },
    { time: '10-15 min', percentage: 55 },
    { time: '15-20 min', percentage: 40 },
    { time: '20+ min', percentage: 25 },
  ];

  return (
    <div className="space-y-6">
      {/* Score Breakdown Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            Score Breakdown
          </CardTitle>
          <CardDescription>
            Detailed breakdown of questionnaire quality metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(scoreBreakdown).map(([category, score]) => (
              <div key={category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{category}</span>
                  <span className="text-sm text-gray-600">{score}/100</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      score >= 80 ? 'bg-green-500' : 
                      score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Question Type Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-green-500" />
            Question Type Distribution
          </CardTitle>
          <CardDescription>
            Breakdown of question types in your questionnaire
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(questionTypeDistribution).map(([type, count]) => {
              const percentage = Math.round((count / questionnaire.questions.length) * 100);
              return (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-blue-500 rounded" />
                    <span className="text-sm font-medium capitalize">{type.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{count} questions</span>
                    <Badge variant="outline">{percentage}%</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Bias Indicators Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-orange-500" />
            Bias Indicators
          </CardTitle>
          <CardDescription>
            Distribution of bias severity levels detected
          </CardDescription>
        </CardHeader>
        <CardContent>
          {analysis.insights.bias_indicators.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Bias Detected</h3>
              <p className="text-gray-600">Your questionnaire appears to be free from obvious biases.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(biasDistribution).map(([severity, count]) => {
                const color = severity === 'high' ? 'bg-red-500' : 
                             severity === 'medium' ? 'bg-orange-500' : 'bg-yellow-500';
                const textColor = severity === 'high' ? 'text-red-700' : 
                                 severity === 'medium' ? 'text-orange-700' : 'text-yellow-700';
                
                return count > 0 ? (
                  <div key={severity} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 ${color} rounded`} />
                      <span className={`text-sm font-medium capitalize ${textColor}`}>
                        {severity} Severity
                      </span>
                    </div>
                    <Badge variant="outline">{count} issues</Badge>
                  </div>
                ) : null;
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completion Forecast */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-500" />
            Completion Forecast
          </CardTitle>
          <CardDescription>
            Predicted completion rates based on questionnaire length
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {completionForecast.map((forecast, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{forecast.time}</span>
                  <span className="text-sm text-gray-600">{forecast.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-purple-500 transition-all duration-500"
                    style={{ width: `${forecast.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Engagement Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-500" />
            Engagement Metrics
          </CardTitle>
          <CardDescription>
            Predicted user engagement and interaction levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Engagement Factors</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Question Variety</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="h-2 rounded-full bg-indigo-500" style={{ width: '75%' }} />
                    </div>
                    <span className="text-xs text-gray-600">75%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Interactive Elements</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="h-2 rounded-full bg-indigo-500" style={{ width: '60%' }} />
                    </div>
                    <span className="text-xs text-gray-600">60%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Visual Appeal</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="h-2 rounded-full bg-indigo-500" style={{ width: '80%' }} />
                    </div>
                    <span className="text-xs text-gray-600">80%</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Completion Factors</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Length Appropriateness</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="h-2 rounded-full bg-green-500" style={{ width: '85%' }} />
                    </div>
                    <span className="text-xs text-gray-600">85%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Question Clarity</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="h-2 rounded-full bg-green-500" style={{ width: '90%' }} />
                    </div>
                    <span className="text-xs text-gray-600">90%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Progress Indication</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="h-2 rounded-full bg-yellow-500" style={{ width: '65%' }} />
                    </div>
                    <span className="text-xs text-gray-600">65%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
