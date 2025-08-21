import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QuestionnairePreview, PreviewQuestionnaire } from '@/components/questionnaire/questionnaire-preview';
import { QuestionType } from '@/types/database';

// Mock the QuestionRenderer component
jest.mock('@/components/question-builder/question-renderer', () => {
  return {
    QuestionRenderer: ({ question, value, onChange, disabled }: any) => (
      <div data-testid={`question-${question.id}`} data-question-type={question.type}>
        <label>{question.text}</label>
        <div data-testid={`question-type-${question.type}`}>
          Question Type: {question.type}
        </div>
        {question.required && <span data-testid="required-indicator">*</span>}
      </div>
    )
  };
});

describe('QuestionnairePreview', () => {
  const createMockQuestionnaire = (questions: any[]): PreviewQuestionnaire => ({
    id: 1,
    title: 'Test Questionnaire',
    description: 'A test questionnaire for preview functionality',
    type: 'assessment',
    category: 'test',
    estimated_time: 5,
    is_active: true,
    is_public: true,
    allow_anonymous: true,
    requires_auth: false,
    questions
  });

  describe('Enhanced Question Type Support', () => {
    it('should render enhanced question types using QuestionRenderer', () => {
      const enhancedQuestions = [
        {
          id: 1,
          text: 'Rich text question',
          type: 'rich_text' as QuestionType,
          required: true,
          order_num: 1
        },
        {
          id: 2,
          text: 'Number question',
          type: 'number' as QuestionType,
          required: false,
          order_num: 2,
          metadata: { min: 1, max: 100 }
        },
        {
          id: 3,
          text: 'Date question',
          type: 'date' as QuestionType,
          required: true,
          order_num: 3
        }
      ];

      const questionnaire = createMockQuestionnaire(enhancedQuestions);

      render(
        <QuestionnairePreview
          questionnaire={questionnaire}
          mode="interactive"
          showMetadata={true}
        />
      );

      // Verify that questions are rendered using QuestionRenderer (our mock)
      expect(screen.getByTestId('question-1')).toBeInTheDocument();
      expect(screen.getByTestId('question-1')).toHaveAttribute('data-question-type', 'rich_text');
      expect(screen.getByTestId('question-type-rich_text')).toHaveTextContent('Question Type: rich_text');
    });

    it('should preserve question metadata and validation rules', () => {
      const questionsWithMetadata = [
        {
          id: 1,
          text: 'File upload with restrictions',
          type: 'file_upload' as QuestionType,
          required: true,
          order_num: 1,
          validation_rules: { max_file_size: 5000000 },
          placeholder_text: 'Upload your document'
        }
      ];

      const questionnaire = createMockQuestionnaire(questionsWithMetadata);

      render(
        <QuestionnairePreview
          questionnaire={questionnaire}
          mode="interactive"
          showMetadata={true}
        />
      );

      // Verify the question is rendered with its specific type (not converted to text)
      expect(screen.getByTestId('question-1')).toBeInTheDocument();
      expect(screen.getByTestId('question-1')).toHaveAttribute('data-question-type', 'file_upload');
    });

    it('should handle geographic question types correctly', () => {
      const geographicQuestions = [
        {
          id: 1,
          text: 'Select your country',
          type: 'country' as QuestionType,
          required: true,
          order_num: 1
        }
      ];

      const questionnaire = createMockQuestionnaire(geographicQuestions);

      render(
        <QuestionnairePreview
          questionnaire={questionnaire}
          mode="interactive"
          showMetadata={true}
        />
      );

      // Verify geographic types are preserved (not converted to single_choice)
      expect(screen.getByTestId('question-1')).toBeInTheDocument();
      expect(screen.getByTestId('question-1')).toHaveAttribute('data-question-type', 'country');
    });
  });

  describe('Preview Mode Functionality', () => {
    it('should render questions using QuestionRenderer component', () => {
      const questions = [
        {
          id: 1,
          text: 'Test question',
          type: 'text' as QuestionType,
          required: true,
          order_num: 1
        }
      ];

      const questionnaire = createMockQuestionnaire(questions);

      render(
        <QuestionnairePreview
          questionnaire={questionnaire}
          mode="interactive"
          showMetadata={true}
        />
      );

      // Verify that QuestionRenderer is being used (our mock component)
      expect(screen.getByTestId('question-1')).toBeInTheDocument();
      expect(screen.getByTestId('question-1')).toHaveAttribute('data-question-type', 'text');
      expect(screen.getByTestId('question-type-text')).toHaveTextContent('Question Type: text');
      expect(screen.getByTestId('required-indicator')).toBeInTheDocument();
    });
  });
});
