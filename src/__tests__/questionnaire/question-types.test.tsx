import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import {
  TextQuestion,
  TextareaQuestion,
  SingleChoiceQuestion,
  MultipleChoiceQuestion,
  BooleanQuestion,
  RatingQuestion,
  LikertQuestion,
  SliderQuestion
} from '@/components/questionnaire/question-types';

describe('Question Types', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('TextQuestion', () => {
    const mockQuestion = {
      id: 1,
      text: 'What is your name?',
      type: 'text' as const,
      required: true,
      order_num: 1
    };

    it('renders question text', () => {
      render(
        <TextQuestion
          question={mockQuestion}
          value=""
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('What is your name?')).toBeInTheDocument();
    });

    it('shows required indicator', () => {
      render(
        <TextQuestion
          question={mockQuestion}
          value=""
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('calls onChange when text is entered', async () => {
      const user = userEvent.setup();
      
      render(
        <TextQuestion
          question={mockQuestion}
          value=""
          onChange={mockOnChange}
        />
      );

      const input = screen.getByRole('textbox');
      await user.type(input, 'John Doe');

      expect(mockOnChange).toHaveBeenCalledWith('John Doe');
    });

    it('displays error message', () => {
      render(
        <TextQuestion
          question={mockQuestion}
          value=""
          onChange={mockOnChange}
          error="This field is required"
        />
      );

      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    it('is disabled when disabled prop is true', () => {
      render(
        <TextQuestion
          question={mockQuestion}
          value=""
          onChange={mockOnChange}
          disabled={true}
        />
      );

      expect(screen.getByRole('textbox')).toBeDisabled();
    });
  });

  describe('TextareaQuestion', () => {
    const mockQuestion = {
      id: 2,
      text: 'Please describe your experience',
      type: 'textarea' as const,
      required: false,
      order_num: 2
    };

    it('renders as textarea', () => {
      render(
        <TextareaQuestion
          question={mockQuestion}
          value=""
          onChange={mockOnChange}
        />
      );

      const textarea = screen.getByRole('textbox');
      expect(textarea.tagName).toBe('TEXTAREA');
    });

    it('handles multiline text input', async () => {
      const user = userEvent.setup();
      
      render(
        <TextareaQuestion
          question={mockQuestion}
          value=""
          onChange={mockOnChange}
        />
      );

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Line 1\nLine 2');

      expect(mockOnChange).toHaveBeenCalledWith('Line 1\nLine 2');
    });
  });

  describe('SingleChoiceQuestion', () => {
    const mockQuestion = {
      id: 3,
      text: 'How are you feeling?',
      type: 'single_choice' as const,
      required: true,
      order_num: 3,
      options: ['Great', 'Good', 'Okay', 'Not good']
    };

    it('renders all options as radio buttons', () => {
      render(
        <SingleChoiceQuestion
          question={mockQuestion}
          value=""
          onChange={mockOnChange}
        />
      );

      expect(screen.getByLabelText('Great')).toBeInTheDocument();
      expect(screen.getByLabelText('Good')).toBeInTheDocument();
      expect(screen.getByLabelText('Okay')).toBeInTheDocument();
      expect(screen.getByLabelText('Not good')).toBeInTheDocument();
    });

    it('selects option when clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <SingleChoiceQuestion
          question={mockQuestion}
          value=""
          onChange={mockOnChange}
        />
      );

      await user.click(screen.getByLabelText('Good'));

      expect(mockOnChange).toHaveBeenCalledWith('Good');
    });

    it('shows selected value', () => {
      render(
        <SingleChoiceQuestion
          question={mockQuestion}
          value="Great"
          onChange={mockOnChange}
        />
      );

      expect(screen.getByLabelText('Great')).toBeChecked();
    });
  });

  describe('MultipleChoiceQuestion', () => {
    const mockQuestion = {
      id: 4,
      text: 'Select all that apply',
      type: 'multiple_choice' as const,
      required: false,
      order_num: 4,
      options: ['Option 1', 'Option 2', 'Option 3']
    };

    it('renders all options as checkboxes', () => {
      render(
        <MultipleChoiceQuestion
          question={mockQuestion}
          value={[]}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByLabelText('Option 1')).toBeInTheDocument();
      expect(screen.getByLabelText('Option 2')).toBeInTheDocument();
      expect(screen.getByLabelText('Option 3')).toBeInTheDocument();
    });

    it('handles multiple selections', async () => {
      const user = userEvent.setup();
      
      render(
        <MultipleChoiceQuestion
          question={mockQuestion}
          value={[]}
          onChange={mockOnChange}
        />
      );

      await user.click(screen.getByLabelText('Option 1'));
      expect(mockOnChange).toHaveBeenCalledWith(['Option 1']);

      await user.click(screen.getByLabelText('Option 2'));
      expect(mockOnChange).toHaveBeenCalledWith(['Option 1', 'Option 2']);
    });

    it('handles deselection', async () => {
      const user = userEvent.setup();
      
      render(
        <MultipleChoiceQuestion
          question={mockQuestion}
          value={['Option 1', 'Option 2']}
          onChange={mockOnChange}
        />
      );

      await user.click(screen.getByLabelText('Option 1'));
      expect(mockOnChange).toHaveBeenCalledWith(['Option 2']);
    });
  });

  describe('BooleanQuestion', () => {
    const mockQuestion = {
      id: 5,
      text: 'Do you agree?',
      type: 'boolean' as const,
      required: true,
      order_num: 5
    };

    it('renders Yes/No options', () => {
      render(
        <BooleanQuestion
          question={mockQuestion}
          value={null}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByLabelText('Yes')).toBeInTheDocument();
      expect(screen.getByLabelText('No')).toBeInTheDocument();
    });

    it('handles Yes selection', async () => {
      const user = userEvent.setup();
      
      render(
        <BooleanQuestion
          question={mockQuestion}
          value={null}
          onChange={mockOnChange}
        />
      );

      await user.click(screen.getByLabelText('Yes'));
      expect(mockOnChange).toHaveBeenCalledWith(true);
    });

    it('handles No selection', async () => {
      const user = userEvent.setup();
      
      render(
        <BooleanQuestion
          question={mockQuestion}
          value={null}
          onChange={mockOnChange}
        />
      );

      await user.click(screen.getByLabelText('No'));
      expect(mockOnChange).toHaveBeenCalledWith(false);
    });
  });

  describe('RatingQuestion', () => {
    const mockQuestion = {
      id: 6,
      text: 'Rate your experience',
      type: 'rating' as const,
      required: true,
      order_num: 6,
      metadata: { min: 1, max: 5 }
    };

    it('renders rating stars', () => {
      render(
        <RatingQuestion
          question={mockQuestion}
          value={0}
          onChange={mockOnChange}
        />
      );

      const stars = screen.getAllByRole('button');
      expect(stars).toHaveLength(5);
    });

    it('handles star selection', async () => {
      const user = userEvent.setup();
      
      render(
        <RatingQuestion
          question={mockQuestion}
          value={0}
          onChange={mockOnChange}
        />
      );

      const stars = screen.getAllByRole('button');
      await user.click(stars[2]); // Click 3rd star (0-indexed)

      expect(mockOnChange).toHaveBeenCalledWith(3);
    });
  });

  describe('SliderQuestion', () => {
    const mockQuestion = {
      id: 7,
      text: 'Rate from 1 to 10',
      type: 'slider' as const,
      required: true,
      order_num: 7,
      metadata: { min: 1, max: 10, step: 1 }
    };

    it('renders slider input', () => {
      render(
        <SliderQuestion
          question={mockQuestion}
          value={5}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByRole('slider')).toBeInTheDocument();
    });

    it('handles slider value change', () => {
      render(
        <SliderQuestion
          question={mockQuestion}
          value={5}
          onChange={mockOnChange}
        />
      );

      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '8' } });

      expect(mockOnChange).toHaveBeenCalledWith(8);
    });

    it('displays current value', () => {
      render(
        <SliderQuestion
          question={mockQuestion}
          value={7}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByDisplayValue('7')).toBeInTheDocument();
    });
  });

  describe('LikertQuestion', () => {
    const mockQuestion = {
      id: 8,
      text: 'I am satisfied with this service',
      type: 'likert' as const,
      required: true,
      order_num: 8,
      options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
    };

    it('renders likert scale options', () => {
      render(
        <LikertQuestion
          question={mockQuestion}
          value=""
          onChange={mockOnChange}
        />
      );

      expect(screen.getByLabelText('Strongly Disagree')).toBeInTheDocument();
      expect(screen.getByLabelText('Disagree')).toBeInTheDocument();
      expect(screen.getByLabelText('Neutral')).toBeInTheDocument();
      expect(screen.getByLabelText('Agree')).toBeInTheDocument();
      expect(screen.getByLabelText('Strongly Agree')).toBeInTheDocument();
    });

    it('handles likert selection', async () => {
      const user = userEvent.setup();
      
      render(
        <LikertQuestion
          question={mockQuestion}
          value=""
          onChange={mockOnChange}
        />
      );

      await user.click(screen.getByLabelText('Agree'));
      expect(mockOnChange).toHaveBeenCalledWith('Agree');
    });
  });
});
