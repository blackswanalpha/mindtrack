import { test, expect, devices } from '@playwright/test';

const viewports = [
  { name: 'Mobile Portrait', width: 375, height: 667 },
  { name: 'Mobile Landscape', width: 667, height: 375 },
  { name: 'Tablet Portrait', width: 768, height: 1024 },
  { name: 'Tablet Landscape', width: 1024, height: 768 },
  { name: 'Desktop Small', width: 1280, height: 720 },
  { name: 'Desktop Large', width: 1920, height: 1080 },
];

test.describe('Responsive Design Tests', () => {
  viewports.forEach(({ name, width, height }) => {
    test.describe(`${name} (${width}x${height})`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width, height });
        await page.goto('/');
      });

      test('should display navigation properly', async ({ page }) => {
        // Check if MindTrack logo is visible
        await expect(page.locator('h1:has-text("MindTrack")')).toBeVisible();
        
        // On mobile, navigation might be collapsed
        if (width < 768) {
          // Look for mobile menu button or collapsed navigation
          const mobileMenu = page.locator('button[aria-label*="menu"], button[aria-expanded], .hamburger, [data-testid*="menu"]');
          const mobileMenuCount = await mobileMenu.count();
          
          if (mobileMenuCount > 0) {
            // Mobile menu exists
            await expect(mobileMenu.first()).toBeVisible();
          } else {
            // Navigation items should still be accessible
            await expect(page.locator('a:has-text("Sign In"), a:has-text("Get Started")')).toHaveCount({ min: 1 });
          }
        } else {
          // Desktop navigation should show all items
          await expect(page.locator('a:has-text("Sign In")')).toBeVisible();
          await expect(page.locator('a:has-text("Get Started")')).toBeVisible();
        }
      });

      test('should display hero section responsively', async ({ page }) => {
        // Hero title should be visible and readable
        const heroTitle = page.locator('h1:has-text("Mental Health")');
        await expect(heroTitle).toBeVisible();
        
        // Check if text is not cut off
        const titleBox = await heroTitle.boundingBox();
        expect(titleBox).toBeTruthy();
        expect(titleBox!.width).toBeGreaterThan(0);
        expect(titleBox!.height).toBeGreaterThan(0);
        
        // CTA buttons should be visible and properly sized
        const ctaButtons = page.locator('a:has-text("Start Free Trial"), a:has-text("View Demo")');
        await expect(ctaButtons.first()).toBeVisible();
        
        // Check button sizing
        const buttonBox = await ctaButtons.first().boundingBox();
        expect(buttonBox).toBeTruthy();
        expect(buttonBox!.width).toBeGreaterThan(100); // Minimum touch target size
        expect(buttonBox!.height).toBeGreaterThan(40);
      });

      test('should display dashboard preview appropriately', async ({ page }) => {
        // Dashboard preview should be visible
        const dashboardPreview = page.locator('text=Active Questionnaires').first();
        await expect(dashboardPreview).toBeVisible();
        
        // On mobile, cards might stack vertically
        const statsCards = page.locator('text=Active Questionnaires, text=Responses Today, text=Completion Rate');
        const cardCount = await statsCards.count();
        expect(cardCount).toBeGreaterThan(0);
        
        // Check if cards are properly sized
        for (let i = 0; i < Math.min(cardCount, 3); i++) {
          const card = statsCards.nth(i);
          const cardBox = await card.boundingBox();
          expect(cardBox).toBeTruthy();
          expect(cardBox!.width).toBeGreaterThan(0);
        }
      });

      test('should display features section in grid layout', async ({ page }) => {
        // Scroll to features section
        await page.locator('text=Powerful Features for Mental Health Professionals').scrollIntoViewIfNeeded();
        
        // Feature cards should be visible
        const featureCards = page.locator('text=Smart Questionnaires, text=QR Code Access, text=AI-Powered Analysis');
        const cardCount = await featureCards.count();
        expect(cardCount).toBeGreaterThan(0);
        
        // Check grid layout responsiveness
        for (let i = 0; i < Math.min(cardCount, 3); i++) {
          const card = featureCards.nth(i);
          await expect(card).toBeVisible();
          
          const cardBox = await card.boundingBox();
          expect(cardBox).toBeTruthy();
          
          // Cards should not be too narrow
          expect(cardBox!.width).toBeGreaterThan(200);
        }
      });

      test('should handle text scaling properly', async ({ page }) => {
        // Check if text is readable at different sizes
        const headings = page.locator('h1, h2, h3');
        const headingCount = await headings.count();
        
        for (let i = 0; i < Math.min(headingCount, 5); i++) {
          const heading = headings.nth(i);
          if (await heading.isVisible()) {
            const headingBox = await heading.boundingBox();
            expect(headingBox).toBeTruthy();
            expect(headingBox!.height).toBeGreaterThan(20); // Minimum readable height
          }
        }
        
        // Check paragraph text
        const paragraphs = page.locator('p');
        const paragraphCount = await paragraphs.count();
        
        for (let i = 0; i < Math.min(paragraphCount, 3); i++) {
          const paragraph = paragraphs.nth(i);
          if (await paragraph.isVisible()) {
            const paragraphBox = await paragraph.boundingBox();
            expect(paragraphBox).toBeTruthy();
            expect(paragraphBox!.height).toBeGreaterThan(16); // Minimum readable height
          }
        }
      });

      test('should have proper touch targets on mobile', async ({ page }) => {
        if (width < 768) {
          // Check button sizes for touch accessibility
          const buttons = page.locator('button, a[role="button"], a:has-text("Sign In"), a:has-text("Get Started")');
          const buttonCount = await buttons.count();
          
          for (let i = 0; i < Math.min(buttonCount, 5); i++) {
            const button = buttons.nth(i);
            if (await button.isVisible()) {
              const buttonBox = await button.boundingBox();
              expect(buttonBox).toBeTruthy();
              
              // Touch targets should be at least 44x44px
              expect(buttonBox!.width).toBeGreaterThan(40);
              expect(buttonBox!.height).toBeGreaterThan(40);
            }
          }
        }
      });

      test('should handle horizontal scrolling', async ({ page }) => {
        // Check if page content fits within viewport width
        const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
        const viewportWidth = width;
        
        // Allow for small differences due to scrollbars
        expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 20);
        
        // Check specific wide elements
        const wideElements = page.locator('img, video, canvas, table');
        const wideElementCount = await wideElements.count();
        
        for (let i = 0; i < Math.min(wideElementCount, 5); i++) {
          const element = wideElements.nth(i);
          if (await element.isVisible()) {
            const elementBox = await element.boundingBox();
            expect(elementBox).toBeTruthy();
            
            // Elements should not cause horizontal overflow
            expect(elementBox!.width).toBeLessThanOrEqual(viewportWidth);
          }
        }
      });

      test('should display statistics section responsively', async ({ page }) => {
        // Scroll to statistics section
        await page.locator('text=Trusted by Healthcare Professionals Worldwide').scrollIntoViewIfNeeded();
        
        // Statistics should be visible
        const stats = page.locator('text=Questionnaires Created, text=Responses Collected, text=Healthcare Organizations');
        const statCount = await stats.count();
        expect(statCount).toBeGreaterThan(0);
        
        // Check if statistics are properly laid out
        for (let i = 0; i < Math.min(statCount, 4); i++) {
          const stat = stats.nth(i);
          if (await stat.isVisible()) {
            const statBox = await stat.boundingBox();
            expect(statBox).toBeTruthy();
            expect(statBox!.width).toBeGreaterThan(0);
          }
        }
      });

      test('should handle form elements responsively', async ({ page }) => {
        // Navigate to a page with forms (demo page)
        await page.goto('/demo');
        
        // Check if form elements are properly sized
        const inputs = page.locator('input, select, textarea, button');
        const inputCount = await inputs.count();
        
        for (let i = 0; i < Math.min(inputCount, 5); i++) {
          const input = inputs.nth(i);
          if (await input.isVisible()) {
            const inputBox = await input.boundingBox();
            expect(inputBox).toBeTruthy();
            
            // Form elements should be properly sized
            expect(inputBox!.width).toBeGreaterThan(50);
            expect(inputBox!.height).toBeGreaterThan(30);
            
            // On mobile, form elements should be large enough for touch
            if (width < 768) {
              expect(inputBox!.height).toBeGreaterThan(40);
            }
          }
        }
      });

      test('should maintain proper spacing and margins', async ({ page }) => {
        // Check if sections have proper spacing
        const sections = page.locator('section, main, article');
        const sectionCount = await sections.count();
        
        for (let i = 0; i < Math.min(sectionCount, 3); i++) {
          const section = sections.nth(i);
          if (await section.isVisible()) {
            const sectionBox = await section.boundingBox();
            expect(sectionBox).toBeTruthy();
            
            // Sections should have reasonable width
            expect(sectionBox!.width).toBeGreaterThan(width * 0.8);
            expect(sectionBox!.width).toBeLessThanOrEqual(width);
          }
        }
      });
    });
  });

  test.describe('Cross-device consistency', () => {
    test('should maintain brand consistency across devices', async ({ page }) => {
      const testViewports = [
        { width: 375, height: 667 }, // Mobile
        { width: 1280, height: 720 }, // Desktop
      ];

      for (const viewport of testViewports) {
        await page.setViewportSize(viewport);
        await page.goto('/');

        // Brand elements should be consistent
        await expect(page.locator('h1:has-text("MindTrack")')).toBeVisible();
        
        // Color scheme should be consistent (check for primary brand colors)
        const brandElement = page.locator('h1:has-text("MindTrack")').first();
        const styles = await brandElement.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            color: computed.color,
            fontFamily: computed.fontFamily,
          };
        });
        
        expect(styles.color).toBeTruthy();
        expect(styles.fontFamily).toBeTruthy();
      }
    });
  });
});
