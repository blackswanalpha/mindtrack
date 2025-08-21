import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { QuestionnaireForm, Questionnaire } from '@/components/questionnaire/questionnaire-form';

// Mock questionnaire data
const mockQuestionnaire: Questionnaire = {
  id: 1,
  title: 'Test Questionnaire',
  description: 'A test questionnaire for unit testing',
  estimated_time: 5,
  allow_anonymous: true,
  questions: [
    {
      id: 1,
      text: 'How are you feeling today?',
      type: 'single_choice',
      required: true,
      order_num: 1,
      options: ['Great', 'Good', 'Okay', 'Not good', 'Terrible']
    },
    {
      id: 2,
      text: 'Please describe your mood in detail',
      type: 'textarea',
      required: false,
      order_num: 2
    },
    {
      id: 3,
      text: 'Rate your energy level (1-10)',
      type: 'slider',
      required: true,
      order_num: 3,
      metadata: { min: 1, max: 10, step: 1 }
    },
    {
      id: 4,
      text: 'Select all that apply to your current state',
      type: 'multiple_choice',
      required: false,
      order_num: 4,
      options: ['Anxious', 'Happy', 'Tired', 'Motivated', 'Stressed']
    }
  ]
};

describe('QuestionnaireForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnSaveDraft = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders questionnaire title and description', () => {
    render(
      <QuestionnaireForm
        questionnaire={mockQuestionnaire}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText('Test Questionnaire')).toBeInTheDocument();
    expect(screen.getByText('A test questionnaire for unit testing')).toBeInTheDocument();
  });

  it('displays progress indicator', () => {
    render(
      <QuestionnaireForm
        questionnaire={mockQuestionnaire}
        onSubmit={mockOnSubmit}
        showProgress={true}
      />
    );

    expect(screen.getByText('Question 1 of 4')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders first question initially', () => {
    render(
      <QuestionnaireForm
        questionnaire={mockQuestionnaire}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText('How are you feeling today?')).toBeInTheDocument();
    expect(screen.getByText('Great')).toBeInTheDocument();
    expect(screen.getByText('Good')).toBeInTheDocument();
  });

  it('allows navigation between questions', async () => {
    const user = userEvent.setup();
    
    render(
      <QuestionnaireForm
        questionnaire={mockQuestionnaire}
        onSubmit={mockOnSubmit}
        allowNavigation={true}
      />
    );

    // Answer first question
    await user.click(screen.getByText('Great'));
    
    // Navigate to next question
    await user.click(screen.getByText('Next'));
    
    expect(screen.getByText('Please describe your mood in detail')).toBeInTheDocument();
    expect(screen.getByText('Question 2 of 4')).toBeInTheDocument();
  });

  it('validates required questions', async () => {
    const user = userEvent.setup();
    
    render(
      <QuestionnaireForm
        questionnaire={mockQuestionnaire}
        onSubmit={mockOnSubmit}
        allowNavigation={true}
      />
    );

    // Try to navigate without answering required question
    await user.click(screen.getByText('Next'));
    
    expect(screen.getByText('This question is required')).toBeInTheDocument();
  });

  it('handles single choice questions correctly', async () => {
    const user = userEvent.setup();
    
    render(
      <QuestionnaireForm
        questionnaire={mockQuestionnaire}
        onSubmit={mockOnSubmit}
      />
    );

    await user.click(screen.getByText('Good'));
    
    // Check that only one option is selected
    const goodOption = screen.getByLabelText('Good');
    const greatOption = screen.getByLabelText('Great');
    
    expect(goodOption).toBeChecked();
    expect(greatOption).not.toBeChecked();
  });

  it('handles multiple choice questions correctly', async () => {
    const user = userEvent.setup();
    
    render(
      <QuestionnaireForm
        questionnaire={mockQuestionnaire}
        onSubmit={mockOnSubmit}
        allowNavigation={true}
      />
    );

    // Navigate to multiple choice question
    await user.click(screen.getByText('Great'));
    await user.click(screen.getByText('Next'));
    await user.click(screen.getByText('Next'));
    await user.click(screen.getByText('Next'));

    // Select multiple options
    await user.click(screen.getByText('Happy'));
    await user.click(screen.getByText('Motivated'));
    
    const happyOption = screen.getByLabelText('Happy');
    const motivatedOption = screen.getByLabelText('Motivated');
    const anxiousOption = screen.getByLabelText('Anxious');
    
    expect(happyOption).toBeChecked();
    expect(motivatedOption).toBeChecked();
    expect(anxiousOption).not.toBeChecked();
  });

  it('handles textarea questions correctly', async () => {
    const user = userEvent.setup();
    
    render(
      <QuestionnaireForm
        questionnaire={mockQuestionnaire}
        onSubmit={mockOnSubmit}
        allowNavigation={true}
      />
    );

    // Navigate to textarea question
    await user.click(screen.getByText('Great'));
    await user.click(screen.getByText('Next'));

    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'I am feeling quite positive today');
    
    expect(textarea).toHaveValue('I am feeling quite positive today');
  });

  it('handles slider questions correctly', async () => {
    const user = userEvent.setup();
    
    render(
      <QuestionnaireForm
        questionnaire={mockQuestionnaire}
        onSubmit={mockOnSubmit}
        allowNavigation={true}
      />
    );

    // Navigate to slider question
    await user.click(screen.getByText('Great'));
    await user.click(screen.getByText('Next'));
    await user.click(screen.getByText('Next'));

    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '7' } });
    
    expect(slider).toHaveValue('7');
  });

  it('saves draft when onSaveDraft is provided', async () => {
    const user = userEvent.setup();
    
    render(
      <QuestionnaireForm
        questionnaire={mockQuestionnaire}
        onSubmit={mockOnSubmit}
        onSaveDraft={mockOnSaveDraft}
      />
    );

    await user.click(screen.getByText('Great'));
    await user.click(screen.getByText('Save Draft'));
    
    expect(mockOnSaveDraft).toHaveBeenCalledWith({ 1: 'Great' });
  });

  it('submits form with all responses', async () => {
    const user = userEvent.setup();
    
    render(
      <QuestionnaireForm
        questionnaire={mockQuestionnaire}
        onSubmit={mockOnSubmit}
        allowNavigation={true}
      />
    );

    // Answer all questions
    await user.click(screen.getByText('Great'));
    await user.click(screen.getByText('Next'));
    
    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'Feeling good');
    await user.click(screen.getByText('Next'));
    
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '8' } });
    await user.click(screen.getByText('Next'));
    
    await user.click(screen.getByText('Happy'));
    await user.click(screen.getByText('Submit'));
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        1: 'Great',
        2: 'Feeling good',
        3: 8,
        4: ['Happy']
      });
    });
  });

  it('loads initial responses correctly', () => {
    const initialResponses = { 1: 'Good', 2: 'Test response' };
    
    render(
      <QuestionnaireForm
        questionnaire={mockQuestionnaire}
        onSubmit={mockOnSubmit}
        initialResponses={initialResponses}
      />
    );

    const goodOption = screen.getByLabelText('Good');
    expect(goodOption).toBeChecked();
  });

  it('disables form when disabled prop is true', () => {
    render(
      <QuestionnaireForm
        questionnaire={mockQuestionnaire}
        onSubmit={mockOnSubmit}
        disabled={true}
      />
    );

    const options = screen.getAllByRole('radio');
    options.forEach(option => {
      expect(option).toBeDisabled();
    });
  });

  it('shows completion message when all questions answered', async () => {
    const user = userEvent.setup();
    
    render(
      <QuestionnaireForm
        questionnaire={mockQuestionnaire}
        onSubmit={mockOnSubmit}
        allowNavigation={true}
      />
    );

    // Answer required questions
    await user.click(screen.getByText('Great'));
    await user.click(screen.getByText('Next'));
    await user.click(screen.getByText('Next'));
    
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '8' } });
    await user.click(screen.getByText('Next'));
    
    expect(screen.getByText('Submit')).toBeInTheDocument();
  });

  it('handles form submission errors gracefully', async () => {
    const user = userEvent.setup();
    const mockOnSubmitError = jest.fn().mockRejectedValue(new Error('Submission failed'));
    
    render(
      <QuestionnaireForm
        questionnaire={mockQuestionnaire}
        onSubmit={mockOnSubmitError}
        allowNavigation={true}
      />
    );

    // Answer required questions and submit
    await user.click(screen.getByText('Great'));
    await user.click(screen.getByText('Next'));
    await user.click(screen.getByText('Next'));
    
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '8' } });
    await user.click(screen.getByText('Next'));
    await user.click(screen.getByText('Submit'));
    
    await waitFor(() => {
      expect(screen.getByText(/failed to submit/i)).toBeInTheDocument();
    });
  });
});
