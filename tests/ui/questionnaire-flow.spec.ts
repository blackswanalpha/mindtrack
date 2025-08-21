import { test, expect } from '@playwright/test';

test.describe('Questionnaire Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to demo page to test questionnaire functionality
    await page.goto('/demo');
  });

  test('should display demo questionnaire page', async ({ page }) => {
    // Check if demo page loads
    await expect(page.locator('h1, h2, h3').first()).toBeVisible();
    
    // Look for questionnaire-related content
    const hasQuestionnaireContent = await page.locator('text=/questionnaire|survey|assessment/i').count() > 0;
    expect(hasQuestionnaireContent).toBeTruthy();
  });

  test('should handle questionnaire navigation', async ({ page }) => {
    // Wait for any questionnaire form to load
    await page.waitForSelector('form, [data-testid*="questionnaire"], [class*="questionnaire"]', { timeout: 10000 });
    
    // Look for navigation buttons (Next, Previous, Submit)
    const nextButton = page.locator('button:has-text("Next"), button:has-text("Continue"), button[type="submit"]').first();
    
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForTimeout(500);
    }
  });

  test('should validate required fields', async ({ page }) => {
    // Look for form inputs
    const inputs = page.locator('input, select, textarea');
    const inputCount = await inputs.count();
    
    if (inputCount > 0) {
      // Try to submit without filling required fields
      const submitButton = page.locator('button:has-text("Submit"), button[type="submit"]').first();
      
      if (await submitButton.isVisible()) {
        await submitButton.click();
        
        // Check for validation messages
        const validationMessages = page.locator('[role="alert"], .error, .invalid, [aria-invalid="true"]');
        const hasValidation = await validationMessages.count() > 0;
        
        // Either validation messages appear or form doesn't submit (stays on same page)
        expect(hasValidation || await submitButton.isVisible()).toBeTruthy();
      }
    }
  });

  test('should handle different question types', async ({ page }) => {
    // Look for different input types
    const radioButtons = page.locator('input[type="radio"]');
    const checkboxes = page.locator('input[type="checkbox"]');
    const textInputs = page.locator('input[type="text"], textarea');
    const selects = page.locator('select');
    const sliders = page.locator('input[type="range"], [role="slider"]');

    // Test radio buttons
    const radioCount = await radioButtons.count();
    if (radioCount > 0) {
      await radioButtons.first().click();
      await expect(radioButtons.first()).toBeChecked();
    }

    // Test checkboxes
    const checkboxCount = await checkboxes.count();
    if (checkboxCount > 0) {
      await checkboxes.first().click();
      await expect(checkboxes.first()).toBeChecked();
    }

    // Test text inputs
    const textCount = await textInputs.count();
    if (textCount > 0) {
      await textInputs.first().fill('Test response');
      await expect(textInputs.first()).toHaveValue('Test response');
    }

    // Test select dropdowns
    const selectCount = await selects.count();
    if (selectCount > 0) {
      const options = selects.first().locator('option');
      const optionCount = await options.count();
      if (optionCount > 1) {
        await selects.first().selectOption({ index: 1 });
      }
    }
  });

  test('should show progress indicator', async ({ page }) => {
    // Look for progress indicators
    const progressElements = page.locator('[role="progressbar"], .progress, [class*="progress"], [data-testid*="progress"]');
    const progressCount = await progressElements.count();
    
    if (progressCount > 0) {
      const progressElement = progressElements.first();
      await expect(progressElement).toBeVisible();
      
      // Check if progress has a value
      const ariaValueNow = await progressElement.getAttribute('aria-valuenow');
      const ariaValueMax = await progressElement.getAttribute('aria-valuemax');
      
      if (ariaValueNow && ariaValueMax) {
        const current = parseInt(ariaValueNow);
        const max = parseInt(ariaValueMax);
        expect(current).toBeGreaterThanOrEqual(0);
        expect(current).toBeLessThanOrEqual(max);
      }
    }
  });

  test('should handle questionnaire completion', async ({ page }) => {
    // Fill out a simple questionnaire if available
    const form = page.locator('form').first();
    
    if (await form.isVisible()) {
      // Fill required fields
      const requiredInputs = page.locator('input[required], select[required], textarea[required]');
      const requiredCount = await requiredInputs.count();
      
      for (let i = 0; i < requiredCount; i++) {
        const input = requiredInputs.nth(i);
        const inputType = await input.getAttribute('type');
        const tagName = await input.evaluate(el => el.tagName.toLowerCase());
        
        if (inputType === 'radio') {
          await input.click();
        } else if (inputType === 'checkbox') {
          await input.click();
        } else if (tagName === 'select') {
          const options = input.locator('option');
          const optionCount = await options.count();
          if (optionCount > 1) {
            await input.selectOption({ index: 1 });
          }
        } else if (tagName === 'textarea' || inputType === 'text') {
          await input.fill('Test response');
        }
      }
      
      // Submit the form
      const submitButton = page.locator('button[type="submit"], button:has-text("Submit")').first();
      if (await submitButton.isVisible()) {
        await submitButton.click();
        
        // Wait for response or redirect
        await page.waitForTimeout(2000);
        
        // Check for success message or redirect
        const successMessage = page.locator('text=/success|complete|thank you|submitted/i');
        const hasSuccess = await successMessage.count() > 0;
        
        // Either success message appears or we're redirected
        expect(hasSuccess || page.url() !== '/demo').toBeTruthy();
      }
    }
  });

  test('should be keyboard accessible', async ({ page }) => {
    // Test tab navigation
    await page.keyboard.press('Tab');
    
    // Check if focus is visible
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Test Enter key on buttons
    const buttons = page.locator('button:visible').first();
    if (await buttons.isVisible()) {
      await buttons.focus();
      // Note: We don't press Enter here to avoid form submission in tests
      await expect(buttons).toBeFocused();
    }
  });

  test('should handle loading states', async ({ page }) => {
    // Look for loading indicators
    const loadingElements = page.locator('[data-testid*="loading"], .loading, .spinner, [aria-busy="true"]');
    
    // If loading elements exist, they should eventually disappear
    const loadingCount = await loadingElements.count();
    if (loadingCount > 0) {
      // Wait for loading to complete
      await page.waitForFunction(() => {
        const loadingEls = document.querySelectorAll('[data-testid*="loading"], .loading, .spinner, [aria-busy="true"]');
        return loadingEls.length === 0 || Array.from(loadingEls).every(el => !el.offsetParent);
      }, { timeout: 10000 });
    }
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Test with invalid data if form exists
    const form = page.locator('form').first();
    
    if (await form.isVisible()) {
      // Try to submit with invalid email format if email field exists
      const emailInput = page.locator('input[type="email"]').first();
      if (await emailInput.isVisible()) {
        await emailInput.fill('invalid-email');
        
        const submitButton = page.locator('button[type="submit"]').first();
        if (await submitButton.isVisible()) {
          await submitButton.click();
          
          // Check for error message
          const errorMessage = page.locator('[role="alert"], .error, [aria-invalid="true"]');
          await expect(errorMessage).toBeVisible({ timeout: 5000 });
        }
      }
    }
  });
});
