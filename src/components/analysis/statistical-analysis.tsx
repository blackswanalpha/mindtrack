'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Calculator,
  Target,
  Users,
  Activity
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

interface StatisticalAnalysisProps {
  analysis: ResponseAnalysis;
  response: Response;
}

export const StatisticalAnalysis: React.FC<StatisticalAnalysisProps> = ({
  analysis,
  response
}) => {
  // Generate additional statistical measures
  const generateDescriptiveStats = () => {
    const numericAnswers = response.answers
      .filter(answer => typeof answer.value === 'number')
      .map(answer => answer.value);
    
    if (numericAnswers.length === 0) return null;
    
    const mean = numericAnswers.reduce((sum, val) => sum + val, 0) / numericAnswers.length;
    const sortedValues = [...numericAnswers].sort((a, b) => a - b);
    const median = sortedValues.length % 2 === 0
      ? (sortedValues[sortedValues.length / 2 - 1] + sortedValues[sortedValues.length / 2]) / 2
      : sortedValues[Math.floor(sortedValues.length / 2)];
    
    const variance = numericAnswers.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / numericAnswers.length;
    const standardDeviation = Math.sqrt(variance);
    
    return {
      mean: mean.toFixed(2),
      median: median.toFixed(2),
      standardDeviation: standardDeviation.toFixed(2),
      min: Math.min(...numericAnswers),
      max: Math.max(...numericAnswers),
      count: numericAnswers.length
    };
  };

  const descriptiveStats = generateDescriptiveStats();

  const getCorrelationStrength = (correlation: number) => {
    const abs = Math.abs(correlation);
    if (abs >= 0.7) return { strength: 'Strong', color: 'text-green-600 bg-green-50' };
    if (abs >= 0.5) return { strength: 'Moderate', color: 'text-yellow-600 bg-yellow-50' };
    if (abs >= 0.3) return { strength: 'Weak', color: 'text-orange-600 bg-orange-50' };
    return { strength: 'Very Weak', color: 'text-gray-600 bg-gray-50' };
  };

  const getSignificanceLevel = (pValue: number) => {
    if (pValue < 0.001) return { level: 'Highly Significant', color: 'text-green-600 bg-green-50' };
    if (pValue < 0.01) return { level: 'Very Significant', color: 'text-green-600 bg-green-50' };
    if (pValue < 0.05) return { level: 'Significant', color: 'text-yellow-600 bg-yellow-50' };
    return { level: 'Not Significant', color: 'text-gray-600 bg-gray-50' };
  };

  return (
    <div className="space-y-6">
      {/* Descriptive Statistics */}
      {descriptiveStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-blue-500" />
              Descriptive Statistics
            </CardTitle>
            <CardDescription>
              Basic statistical measures for numeric responses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{descriptiveStats.mean}</div>
                <div className="text-sm text-blue-700">Mean</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{descriptiveStats.median}</div>
                <div className="text-sm text-green-700">Median</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{descriptiveStats.standardDeviation}</div>
                <div className="text-sm text-purple-700">Std Dev</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{descriptiveStats.min}</div>
                <div className="text-sm text-orange-700">Minimum</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{descriptiveStats.max}</div>
                <div className="text-sm text-red-700">Maximum</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">{descriptiveStats.count}</div>
                <div className="text-sm text-gray-700">Count</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Distribution Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-green-500" />
            Response Distributions
          </CardTitle>
          <CardDescription>
            Distribution of responses across different categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(analysis.insights.statistical_summary.distributions).map(([category, distribution]) => (
              <div key={category} className="space-y-3">
                <h4 className="font-medium text-gray-900 capitalize">{category.replace('_', ' ')}</h4>
                <div className="space-y-2">
                  {distribution.map((item, index) => {
                    const total = distribution.reduce((sum, d) => sum + d.count, 0);
                    const percentage = total > 0 ? (item.count / total) * 100 : 0;
                    
                    return (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <span className="text-sm font-medium min-w-0 flex-1">{item.value}</span>
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full bg-green-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-3">
                          <span className="text-sm text-gray-600">{item.count}</span>
                          <Badge variant="outline" className="text-xs">
                            {percentage.toFixed(1)}%
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Correlation Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-500" />
            Correlation Analysis
          </CardTitle>
          <CardDescription>
            Statistical relationships between different questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {analysis.insights.statistical_summary.correlations.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Correlations Found</h3>
              <p className="text-gray-600">
                {analysis.analysis_type === 'individual' 
                  ? 'Individual response analysis does not include correlations.'
                  : 'No significant correlations detected between questions.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {analysis.insights.statistical_summary.correlations.map((correlation, index) => {
                const strength = getCorrelationStrength(correlation.correlation);
                const significance = getSignificanceLevel(correlation.significance);
                
                return (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">
                          {correlation.question_1} ↔ {correlation.question_2}
                        </h4>
                        <div className="flex items-center gap-2">
                          <Badge className={strength.color}>
                            {strength.strength}
                          </Badge>
                          <Badge className={significance.color}>
                            {significance.level}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">
                          r = {correlation.correlation.toFixed(3)}
                        </div>
                        <div className="text-sm text-gray-600">
                          p = {correlation.significance.toFixed(4)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Correlation Strength</span>
                        <span>{Math.abs(correlation.correlation * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={Math.abs(correlation.correlation) * 100} className="h-2" />
                    </div>
                    
                    <div className="mt-3 text-sm text-gray-600">
                      {correlation.correlation > 0 
                        ? 'Positive correlation: As one increases, the other tends to increase.'
                        : 'Negative correlation: As one increases, the other tends to decrease.'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistical Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-orange-500" />
            Statistical Summary
          </CardTitle>
          <CardDescription>
            Key statistical measures and interpretations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Sample Characteristics</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Sample Size:</span>
                    <span className="font-medium">{analysis.metadata.sample_size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Analysis Type:</span>
                    <span className="font-medium capitalize">{analysis.analysis_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Confidence Level:</span>
                    <span className="font-medium">{Math.round(analysis.metadata.confidence_score * 100)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Questions Analyzed:</span>
                    <span className="font-medium">{response.answers.length}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Quality Metrics</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Response Quality</span>
                      <span>{analysis.insights.completion_quality}%</span>
                    </div>
                    <Progress value={analysis.insights.completion_quality} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Sentiment Score</span>
                      <span>{analysis.insights.sentiment_score.toFixed(1)}/10</span>
                    </div>
                    <Progress value={analysis.insights.sentiment_score * 10} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Analysis Confidence</span>
                      <span>{Math.round(analysis.metadata.confidence_score * 100)}%</span>
                    </div>
                    <Progress value={analysis.metadata.confidence_score * 100} className="h-2" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistical Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-gray-500" />
            Statistical Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
              <p>
                <strong>Correlation coefficients</strong> range from -1 to +1, where values closer to ±1 indicate stronger relationships.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
              <p>
                <strong>P-values</strong> less than 0.05 are typically considered statistically significant.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
              <p>
                <strong>Standard deviation</strong> measures the spread of responses around the mean value.
              </p>
            </div>
            {analysis.analysis_type === 'individual' && (
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                <p>
                  <strong>Individual analysis</strong> provides insights for a single response. For population-level statistics, use aggregate analysis.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
