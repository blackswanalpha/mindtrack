'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

interface AIAnalysisRequestProps {
  responseId: number;
  questionnaireTitle?: string;
  onAnalysisComplete?: (analysis: any) => void;
  className?: string;
}

interface AnalysisState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
  analysis: any | null;
}

export function AIAnalysisRequest({ 
  responseId, 
  questionnaireTitle,
  onAnalysisComplete,
  className 
}: AIAnalysisRequestProps) {
  const [analysisType, setAnalysisType] = useState<string>('comprehensive');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [state, setState] = useState<AnalysisState>({
    isLoading: false,
    error: null,
    success: false,
    analysis: null
  });

  const analysisTypes = [
    {
      value: 'comprehensive',
      label: 'Comprehensive Analysis',
      description: 'Complete mental health assessment with insights and recommendations'
    },
    {
      value: 'sentiment',
      label: 'Sentiment Analysis',
      description: 'Focus on emotional tone and sentiment indicators'
    },
    {
      value: 'risk',
      label: 'Risk Assessment',
      description: 'Identify and assess mental health risk factors'
    },
    {
      value: 'recommendations',
      label: 'Recommendations',
      description: 'Generate actionable recommendations and next steps'
    }
  ];

  const handleGenerateAnalysis = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null, success: false }));

    try {
      const response = await fetch(`/api/ai-analysis/responses/${responseId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analysisType,
          prompt: customPrompt || undefined,
          model: 'gemini-pro'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate analysis');
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        success: true,
        analysis: data.data.analysis
      }));

      if (onAnalysisComplete) {
        onAnalysisComplete(data.data.analysis);
      }

    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      }));
    }
  };

  const selectedAnalysisType = analysisTypes.find(type => type.value === analysisType);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-indigo-600" />
          AI Analysis Request
        </CardTitle>
        <CardDescription>
          Generate AI-powered insights for {questionnaireTitle || 'this questionnaire response'}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Analysis Type Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Analysis Type</label>
          <Select value={analysisType} onValueChange={setAnalysisType}>
            <SelectTrigger>
              <SelectValue placeholder="Select analysis type" />
            </SelectTrigger>
            <SelectContent>
              {analysisTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex flex-col">
                    <span className="font-medium">{type.label}</span>
                    <span className="text-xs text-muted-foreground">{type.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {selectedAnalysisType && (
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary">{selectedAnalysisType.label}</Badge>
              <span className="text-xs text-muted-foreground">
                {selectedAnalysisType.description}
              </span>
            </div>
          )}
        </div>

        {/* Custom Prompt */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Custom Instructions (Optional)
          </label>
          <Textarea
            placeholder="Add specific instructions or focus areas for the AI analysis..."
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            rows={3}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground">
            Provide additional context or specific areas you'd like the AI to focus on
          </p>
        </div>

        {/* Status Messages */}
        {state.error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}

        {state.success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              AI analysis generated successfully! View the results below.
            </AlertDescription>
          </Alert>
        )}

        {/* Generate Button */}
        <Button
          onClick={handleGenerateAnalysis}
          disabled={state.isLoading}
          className="w-full"
          size="lg"
        >
          {state.isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Analysis...
            </>
          ) : (
            <>
              <Brain className="mr-2 h-4 w-4" />
              Generate AI Analysis
            </>
          )}
        </Button>

        {/* Analysis Preview */}
        {state.analysis && (
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Analysis Generated</h4>
            <p className="text-sm text-muted-foreground">
              Analysis ID: {state.analysis.id} | 
              Model: {state.analysis.model_used} | 
              Created: {new Date(state.analysis.created_at).toLocaleString()}
            </p>
          </div>
        )}

        {/* Information */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• AI analysis uses advanced language models to provide insights</p>
          <p>• Results should be reviewed by qualified professionals</p>
          <p>• Analysis is based solely on the provided questionnaire responses</p>
          <p>• Processing may take 10-30 seconds depending on response complexity</p>
        </div>
      </CardContent>
    </Card>
  );
}
