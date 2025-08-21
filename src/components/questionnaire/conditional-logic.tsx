'use client';

import React from 'react';

export interface ConditionalRule {
  id: string;
  questionId: number;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
  targetQuestionId?: number;
  action: 'show' | 'hide' | 'require' | 'skip_to' | 'end_survey';
}

export interface ConditionalLogicEngine {
  rules: ConditionalRule[];
  responses: Record<number, any>;
}

export class ConditionalLogicProcessor {
  private rules: ConditionalRule[];
  private responses: Record<number, any>;

  constructor(rules: ConditionalRule[], responses: Record<number, any>) {
    this.rules = rules;
    this.responses = responses;
  }

  // Evaluate a single condition
  private evaluateCondition(rule: ConditionalRule): boolean {
    const responseValue = this.responses[rule.questionId];
    
    if (responseValue === undefined || responseValue === null) {
      return false;
    }

    switch (rule.operator) {
      case 'equals':
        return responseValue === rule.value;
      
      case 'not_equals':
        return responseValue !== rule.value;
      
      case 'contains':
        if (Array.isArray(responseValue)) {
          return responseValue.includes(rule.value);
        }
        return String(responseValue).toLowerCase().includes(String(rule.value).toLowerCase());
      
      case 'greater_than':
        return Number(responseValue) > Number(rule.value);
      
      case 'less_than':
        return Number(responseValue) < Number(rule.value);
      
      case 'in':
        if (Array.isArray(rule.value)) {
          return rule.value.includes(responseValue);
        }
        return false;
      
      case 'not_in':
        if (Array.isArray(rule.value)) {
          return !rule.value.includes(responseValue);
        }
        return true;
      
      default:
        return false;
    }
  }

  // Get all questions that should be visible
  getVisibleQuestions(allQuestions: any[]): any[] {
    const hiddenQuestions = new Set<number>();
    const requiredQuestions = new Set<number>();

    // Process all rules
    this.rules.forEach(rule => {
      const conditionMet = this.evaluateCondition(rule);
      
      if (conditionMet) {
        switch (rule.action) {
          case 'hide':
            if (rule.targetQuestionId) {
              hiddenQuestions.add(rule.targetQuestionId);
            }
            break;
          
          case 'show':
            if (rule.targetQuestionId) {
              hiddenQuestions.delete(rule.targetQuestionId);
            }
            break;
          
          case 'require':
            if (rule.targetQuestionId) {
              requiredQuestions.add(rule.targetQuestionId);
            }
            break;
        }
      }
    });

    // Filter questions and update required status
    return allQuestions
      .filter(question => !hiddenQuestions.has(question.id))
      .map(question => ({
        ...question,
        required: question.required || requiredQuestions.has(question.id)
      }));
  }

  // Check if survey should end early
  shouldEndSurvey(): boolean {
    return this.rules.some(rule => {
      return this.evaluateCondition(rule) && rule.action === 'end_survey';
    });
  }

  // Get next question to skip to
  getSkipToQuestion(): number | null {
    for (const rule of this.rules) {
      if (this.evaluateCondition(rule) && rule.action === 'skip_to' && rule.targetQuestionId) {
        return rule.targetQuestionId;
      }
    }
    return null;
  }

  // Get questions that are conditionally required
  getConditionallyRequiredQuestions(): number[] {
    const requiredQuestions: number[] = [];
    
    this.rules.forEach(rule => {
      if (this.evaluateCondition(rule) && rule.action === 'require' && rule.targetQuestionId) {
        requiredQuestions.push(rule.targetQuestionId);
      }
    });
    
    return requiredQuestions;
  }

  // Validate responses considering conditional logic
  validateConditionalResponses(allQuestions: any[]): { isValid: boolean; errors: Record<number, string> } {
    const visibleQuestions = this.getVisibleQuestions(allQuestions);
    const errors: Record<number, string> = {};
    let isValid = true;

    visibleQuestions.forEach(question => {
      const value = this.responses[question.id];
      
      if (question.required) {
        if (value === undefined || value === null || value === '') {
          errors[question.id] = 'This question is required';
          isValid = false;
        } else if (question.type === 'multiple_choice' && Array.isArray(value) && value.length === 0) {
          errors[question.id] = 'Please select at least one option';
          isValid = false;
        }
      }
    });

    return { isValid, errors };
  }
}

