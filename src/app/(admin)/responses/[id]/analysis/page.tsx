'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  BarChart3, 
  TrendingUp, 
  Users, 
  Target,
  PieChart,
  Download,
  RefreshCw,
  FileText,
  Lightbulb,
  AlertTriangle
} from 'lucide-react';
import { ResponseAnalysisEngine } from '@/components/analysis/response-analysis-engine';
import { ResponseInsights } from '@/components/analysis/response-insights';
import { ResponseCharts } from '@/components/analysis/response-charts';
import { StatisticalAnalysis } from '@/components/analysis/statistical-analysis';

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

export default function ResponseAnalysisPage() {
  const params = useParams();
  const responseId = params.id as string;
  
  const [response, setResponse] = useState<Response | null>(null);
  const [analysis, setAnalysis] = useState<ResponseAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [analysisType, setAnalysisType] = useState<'individual' | 'aggregate'>('individual');

  useEffect(() => {
    loadResponse();
    loadExistingAnalysis();
  }, [responseId]);

  const loadResponse = async () => {
    try {
      // Mock data for now - replace with actual API call
      const mockResponse: Response = {
        id: parseInt(responseId),
        questionnaire_id: 1,
        questionnaire_title: 'Employee Satisfaction Survey',
        respondent_id: 'user-123',
        answers: [
          {
            question_id: 1,
            question_text: 'How satisfied are you with your current role?',
            question_type: 'rating',
            value: 8,
            submitted_at: new Date().toISOString()
          },
          {
            question_id: 2,
            question_text: 'What is your gender?',
            question_type: 'single_choice',
            value: 'Female',
            submitted_at: new Date().toISOString()
          },
          {
            question_id: 3,
            question_text: 'How would you rate your work-life balance?',
            question_type: 'likert',
            value: 'Agree',
            submitted_at: new Date().toISOString()
          },
          {
            question_id: 4,
            question_text: 'What improvements would you suggest?',
            question_type: 'textarea',
            value: 'More flexible working hours and better communication from management.',
            submitted_at: new Date().toISOString()
          }
        ],
        completion_time: 420, // 7 minutes
        is_complete: true,
        submitted_at: new Date().toISOString()
      };
      setResponse(mockResponse);
    } catch (err) {
      setError('Failed to load response');
    }
  };

  const loadExistingAnalysis = async () => {
    try {
      // Check if there's an existing analysis - mock for now
      const mockAnalysis: ResponseAnalysis = {
        id: 'analysis-1',
        response_id: responseId,
        analysis_type: 'individual',
        insights: {
          sentiment_score: 7.2,
          completion_quality: 85,
          response_patterns: [
            {
              pattern_type: 'engagement',
              description: 'High engagement with detailed text responses',
              confidence: 0.89
            },
            {
              pattern_type: 'consistency',
              description: 'Consistent rating patterns across similar questions',
              confidence: 0.76
            }
          ],
          statistical_summary: {
            mean_scores: {
              'satisfaction': 7.5,
              'work_life_balance': 6.8,
              'overall_sentiment': 7.2
            },
            distributions: {
              'satisfaction': [
                { value: '1-3', count: 2 },
                { value: '4-6', count: 8 },
                { value: '7-9', count: 15 },
                { value: '10', count: 5 }
              ]
            },
            correlations: [
              {
                question_1: 'Role Satisfaction',
                question_2: 'Work-Life Balance',
                correlation: 0.67,
                significance: 0.001
              }
            ]
          },
          trends: [
            {
              metric: 'satisfaction_score',
              direction: 'increasing',
              change_rate: 0.15,
              significance: 'moderate'
            }
          ],
          recommendations: [
            'Focus on work-life balance improvements',
            'Enhance management communication',
            'Consider flexible working arrangements'
          ]
        },
        metadata: {
          analyzed_at: new Date().toISOString(),
          analysis_version: '1.0',
          confidence_score: 0.82,
          sample_size: 1
        }
      };
      setAnalysis(mockAnalysis);
    } catch (err) {
      console.log('No existing analysis found');
    }
  };

  const runAnalysis = async () => {
    if (!response) return;

    setIsAnalyzing(true);
    setError(null);

    // The analysis will be handled by the ResponseAnalysisEngine component
    // This function now just triggers the analysis
  };

  const handleAnalysisComplete = (result: any) => {
    setIsAnalyzing(false);

    if (result.status === 'success') {
      const newAnalysis: ResponseAnalysis = {
        id: result.id,
        response_id: responseId,
        analysis_type: analysisType,
        insights: result.insights,
        metadata: {
          analyzed_at: result.metadata.analyzedAt,
          analysis_version: result.metadata.version,
          confidence_score: result.confidence,
          sample_size: analysisType === 'individual' ? 1 : Math.floor(Math.random() * 100) + 50
        }
      };
      setAnalysis(newAnalysis);
    } else {
      setError(result.errors?.[0] || 'Analysis failed');
    }
  };

  const handleAnalysisError = (errorMessage: string) => {
    setIsAnalyzing(false);
    setError(errorMessage);
  };

  const exportAnalysis = () => {
    if (!analysis || !response) return;
    
    const exportData = {
      response_id: response.id,
      questionnaire: response.questionnaire_title,
      analysis_date: analysis.metadata.analyzed_at,
      analysis_type: analysis.analysis_type,
      insights: analysis.insights
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `response-analysis-${responseId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!response) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
          <span className="ml-2 text-lg">Loading response...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Response Analysis</h1>
          <p className="text-gray-600 mt-1">{response.questionnaire_title}</p>
          <div className="flex items-center gap-4 mt-2">
            <Badge variant="outline">Response #{response.id}</Badge>
            <Badge variant={response.is_complete ? "default" : "secondary"}>
              {response.is_complete ? 'Complete' : 'Partial'}
            </Badge>
            <span className="text-sm text-gray-500">
              Completed in {Math.floor(response.completion_time / 60)}m {response.completion_time % 60}s
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Analysis Type:</label>
            <select 
              value={analysisType} 
              onChange={(e) => setAnalysisType(e.target.value as 'individual' | 'aggregate')}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value="individual">Individual</option>
              <option value="aggregate">Aggregate</option>
            </select>
          </div>
          {analysis && (
            <Button variant="outline" onClick={exportAnalysis}>
              <Download className="w-4 h-4 mr-2" />
              Export Analysis
            </Button>
          )}
          <Button onClick={runAnalysis} disabled={isAnalyzing}>
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                {analysis ? 'Re-analyze' : 'Analyze'}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Analysis Progress */}
      {isAnalyzing && (
        <ResponseAnalysisEngine
          responseId={responseId}
          response={response}
          analysisType={analysisType}
          onAnalysisComplete={handleAnalysisComplete}
          onError={handleAnalysisError}
          autoStart={true}
        />
      )}

      {/* Analysis Results */}
      {analysis && !isAnalyzing && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="statistics">Statistics</TabsTrigger>
            <TabsTrigger value="visualizations">Charts</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sentiment Score</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analysis.insights.sentiment_score.toFixed(1)}/10</div>
                  <p className="text-xs text-muted-foreground">
                    {analysis.insights.sentiment_score >= 8 ? 'Very Positive' : 
                     analysis.insights.sentiment_score >= 6 ? 'Positive' : 
                     analysis.insights.sentiment_score >= 4 ? 'Neutral' : 'Negative'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analysis.insights.completion_quality}%</div>
                  <p className="text-xs text-muted-foreground">Response completeness</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sample Size</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analysis.metadata.sample_size}</div>
                  <p className="text-xs text-muted-foreground">
                    {analysisType === 'individual' ? 'Individual' : 'Responses analyzed'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Confidence</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.round(analysis.metadata.confidence_score * 100)}%
                  </div>
                  <p className="text-xs text-muted-foreground">Analysis confidence</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-blue-500" />
                    Key Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.insights.response_patterns.map((pattern, index) => (
                      <div key={index} className="border-l-4 border-blue-500 pl-4">
                        <h4 className="font-medium capitalize">{pattern.pattern_type}</h4>
                        <p className="text-sm text-gray-600">{pattern.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">Confidence:</span>
                          <Badge variant="outline" className="text-xs">
                            {Math.round(pattern.confidence * 100)}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-500" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.insights.recommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm">{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <ResponseInsights analysis={analysis} response={response} />
          </TabsContent>

          <TabsContent value="statistics" className="space-y-6">
            <StatisticalAnalysis analysis={analysis} response={response} />
          </TabsContent>

          <TabsContent value="visualizations" className="space-y-6">
            <ResponseCharts analysis={analysis} response={response} />
          </TabsContent>
        </Tabs>
      )}

      {/* No Analysis State */}
      {!analysis && !isAnalyzing && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No Analysis Available</h3>
              <p className="text-gray-600 mb-6">
                Run an AI analysis to get insights about response patterns, sentiment analysis, 
                and statistical correlations.
              </p>
              <Button onClick={runAnalysis} size="lg">
                <Brain className="w-5 h-5 mr-2" />
                Start AI Analysis
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
