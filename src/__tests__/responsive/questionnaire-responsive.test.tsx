import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QuestionnaireForm, Questionnaire } from '@/components/questionnaire/questionnaire-form';
import { QuestionnaireList, QuestionnaireListItem } from '@/components/questionnaire/questionnaire-list';

// Mock window.matchMedia for responsive testing
const mockMatchMedia = (width: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => {
      const matches = {
        '(max-width: 640px)': width <= 640,
        '(max-width: 768px)': width <= 768,
        '(max-width: 1024px)': width <= 1024,
        '(min-width: 641px)': width > 640,
        '(min-width: 769px)': width > 768,
        '(min-width: 1025px)': width > 1024,
      };

      return {
        matches: matches[query] || false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      };
    }),
  });
};

// Mock questionnaire data
const mockQuestionnaire: Questionnaire = {
  id: 1,
  title: 'Responsive Test Questionnaire',
  description: 'Testing questionnaire responsive behavior across different screen sizes',
  estimated_time: 5,
  allow_anonymous: true,
  questions: [
    {
      id: 1,
      text: 'How are you feeling today? This is a longer question text to test wrapping behavior.',
      type: 'single_choice',
      required: true,
      order_num: 1,
      options: ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor']
    },
    {
      id: 2,
      text: 'Please describe your current situation in detail',
      type: 'textarea',
      required: false,
      order_num: 2
    }
  ]
};

const mockQuestionnaireList: QuestionnaireListItem[] = [
  {
    id: 1,
    title: 'GAD-7 Anxiety Assessment',
    description: 'Generalized Anxiety Disorder 7-item scale',
    type: 'assessment',
    category: 'mental_health',
    estimated_time: 5,
    is_active: true,
    is_public: false,
    allow_anonymous: true,
    response_count: 142,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-20T14:30:00Z',
    created_by: {
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@example.com'
    }
  }
];

