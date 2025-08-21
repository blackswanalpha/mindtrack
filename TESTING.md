# MindTrack Testing Guide

This document outlines the comprehensive testing strategy for the MindTrack questionnaire system.

## Testing Overview

The MindTrack application includes extensive testing coverage across multiple dimensions:

- **Unit Tests**: Individual component and function testing
- **Integration Tests**: End-to-end questionnaire flow testing
- **Accessibility Tests**: WCAG compliance and screen reader compatibility
- **Responsive Design Tests**: Multi-device and viewport testing
- **Conditional Logic Tests**: Complex questionnaire flow validation

## Test Structure

```
src/
├── __tests__/
│   ├── questionnaire/
│   │   ├── questionnaire-form.test.tsx
│   │   ├── conditional-logic.test.ts
│   │   └── question-types.test.tsx
│   ├── accessibility/
│   │   └── questionnaire-accessibility.test.tsx
│   ├── responsive/
│   │   └── questionnaire-responsive.test.tsx
│   └── integration/
│       └── questionnaire-flow.test.tsx
├── components/
└── lib/
```

## Running Tests

### All Tests
```bash
npm test
```

### Watch Mode (Development)
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

### Specific Test Categories
```bash
# Unit tests only
npm run test:unit

# Accessibility tests
npm run test:accessibility

# Responsive design tests
npm run test:responsive

# Integration tests
npm run test:integration

# CI/CD pipeline
npm run test:ci
```

## Test Categories

### 1. Unit Tests

#### QuestionnaireForm Tests
- ✅ Renders questionnaire title and description
- ✅ Displays progress indicator
- ✅ Handles navigation between questions
- ✅ Validates required questions
- ✅ Handles all question types correctly
- ✅ Saves and loads draft responses
- ✅ Submits form with complete responses
- ✅ Handles form submission errors

#### Question Types Tests
- ✅ TextQuestion: Input handling and validation
- ✅ TextareaQuestion: Multiline text support
- ✅ SingleChoiceQuestion: Radio button behavior
- ✅ MultipleChoiceQuestion: Checkbox selection
- ✅ BooleanQuestion: Yes/No responses
- ✅ RatingQuestion: Star rating interaction
- ✅ LikertQuestion: Scale responses
- ✅ SliderQuestion: Range input handling

#### Conditional Logic Tests
- ✅ Rule evaluation (equals, not_equals, greater_than, etc.)
- ✅ Question visibility management
- ✅ Required field conditional logic
- ✅ Skip logic and early termination
- ✅ Complex multi-rule scenarios
- ✅ Validation with conditional requirements

### 2. Integration Tests

#### Complete Questionnaire Flow
- ✅ Full questionnaire completion with all question types
- ✅ Validation error handling throughout flow
- ✅ Draft saving and loading functionality
- ✅ Submission error recovery

#### Adaptive Questionnaire Flow
- ✅ Conditional logic execution
- ✅ Early termination scenarios
- ✅ Question skipping based on responses
- ✅ Adaptive scoring and confidence calculation

### 3. Accessibility Tests

#### WCAG Compliance
- ✅ No accessibility violations (axe-core)
- ✅ Proper heading structure (h1, h2, etc.)
- ✅ Form accessibility (labels, fieldsets, legends)
- ✅ Progress indication accessibility
- ✅ Error message accessibility

#### Keyboard Navigation
- ✅ Tab order and focus management
- ✅ Keyboard-only operation
- ✅ Focus indicators
- ✅ Skip links where appropriate

#### Screen Reader Support
- ✅ ARIA labels and descriptions
- ✅ Live regions for dynamic content
- ✅ Semantic HTML structure
- ✅ Alternative text for images

#### Assistive Technology
- ✅ High contrast mode support
- ✅ Reduced motion preferences
- ✅ Text scaling up to 200%
- ✅ Touch target sizing (44px minimum)

### 4. Responsive Design Tests

#### Viewport Testing
- ✅ Mobile (320px - 640px)
- ✅ Tablet (641px - 1024px)
- ✅ Desktop (1025px+)
- ✅ Orientation changes

#### Layout Adaptation
- ✅ Navigation button stacking
- ✅ Question text wrapping
- ✅ Option list formatting
- ✅ Progress indicator scaling

#### Touch Interface
- ✅ Touch target sizing
- ✅ Gesture support
- ✅ Mobile-specific interactions

## Coverage Requirements

The testing suite maintains high coverage standards:

- **Branches**: 80% minimum
- **Functions**: 80% minimum
- **Lines**: 80% minimum
- **Statements**: 80% minimum

## Test Data and Mocks

### Mock Questionnaires
- Simple questionnaire (basic flow testing)
- Complex questionnaire (all question types)
- Adaptive questionnaire (conditional logic)
- GAD-7 questionnaire (real-world example)

### Mock Services
- localStorage/sessionStorage
- fetch API
- window.matchMedia (responsive testing)
- IntersectionObserver/ResizeObserver

## Continuous Integration

### GitHub Actions Workflow
```yaml
- name: Run Tests
  run: npm run test:ci
  
- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    file: ./coverage/lcov.info
```

### Pre-commit Hooks
- Lint checking
- Type checking
- Unit test execution
- Accessibility validation

## Testing Best Practices

### 1. Test Structure
- **Arrange**: Set up test data and mocks
- **Act**: Execute the functionality being tested
- **Assert**: Verify the expected outcomes

### 2. Test Naming
- Descriptive test names that explain the scenario
- Use "should" or "it" patterns for clarity
- Group related tests with describe blocks

### 3. Mock Strategy
- Mock external dependencies
- Use real implementations for internal logic
- Avoid over-mocking that hides real issues

### 4. Accessibility Testing
- Include axe-core in all component tests
- Test keyboard navigation paths
- Verify ARIA attributes and roles

### 5. Responsive Testing
- Test key breakpoints
- Verify touch target sizes
- Check text scaling behavior

## Debugging Tests

### Common Issues
1. **Async Operations**: Use `waitFor` for async state changes
2. **User Events**: Use `userEvent` instead of `fireEvent` for realistic interactions
3. **Mocks**: Ensure mocks are properly reset between tests
4. **Accessibility**: Check for proper ARIA attributes and semantic HTML

### Debug Commands
```bash
# Run specific test file
npm test questionnaire-form.test.tsx

# Run tests in debug mode
npm test -- --verbose

# Run tests with coverage details
npm run test:coverage -- --verbose
```

## Performance Testing

While not included in the current test suite, consider adding:
- Component rendering performance
- Large questionnaire handling
- Memory leak detection
- Bundle size analysis

## Future Testing Enhancements

1. **Visual Regression Testing**: Screenshot comparison
2. **E2E Testing**: Playwright or Cypress integration
3. **Performance Testing**: Lighthouse CI integration
4. **Cross-browser Testing**: BrowserStack integration
5. **Load Testing**: Stress testing with large datasets

## Contributing to Tests

When adding new features:
1. Write tests first (TDD approach)
2. Ensure accessibility compliance
3. Test responsive behavior
4. Add integration test scenarios
5. Update this documentation

## Test Maintenance

- Review and update tests with feature changes
- Remove obsolete tests
- Refactor common test utilities
- Monitor coverage trends
- Update mock data to reflect real-world scenarios
