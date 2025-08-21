import { describe, it, expect, beforeEach } from '@jest/globals';
import { QuestionValidationEngine } from '@/lib/question-validation-engine';
import { ConditionalLogicEngine } from '@/lib/conditional-logic-engine';
import { Question, Answer, QuestionType, ValidationRules } from '@/types/database';

describe('Enhanced Question System', () => {
  describe('Question Validation Engine', () => {
    const createMockQuestion = (
      type: QuestionType,
      validationRules?: ValidationRules,
      required = true
    ): Question => ({
      id: 1,
      questionnaire_id: 1,
      text: 'Test question',
      type,
      required,
      order_num: 1,
      validation_rules: validationRules,
      options: undefined,
      conditional_logic: undefined,
      metadata: undefined,
      help_text: undefined,
      placeholder_text: undefined,
      error_message: undefined,
      is_template: false,
      template_category: undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    describe('Text Question Validation', () => {
      it('should validate text input with length constraints', () => {
        const question = createMockQuestion('text', {
          min_length: 5,
          max_length: 20
        });

        // Valid input
        const validResult = QuestionValidationEngine.validateAnswer(question, 'Hello World');
        expect(validResult.isValid).toBe(true);
        expect(validResult.errors).toHaveLength(0);

        // Too short
        const shortResult = QuestionValidationEngine.validateAnswer(question, 'Hi');
        expect(shortResult.isValid).toBe(false);
        expect(shortResult.errors).toContain('Text must be at least 5 characters long');

        // Too long
        const longResult = QuestionValidationEngine.validateAnswer(question, 'This is a very long text that exceeds the limit');
        expect(longResult.isValid).toBe(false);
        expect(longResult.errors).toContain('Text must not exceed 20 characters');
      });

      it('should validate text input with pattern constraints', () => {
        const question = createMockQuestion('text', {
          pattern: '^[a-zA-Z\\s]+$' // Only letters and spaces
        });

        // Valid input
        const validResult = QuestionValidationEngine.validateAnswer(question, 'John Doe');
        expect(validResult.isValid).toBe(true);

        // Invalid input (contains numbers)
        const invalidResult = QuestionValidationEngine.validateAnswer(question, 'John123');
        expect(invalidResult.isValid).toBe(false);
        expect(invalidResult.errors).toContain('Text format is invalid');
      });
    });

    describe('Multiple Choice Validation', () => {
      it('should validate selection limits', () => {
        const question = createMockQuestion('multiple_choice', {
          min_selections: 2,
          max_selections: 4
        });

        // Valid selection
        const validResult = QuestionValidationEngine.validateAnswer(question, ['option1', 'option2', 'option3']);
        expect(validResult.isValid).toBe(true);

        // Too few selections
        const tooFewResult = QuestionValidationEngine.validateAnswer(question, ['option1']);
        expect(tooFewResult.isValid).toBe(false);
        expect(tooFewResult.errors).toContain('Please select at least 2 option(s)');

        // Too many selections
        const tooManyResult = QuestionValidationEngine.validateAnswer(question, ['option1', 'option2', 'option3', 'option4', 'option5']);
        expect(tooManyResult.isValid).toBe(false);
        expect(tooManyResult.errors).toContain('Please select at most 4 option(s)');
      });
    });

    describe('Numeric Question Validation', () => {
      it('should validate number ranges', () => {
        const question = createMockQuestion('number', {
          min_value: 1,
          max_value: 10
        });

        // Valid number
        const validResult = QuestionValidationEngine.validateAnswer(question, 5);
        expect(validResult.isValid).toBe(true);

        // Below minimum
        const belowMinResult = QuestionValidationEngine.validateAnswer(question, 0);
        expect(belowMinResult.isValid).toBe(false);
        expect(belowMinResult.errors).toContain('Value must be at least 1');

        // Above maximum
        const aboveMaxResult = QuestionValidationEngine.validateAnswer(question, 15);
        expect(aboveMaxResult.isValid).toBe(false);
        expect(aboveMaxResult.errors).toContain('Value must not exceed 10');
      });

      it('should validate decimal places', () => {
        const question = createMockQuestion('decimal', {
          decimal_places: 2
        });

        // Valid decimal
        const validResult = QuestionValidationEngine.validateAnswer(question, 3.14);
        expect(validResult.isValid).toBe(true);

        // Too many decimal places
        const tooManyDecimalsResult = QuestionValidationEngine.validateAnswer(question, 3.14159);
        expect(tooManyDecimalsResult.isValid).toBe(false);
        expect(tooManyDecimalsResult.errors).toContain('Value must have at most 2 decimal places');
      });
    });

    describe('Date Validation', () => {
      it('should validate date ranges', () => {
        const question = createMockQuestion('date', {
          min_date: '2024-01-01',
          max_date: '2024-12-31'
        });

        // Valid date
        const validResult = QuestionValidationEngine.validateAnswer(question, '2024-06-15');
        expect(validResult.isValid).toBe(true);

        // Date too early
        const tooEarlyResult = QuestionValidationEngine.validateAnswer(question, '2023-12-31');
        expect(tooEarlyResult.isValid).toBe(false);

        // Date too late
        const tooLateResult = QuestionValidationEngine.validateAnswer(question, '2025-01-01');
        expect(tooLateResult.isValid).toBe(false);
      });
    });

    describe('File Upload Validation', () => {
      it('should validate file constraints', () => {
        const question = createMockQuestion('file_upload', {
          max_file_size: 1024 * 1024, // 1MB
          max_files: 3,
          allowed_file_types: ['image/jpeg', 'image/png', 'application/pdf']
        });

        // Mock file objects
        const validFile = {
          name: 'test.jpg',
          size: 500 * 1024, // 500KB
          type: 'image/jpeg'
        } as File;

        const oversizedFile = {
          name: 'large.jpg',
          size: 2 * 1024 * 1024, // 2MB
          type: 'image/jpeg'
        } as File;

        const invalidTypeFile = {
          name: 'document.txt',
          size: 100 * 1024, // 100KB
          type: 'text/plain'
        } as File;

        // Valid file
        const validResult = QuestionValidationEngine.validateAnswer(question, [validFile]);
        expect(validResult.isValid).toBe(true);

        // Oversized file
        const oversizedResult = QuestionValidationEngine.validateAnswer(question, [oversizedFile]);
        expect(oversizedResult.isValid).toBe(false);
        expect(oversizedResult.errors.some(error => error.includes('too large'))).toBe(true);

        // Invalid file type
        const invalidTypeResult = QuestionValidationEngine.validateAnswer(question, [invalidTypeFile]);
        expect(invalidTypeResult.isValid).toBe(false);
        expect(invalidTypeResult.errors.some(error => error.includes('invalid type'))).toBe(true);

        // Too many files
        const tooManyFilesResult = QuestionValidationEngine.validateAnswer(question, [validFile, validFile, validFile, validFile]);
        expect(tooManyFilesResult.isValid).toBe(false);
        expect(tooManyFilesResult.errors.some(error => error.includes('at most 3 file'))).toBe(true);
      });
    });

    describe('Required Field Validation', () => {
      it('should validate required fields', () => {
        const requiredQuestion = createMockQuestion('text', undefined, true);
        const optionalQuestion = createMockQuestion('text', undefined, false);

        // Required field with empty value
        const requiredEmptyResult = QuestionValidationEngine.validateAnswer(requiredQuestion, '');
        expect(requiredEmptyResult.isValid).toBe(false);
        expect(requiredEmptyResult.errors).toContain('This field is required');

        // Optional field with empty value
        const optionalEmptyResult = QuestionValidationEngine.validateAnswer(optionalQuestion, '');
        expect(optionalEmptyResult.isValid).toBe(true);
      });
    });
  });

  describe('Conditional Logic Engine', () => {
    let questions: Question[];
    let answers: Answer[];

    beforeEach(() => {
      questions = [
        {
          id: 1,
          questionnaire_id: 1,
          text: 'Do you have anxiety?',
          type: 'boolean',
          required: true,
          order_num: 1,
          options: undefined,
          validation_rules: undefined,
          conditional_logic: undefined,
          metadata: undefined,
          help_text: undefined,
          placeholder_text: undefined,
          error_message: undefined,
          is_template: false,
          template_category: undefined,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          questionnaire_id: 1,
          text: 'Rate your anxiety level',
          type: 'rating',
          required: true,
          order_num: 2,
          options: undefined,
          validation_rules: { min_value: 1, max_value: 10 },
          conditional_logic: {
            conditions: [
              {
                question_id: 1,
                operator: 'equals',
                value: true
              }
            ],
            operator: 'AND',
            action: 'show'
          },
          metadata: undefined,
          help_text: undefined,
          placeholder_text: undefined,
          error_message: undefined,
          is_template: false,
          template_category: undefined,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      answers = [];
    });

    it('should show/hide questions based on conditions', () => {
      const engine = new ConditionalLogicEngine(questions, answers);

      // Initially, only first question should be visible
      let visibleQuestions = engine.getVisibleQuestions();
      expect(visibleQuestions).toHaveLength(1);
      expect(visibleQuestions[0].id).toBe(1);

      // Answer "yes" to anxiety question
      answers.push({
        id: 1,
        response_id: 1,
        question_id: 1,
        value: undefined,
        numeric_value: undefined,
        boolean_value: true,
        json_value: undefined,
        date_value: undefined,
        time_value: undefined,
        datetime_value: undefined,
        has_files: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      engine.updateAnswers(answers);
      visibleQuestions = engine.getVisibleQuestions();

      // Now both questions should be visible
      expect(visibleQuestions).toHaveLength(2);
      expect(visibleQuestions.map(q => q.id)).toEqual([1, 2]);
    });

    it('should calculate progress correctly', () => {
      const engine = new ConditionalLogicEngine(questions, answers);

      // No answers - 0% progress
      let progress = engine.getProgress();
      expect(progress.percentage).toBe(0);
      expect(progress.current).toBe(0);
      expect(progress.total).toBe(1); // Only first question visible

      // Answer first question
      answers.push({
        id: 1,
        response_id: 1,
        question_id: 1,
        value: undefined,
        numeric_value: undefined,
        boolean_value: true,
        json_value: undefined,
        date_value: undefined,
        time_value: undefined,
        datetime_value: undefined,
        has_files: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      engine.updateAnswers(answers);
      progress = engine.getProgress();

      // Should be 50% (1 of 2 visible questions answered)
      expect(progress.percentage).toBe(50);
      expect(progress.current).toBe(1);
      expect(progress.total).toBe(2);
    });

    it('should validate required questions', () => {
      const engine = new ConditionalLogicEngine(questions, answers);

      // No answers - validation should fail
      let validation = engine.validateRequiredQuestions();
      expect(validation.isValid).toBe(false);
      expect(validation.missingQuestions).toContain(1);

      // Answer first question to reveal second
      answers.push({
        id: 1,
        response_id: 1,
        question_id: 1,
        value: undefined,
        numeric_value: undefined,
        boolean_value: true,
        json_value: undefined,
        date_value: undefined,
        time_value: undefined,
        datetime_value: undefined,
        has_files: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      engine.updateAnswers(answers);
      validation = engine.validateRequiredQuestions();

      // Should still be invalid (second question now required)
      expect(validation.isValid).toBe(false);
      expect(validation.missingQuestions).toContain(2);

      // Answer second question
      answers.push({
        id: 2,
        response_id: 1,
        question_id: 2,
        value: undefined,
        numeric_value: 7,
        boolean_value: undefined,
        json_value: undefined,
        date_value: undefined,
        time_value: undefined,
        datetime_value: undefined,
        has_files: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      engine.updateAnswers(answers);
      validation = engine.validateRequiredQuestions();

      // Should now be valid
      expect(validation.isValid).toBe(true);
      expect(validation.missingQuestions).toHaveLength(0);
    });
  });

  describe('Question Type Coverage', () => {
    const questionTypes: QuestionType[] = [
      'text', 'textarea', 'rich_text',
      'multiple_choice', 'single_choice', 'dropdown',
      'rating', 'likert', 'star_rating', 'nps', 'semantic_differential',
      'boolean', 'slider', 'number', 'decimal',
      'date', 'time', 'datetime',
      'file_upload', 'image_upload',
      'country', 'state', 'city'
    ];

    it('should support all defined question types', () => {
      questionTypes.forEach(type => {
        const question = {
          id: 1,
          questionnaire_id: 1,
          text: `Test ${type} question`,
          type,
          required: false,
          order_num: 1,
          options: undefined,
          validation_rules: undefined,
          conditional_logic: undefined,
          metadata: undefined,
          help_text: undefined,
          placeholder_text: undefined,
          error_message: undefined,
          is_template: false,
          template_category: undefined,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as Question;

        // Should not throw an error when validating
        expect(() => {
          QuestionValidationEngine.validateAnswer(question, null);
        }).not.toThrow();
      });
    });
  });
});