// Hook for using conditional logic in components
export const useConditionalLogic = (rules: ConditionalRule[], responses: Record<number, any>) => {
  const processor = new ConditionalLogicProcessor(rules, responses);
  
  return {
    getVisibleQuestions: (questions: any[]) => processor.getVisibleQuestions(questions),
    shouldEndSurvey: () => processor.shouldEndSurvey(),
    getSkipToQuestion: () => processor.getSkipToQuestion(),
    getConditionallyRequiredQuestions: () => processor.getConditionallyRequiredQuestions(),
    validateConditionalResponses: (questions: any[]) => processor.validateConditionalResponses(questions)
  };
};

// Utility functions for creating common conditional rules
export const ConditionalRuleBuilder = {
  // Show question if another question equals a value
  showIf: (questionId: number, value: any, targetQuestionId: number): ConditionalRule => ({
    id: `show_${targetQuestionId}_if_${questionId}_equals_${value}`,
    questionId,
    operator: 'equals',
    value,
    targetQuestionId,
    action: 'show'
  }),

  // Hide question if another question equals a value
  hideIf: (questionId: number, value: any, targetQuestionId: number): ConditionalRule => ({
    id: `hide_${targetQuestionId}_if_${questionId}_equals_${value}`,
    questionId,
    operator: 'equals',
    value,
    targetQuestionId,
    action: 'hide'
  }),

  // Require question if another question equals a value
  requireIf: (questionId: number, value: any, targetQuestionId: number): ConditionalRule => ({
    id: `require_${targetQuestionId}_if_${questionId}_equals_${value}`,
    questionId,
    operator: 'equals',
    value,
    targetQuestionId,
    action: 'require'
  }),

  // Skip to question if condition is met
  skipToIf: (questionId: number, value: any, targetQuestionId: number): ConditionalRule => ({
    id: `skip_to_${targetQuestionId}_if_${questionId}_equals_${value}`,
    questionId,
    operator: 'equals',
    value,
    targetQuestionId,
    action: 'skip_to'
  }),

  // End survey if condition is met
  endSurveyIf: (questionId: number, value: any): ConditionalRule => ({
    id: `end_survey_if_${questionId}_equals_${value}`,
    questionId,
    operator: 'equals',
    value,
    action: 'end_survey'
  }),

  // Show question if score is above threshold
  showIfScoreAbove: (questionId: number, threshold: number, targetQuestionId: number): ConditionalRule => ({
    id: `show_${targetQuestionId}_if_${questionId}_above_${threshold}`,
    questionId,
    operator: 'greater_than',
    value: threshold,
    targetQuestionId,
    action: 'show'
  }),

  // Show question if multiple choice contains value
  showIfContains: (questionId: number, value: any, targetQuestionId: number): ConditionalRule => ({
    id: `show_${targetQuestionId}_if_${questionId}_contains_${value}`,
    questionId,
    operator: 'contains',
    value,
    targetQuestionId,
    action: 'show'
  })
};

// Example conditional logic configurations for common questionnaires
export const CommonConditionalLogic = {
  // GAD-7 with follow-up questions
  GAD7WithFollowUp: [
    // If total anxiety score is high, show additional questions
    ConditionalRuleBuilder.showIfScoreAbove(7, 10, 8), // Show question 8 if score > 10
    ConditionalRuleBuilder.requireIf(7, 'Nearly every day', 8), // Require follow-up if severe
  ],

  // PHQ-9 with suicide risk assessment
  PHQ9WithSuicideRisk: [
    // If question 9 (suicide ideation) is answered positively, show crisis resources
    ConditionalRuleBuilder.showIf(9, 'Several days', 10),
    ConditionalRuleBuilder.showIf(9, 'More than half the days', 10),
    ConditionalRuleBuilder.showIf(9, 'Nearly every day', 10),
    ConditionalRuleBuilder.requireIf(9, 'Nearly every day', 11), // Require immediate contact info
  ],

  // Adaptive wellness check
  AdaptiveWellness: [
    // Skip detailed questions if feeling good
    ConditionalRuleBuilder.skipToIf(1, 'Excellent', 10),
    ConditionalRuleBuilder.skipToIf(1, 'Very good', 8),
    // Show additional support questions if struggling
    ConditionalRuleBuilder.showIf(2, 'Very difficult', 15),
    ConditionalRuleBuilder.showIf(2, 'Extremely difficult', 15),
  ]
};

export default ConditionalLogicProcessor;
