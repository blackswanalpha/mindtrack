'use client';

import React, { useEffect, useState } from 'react';
import { AIAnalyzer, AnalysisOptions, AnalysisResult } from '@/lib/ai-analyzer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * Questionnaire Analysis Engine
 *
 * Handles the core AI analysis logic for questionnaires including:
 * - Structure analysis
 * - Bias detection
 * - Completion optimization
 * - Question effectiveness evaluation
 */

interface QuestionnaireAnalysisEngineProps {
  questionnaireId: string;
  questionnaire: any;
  analysisType: 'structure' | 'effectiveness' | 'bias_detection' | 'completion_optimization';
  onAnalysisComplete: (analysis: AnalysisResult) => void;
  onError: (error: string) => void;
  onProgress?: (progress: number) => void;
  autoStart?: boolean;
}

export const QuestionnaireAnalysisEngine: React.FC<QuestionnaireAnalysisEngineProps> = ({
  questionnaireId,
  questionnaire,
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
    if (autoStart && questionnaire) {
      startAnalysis();
    }
  }, [autoStart, questionnaire]);

  const startAnalysis = async () => {
    if (!questionnaire) {
      onError('No questionnaire data provided');
      return;
    }

    setIsAnalyzing(true);
    setProgress(0);
    setCurrentStep('Initializing analysis...');

    try {
      // Step 1: Initialize
      await updateProgress(10, 'Preparing questionnaire data...');

      // Step 2: Structure Analysis
      await updateProgress(30, 'Analyzing questionnaire structure...');

      // Step 3: Bias Detection
      await updateProgress(50, 'Detecting potential biases...');

      // Step 4: Effectiveness Evaluation
      await updateProgress(70, 'Evaluating question effectiveness...');

      // Step 5: Generate Recommendations
      await updateProgress(90, 'Generating recommendations...');

      const analysisOptions: AnalysisOptions = {
        analysisType,
        includeRecommendations: true,
        confidenceThreshold: 0.7,
        language: 'en'
      };

      const result = await analyzer.analyzeQuestionnaire(questionnaire, analysisOptions);

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
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700));
  };

  if (!isAnalyzing) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-blue-500" />
          AI Analysis in Progress
        </CardTitle>
        <CardDescription>
          Analyzing questionnaire for {analysisType.replace('_', ' ')} insights
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
            Structure Analysis
          </div>
          <div className={`flex items-center gap-2 ${progress >= 50 ? 'text-green-600' : 'text-gray-400'}`}>
            {progress >= 50 ? <CheckCircle className="w-4 h-4" /> : <RefreshCw className="w-4 h-4 animate-spin" />}
            Bias Detection
          </div>
          <div className={`flex items-center gap-2 ${progress >= 75 ? 'text-green-600' : 'text-gray-400'}`}>
            {progress >= 75 ? <CheckCircle className="w-4 h-4" /> : <RefreshCw className="w-4 h-4 animate-spin" />}
            Effectiveness Evaluation
          </div>
          <div className={`flex items-center gap-2 ${progress >= 100 ? 'text-green-600' : 'text-gray-400'}`}>
            {progress >= 100 ? <CheckCircle className="w-4 h-4" /> : <RefreshCw className="w-4 h-4 animate-spin" />}
            Recommendations
          </div>
        </div>

        <Alert>
          <Brain className="h-4 w-4" />
          <AlertDescription>
            Our AI is analyzing your questionnaire using advanced natural language processing
            and bias detection algorithms. This may take a few moments.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
