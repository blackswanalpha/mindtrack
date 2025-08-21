import { ConditionalLogicProcessor, ConditionalRuleBuilder } from '@/components/questionnaire/conditional-logic';

describe('ConditionalLogicProcessor', () => {
  const mockQuestions = [
    { id: 1, text: 'Question 1', required: false },
    { id: 2, text: 'Question 2', required: false },
    { id: 3, text: 'Question 3', required: false },
    { id: 4, text: 'Question 4', required: false },
    { id: 5, text: 'Question 5', required: false }
  ];

  describe('evaluateCondition', () => {
    it('evaluates equals condition correctly', () => {
      const rules = [ConditionalRuleBuilder.showIf(1, 'yes', 2)];
      const responses = { 1: 'yes' };
      const processor = new ConditionalLogicProcessor(rules, responses);
      
      const visibleQuestions = processor.getVisibleQuestions(mockQuestions);
      expect(visibleQuestions).toHaveLength(5); // All questions visible
    });

    it('evaluates not_equals condition correctly', () => {
      const rules = [{
        id: 'test',
        questionId: 1,
        operator: 'not_equals' as const,
        value: 'no',
        targetQuestionId: 2,
        action: 'show' as const
      }];
      const responses = { 1: 'yes' };
      const processor = new ConditionalLogicProcessor(rules, responses);
      
      const visibleQuestions = processor.getVisibleQuestions(mockQuestions);
      expect(visibleQuestions).toHaveLength(5);
    });

    it('evaluates greater_than condition correctly', () => {
      const rules = [ConditionalRuleBuilder.showIfScoreAbove(1, 5, 2)];
      const responses = { 1: 7 };
      const processor = new ConditionalLogicProcessor(rules, responses);
      
      const visibleQuestions = processor.getVisibleQuestions(mockQuestions);
      expect(visibleQuestions).toHaveLength(5);
    });

    it('evaluates contains condition for arrays', () => {
      const rules = [ConditionalRuleBuilder.showIfContains(1, 'option1', 2)];
      const responses = { 1: ['option1', 'option2'] };
      const processor = new ConditionalLogicProcessor(rules, responses);
      
      const visibleQuestions = processor.getVisibleQuestions(mockQuestions);
      expect(visibleQuestions).toHaveLength(5);
    });

    it('evaluates contains condition for strings', () => {
      const rules = [ConditionalRuleBuilder.showIfContains(1, 'test', 2)];
      const responses = { 1: 'this is a test string' };
      const processor = new ConditionalLogicProcessor(rules, responses);
      
      const visibleQuestions = processor.getVisibleQuestions(mockQuestions);
      expect(visibleQuestions).toHaveLength(5);
    });

    it('evaluates in condition correctly', () => {
      const rules = [{
        id: 'test',
        questionId: 1,
        operator: 'in' as const,
        value: ['option1', 'option2', 'option3'],
        targetQuestionId: 2,
        action: 'show' as const
      }];
      const responses = { 1: 'option2' };
      const processor = new ConditionalLogicProcessor(rules, responses);
      
      const visibleQuestions = processor.getVisibleQuestions(mockQuestions);
      expect(visibleQuestions).toHaveLength(5);
    });
  });

  describe('getVisibleQuestions', () => {
    it('hides questions based on hide rules', () => {
      const rules = [ConditionalRuleBuilder.hideIf(1, 'yes', 2)];
      const responses = { 1: 'yes' };
      const processor = new ConditionalLogicProcessor(rules, responses);
      
      const visibleQuestions = processor.getVisibleQuestions(mockQuestions);
      expect(visibleQuestions).toHaveLength(4);
      expect(visibleQuestions.find(q => q.id === 2)).toBeUndefined();
    });

    it('shows questions based on show rules', () => {
      const rules = [
        ConditionalRuleBuilder.hideIf(1, 'no', 2), // Hide by default
        ConditionalRuleBuilder.showIf(1, 'yes', 2)  // Show if condition met
      ];
      const responses = { 1: 'yes' };
      const processor = new ConditionalLogicProcessor(rules, responses);
      
      const visibleQuestions = processor.getVisibleQuestions(mockQuestions);
      expect(visibleQuestions).toHaveLength(5);
      expect(visibleQuestions.find(q => q.id === 2)).toBeDefined();
    });

    it('makes questions required based on require rules', () => {
      const rules = [ConditionalRuleBuilder.requireIf(1, 'yes', 2)];
      const responses = { 1: 'yes' };
      const processor = new ConditionalLogicProcessor(rules, responses);
      
      const visibleQuestions = processor.getVisibleQuestions(mockQuestions);
      const question2 = visibleQuestions.find(q => q.id === 2);
      expect(question2?.required).toBe(true);
    });

    it('handles multiple rules correctly', () => {
      const rules = [
        ConditionalRuleBuilder.hideIf(1, 'no', 2),
        ConditionalRuleBuilder.hideIf(1, 'no', 3),
        ConditionalRuleBuilder.requireIf(1, 'yes', 4)
      ];
      const responses = { 1: 'no' };
      const processor = new ConditionalLogicProcessor(rules, responses);
      
      const visibleQuestions = processor.getVisibleQuestions(mockQuestions);
      expect(visibleQuestions).toHaveLength(3); // Questions 2 and 3 hidden
      expect(visibleQuestions.find(q => q.id === 2)).toBeUndefined();
      expect(visibleQuestions.find(q => q.id === 3)).toBeUndefined();
      expect(visibleQuestions.find(q => q.id === 4)?.required).toBe(false); // Condition not met
    });
  });

  describe('shouldEndSurvey', () => {
    it('returns true when end_survey condition is met', () => {
      const rules = [ConditionalRuleBuilder.endSurveyIf(1, 'terminate')];
      const responses = { 1: 'terminate' };
      const processor = new ConditionalLogicProcessor(rules, responses);
      
      expect(processor.shouldEndSurvey()).toBe(true);
    });

    it('returns false when end_survey condition is not met', () => {
      const rules = [ConditionalRuleBuilder.endSurveyIf(1, 'terminate')];
      const responses = { 1: 'continue' };
      const processor = new ConditionalLogicProcessor(rules, responses);
      
      expect(processor.shouldEndSurvey()).toBe(false);
    });
  });

  describe('getSkipToQuestion', () => {
    it('returns target question when skip condition is met', () => {
      const rules = [ConditionalRuleBuilder.skipToIf(1, 'skip', 5)];
      const responses = { 1: 'skip' };
      const processor = new ConditionalLogicProcessor(rules, responses);
      
      expect(processor.getSkipToQuestion()).toBe(5);
    });

    it('returns null when skip condition is not met', () => {
      const rules = [ConditionalRuleBuilder.skipToIf(1, 'skip', 5)];
      const responses = { 1: 'continue' };
      const processor = new ConditionalLogicProcessor(rules, responses);
      
      expect(processor.getSkipToQuestion()).toBe(null);
    });
  });

  describe('getConditionallyRequiredQuestions', () => {
    it('returns questions that are conditionally required', () => {
      const rules = [
        ConditionalRuleBuilder.requireIf(1, 'yes', 2),
        ConditionalRuleBuilder.requireIf(1, 'yes', 3)
      ];
      const responses = { 1: 'yes' };
      const processor = new ConditionalLogicProcessor(rules, responses);
      
      const requiredQuestions = processor.getConditionallyRequiredQuestions();
      expect(requiredQuestions).toEqual([2, 3]);
    });

    it('returns empty array when no conditions are met', () => {
      const rules = [ConditionalRuleBuilder.requireIf(1, 'yes', 2)];
      const responses = { 1: 'no' };
      const processor = new ConditionalLogicProcessor(rules, responses);
      
      const requiredQuestions = processor.getConditionallyRequiredQuestions();
      expect(requiredQuestions).toEqual([]);
    });
  });

  describe('validateConditionalResponses', () => {
    it('validates visible required questions', () => {
      const questions = [
        { id: 1, text: 'Q1', required: true },
        { id: 2, text: 'Q2', required: false },
        { id: 3, text: 'Q3', required: false }
      ];
      const rules = [ConditionalRuleBuilder.requireIf(1, 'yes', 2)];
      const responses = { 1: 'yes' }; // Missing required question 2
      const processor = new ConditionalLogicProcessor(rules, responses);
      
      const validation = processor.validateConditionalResponses(questions);
      expect(validation.isValid).toBe(false);
      expect(validation.errors[2]).toBe('This question is required');
    });

    it('passes validation when all required questions are answered', () => {
      const questions = [
        { id: 1, text: 'Q1', required: true },
        { id: 2, text: 'Q2', required: false }
      ];
      const rules = [ConditionalRuleBuilder.requireIf(1, 'yes', 2)];
      const responses = { 1: 'yes', 2: 'answered' };
      const processor = new ConditionalLogicProcessor(rules, responses);
      
      const validation = processor.validateConditionalResponses(questions);
      expect(validation.isValid).toBe(true);
      expect(Object.keys(validation.errors)).toHaveLength(0);
    });

    it('validates multiple choice questions correctly', () => {
      const questions = [
        { id: 1, text: 'Q1', type: 'multiple_choice', required: true }
      ];
      const rules: any[] = [];
      const responses = { 1: [] }; // Empty array for multiple choice
      const processor = new ConditionalLogicProcessor(rules, responses);
      
      const validation = processor.validateConditionalResponses(questions);
      expect(validation.isValid).toBe(false);
      expect(validation.errors[1]).toBe('Please select at least one option');
    });
  });
});

