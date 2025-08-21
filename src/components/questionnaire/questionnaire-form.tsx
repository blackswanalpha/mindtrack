'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { ChevronLeft, ChevronRight, Save, Send, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Question {
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
  };
}

export interface Questionnaire {
  id: number;
  title: string;
  description?: string;
  questions: Question[];
  estimated_time?: number;
  allow_anonymous: boolean;
}

export interface QuestionnaireFormProps {
  questionnaire: Questionnaire;
  onSubmit: (responses: Record<number, any>) => Promise<void>;
  onSaveDraft?: (responses: Record<number, any>) => Promise<void>;
  initialResponses?: Record<number, any>;
  disabled?: boolean;
  showProgress?: boolean;
  allowNavigation?: boolean;
  className?: string;
}

export const QuestionnaireForm: React.FC<QuestionnaireFormProps> = ({
  questionnaire,
  onSubmit,
  onSaveDraft,
  initialResponses = {},
  disabled = false,
  showProgress = true,
  allowNavigation = true,
  className
}) => {
  const [responses, setResponses] = useState<Record<number, any>>(initialResponses);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const sortedQuestions = [...questionnaire.questions].sort((a, b) => a.order_num - b.order_num);
  const currentQuestion = sortedQuestions[currentQuestionIndex];
  const totalQuestions = sortedQuestions.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  // Auto-save functionality
  useEffect(() => {
    if (onSaveDraft && Object.keys(responses).length > 0) {
      const timeoutId = setTimeout(() => {
        handleSaveDraft();
      }, 2000); // Auto-save after 2 seconds of inactivity

      return () => clearTimeout(timeoutId);
    }
  }, [responses, onSaveDraft]);

  const handleResponseChange = (questionId: number, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));

    // Clear error when user starts typing
    if (errors[questionId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  const validateQuestion = (question: Question): string | null => {
    const value = responses[question.id];
    
    if (question.required) {
      if (value === undefined || value === null || value === '') {
        return 'This question is required';
      }
      
      if (question.type === 'multiple_choice' && Array.isArray(value) && value.length === 0) {
        return 'Please select at least one option';
      }
    }
    
    return null;
  };

  const validateCurrentQuestion = (): boolean => {
    const error = validateQuestion(currentQuestion);
    if (error) {
      setErrors(prev => ({
        ...prev,
        [currentQuestion.id]: error
      }));
      return false;
    }
    return true;
  };

  const validateAllQuestions = (): boolean => {
    const newErrors: Record<number, string> = {};
    let isValid = true;

    sortedQuestions.forEach(question => {
      const error = validateQuestion(question);
      if (error) {
        newErrors[question.id] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    if (validateCurrentQuestion() && currentQuestionIndex < totalQuestions - 1) {
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
    if (!validateAllQuestions() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(responses);
    } catch (error) {
      console.error('Failed to submit questionnaire:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestion = (question: Question) => {
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

  const answeredQuestions = sortedQuestions.filter(q => 
    responses[q.id] !== undefined && responses[q.id] !== null && responses[q.id] !== ''
  ).length;

  return (
    <div className={cn("max-w-4xl mx-auto", className)}>
      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                {questionnaire.title}
              </CardTitle>
              {questionnaire.description && (
                <p className="text-gray-600 mt-2">{questionnaire.description}</p>
              )}
            </div>
            {questionnaire.estimated_time && (
              <div className="text-sm text-gray-500">
                Est. time: {questionnaire.estimated_time} min
              </div>
            )}
          </div>
          
          {showProgress && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
                <span>{answeredQuestions} of {totalQuestions} answered</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
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

          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <div className="flex items-center gap-3">
              {allowNavigation && (
                <>
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0 || disabled}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  
                  {currentQuestionIndex < totalQuestions - 1 ? (
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
                          Submit
                        </>
                      )}
                    </Button>
                  )}
                </>
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
