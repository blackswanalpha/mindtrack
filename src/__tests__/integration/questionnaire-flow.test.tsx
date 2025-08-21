import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { QuestionnaireForm, Questionnaire } from '@/components/questionnaire/questionnaire-form';
import { AdaptiveQuestionnaire } from '@/components/questionnaire/adaptive-questionnaire';
import { ConditionalRuleBuilder } from '@/components/questionnaire/conditional-logic';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock questionnaire with conditional logic
const mockAdaptiveQuestionnaire = {
  id: 1,
  title: 'GAD-7 Anxiety Assessment with Conditional Logic',
  description: 'Adaptive anxiety assessment with conditional follow-up questions',
  questions: [
    {
      id: 1,
      text: 'Over the last 2 weeks, how often have you been bothered by feeling nervous, anxious, or on edge?',
      type: 'single_choice' as const,
      required: true,
      order_num: 1,
      options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
      metadata: { adaptive_weight: 1, risk_indicator: true }
    },
    {
      id: 2,
      text: 'Over the last 2 weeks, how often have you been bothered by not being able to stop or control worrying?',
      type: 'single_choice' as const,
      required: true,
      order_num: 2,
      options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
      metadata: { adaptive_weight: 1, risk_indicator: true }
    },
    {
      id: 3,
      text: 'Have you experienced panic attacks in the past month?',
      type: 'boolean' as const,
      required: false,
      order_num: 3,
      metadata: { adaptive_weight: 2, risk_indicator: true }
    },
    {
      id: 4,
      text: 'Please describe your panic attack symptoms in detail',
      type: 'textarea' as const,
      required: false,
      order_num: 4
    },
    {
      id: 5,
      text: 'How would you rate your overall anxiety level today? (1-10)',
      type: 'slider' as const,
      required: true,
      order_num: 5,
      metadata: { min: 1, max: 10, step: 1, adaptive_weight: 1 }
    }
  ],
  conditional_rules: [
    // Show detailed panic attack question only if user reports panic attacks
    ConditionalRuleBuilder.showIf(3, true, 4),
    // Require detailed description if panic attacks are reported
    ConditionalRuleBuilder.requireIf(3, true, 4),
    // End survey early if no anxiety symptoms reported
    {
      id: 'end_if_no_anxiety',
      questionId: 1,
      operator: 'equals' as const,
      value: 'Not at all',
      action: 'end_survey' as const
    }
  ],
  adaptive_config: {
    enabled: true,
    min_questions: 2,
    max_questions: 5,
    confidence_threshold: 0.8,
    early_termination_enabled: true
  },
  estimated_time: 5,
  allow_anonymous: true
};

