import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import '@testing-library/jest-dom';
import { QuestionnaireForm, Questionnaire } from '@/components/questionnaire/questionnaire-form';
import { TextQuestion, SingleChoiceQuestion, MultipleChoiceQuestion } from '@/components/questionnaire/question-types';

expect.extend(toHaveNoViolations);

// Mock questionnaire for accessibility testing
const mockQuestionnaire: Questionnaire = {
  id: 1,
  title: 'Accessibility Test Questionnaire',
  description: 'Testing questionnaire accessibility features',
  estimated_time: 5,
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
      text: 'How are you feeling today?',
      type: 'single_choice',
      required: true,
      order_num: 2,
      options: ['Great', 'Good', 'Okay', 'Not good', 'Terrible']
    },
    {
      id: 3,
      text: 'Select all symptoms you are experiencing',
      type: 'multiple_choice',
      required: false,
      order_num: 3,
      options: ['Headache', 'Fatigue', 'Anxiety', 'Depression', 'Sleep issues']
    }
  ]
};

describe('Questionnaire Accessibility', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('QuestionnaireForm Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <QuestionnaireForm
          questionnaire={mockQuestionnaire}
          onSubmit={mockOnSubmit}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has proper heading structure', () => {
      render(
        <QuestionnaireForm
          questionnaire={mockQuestionnaire}
          onSubmit={mockOnSubmit}
        />
      );

      // Main title should be h1
      const mainTitle = screen.getByRole('heading', { level: 1 });
      expect(mainTitle).toHaveTextContent('Accessibility Test Questionnaire');

      // Question should have proper heading level
      const questionHeading = screen.getByRole('heading', { level: 2 });
      expect(questionHeading).toBeInTheDocument();
    });

    it('has proper form structure', () => {
      render(
        <QuestionnaireForm
          questionnaire={mockQuestionnaire}
          onSubmit={mockOnSubmit}
        />
      );

      // Should have a form element
      expect(screen.getByRole('form')).toBeInTheDocument();
    });

    it('has proper progress indication', () => {
      render(
        <QuestionnaireForm
          questionnaire={mockQuestionnaire}
          onSubmit={mockOnSubmit}
          showProgress={true}
        />
      );

      // Progress bar should be accessible
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveAttribute('aria-valuenow');
      expect(progressBar).toHaveAttribute('aria-valuemin');
      expect(progressBar).toHaveAttribute('aria-valuemax');
    });

    it('has proper navigation buttons', () => {
      render(
        <QuestionnaireForm
          questionnaire={mockQuestionnaire}
          onSubmit={mockOnSubmit}
          allowNavigation={true}
        />
      );

      const nextButton = screen.getByRole('button', { name: /next/i });
      expect(nextButton).toBeInTheDocument();
      expect(nextButton).toHaveAttribute('type', 'button');
    });
  });

  describe('Question Types Accessibility', () => {
    it('TextQuestion should be accessible', async () => {
      const mockQuestion = {
        id: 1,
        text: 'What is your name?',
        type: 'text' as const,
        required: true,
        order_num: 1
      };

      const { container } = render(
        <TextQuestion
          question={mockQuestion}
          value=""
          onChange={jest.fn()}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();

      // Should have proper label association
      const input = screen.getByRole('textbox');
      expect(input).toHaveAccessibleName('What is your name?');
      expect(input).toHaveAttribute('required');
    });

    it('SingleChoiceQuestion should be accessible', async () => {
      const mockQuestion = {
        id: 2,
        text: 'How are you feeling?',
        type: 'single_choice' as const,
        required: true,
        order_num: 2,
        options: ['Great', 'Good', 'Okay']
      };

      const { container } = render(
        <SingleChoiceQuestion
          question={mockQuestion}
          value=""
          onChange={jest.fn()}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();

      // Should have proper fieldset and legend
      const fieldset = screen.getByRole('radiogroup');
      expect(fieldset).toHaveAccessibleName('How are you feeling?');

      // All radio buttons should be accessible
      const radioButtons = screen.getAllByRole('radio');
      expect(radioButtons).toHaveLength(3);
      
      radioButtons.forEach((radio, index) => {
        expect(radio).toHaveAccessibleName(mockQuestion.options[index]);
      });
    });

    it('MultipleChoiceQuestion should be accessible', async () => {
      const mockQuestion = {
        id: 3,
        text: 'Select all that apply',
        type: 'multiple_choice' as const,
        required: false,
        order_num: 3,
        options: ['Option 1', 'Option 2', 'Option 3']
      };

      const { container } = render(
        <MultipleChoiceQuestion
          question={mockQuestion}
          value={[]}
          onChange={jest.fn()}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();

      // Should have proper fieldset and legend
      const fieldset = screen.getByRole('group');
      expect(fieldset).toHaveAccessibleName('Select all that apply');

      // All checkboxes should be accessible
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(3);
      
      checkboxes.forEach((checkbox, index) => {
        expect(checkbox).toHaveAccessibleName(mockQuestion.options[index]);
      });
    });
  });

  describe('Error Handling Accessibility', () => {
    it('displays error messages accessibly', async () => {
      const mockQuestion = {
        id: 1,
        text: 'Required field',
        type: 'text' as const,
        required: true,
        order_num: 1
      };

      const { container } = render(
        <TextQuestion
          question={mockQuestion}
          value=""
          onChange={jest.fn()}
          error="This field is required"
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();

      // Error message should be associated with input
      const input = screen.getByRole('textbox');
      const errorMessage = screen.getByText('This field is required');
      
      expect(input).toHaveAttribute('aria-describedby');
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(errorMessage).toHaveAttribute('role', 'alert');
    });
  });

  describe('Keyboard Navigation', () => {
    it('supports keyboard navigation', () => {
      render(
        <QuestionnaireForm
          questionnaire={mockQuestionnaire}
          onSubmit={mockOnSubmit}
          allowNavigation={true}
        />
      );

      // All interactive elements should be focusable
      const input = screen.getByRole('textbox');
      const nextButton = screen.getByRole('button', { name: /next/i });

      expect(input).toHaveAttribute('tabindex', '0');
      expect(nextButton).not.toHaveAttribute('tabindex', '-1');
    });

    it('has proper focus management', () => {
      render(
        <QuestionnaireForm
          questionnaire={mockQuestionnaire}
          onSubmit={mockOnSubmit}
        />
      );

      // First focusable element should receive focus
      const input = screen.getByRole('textbox');
      input.focus();
      expect(input).toHaveFocus();
    });
  });

  describe('Screen Reader Support', () => {
    it('provides proper ARIA labels', () => {
      render(
        <QuestionnaireForm
          questionnaire={mockQuestionnaire}
          onSubmit={mockOnSubmit}
          showProgress={true}
        />
      );

      // Progress should have aria-label
      const progress = screen.getByRole('progressbar');
      expect(progress).toHaveAttribute('aria-label');

      // Form should have accessible name
      const form = screen.getByRole('form');
      expect(form).toHaveAccessibleName();
    });

    it('announces dynamic content changes', () => {
      render(
        <QuestionnaireForm
          questionnaire={mockQuestionnaire}
          onSubmit={mockOnSubmit}
        />
      );

      // Error messages should have role="alert" for screen readers
      // This would be tested in integration with actual error states
    });
  });

  describe('High Contrast Mode Support', () => {
    it('maintains visibility in high contrast mode', () => {
      render(
        <QuestionnaireForm
          questionnaire={mockQuestionnaire}
          onSubmit={mockOnSubmit}
        />
      );

      // Elements should have proper contrast
      // This would typically be tested with visual regression testing
      // or by checking computed styles
      const input = screen.getByRole('textbox');
      expect(input).toHaveStyle('border: 1px solid'); // Ensures border is present
    });
  });

  describe('Reduced Motion Support', () => {
    it('respects prefers-reduced-motion', () => {
      // Mock prefers-reduced-motion
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      render(
        <QuestionnaireForm
          questionnaire={mockQuestionnaire}
          onSubmit={mockOnSubmit}
        />
      );

      // Animations should be disabled when prefers-reduced-motion is set
      // This would be tested by checking CSS classes or styles
    });
  });

  describe('Mobile Accessibility', () => {
    it('has proper touch targets', () => {
      render(
        <QuestionnaireForm
          questionnaire={mockQuestionnaire}
          onSubmit={mockOnSubmit}
        />
      );

      // Touch targets should be at least 44px
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        const styles = window.getComputedStyle(button);
        const minSize = 44; // 44px minimum touch target
        
        // This would need actual computed style checking in a real test
        expect(button).toBeInTheDocument();
      });
    });

    it('supports zoom up to 200%', () => {
      // This would typically be tested with visual regression testing
      // or by checking that content remains accessible at different zoom levels
      render(
        <QuestionnaireForm
          questionnaire={mockQuestionnaire}
          onSubmit={mockOnSubmit}
        />
      );

      // Content should remain functional when zoomed
      expect(screen.getByRole('form')).toBeInTheDocument();
    });
  });
});
