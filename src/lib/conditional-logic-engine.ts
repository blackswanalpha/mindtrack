import { ConditionalLogic, LogicCondition, Question, Answer } from '@/types/database';

/**
 * Conditional Logic Engine for MindTrack Questionnaires
 * Handles show/hide logic, skip logic, branching, and dynamic question text
 */

export class ConditionalLogicEngine {
  private questions: Question[];
  private answers: Map<number, Answer>;
  private visibilityCache: Map<number, boolean>;

  constructor(questions: Question[], answers: Answer[] = []) {
    this.questions = questions;
    this.answers = new Map(answers.map(answer => [answer.question_id, answer]));
    this.visibilityCache = new Map();
  }

  /**
   * Update answers and recalculate visibility
   */
  updateAnswers(answers: Answer[]): void {
    this.answers = new Map(answers.map(answer => [answer.question_id, answer]));
    this.visibilityCache.clear();
  }

  /**
   * Check if a question should be visible based on conditional logic
   */
  isQuestionVisible(questionId: number): boolean {
    // Check cache first
    if (this.visibilityCache.has(questionId)) {
      return this.visibilityCache.get(questionId)!;
    }

    const question = this.questions.find(q => q.id === questionId);
    if (!question || !question.conditional_logic) {
      // No conditional logic means always visible
      this.visibilityCache.set(questionId, true);
      return true;
    }

    const isVisible = this.evaluateConditionalLogic(question.conditional_logic);
    this.visibilityCache.set(questionId, isVisible);
    return isVisible;
  }

  /**
   * Get all visible questions in order
   */
  getVisibleQuestions(): Question[] {
    return this.questions
      .filter(question => this.isQuestionVisible(question.id))
      .sort((a, b) => a.order_num - b.order_num);
  }

  /**
   * Check if a question is required based on conditional logic
   */
  isQuestionRequired(questionId: number): boolean {
    const question = this.questions.find(q => q.id === questionId);
    if (!question) return false;

    // Base requirement
    let isRequired = question.required;

    // Check for conditional requirement logic
    if (question.conditional_logic?.action === 'require') {
      isRequired = this.evaluateConditionalLogic(question.conditional_logic);
    }

    return isRequired && this.isQuestionVisible(questionId);
  }

  /**
   * Get the next question based on skip logic
   */
  getNextQuestion(currentQuestionId: number): Question | null {
    const currentQuestion = this.questions.find(q => q.id === currentQuestionId);
    if (!currentQuestion) return null;

    // Check for skip logic
    if (currentQuestion.conditional_logic?.action === 'skip_to') {
      const shouldSkip = this.evaluateConditionalLogic(currentQuestion.conditional_logic);
      if (shouldSkip && currentQuestion.conditional_logic.target_question_id) {
        const targetQuestion = this.questions.find(q => q.id === currentQuestion.conditional_logic!.target_question_id);
        if (targetQuestion && this.isQuestionVisible(targetQuestion.id)) {
          return targetQuestion;
        }
      }
    }

    // Get next visible question in order
    const currentIndex = this.questions.findIndex(q => q.id === currentQuestionId);
    for (let i = currentIndex + 1; i < this.questions.length; i++) {
      const nextQuestion = this.questions[i];
      if (this.isQuestionVisible(nextQuestion.id)) {
        return nextQuestion;
      }
    }

    return null;
  }

  /**
   * Get dynamic question text with variable substitution
   */
  getDynamicQuestionText(questionId: number): string {
    const question = this.questions.find(q => q.id === questionId);
    if (!question) return '';

    let text = question.text;

    // Replace variables with answer values
    const variablePattern = /\{\{(\w+)\.(\w+)\}\}/g;
    text = text.replace(variablePattern, (match, questionRef, property) => {
      // Find question by reference (could be order_num or id)
      const refQuestion = this.questions.find(q => 
        q.order_num.toString() === questionRef || q.id.toString() === questionRef
      );
      
      if (refQuestion) {
        const answer = this.answers.get(refQuestion.id);
        if (answer) {
          return this.getAnswerValue(answer, property) || match;
        }
      }
      
      return match;
    });

    return text;
  }

  /**
   * Evaluate conditional logic conditions
   */
  private evaluateConditionalLogic(logic: ConditionalLogic): boolean {
    const results = logic.conditions.map(condition => this.evaluateCondition(condition));
    
    if (logic.operator === 'AND') {
      return results.every(result => result);
    } else {
      return results.some(result => result);
    }
  }