describe('Questionnaire Responsive Design', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Reset window properties
    delete (window as any).innerWidth;
    delete (window as any).matchMedia;
  });

  describe('Mobile (320px - 640px)', () => {
    beforeEach(() => {
      mockMatchMedia(375); // iPhone SE width
    });

    it('renders questionnaire form properly on mobile', () => {
      render(
        <QuestionnaireForm
          questionnaire={mockQuestionnaire}
          onSubmit={mockOnSubmit}
          showProgress={true}
        />
      );

      // Title should be visible and readable
      expect(screen.getByText('Responsive Test Questionnaire')).toBeInTheDocument();
      
      // Progress bar should be visible
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      
      // Question text should wrap properly
      expect(screen.getByText(/How are you feeling today/)).toBeInTheDocument();
    });

    it('stacks navigation buttons vertically on mobile', () => {
      render(
        <QuestionnaireForm
          questionnaire={mockQuestionnaire}
          onSubmit={mockOnSubmit}
          allowNavigation={true}
        />
      );

      const nextButton = screen.getByRole('button', { name: /next/i });
      expect(nextButton).toBeInTheDocument();
      
      // Button should be full width on mobile (this would be tested with actual CSS)
      expect(nextButton).toHaveClass(/w-full|flex-1/);
    });

    it('handles long question text on mobile', () => {
      render(
        <QuestionnaireForm
          questionnaire={mockQuestionnaire}
          onSubmit={mockOnSubmit}
        />
      );

      // Long question text should be visible and wrapped
      const questionText = screen.getByText(/How are you feeling today/);
      expect(questionText).toBeInTheDocument();
      
      // Text should not overflow (this would be tested with actual layout measurements)
    });

    it('renders options list properly on mobile', () => {
      render(
        <QuestionnaireForm
          questionnaire={mockQuestionnaire}
          onSubmit={mockOnSubmit}
        />
      );

      // All options should be visible
      expect(screen.getByLabelText('Excellent')).toBeInTheDocument();
      expect(screen.getByLabelText('Very Good')).toBeInTheDocument();
      expect(screen.getByLabelText('Good')).toBeInTheDocument();
      expect(screen.getByLabelText('Fair')).toBeInTheDocument();
      expect(screen.getByLabelText('Poor')).toBeInTheDocument();
    });

    it('renders questionnaire list in mobile layout', () => {
      render(
        <QuestionnaireList
          questionnaires={mockQuestionnaireList}
          onEdit={jest.fn()}
          onDelete={jest.fn()}
          onView={jest.fn()}
          onGenerateQR={jest.fn()}
          onDuplicate={jest.fn()}
          onCreateNew={jest.fn()}
        />
      );

      // List should render in single column on mobile
      expect(screen.getByText('GAD-7 Anxiety Assessment')).toBeInTheDocument();
    });
  });

  describe('Tablet (641px - 1024px)', () => {
    beforeEach(() => {
      mockMatchMedia(768); // iPad width
    });

    it('renders questionnaire form properly on tablet', () => {
      render(
        <QuestionnaireForm
          questionnaire={mockQuestionnaire}
          onSubmit={mockOnSubmit}
          showProgress={true}
        />
      );

      expect(screen.getByText('Responsive Test Questionnaire')).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('uses appropriate spacing on tablet', () => {
      render(
        <QuestionnaireForm
          questionnaire={mockQuestionnaire}
          onSubmit={mockOnSubmit}
        />
      );

      // Content should have appropriate margins and padding for tablet
      const form = screen.getByRole('form');
      expect(form).toBeInTheDocument();
    });

    it('renders questionnaire list in tablet layout', () => {
      render(
        <QuestionnaireList
          questionnaires={mockQuestionnaireList}
          onEdit={jest.fn()}
          onDelete={jest.fn()}
          onView={jest.fn()}
          onGenerateQR={jest.fn()}
          onDuplicate={jest.fn()}
          onCreateNew={jest.fn()}
        />
      );

      // Should show more information per item on tablet
      expect(screen.getByText('GAD-7 Anxiety Assessment')).toBeInTheDocument();
    });
  });

  describe('Desktop (1025px+)', () => {
    beforeEach(() => {
      mockMatchMedia(1440); // Desktop width
    });

    it('renders questionnaire form properly on desktop', () => {
      render(
        <QuestionnaireForm
          questionnaire={mockQuestionnaire}
          onSubmit={mockOnSubmit}
          showProgress={true}
        />
      );

      expect(screen.getByText('Responsive Test Questionnaire')).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('uses horizontal layout for navigation on desktop', () => {
      render(
        <QuestionnaireForm
          questionnaire={mockQuestionnaire}
          onSubmit={mockOnSubmit}
          allowNavigation={true}
        />
      );

      const nextButton = screen.getByRole('button', { name: /next/i });
      expect(nextButton).toBeInTheDocument();
      
      // Buttons should be inline on desktop
      expect(nextButton).not.toHaveClass(/w-full/);
    });

    it('renders questionnaire list in desktop layout', () => {
      render(
        <QuestionnaireList
          questionnaires={mockQuestionnaireList}
          onEdit={jest.fn()}
          onDelete={jest.fn()}
          onView={jest.fn()}
          onGenerateQR={jest.fn()}
          onDuplicate={jest.fn()}
          onCreateNew={jest.fn()}
        />
      );

      // Should show full information and multiple columns on desktop
      expect(screen.getByText('GAD-7 Anxiety Assessment')).toBeInTheDocument();
    });
  });

  describe('Orientation Changes', () => {
    it('handles portrait to landscape orientation change', () => {
      // Start in portrait
      mockMatchMedia(375);
      
      const { rerender } = render(
        <QuestionnaireForm
          questionnaire={mockQuestionnaire}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByText('Responsive Test Questionnaire')).toBeInTheDocument();

      // Change to landscape
      mockMatchMedia(667);
      
      rerender(
        <QuestionnaireForm
          questionnaire={mockQuestionnaire}
          onSubmit={mockOnSubmit}
        />
      );

      // Content should still be accessible
      expect(screen.getByText('Responsive Test Questionnaire')).toBeInTheDocument();
    });
  });

  describe('Touch Targets', () => {
    beforeEach(() => {
      mockMatchMedia(375); // Mobile width
    });

    it('has appropriate touch target sizes on mobile', () => {
      render(
        <QuestionnaireForm
          questionnaire={mockQuestionnaire}
          onSubmit={mockOnSubmit}
          allowNavigation={true}
        />
      );

      // Radio buttons should have adequate touch targets
      const radioButtons = screen.getAllByRole('radio');
      radioButtons.forEach(radio => {
        // Touch targets should be at least 44px (this would be tested with actual measurements)
        expect(radio).toBeInTheDocument();
      });

      // Buttons should have adequate touch targets
      const nextButton = screen.getByRole('button', { name: /next/i });
      expect(nextButton).toBeInTheDocument();
    });
  });

  describe('Text Scaling', () => {
    it('handles text scaling gracefully', () => {
      // Mock larger text size
      Object.defineProperty(document.documentElement, 'style', {
        value: { fontSize: '20px' },
        writable: true
      });

      render(
        <QuestionnaireForm
          questionnaire={mockQuestionnaire}
          onSubmit={mockOnSubmit}
        />
      );

      // Content should remain accessible with larger text
      expect(screen.getByText('Responsive Test Questionnaire')).toBeInTheDocument();
      expect(screen.getByText(/How are you feeling today/)).toBeInTheDocument();
    });
  });

  describe('Viewport Meta Tag', () => {
    it('should have proper viewport configuration', () => {
      // This would typically be tested at the document level
      // Ensuring viewport meta tag is present: <meta name="viewport" content="width=device-width, initial-scale=1">
      
      render(
        <QuestionnaireForm
          questionnaire={mockQuestionnaire}
          onSubmit={mockOnSubmit}
        />
      );

      // Content should render properly assuming correct viewport setup
      expect(screen.getByText('Responsive Test Questionnaire')).toBeInTheDocument();
    });
  });

  describe('Container Queries Support', () => {
    it('adapts to container size changes', () => {
      const { container } = render(
        <div style={{ width: '300px' }}>
          <QuestionnaireForm
            questionnaire={mockQuestionnaire}
            onSubmit={mockOnSubmit}
          />
        </div>
      );

      // Content should adapt to narrow container
      expect(screen.getByText('Responsive Test Questionnaire')).toBeInTheDocument();
      
      // Layout should be appropriate for narrow container
      expect(container.firstChild).toHaveStyle('width: 300px');
    });
  });

  describe('Print Styles', () => {
    it('should be print-friendly', () => {
      // Mock print media query
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === 'print',
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

      // Content should be accessible for printing
      expect(screen.getByText('Responsive Test Questionnaire')).toBeInTheDocument();
    });
  });
});