describe('ConditionalRuleBuilder', () => {
  it('creates show rule correctly', () => {
    const rule = ConditionalRuleBuilder.showIf(1, 'yes', 2);
    
    expect(rule.questionId).toBe(1);
    expect(rule.operator).toBe('equals');
    expect(rule.value).toBe('yes');
    expect(rule.targetQuestionId).toBe(2);
    expect(rule.action).toBe('show');
  });

  it('creates hide rule correctly', () => {
    const rule = ConditionalRuleBuilder.hideIf(1, 'no', 2);
    
    expect(rule.questionId).toBe(1);
    expect(rule.operator).toBe('equals');
    expect(rule.value).toBe('no');
    expect(rule.targetQuestionId).toBe(2);
    expect(rule.action).toBe('hide');
  });

  it('creates require rule correctly', () => {
    const rule = ConditionalRuleBuilder.requireIf(1, 'yes', 2);
    
    expect(rule.questionId).toBe(1);
    expect(rule.operator).toBe('equals');
    expect(rule.value).toBe('yes');
    expect(rule.targetQuestionId).toBe(2);
    expect(rule.action).toBe('require');
  });

  it('creates skip rule correctly', () => {
    const rule = ConditionalRuleBuilder.skipToIf(1, 'skip', 5);
    
    expect(rule.questionId).toBe(1);
    expect(rule.operator).toBe('equals');
    expect(rule.value).toBe('skip');
    expect(rule.targetQuestionId).toBe(5);
    expect(rule.action).toBe('skip_to');
  });

  it('creates end survey rule correctly', () => {
    const rule = ConditionalRuleBuilder.endSurveyIf(1, 'end');
    
    expect(rule.questionId).toBe(1);
    expect(rule.operator).toBe('equals');
    expect(rule.value).toBe('end');
    expect(rule.action).toBe('end_survey');
    expect(rule.targetQuestionId).toBeUndefined();
  });

  it('creates score-based rule correctly', () => {
    const rule = ConditionalRuleBuilder.showIfScoreAbove(1, 10, 2);
    
    expect(rule.questionId).toBe(1);
    expect(rule.operator).toBe('greater_than');
    expect(rule.value).toBe(10);
    expect(rule.targetQuestionId).toBe(2);
    expect(rule.action).toBe('show');
  });

  it('creates contains rule correctly', () => {
    const rule = ConditionalRuleBuilder.showIfContains(1, 'option', 2);
    
    expect(rule.questionId).toBe(1);
    expect(rule.operator).toBe('contains');
    expect(rule.value).toBe('option');
    expect(rule.targetQuestionId).toBe(2);
    expect(rule.action).toBe('show');
  });
});
