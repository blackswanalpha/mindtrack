import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the main navigation', async ({ page }) => {
    // Check if the MindTrack logo is visible
    await expect(page.locator('h1:has-text("MindTrack")')).toBeVisible();
    
    // Check navigation buttons
    await expect(page.locator('a:has-text("Sign In")')).toBeVisible();
    await expect(page.locator('a:has-text("Get Started")')).toBeVisible();
  });

  test('should display the hero section', async ({ page }) => {
    // Check hero title
    await expect(page.locator('h1:has-text("Mental Health")')).toBeVisible();
    await expect(page.locator('span:has-text("Questionnaire Platform")')).toBeVisible();
    
    // Check hero description
    await expect(page.locator('text=Streamline mental health assessments')).toBeVisible();
    
    // Check CTA buttons
    await expect(page.locator('a:has-text("Start Free Trial")')).toBeVisible();
    await expect(page.locator('a:has-text("View Demo")')).toBeVisible();
  });

  test('should display trust indicators', async ({ page }) => {
    await expect(page.locator('text=No credit card required')).toBeVisible();
    await expect(page.locator('text=14-day free trial')).toBeVisible();
    await expect(page.locator('text=Cancel anytime')).toBeVisible();
  });

  test('should display dashboard preview', async ({ page }) => {
    // Check dashboard preview elements
    await expect(page.locator('text=Active Questionnaires')).toBeVisible();
    await expect(page.locator('text=Responses Today')).toBeVisible();
    await expect(page.locator('text=Completion Rate')).toBeVisible();
    await expect(page.locator('text=Recent Activity')).toBeVisible();
  });

  test('should display features section', async ({ page }) => {
    // Scroll to features section
    await page.locator('text=Powerful Features for Mental Health Professionals').scrollIntoViewIfNeeded();
    
    // Check feature cards
    await expect(page.locator('text=Smart Questionnaires')).toBeVisible();
    await expect(page.locator('text=QR Code Access')).toBeVisible();
    await expect(page.locator('text=AI-Powered Analysis')).toBeVisible();
    await expect(page.locator('text=Advanced Analytics')).toBeVisible();
    await expect(page.locator('text=Smart Notifications')).toBeVisible();
    await expect(page.locator('text=Team Collaboration')).toBeVisible();
  });

  test('should display statistics section', async ({ page }) => {
    // Scroll to statistics section
    await page.locator('text=Trusted by Healthcare Professionals Worldwide').scrollIntoViewIfNeeded();
    
    // Check statistics
    await expect(page.locator('text=Questionnaires Created')).toBeVisible();
    await expect(page.locator('text=Responses Collected')).toBeVisible();
    await expect(page.locator('text=Healthcare Organizations')).toBeVisible();
    await expect(page.locator('text=Uptime Reliability')).toBeVisible();
  });

  test('should display testimonials section', async ({ page }) => {
    // Scroll to testimonials section
    await page.locator('text=What Healthcare Professionals Say').scrollIntoViewIfNeeded();
    
    // Check testimonials
    await expect(page.locator('text=Dr. Sarah Mitchell')).toBeVisible();
    await expect(page.locator('text=Dr. Michael Johnson')).toBeVisible();
    await expect(page.locator('text=Dr. Emily Chen')).toBeVisible();
  });

  test('should have working navigation links', async ({ page }) => {
    // Test Sign In link
    await page.click('a:has-text("Sign In")');
    await expect(page).toHaveURL(/.*login/);
    
    // Go back to homepage
    await page.goto('/');
    
    // Test Get Started link
    await page.click('a:has-text("Get Started")');
    await expect(page).toHaveURL(/.*register/);
  });

  test('should have working CTA buttons', async ({ page }) => {
    // Test Start Free Trial button
    await page.click('a:has-text("Start Free Trial")');
    await expect(page).toHaveURL(/.*register/);
    
    // Go back to homepage
    await page.goto('/');
    
    // Test View Demo button
    await page.click('a:has-text("View Demo")');
    await expect(page).toHaveURL(/.*demo/);
  });

  test('should have smooth scrolling animations', async ({ page }) => {
    // Check if animated elements are present
    await expect(page.locator('.animate-in, [class*="animate"]')).toHaveCount({ min: 1 });
    
    // Test scroll progress indicator
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(500);
    
    // Scroll back to top
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
  });

  test('should be accessible', async ({ page }) => {
    // Check for proper heading hierarchy
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThan(0);
    
    // Check for alt text on images
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      const ariaLabel = await img.getAttribute('aria-label');
      
      // Images should have alt text or aria-label
      expect(alt !== null || ariaLabel !== null).toBeTruthy();
    }
    
    // Check for proper button labels
    const buttons = page.locator('button, a[role="button"]');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');
      
      // Buttons should have text or aria-label
      expect((text && text.trim().length > 0) || ariaLabel !== null).toBeTruthy();
    }
  });
});
