'use client';

import React, { useEffect, useState } from 'react';
import { AIAnalyzer, AnalysisOptions, AnalysisResult } from '@/lib/ai-analyzer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, CheckCircle, AlertTriangle, RefreshCw, BarChart3 } from 'lucide-react';

/**
 * Response Analysis Engine
 *
 * Handles the core AI analysis logic for responses including:
 * - Sentiment analysis
 * - Pattern recognition
 * - Statistical analysis
 * - Trend detection
 * - Predictive insights
 */

interface ResponseAnalysisEngineProps {
  responseId: string;
  response: any;
  analysisType: 'individual' | 'aggregate' | 'comparative' | 'predictive';
  onAnalysisComplete: (analysis: AnalysisResult) => void;
  onError: (error: string) => void;
  onProgress?: (progress: number) => void;
  autoStart?: boolean;
}

export const ResponseAnalysisEngine: React.FC<ResponseAnalysisEngineProps> = ({
  responseId,
  response,
  analysisType,
  onAnalysisComplete,
  onError,
  onProgress,
  autoStart = false
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [analyzer] = useState(() => new AIAnalyzer());

  useEffect(() => {
    if (autoStart && response) {
      startAnalysis();
    }
  }, [autoStart, response]);

  const startAnalysis = async () => {
    if (!response) {
      onError('No response data provided');
      return;
    }

    setIsAnalyzing(true);
    setProgress(0);
    setCurrentStep('Initializing analysis...');

    try {
      // Step 1: Initialize
      await updateProgress(15, 'Preparing response data...');

      // Step 2: Sentiment Analysis
      await updateProgress(35, 'Analyzing sentiment and emotions...');

      // Step 3: Pattern Recognition
      await updateProgress(55, 'Detecting response patterns...');

      // Step 4: Statistical Analysis
      await updateProgress(75, 'Computing statistical measures...');

      // Step 5: Generate Insights
      await updateProgress(95, 'Generating insights and recommendations...');

      const analysisOptions: AnalysisOptions = {
        analysisType,
        includeRecommendations: true,
        confidenceThreshold: 0.7,
        language: 'en'
      };

      const result = await analyzer.analyzeResponse(response, analysisOptions);

      await updateProgress(100, 'Analysis complete!');

      setTimeout(() => {
        setIsAnalyzing(false);
        onAnalysisComplete(result);
      }, 500);

    } catch (error) {
      setIsAnalyzing(false);
      const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
      onError(errorMessage);
    }
  };

  const updateProgress = async (newProgress: number, step: string) => {
    setProgress(newProgress);
    setCurrentStep(step);
    onProgress?.(newProgress);

    // Simulate realistic processing time
    await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 800));
  };

  if (!isAnalyzing) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-purple-500" />
          AI Response Analysis in Progress
        </CardTitle>
        <CardDescription>
          Performing {analysisType} analysis on response data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{currentStep}</span>
            <span className="text-gray-600">{progress}%</span>
          </div>
          <Progress value={progress} className="w-full h-2" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div className={`flex items-center gap-2 ${progress >= 25 ? 'text-green-600' : 'text-gray-400'}`}>
            {progress >= 25 ? <CheckCircle className="w-4 h-4" /> : <RefreshCw className="w-4 h-4 animate-spin" />}
            Sentiment Analysis
          </div>
          <div className={`flex items-center gap-2 ${progress >= 50 ? 'text-green-600' : 'text-gray-400'}`}>
            {progress >= 50 ? <CheckCircle className="w-4 h-4" /> : <RefreshCw className="w-4 h-4 animate-spin" />}
            Pattern Recognition
          </div>
          <div className={`flex items-center gap-2 ${progress >= 75 ? 'text-green-600' : 'text-gray-400'}`}>
            {progress >= 75 ? <CheckCircle className="w-4 h-4" /> : <RefreshCw className="w-4 h-4 animate-spin" />}
            Statistical Analysis
          </div>
          <div className={`flex items-center gap-2 ${progress >= 100 ? 'text-green-600' : 'text-gray-400'}`}>
            {progress >= 100 ? <CheckCircle className="w-4 h-4" /> : <RefreshCw className="w-4 h-4 animate-spin" />}
            Insights Generation
          </div>
        </div>

        <Alert>
          <Brain className="h-4 w-4" />
          <AlertDescription>
            {analysisType === 'individual'
              ? 'Analyzing individual response patterns, sentiment, and quality metrics.'
              : 'Processing aggregate data to identify trends, correlations, and statistical insights.'}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
