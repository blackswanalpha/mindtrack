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
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Users, 
  Target,
  TrendingUp,
  FileText,
  Lightbulb,
  Download,
  RefreshCw
} from 'lucide-react';
import { QuestionnaireAnalysisEngine } from '@/components/analysis/questionnaire-analysis-engine';
import { AnalysisInsights } from '@/components/analysis/analysis-insights';
import { AnalysisCharts } from '@/components/analysis/analysis-charts';

interface QuestionnaireAnalysis {
  id: string;
  questionnaire_id: string;
  analysis_type: 'structure' | 'effectiveness' | 'bias_detection' | 'completion_optimization';
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
  type: string;
  category: string;
  estimated_time: number;
  is_active: boolean;
  questions: Array<{
    id: number;
    text: string;
    type: string;
    required: boolean;
    order_num: number;
  }>;
  created_at: string;
  updated_at: string;
}

export default function QuestionnaireAnalysisPage() {
  const params = useParams();
  const questionnaireId = params.id as string;
  
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [analysis, setAnalysis] = useState<QuestionnaireAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadQuestionnaire();
    loadExistingAnalysis();
  }, [questionnaireId]);

  const loadQuestionnaire = async () => {
    try {
      // Mock data for now - replace with actual API call
      const mockQuestionnaire: Questionnaire = {
        id: parseInt(questionnaireId),
        title: 'Employee Satisfaction Survey',
        description: 'Annual survey to measure employee satisfaction and engagement',
        type: 'survey',
        category: 'hr',
        estimated_time: 15,
        is_active: true,
        questions: [
          { id: 1, text: 'How satisfied are you with your current role?', type: 'rating', required: true, order_num: 1 },
          { id: 2, text: 'What is your gender?', type: 'single_choice', required: false, order_num: 2 },
          { id: 3, text: 'How would you rate your work-life balance?', type: 'likert', required: true, order_num: 3 },
          { id: 4, text: 'What improvements would you suggest?', type: 'textarea', required: false, order_num: 4 }
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setQuestionnaire(mockQuestionnaire);
    } catch (err) {
      setError('Failed to load questionnaire');
    }
  };

  const loadExistingAnalysis = async () => {
    try {
      // Check if there's an existing analysis - mock for now
      const mockAnalysis: QuestionnaireAnalysis = {
        id: 'analysis-1',
        questionnaire_id: questionnaireId,
        analysis_type: 'structure',
        insights: {
          overall_score: 78,
          strengths: [
            'Good mix of question types',
            'Logical flow and progression',
            'Appropriate length for topic'
          ],
          weaknesses: [
            'Potential gender bias in question 2',
            'Missing demographic context',
            'Some questions may be leading'
          ],
          recommendations: [
            'Consider making gender question optional or more inclusive',
            'Add context about survey purpose',
            'Rephrase leading questions to be more neutral'
          ],
          bias_indicators: [
            {
              question_id: 2,
              type: 'demographic_bias',
              severity: 'medium',
              description: 'Gender question may exclude non-binary individuals',
              suggestion: 'Add "Other" or "Prefer not to say" options'
            }
          ],
          completion_metrics: {
            estimated_time: 12,
            difficulty_score: 3.2,
            engagement_score: 7.8,
            dropout_risk: 15
          }
        },
        metadata: {
          analyzed_at: new Date().toISOString(),
          analysis_version: '1.0',
          confidence_score: 0.85
        }
      };
      setAnalysis(mockAnalysis);
    } catch (err) {
      console.log('No existing analysis found');
    }
  };

  const runAnalysis = async () => {
    if (!questionnaire) return;

    setIsAnalyzing(true);
    setError(null);

    // The analysis will be handled by the QuestionnaireAnalysisEngine component
    // This function now just triggers the analysis
  };

  const handleAnalysisComplete = (result: any) => {
    setIsAnalyzing(false);

    if (result.status === 'success') {
      const newAnalysis: QuestionnaireAnalysis = {
        id: result.id,
        questionnaire_id: questionnaireId,
        analysis_type: 'structure',
        insights: result.insights,
        metadata: {
          analyzed_at: result.metadata.analyzedAt,
          analysis_version: result.metadata.version,
          confidence_score: result.confidence
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
    if (!analysis || !questionnaire) return;
    
    const exportData = {
      questionnaire: questionnaire.title,
      analysis_date: analysis.metadata.analyzed_at,
      overall_score: analysis.insights.overall_score,
      insights: analysis.insights
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `questionnaire-analysis-${questionnaireId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!questionnaire) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
          <span className="ml-2 text-lg">Loading questionnaire...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Questionnaire Analysis</h1>
          <p className="text-gray-600 mt-1">{questionnaire.title}</p>
        </div>
        <div className="flex gap-3">
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
        <QuestionnaireAnalysisEngine
          questionnaireId={questionnaireId}
          questionnaire={questionnaire}
          analysisType="structure"
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
            <TabsTrigger value="bias">Bias Detection</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analysis.insights.overall_score}/100</div>
                  <p className="text-xs text-muted-foreground">
                    {analysis.insights.overall_score >= 80 ? 'Excellent' : 
                     analysis.insights.overall_score >= 60 ? 'Good' : 'Needs Improvement'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completion Risk</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analysis.insights.completion_metrics.dropout_risk}%</div>
                  <p className="text-xs text-muted-foreground">Estimated dropout rate</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Confidence</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
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
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.insights.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                    Areas for Improvement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.insights.weaknesses.map((weakness, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm">{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <AnalysisInsights analysis={analysis} questionnaire={questionnaire} />
          </TabsContent>

          <TabsContent value="bias" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  Bias Detection Results
                </CardTitle>
                <CardDescription>
                  Potential biases detected in your questionnaire questions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analysis.insights.bias_indicators.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Bias Detected</h3>
                    <p className="text-gray-600">Your questionnaire appears to be free from obvious biases.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {analysis.insights.bias_indicators.map((bias, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant={bias.severity === 'high' ? 'destructive' : 
                                           bias.severity === 'medium' ? 'default' : 'secondary'}>
                              {bias.severity} severity
                            </Badge>
                            <span className="text-sm text-gray-600">Question {bias.question_id}</span>
                          </div>
                          <Badge variant="outline">{bias.type.replace('_', ' ')}</Badge>
                        </div>
                        <p className="text-sm text-gray-800 mb-2">{bias.description}</p>
                        <div className="bg-blue-50 p-3 rounded-md">
                          <p className="text-sm text-blue-800">
                            <strong>Suggestion:</strong> {bias.suggestion}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-6">
            <AnalysisCharts analysis={analysis} questionnaire={questionnaire} />
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
                Run an AI analysis to get insights about your questionnaire structure, 
                potential biases, and optimization recommendations.
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