  /**
   * Evaluate a single condition
   */
  private evaluateCondition(condition: LogicCondition): boolean {
    const answer = this.answers.get(condition.question_id);
    
    if (!answer) {
      // No answer provided
      return condition.operator === 'is_empty';
    }

    const answerValue = this.getAnswerValue(answer);
    
    switch (condition.operator) {
      case 'equals':
        return this.compareValues(answerValue, condition.value, '===');
      
      case 'not_equals':
        return this.compareValues(answerValue, condition.value, '!==');
      
      case 'contains':
        if (typeof answerValue === 'string' && typeof condition.value === 'string') {
          return answerValue.toLowerCase().includes(condition.value.toLowerCase());
        }
        if (Array.isArray(answerValue) && !Array.isArray(condition.value)) {
          return answerValue.includes(condition.value);
        }
        return false;
      
      case 'not_contains':
        return !this.evaluateCondition({...condition, operator: 'contains'});
      
      case 'greater_than':
        return this.compareValues(answerValue, condition.value, '>');
      
      case 'less_than':
        return this.compareValues(answerValue, condition.value, '<');
      
      case 'is_empty':
        return !answerValue || answerValue === '' || 
               (Array.isArray(answerValue) && answerValue.length === 0);
      
      case 'is_not_empty':
        return !this.evaluateCondition({...condition, operator: 'is_empty'});
      
      default:
        return false;
    }
  }

  /**
   * Get the appropriate value from an answer based on question type
   */
  private getAnswerValue(answer: Answer, property?: string): any {
    if (property) {
      switch (property) {
        case 'text':
        case 'value':
          return answer.value;
        case 'number':
          return answer.numeric_value;
        case 'date':
          return answer.date_value;
        case 'time':
          return answer.time_value;
        case 'datetime':
          return answer.datetime_value;
        case 'boolean':
          return answer.boolean_value;
        case 'json':
          return answer.json_value;
        default:
          return answer.value;
      }
    }

    // Return the most appropriate value based on what's available
    if (answer.boolean_value !== null && answer.boolean_value !== undefined) {
      return answer.boolean_value;
    }
    if (answer.numeric_value !== null && answer.numeric_value !== undefined) {
      return answer.numeric_value;
    }
    if (answer.date_value) {
      return answer.date_value;
    }
    if (answer.time_value) {
      return answer.time_value;
    }
    if (answer.datetime_value) {
      return answer.datetime_value;
    }
    if (answer.json_value) {
      return answer.json_value;
    }
    
    return answer.value;
  }

  /**
   * Compare two values with the given operator
   */
  private compareValues(value1: any, value2: any, operator: string): boolean {
    // Handle null/undefined cases
    if (value1 == null || value2 == null) {
      switch (operator) {
        case '===':
          return value1 === value2;
        case '!==':
          return value1 !== value2;
        default:
          return false;
      }
    }

    // Convert to numbers for numeric comparisons
    if (operator === '>' || operator === '<') {
      const num1 = typeof value1 === 'number' ? value1 : parseFloat(value1);
      const num2 = typeof value2 === 'number' ? value2 : parseFloat(value2);
      
      if (isNaN(num1) || isNaN(num2)) {
        return false;
      }
      
      return operator === '>' ? num1 > num2 : num1 < num2;
    }

    // String/exact comparisons
    switch (operator) {
      case '===':
        return value1 === value2;
      case '!==':
        return value1 !== value2;
      default:
        return false;
    }
  }

  /**
   * Get questionnaire progress based on visible questions
   */
  getProgress(): { current: number; total: number; percentage: number } {
    const visibleQuestions = this.getVisibleQuestions();
    const answeredQuestions = visibleQuestions.filter(q => this.answers.has(q.id));
    
    const current = answeredQuestions.length;
    const total = visibleQuestions.length;
    const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
    
    return { current, total, percentage };
  }

  /**
   * Validate all visible required questions are answered
   */
  validateRequiredQuestions(): { isValid: boolean; missingQuestions: Question[] } {
    const visibleQuestions = this.getVisibleQuestions();
    const missingQuestions: Question[] = [];
    
    for (const question of visibleQuestions) {
      if (this.isQuestionRequired(question.id) && !this.answers.has(question.id)) {
        missingQuestions.push(question);
      }
    }
    
    return {
      isValid: missingQuestions.length === 0,
      missingQuestions
    };
  }
}
