'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Lightbulb, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Users,
  Target,
  BarChart3
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

interface AnalysisInsightsProps {
  analysis: QuestionnaireAnalysis;
  questionnaire: Questionnaire;
}

export const AnalysisInsights: React.FC<AnalysisInsightsProps> = ({
  analysis,
  questionnaire
}) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getEngagementLevel = (score: number) => {
    if (score >= 8) return { level: 'High', color: 'text-green-600' };
    if (score >= 6) return { level: 'Medium', color: 'text-yellow-600' };
    return { level: 'Low', color: 'text-red-600' };
  };

  const getDifficultyLevel = (score: number) => {
    if (score <= 2) return { level: 'Easy', color: 'text-green-600' };
    if (score <= 3.5) return { level: 'Medium', color: 'text-yellow-600' };
    return { level: 'Hard', color: 'text-red-600' };
  };

  return (
    <div className="space-y-6">
      {/* Completion Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            Completion Metrics
          </CardTitle>
          <CardDescription>
            Analysis of questionnaire completion characteristics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Estimated Time</span>
                <Clock className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold">{analysis.insights.completion_metrics.estimated_time}m</div>
              <p className="text-xs text-gray-600">Average completion time</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Difficulty</span>
                <Target className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold">
                {analysis.insights.completion_metrics.difficulty_score.toFixed(1)}/5
              </div>
              <p className={`text-xs ${getDifficultyLevel(analysis.insights.completion_metrics.difficulty_score).color}`}>
                {getDifficultyLevel(analysis.insights.completion_metrics.difficulty_score).level}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Engagement</span>
                <TrendingUp className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold">
                {analysis.insights.completion_metrics.engagement_score.toFixed(1)}/10
              </div>
              <p className={`text-xs ${getEngagementLevel(analysis.insights.completion_metrics.engagement_score).color}`}>
                {getEngagementLevel(analysis.insights.completion_metrics.engagement_score).level}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Dropout Risk</span>
                <AlertTriangle className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold">{analysis.insights.completion_metrics.dropout_risk}%</div>
              <Progress 
                value={analysis.insights.completion_metrics.dropout_risk} 
                className="h-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            Detailed Recommendations
          </CardTitle>
          <CardDescription>
            AI-generated suggestions to improve your questionnaire
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analysis.insights.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-blue-900">{recommendation}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Question Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Question-by-Question Analysis
          </CardTitle>
          <CardDescription>
            Detailed analysis of individual questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {questionnaire.questions.map((question, index) => {
              const biasIndicator = analysis.insights.bias_indicators.find(
                bias => bias.question_id === question.id
              );
              
              return (
                <div key={question.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">Q{question.order_num}</Badge>
                        <Badge variant="secondary">{question.type}</Badge>
                        {question.required && (
                          <Badge variant="destructive" className="text-xs">Required</Badge>
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-900">{question.text}</p>
                    </div>
                    {biasIndicator ? (
                      <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    )}
                  </div>
                  
                  {biasIndicator && (
                    <div className={`mt-3 p-3 rounded-md border ${getSeverityColor(biasIndicator.severity)}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {biasIndicator.severity} severity
                        </Badge>
                        <span className="text-xs font-medium">{biasIndicator.type.replace('_', ' ')}</span>
                      </div>
                      <p className="text-sm mb-2">{biasIndicator.description}</p>
                      <div className="bg-white bg-opacity-50 p-2 rounded text-xs">
                        <strong>Suggestion:</strong> {biasIndicator.suggestion}
                      </div>
                    </div>
                  )}
                  
                  {!biasIndicator && (
                    <div className="mt-2 text-xs text-green-600 bg-green-50 p-2 rounded">
                      ✓ No bias indicators detected for this question
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Analysis Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-gray-500" />
            Analysis Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Analysis ID:</span>
              <p className="text-gray-600 font-mono">{analysis.id}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Version:</span>
              <p className="text-gray-600">{analysis.metadata.analysis_version}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Analyzed:</span>
              <p className="text-gray-600">
                {new Date(analysis.metadata.analyzed_at).toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
