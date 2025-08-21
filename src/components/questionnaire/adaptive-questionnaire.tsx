'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  Send, 
  AlertCircle, 
  Brain,
  Zap,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useConditionalLogic, ConditionalRule } from './conditional-logic';
import { 
  TextQuestion, 
  TextareaQuestion, 
  SingleChoiceQuestion, 
  MultipleChoiceQuestion, 
  BooleanQuestion, 
  RatingQuestion, 
  LikertQuestion, 
  SliderQuestion 
} from './question-types';

export interface AdaptiveQuestion {
  id: number;
  text: string;
  type: 'text' | 'multiple_choice' | 'rating' | 'boolean' | 'textarea' | 'single_choice' | 'likert' | 'slider';
  required: boolean;
  order_num: number;
  options?: string[];
  metadata?: {
    min?: number;
    max?: number;
    step?: number;
    scale_labels?: string[];
    adaptive_weight?: number; // Weight for adaptive scoring
    risk_indicator?: boolean; // Whether this question indicates risk
  };
}

export interface AdaptiveQuestionnaire {
  id: number;
  title: string;
  description?: string;
  questions: AdaptiveQuestion[];
  conditional_rules: ConditionalRule[];
  adaptive_config: {
    enabled: boolean;
    min_questions: number;
    max_questions: number;
    confidence_threshold: number;
    early_termination_enabled: boolean;
  };
  estimated_time?: number;
  allow_anonymous: boolean;
}

export interface AdaptiveQuestionnaireProps {
  questionnaire: AdaptiveQuestionnaire;
  onSubmit: (responses: Record<number, any>, metadata: AdaptiveMetadata) => Promise<void>;
  onSaveDraft?: (responses: Record<number, any>) => Promise<void>;
  initialResponses?: Record<number, any>;
  disabled?: boolean;
  className?: string;
}

export interface AdaptiveMetadata {
  total_questions_shown: number;
  questions_skipped: number;
  adaptive_score: number;
  confidence_level: number;
  early_termination: boolean;
  completion_path: number[];
}

