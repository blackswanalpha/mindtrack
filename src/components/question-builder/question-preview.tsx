'use client'

import React, { useState } from 'react';
import { Question, QuestionSection, Answer } from '@/types/database';
import { ConditionalLogicEngine } from '@/lib/conditional-logic-engine';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { QuestionRenderer } from './question-renderer';

interface QuestionPreviewProps {
  questions: Question[];
  sections: QuestionSection[];
  className?: string;
}

export const QuestionPreview: React.FC<QuestionPreviewProps> = ({
  questions,
  sections,
  className
}) => {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Initialize conditional logic engine
  const logicEngine = new ConditionalLogicEngine(questions, answers);
  const visibleQuestions = logicEngine.getVisibleQuestions();
  const progress = logicEngine.getProgress();

  const currentQuestion = visibleQuestions[currentQuestionIndex];
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === visibleQuestions.length - 1;

  const handleAnswerChange = (questionId: number, value: any) => {
    const existingAnswerIndex = answers.findIndex(a => a.question_id === questionId);
    const newAnswer: Answer = {
      id: Date.now(),
      response_id: 1, // Mock response ID
      question_id: questionId,
      value: typeof value === 'string' ? value : undefined,
      numeric_value: typeof value === 'number' ? value : undefined,
      boolean_value: typeof value === 'boolean' ? value : undefined,
      json_value: typeof value === 'object' ? value : undefined,
      date_value: undefined,
      time_value: undefined,
      datetime_value: undefined,
      has_files: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const newAnswers = [...answers];
    if (existingAnswerIndex >= 0) {
      newAnswers[existingAnswerIndex] = newAnswer;
    } else {
      newAnswers.push(newAnswer);
    }

    setAnswers(newAnswers);
    
    // Update logic engine with new answers
    logicEngine.updateAnswers(newAnswers);
  };

  const handleNext = () => {
    if (!isLastQuestion) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstQuestion) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleReset = () => {
    setAnswers([]);
    setCurrentQuestionIndex(0);
  };

  const getCurrentAnswer = (questionId: number) => {
    return answers.find(a => a.question_id === questionId);
  };

  const getSectionForQuestion = (question: Question) => {
    return sections.find(s => s.id === question.section_id);
  };

  if (visibleQuestions.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-12 text-center">
          <div className="text-gray-500">
            <h3 className="text-lg font-medium mb-2">No Questions to Preview</h3>
            <p>Add some questions to see the preview.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Questionnaire Preview</CardTitle>
            <div className="flex items-center gap-4">
              <Badge variant="outline">
                Question {currentQuestionIndex + 1} of {visibleQuestions.length}
              </Badge>
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Progress</span>
              <span>{progress.percentage}% complete</span>
            </div>
            <Progress value={progress.percentage} className="w-full" />
          </div>
        </CardHeader>
      </Card>

      {/* Current Question */}
      {currentQuestion && (
        <Card>
          <CardContent className="p-6">
            {/* Section Header */}
            {currentQuestion.section_id && (
              <div className="mb-6">
                {(() => {
                  const section = getSectionForQuestion(currentQuestion);
                  return section ? (
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h3 className="font-semibold text-gray-900">{section.title}</h3>
                      {section.description && (
                        <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                      )}
                    </div>
                  ) : null;
                })()}
              </div>
            )}

            {/* Question */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                  {currentQuestionIndex + 1}
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    {logicEngine.getDynamicQuestionText(currentQuestion.id)}
                    {logicEngine.isQuestionRequired(currentQuestion.id) && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </h4>
                  
                  {currentQuestion.help_text && (
                    <p className="text-sm text-gray-600 mb-4">{currentQuestion.help_text}</p>
                  )}

                  <QuestionRenderer
                    question={currentQuestion}
                    value={getCurrentAnswer(currentQuestion.id)}
                    onChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={isFirstQuestion}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            <div className="flex items-center gap-2">
              {visibleQuestions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentQuestionIndex
                      ? 'bg-blue-500'
                      : index < currentQuestionIndex
                      ? 'bg-green-500'
                      : 'bg-gray-300'
                  }`}
                  title={`Question ${index + 1}`}
                />
              ))}
            </div>

            <Button
              onClick={handleNext}
              disabled={isLastQuestion}
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      {isLastQuestion && (
        <Card>
          <CardHeader>
            <CardTitle>Preview Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{visibleQuestions.length}</div>
                <div className="text-sm text-gray-600">Total Questions</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{progress.current}</div>
                <div className="text-sm text-gray-600">Answered</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {visibleQuestions.filter(q => logicEngine.isQuestionRequired(q.id)).length}
                </div>
                <div className="text-sm text-gray-600">Required</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{sections.length}</div>
                <div className="text-sm text-gray-600">Sections</div>
              </div>
            </div>

            {/* Validation Summary */}
            <div className="mt-6">
              <h4 className="font-medium mb-2">Validation Status</h4>
              {(() => {
                const validation = logicEngine.validateRequiredQuestions();
                return validation.isValid ? (
                  <div className="text-green-600 text-sm">
                    ✓ All required questions have been answered
                  </div>
                ) : (
                  <div className="text-red-600 text-sm">
                    ⚠ {validation.missingQuestions.length} required question(s) not answered
                  </div>
                );
              })()}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