describe('Questionnaire Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('Complete Questionnaire Flow', () => {
    it('completes a full questionnaire with all question types', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = jest.fn().mockResolvedValue(undefined);

      const fullQuestionnaire: Questionnaire = {
        id: 1,
        title: 'Complete Test Questionnaire',
        description: 'Testing all question types',
        estimated_time: 10,
        allow_anonymous: true,
        questions: [
          {
            id: 1,
            text: 'What is your name?',
            type: 'text',
            required: true,
            order_num: 1
          },
          {
            id: 2,
            text: 'How are you feeling?',
            type: 'single_choice',
            required: true,
            order_num: 2,
            options: ['Great', 'Good', 'Okay', 'Not good']
          },
          {
            id: 3,
            text: 'Select all symptoms',
            type: 'multiple_choice',
            required: false,
            order_num: 3,
            options: ['Headache', 'Fatigue', 'Anxiety']
          },
          {
            id: 4,
            text: 'Do you exercise regularly?',
            type: 'boolean',
            required: true,
            order_num: 4
          },
          {
            id: 5,
            text: 'Rate your energy level',
            type: 'slider',
            required: true,
            order_num: 5,
            metadata: { min: 1, max: 10, step: 1 }
          }
        ]
      };

      render(
        <QuestionnaireForm
          questionnaire={fullQuestionnaire}
          onSubmit={mockOnSubmit}
          allowNavigation={true}
          showProgress={true}
        />
      );

      // Answer text question
      const nameInput = screen.getByRole('textbox');
      await user.type(nameInput, 'John Doe');
      await user.click(screen.getByText('Next'));

      // Answer single choice question
      await user.click(screen.getByLabelText('Good'));
      await user.click(screen.getByText('Next'));

      // Answer multiple choice question
      await user.click(screen.getByLabelText('Headache'));
      await user.click(screen.getByLabelText('Fatigue'));
      await user.click(screen.getByText('Next'));

      // Answer boolean question
      await user.click(screen.getByLabelText('Yes'));
      await user.click(screen.getByText('Next'));

      // Answer slider question
      const slider = screen.getByRole('slider');
      await user.clear(slider);
      await user.type(slider, '7');
      
      // Submit questionnaire
      await user.click(screen.getByText('Submit'));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          1: 'John Doe',
          2: 'Good',
          3: ['Headache', 'Fatigue'],
          4: true,
          5: 7
        });
      });
    });

    it('handles validation errors throughout the flow', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = jest.fn();

      const questionnaire: Questionnaire = {
        id: 1,
        title: 'Validation Test',
        description: 'Testing validation',
        estimated_time: 5,
        allow_anonymous: true,
        questions: [
          {
            id: 1,
            text: 'Required text field',
            type: 'text',
            required: true,
            order_num: 1
          },
          {
            id: 2,
            text: 'Required choice',
            type: 'single_choice',
            required: true,
            order_num: 2,
            options: ['Option 1', 'Option 2']
          }
        ]
      };

      render(
        <QuestionnaireForm
          questionnaire={questionnaire}
          onSubmit={mockOnSubmit}
          allowNavigation={true}
        />
      );

      // Try to proceed without answering required question
      await user.click(screen.getByText('Next'));
      
      expect(screen.getByText('This question is required')).toBeInTheDocument();

      // Answer first question
      const input = screen.getByRole('textbox');
      await user.type(input, 'Test answer');
      await user.click(screen.getByText('Next'));

      // Try to submit without answering second required question
      await user.click(screen.getByText('Submit'));
      
      expect(screen.getByText('This question is required')).toBeInTheDocument();

      // Answer second question and submit
      await user.click(screen.getByLabelText('Option 1'));
      await user.click(screen.getByText('Submit'));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          1: 'Test answer',
          2: 'Option 1'
        });
      });
    });
  });

  describe('Adaptive Questionnaire Flow', () => {
    it('follows conditional logic correctly', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = jest.fn().mockResolvedValue(undefined);

      render(
        <AdaptiveQuestionnaire
          questionnaire={mockAdaptiveQuestionnaire}
          onSubmit={mockOnSubmit}
        />
      );

      // Answer first question with high anxiety
      await user.click(screen.getByLabelText('Nearly every day'));
      await user.click(screen.getByText('Next'));

      // Answer second question
      await user.click(screen.getByLabelText('More than half the days'));
      await user.click(screen.getByText('Next'));

      // Answer panic attack question - Yes
      await user.click(screen.getByLabelText('Yes'));
      await user.click(screen.getByText('Next'));

      // Should now show the conditional follow-up question
      expect(screen.getByText('Please describe your panic attack symptoms in detail')).toBeInTheDocument();
      
      // Answer the conditional question
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Rapid heartbeat, sweating, feeling of doom');
      await user.click(screen.getByText('Next'));

      // Answer slider question
      const slider = screen.getByRole('slider');
      await user.clear(slider);
      await user.type(slider, '8');
      
      // Submit
      await user.click(screen.getByText('Complete'));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          {
            1: 'Nearly every day',
            2: 'More than half the days',
            3: true,
            4: 'Rapid heartbeat, sweating, feeling of doom',
            5: 8
          },
          expect.objectContaining({
            total_questions_shown: 5,
            questions_skipped: 0,
            early_termination: false
          })
        );
      });
    });

    it('handles early termination correctly', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = jest.fn().mockResolvedValue(undefined);

      render(
        <AdaptiveQuestionnaire
          questionnaire={mockAdaptiveQuestionnaire}
          onSubmit={mockOnSubmit}
        />
      );

      // Answer first question with no anxiety (should trigger early termination)
      await user.click(screen.getByLabelText('Not at all'));
      
      // Should show early termination option or automatically submit
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          { 1: 'Not at all' },
          expect.objectContaining({
            early_termination: true
          })
        );
      });
    });

    it('skips questions based on conditional logic', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = jest.fn().mockResolvedValue(undefined);

      render(
        <AdaptiveQuestionnaire
          questionnaire={mockAdaptiveQuestionnaire}
          onSubmit={mockOnSubmit}
        />
      );

      // Answer questions without triggering panic attack follow-up
      await user.click(screen.getByLabelText('Several days'));
      await user.click(screen.getByText('Next'));

      await user.click(screen.getByLabelText('Several days'));
      await user.click(screen.getByText('Next'));

      // Answer No to panic attacks
      await user.click(screen.getByLabelText('No'));
      await user.click(screen.getByText('Next'));

      // Should skip the detailed panic attack question and go to slider
      expect(screen.getByText('How would you rate your overall anxiety level today?')).toBeInTheDocument();
      expect(screen.queryByText('Please describe your panic attack symptoms')).not.toBeInTheDocument();
    });
  });

  describe('Draft Saving and Loading', () => {
    it('saves and loads draft responses', async () => {
      const user = userEvent.setup();
      const mockOnSaveDraft = jest.fn().mockResolvedValue(undefined);

      const questionnaire: Questionnaire = {
        id: 1,
        title: 'Draft Test',
        description: 'Testing draft functionality',
        estimated_time: 5,
        allow_anonymous: true,
        questions: [
          {
            id: 1,
            text: 'Test question',
            type: 'text',
            required: true,
            order_num: 1
          }
        ]
      };

      render(
        <QuestionnaireForm
          questionnaire={questionnaire}
          onSubmit={jest.fn()}
          onSaveDraft={mockOnSaveDraft}
        />
      );

      // Enter some text
      const input = screen.getByRole('textbox');
      await user.type(input, 'Draft response');

      // Save draft
      await user.click(screen.getByText('Save Draft'));

      await waitFor(() => {
        expect(mockOnSaveDraft).toHaveBeenCalledWith({ 1: 'Draft response' });
      });
    });

    it('loads initial responses from draft', () => {
      const questionnaire: Questionnaire = {
        id: 1,
        title: 'Draft Load Test',
        description: 'Testing draft loading',
        estimated_time: 5,
        allow_anonymous: true,
        questions: [
          {
            id: 1,
            text: 'Test question',
            type: 'text',
            required: true,
            order_num: 1
          }
        ]
      };

      const initialResponses = { 1: 'Loaded from draft' };

      render(
        <QuestionnaireForm
          questionnaire={questionnaire}
          onSubmit={jest.fn()}
          initialResponses={initialResponses}
        />
      );

      // Input should have the loaded value
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('Loaded from draft');
    });
  });

  describe('Error Handling', () => {
    it('handles submission errors gracefully', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = jest.fn().mockRejectedValue(new Error('Network error'));

      const questionnaire: Questionnaire = {
        id: 1,
        title: 'Error Test',
        description: 'Testing error handling',
        estimated_time: 5,
        allow_anonymous: true,
        questions: [
          {
            id: 1,
            text: 'Test question',
            type: 'text',
            required: true,
            order_num: 1
          }
        ]
      };

      render(
        <QuestionnaireForm
          questionnaire={questionnaire}
          onSubmit={mockOnSubmit}
        />
      );

      // Answer question and submit
      const input = screen.getByRole('textbox');
      await user.type(input, 'Test answer');
      await user.click(screen.getByText('Submit'));

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/failed to submit/i)).toBeInTheDocument();
      });

      // Form should still be functional
      expect(input).toHaveValue('Test answer');
    });

    it('handles draft saving errors gracefully', async () => {
      const user = userEvent.setup();
      const mockOnSaveDraft = jest.fn().mockRejectedValue(new Error('Save failed'));

      const questionnaire: Questionnaire = {
        id: 1,
        title: 'Draft Error Test',
        description: 'Testing draft error handling',
        estimated_time: 5,
        allow_anonymous: true,
        questions: [
          {
            id: 1,
            text: 'Test question',
            type: 'text',
            required: true,
            order_num: 1
          }
        ]
      };

      render(
        <QuestionnaireForm
          questionnaire={questionnaire}
          onSubmit={jest.fn()}
          onSaveDraft={mockOnSaveDraft}
        />
      );

      // Enter text and try to save draft
      const input = screen.getByRole('textbox');
      await user.type(input, 'Test response');
      await user.click(screen.getByText('Save Draft'));

      // Should handle error gracefully (not crash)
      await waitFor(() => {
        expect(mockOnSaveDraft).toHaveBeenCalled();
      });

      // Form should still be functional
      expect(input).toHaveValue('Test response');
    });
  });
});