export const AdaptiveQuestionnaire: React.FC<AdaptiveQuestionnaireProps> = ({
  questionnaire,
  onSubmit,
  onSaveDraft,
  initialResponses = {},
  disabled = false,
  className
}) => {
  const [responses, setResponses] = useState<Record<number, any>>(initialResponses);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [completionPath, setCompletionPath] = useState<number[]>([]);
  const [adaptiveScore, setAdaptiveScore] = useState(0);
  const [confidenceLevel, setConfidenceLevel] = useState(0);

  // Use conditional logic hook
  const conditionalLogic = useConditionalLogic(questionnaire.conditional_rules, responses);

  // Get visible questions based on conditional logic
  const visibleQuestions = useMemo(() => {
    return conditionalLogic.getVisibleQuestions(questionnaire.questions);
  }, [questionnaire.questions, responses, conditionalLogic]);

  // Calculate adaptive metrics
  const adaptiveMetrics = useMemo(() => {
    if (!questionnaire.adaptive_config.enabled) {
      return { score: 0, confidence: 0, shouldTerminate: false };
    }

    let totalScore = 0;
    let weightedResponses = 0;
    let riskIndicators = 0;

    visibleQuestions.forEach(question => {
      const response = responses[question.id];
      if (response !== undefined && response !== null && response !== '') {
        const weight = question.metadata?.adaptive_weight || 1;
        
        // Calculate question score based on type
        let questionScore = 0;
        switch (question.type) {
          case 'rating':
          case 'slider':
            questionScore = Number(response) || 0;
            break;
          case 'likert':
          case 'single_choice':
            if (question.options) {
              questionScore = question.options.indexOf(response);
            }
            break;
          case 'boolean':
            questionScore = response === true ? 1 : 0;
            break;
          case 'multiple_choice':
            if (Array.isArray(response)) {
              questionScore = response.length;
            }
            break;
        }

        totalScore += questionScore * weight;
        weightedResponses += weight;

        // Check for risk indicators
        if (question.metadata?.risk_indicator && questionScore > 0) {
          riskIndicators++;
        }
      }
    });

    const normalizedScore = weightedResponses > 0 ? totalScore / weightedResponses : 0;
    const confidence = Math.min(Object.keys(responses).length / questionnaire.adaptive_config.min_questions, 1);
    const shouldTerminate = 
      questionnaire.adaptive_config.early_termination_enabled &&
      confidence >= questionnaire.adaptive_config.confidence_threshold &&
      Object.keys(responses).length >= questionnaire.adaptive_config.min_questions;

    return { score: normalizedScore, confidence, shouldTerminate, riskIndicators };
  }, [responses, visibleQuestions, questionnaire.adaptive_config]);

  // Update adaptive metrics
  useEffect(() => {
    setAdaptiveScore(adaptiveMetrics.score);
    setConfidenceLevel(adaptiveMetrics.confidence);
  }, [adaptiveMetrics]);

  // Auto-save functionality
  useEffect(() => {
    if (onSaveDraft && Object.keys(responses).length > 0) {
      const timeoutId = setTimeout(() => {
        handleSaveDraft();
      }, 2000);

      return () => clearTimeout(timeoutId);
    }
  }, [responses, onSaveDraft]);

  const currentQuestion = visibleQuestions[currentQuestionIndex];
  const totalQuestions = visibleQuestions.length;
  const progress = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;

  const handleResponseChange = (questionId: number, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));

    // Add to completion path
    setCompletionPath(prev => {
      if (!prev.includes(questionId)) {
        return [...prev, questionId];
      }
      return prev;
    });

    // Clear error when user starts typing
    if (errors[questionId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  const validateCurrentQuestion = (): boolean => {
    if (!currentQuestion) return true;
    
    const value = responses[currentQuestion.id];
    
    if (currentQuestion.required) {
      if (value === undefined || value === null || value === '') {
        setErrors(prev => ({
          ...prev,
          [currentQuestion.id]: 'This question is required'
        }));
        return false;
      }
      
      if (currentQuestion.type === 'multiple_choice' && Array.isArray(value) && value.length === 0) {
        setErrors(prev => ({
          ...prev,
          [currentQuestion.id]: 'Please select at least one option'
        }));
        return false;
      }
    }
    
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentQuestion()) return;

    // Check for skip logic
    const skipToQuestion = conditionalLogic.getSkipToQuestion();
    if (skipToQuestion) {
      const skipIndex = visibleQuestions.findIndex(q => q.id === skipToQuestion);
      if (skipIndex !== -1) {
        setCurrentQuestionIndex(skipIndex);
        return;
      }
    }

    // Check for early termination
    if (questionnaire.adaptive_config.enabled && adaptiveMetrics.shouldTerminate) {
      handleSubmit();
      return;
    }

    // Normal progression
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSaveDraft = async () => {
    if (!onSaveDraft || isSaving) return;

    setIsSaving(true);
    try {
      await onSaveDraft(responses);
    } catch (error) {
      console.error('Failed to save draft:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    // Validate all visible questions
    const validation = conditionalLogic.validateConditionalResponses(questionnaire.questions);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const metadata: AdaptiveMetadata = {
        total_questions_shown: visibleQuestions.length,
        questions_skipped: questionnaire.questions.length - visibleQuestions.length,
        adaptive_score: adaptiveScore,
        confidence_level: confidenceLevel,
        early_termination: adaptiveMetrics.shouldTerminate,
        completion_path: completionPath
      };

      await onSubmit(responses, metadata);
    } catch (error) {
      console.error('Failed to submit questionnaire:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestion = (question: AdaptiveQuestion) => {
    const commonProps = {
      question,
      value: responses[question.id],
      onChange: (value: any) => handleResponseChange(question.id, value),
      error: errors[question.id],
      disabled
    };

    switch (question.type) {
      case 'text':
        return <TextQuestion {...commonProps} />;
      case 'textarea':
        return <TextareaQuestion {...commonProps} />;
      case 'single_choice':
        return <SingleChoiceQuestion {...commonProps} />;
      case 'multiple_choice':
        return <MultipleChoiceQuestion {...commonProps} />;
      case 'boolean':
        return <BooleanQuestion {...commonProps} />;
      case 'rating':
        return <RatingQuestion {...commonProps} />;
      case 'likert':
        return <LikertQuestion {...commonProps} />;
      case 'slider':
        return <SliderQuestion {...commonProps} />;
      default:
        return <TextQuestion {...commonProps} />;
    }
  };

  const answeredQuestions = visibleQuestions.filter(q => 
    responses[q.id] !== undefined && responses[q.id] !== null && responses[q.id] !== ''
  ).length;

  return (
    <div className={cn("max-w-4xl mx-auto", className)}>
      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  {questionnaire.title}
                  {questionnaire.adaptive_config.enabled && (
                    <Badge className="bg-purple-100 text-purple-800 flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      Adaptive
                    </Badge>
                  )}
                </CardTitle>
                {questionnaire.description && (
                  <p className="text-gray-600 mt-2">{questionnaire.description}</p>
                )}
              </div>
            </div>
            {questionnaire.estimated_time && (
              <div className="text-sm text-gray-500">
                Est. time: {questionnaire.estimated_time} min
              </div>
            )}
          </div>
          
          {/* Progress and Adaptive Metrics */}
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
              <span>{answeredQuestions} of {totalQuestions} answered</span>
            </div>
            <Progress value={progress} className="h-2" />
            
            {questionnaire.adaptive_config.enabled && (
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-500" />
                  <span className="text-gray-600">Confidence: {Math.round(confidenceLevel * 100)}%</span>
                </div>
                {adaptiveMetrics.riskIndicators > 0 && (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                    <span className="text-gray-600">{adaptiveMetrics.riskIndicators} risk indicators</span>
                  </div>
                )}
                {adaptiveMetrics.shouldTerminate && (
                  <Badge className="bg-green-100 text-green-800">
                    Ready to complete
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="min-h-[300px]">
            {currentQuestion && renderQuestion(currentQuestion)}
          </div>

          {Object.keys(errors).length > 0 && (
            <Alert className="mt-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                Please complete all required questions before proceeding.
              </AlertDescription>
            </Alert>
          )}

          {/* Early termination suggestion */}
          {questionnaire.adaptive_config.enabled && adaptiveMetrics.shouldTerminate && (
            <Alert className="mt-6 border-green-200 bg-green-50">
              <Target className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                Based on your responses, we have enough information to provide accurate results. 
                You can complete the questionnaire now or continue with remaining questions.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0 || disabled}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              
              {currentQuestionIndex < totalQuestions - 1 && !adaptiveMetrics.shouldTerminate ? (
                <Button
                  onClick={handleNext}
                  disabled={disabled}
                  className="flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || disabled}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Complete
                    </>
                  )}
                </Button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {onSaveDraft && (
                <Button
                  variant="ghost"
                  onClick={handleSaveDraft}
                  disabled={isSaving || disabled}
                  className="flex items-center gap-2 text-gray-600"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Draft
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
