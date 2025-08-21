'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Eye, 
  EyeOff, 
  Clock, 
  Users, 
  Shield, 
  Globe,
  Lock,
  Settings,
  Play,
  Pause
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { QuestionRenderer } from '@/components/question-builder/question-renderer';
import {
  QuestionType,
  QuestionOption,
  ValidationRules,
  ConditionalLogic,
  QuestionMetadata
} from '@/types/database';

export interface PreviewQuestion {
  id: number;
  text: string;
  type: QuestionType;
  required: boolean;
  order_num: number;
  options?: string[] | QuestionOption[];
  validation_rules?: ValidationRules;
  conditional_logic?: ConditionalLogic;
  metadata?: QuestionMetadata;
  help_text?: string;
  placeholder_text?: string;
  error_message?: string;
}

export interface PreviewQuestionnaire {
  id?: number;
  title: string;
  description?: string;
  type?: string;
  category?: string;
  estimated_time?: number;
  is_active: boolean;
  is_public: boolean;
  allow_anonymous: boolean;
  requires_auth: boolean;
  questions: PreviewQuestion[];
}

export interface QuestionnairePreviewProps {
  questionnaire: PreviewQuestionnaire;
  mode?: 'preview' | 'interactive';
  showMetadata?: boolean;
  onClose?: () => void;
  className?: string;
}

export const QuestionnairePreview: React.FC<QuestionnairePreviewProps> = ({
  questionnaire,
  mode = 'preview',
  showMetadata = true,
  onClose,
  className
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<number, any>>({});
  const [isPlaying, setIsPlaying] = useState(false);

  const sortedQuestions = [...questionnaire.questions].sort((a, b) => a.order_num - b.order_num);
  const currentQuestion = sortedQuestions[currentQuestionIndex];
  const totalQuestions = sortedQuestions.length;

  const handleResponseChange = (questionId: number, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleAutoPlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    const interval = setInterval(() => {
      setCurrentQuestionIndex(prev => {
        if (prev >= totalQuestions - 1) {
          setIsPlaying(false);
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 3000); // Change question every 3 seconds
  };

  const renderQuestion = (question: PreviewQuestion) => {
    return (
      <QuestionRenderer
        question={question}
        value={responses[question.id]}
        onChange={(value: any) => handleResponseChange(question.id, value)}
        disabled={mode === 'preview'}
      />
    );
  };

  const getAccessBadges = () => {
    const badges = [];
    
    if (questionnaire.is_public) {
      badges.push(
        <Badge key="public" className="bg-green-100 text-green-800 flex items-center gap-1">
          <Globe className="w-3 h-3" />
          Public
        </Badge>
      );
    } else {
      badges.push(
        <Badge key="private" className="bg-gray-100 text-gray-800 flex items-center gap-1">
          <Lock className="w-3 h-3" />
          Private
        </Badge>
      );
    }

    if (questionnaire.allow_anonymous) {
      badges.push(
        <Badge key="anonymous" className="bg-blue-100 text-blue-800 flex items-center gap-1">
          <Shield className="w-3 h-3" />
          Anonymous
        </Badge>
      );
    }

    if (questionnaire.requires_auth) {
      badges.push(
        <Badge key="auth" className="bg-orange-100 text-orange-800 flex items-center gap-1">
          <Users className="w-3 h-3" />
          Auth Required
        </Badge>
      );
    }

    return badges;
  };

  return (
    <div className={cn("max-w-4xl mx-auto", className)}>
      <Card className="shadow-lg">
        {/* Header */}
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  Preview: {questionnaire.title}
                </CardTitle>
                <p className="text-gray-600 text-sm">
                  {mode === 'preview' ? 'Read-only preview' : 'Interactive preview'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAutoPlay}
                className="flex items-center gap-2"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Auto Play
                  </>
                )}
              </Button>
              {onClose && (
                <Button variant="outline" size="sm" onClick={onClose}>
                  Close
                </Button>
              )}
            </div>
          </div>

          {/* Metadata */}
          {showMetadata && (
            <div className="mt-4 space-y-3">
              {questionnaire.description && (
                <p className="text-gray-700">{questionnaire.description}</p>
              )}
              
              <div className="flex flex-wrap items-center gap-2">
                {getAccessBadges()}
                {questionnaire.estimated_time && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {questionnaire.estimated_time} min
                  </Badge>
                )}
                <Badge variant="outline" className="flex items-center gap-1">
                  <Settings className="w-3 h-3" />
                  {totalQuestions} questions
                </Badge>
              </div>
            </div>
          )}

          {/* Progress */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
              <span>{Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)}% complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Question Display */}
          <div className="min-h-[300px] mb-6">
            {currentQuestion && (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-1">
                    {currentQuestionIndex + 1}
                  </Badge>
                  <div className="flex-1">
                    {renderQuestion(currentQuestion)}
                  </div>
                </div>
              </div>
            )}
          </div>

          <Separator className="mb-6" />

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0 || isPlaying}
                className="flex items-center gap-2"
              >
                ← Previous
              </Button>
              
              <Button
                onClick={handleNext}
                disabled={currentQuestionIndex >= totalQuestions - 1 || isPlaying}
                className="flex items-center gap-2"
              >
                Next →
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {mode === 'interactive' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setResponses({})}
                  className="text-gray-600"
                >
                  Clear Responses
                </Button>
              )}
              
              <div className="text-sm text-gray-500">
                {Object.keys(responses).length} of {totalQuestions} answered
              </div>
            </div>
          </div>

          {/* Question List */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">All Questions</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {sortedQuestions.map((question, index) => (
                <div
                  key={question.id}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                    index === currentQuestionIndex 
                      ? "border-blue-500 bg-blue-50" 
                      : "border-gray-200 hover:border-gray-300"
                  )}
                  onClick={() => setCurrentQuestionIndex(index)}
                >
                  <Badge 
                    variant={index === currentQuestionIndex ? "default" : "outline"}
                    className="mt-1"
                  >
                    {index + 1}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {question.text}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {question.type.replace('_', ' ')}
                      </Badge>
                      {question.required && (
                        <Badge variant="outline" className="text-xs">
                          Required
                        </Badge>
                      )}
                      {responses[question.id] && (
                        <Badge className="text-xs bg-green-100 text-green-800">
                          Answered
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
