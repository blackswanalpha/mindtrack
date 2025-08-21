import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { 
  sendEmail, 
  sendTemplateEmail, 
  substituteVariables, 
  validateTemplateVariables,
  addEmailTracking,
  defaultEmailTemplates,
  EMAIL_TEMPLATE_TYPES
} from '../lib/email-service';
import { 
  sanitizeHtmlContent, 
  checkRateLimit, 
  validateEmailDomain, 
  checkSpamContent,
  addUnsubscribeLink,
  performSecurityCheck
} from '../lib/email-security';

// Mock the database query function
jest.mock('../lib/db', () => ({
  query: jest.fn()
}));

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransporter: jest.fn(() => ({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' }),
    verify: jest.fn().mockResolvedValue(true)
  }))
}));

describe('Email Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Template Variable Substitution', () => {
    it('should substitute simple variables', () => {
      const template = 'Hello {{name}}, welcome to {{organization}}!';
      const variables = { name: 'John', organization: 'MindTrack' };
      const result = substituteVariables(template, variables);
      expect(result).toBe('Hello John, welcome to MindTrack!');
    });

    it('should handle conditional blocks', () => {
      const template = 'Hello {{name}}{{#if message}}, {{message}}{{/if}}!';
      const variables = { name: 'John', message: 'welcome' };
      const result = substituteVariables(template, variables);
      expect(result).toBe('Hello John, welcome!');
    });

    it('should remove conditional blocks when condition is false', () => {
      const template = 'Hello {{name}}{{#if message}}, {{message}}{{/if}}!';
      const variables = { name: 'John' };
      const result = substituteVariables(template, variables);
      expect(result).toBe('Hello John!');
    });

    it('should leave unmatched variables unchanged', () => {
      const template = 'Hello {{name}}, {{unknown}} variable';
      const variables = { name: 'John' };
      const result = substituteVariables(template, variables);
      expect(result).toBe('Hello John, {{unknown}} variable');
    });
  });

  describe('Template Variable Validation', () => {
    const templateVariables = {
      name: { description: 'User name', required: true, type: 'string' as const },
      age: { description: 'User age', required: false, type: 'number' as const },
      email: { description: 'User email', required: true, type: 'string' as const },
      website: { description: 'User website', required: false, type: 'url' as const }
    };

    it('should validate required variables', () => {
      const variables = { name: 'John' }; // missing required email
      const result = validateTemplateVariables(templateVariables, variables);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Required variable 'email' is missing");
    });

    it('should validate variable types', () => {
      const variables = { 
        name: 'John', 
        email: 'john@example.com', 
        age: 'not-a-number',
        website: 'not-a-url'
      };
      const result = validateTemplateVariables(templateVariables, variables);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Variable 'age' must be a number");
      expect(result.errors).toContain("Variable 'website' must be a valid URL");
    });

    it('should pass validation with correct variables', () => {
      const variables = { 
        name: 'John', 
        email: 'john@example.com', 
        age: 25,
        website: 'https://example.com'
      };
      const result = validateTemplateVariables(templateVariables, variables);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Email Tracking', () => {
    it('should add tracking pixel to HTML content', () => {
      const html = '<html><body><h1>Test</h1></body></html>';
      const result = addEmailTracking(html, 123);
      expect(result).toContain('src="https://mindtrack.com/api/email/track?id=123&event=opened"');
      expect(result).toContain('width="1" height="1"');
    });

    it('should add tracking to links', () => {
      const html = '<a href="https://example.com">Click here</a>';
      const result = addEmailTracking(html, 123);
      expect(result).toContain('/api/email/track/click?id=123&url=');
      expect(result).toContain('data-original-url="https://example.com"');
    });

    it('should not track anchor links or mailto links', () => {
      const html = '<a href="#section">Anchor</a><a href="mailto:test@example.com">Email</a>';
      const result = addEmailTracking(html, 123);
      expect(result).toContain('href="#section"');
      expect(result).toContain('href="mailto:test@example.com"');
      expect(result).not.toContain('/api/email/track/click');
    });
  });

  describe('Default Email Templates', () => {
    it('should have all required template types', () => {
      const requiredTypes = [
        EMAIL_TEMPLATE_TYPES.WELCOME,
        EMAIL_TEMPLATE_TYPES.EMAIL_VERIFICATION,
        EMAIL_TEMPLATE_TYPES.PASSWORD_RESET,
        EMAIL_TEMPLATE_TYPES.ASSESSMENT_RESULTS,
        EMAIL_TEMPLATE_TYPES.ORGANIZATION_INVITATION
      ];

      requiredTypes.forEach(type => {
        const template = Object.values(defaultEmailTemplates).find(t => t.type === type);
        expect(template).toBeDefined();
        expect(template?.name).toBeTruthy();
        expect(template?.subject).toBeTruthy();
        expect(template?.html_content).toBeTruthy();
        expect(template?.text_content).toBeTruthy();
      });
    });

    it('should have valid variable definitions', () => {
      Object.values(defaultEmailTemplates).forEach(template => {
        expect(template.variables).toBeDefined();
        expect(typeof template.variables).toBe('object');
        
        Object.entries(template.variables).forEach(([key, config]) => {
          expect(config.description).toBeTruthy();
          expect(config.required).toBeDefined();
          expect(['string', 'number', 'date', 'boolean', 'url']).toContain(config.type);
        });
      });
    });
  });
});

describe('Email Security', () => {
  describe('HTML Sanitization', () => {
    it('should remove script tags', () => {
      const html = '<p>Hello</p><script>alert("xss")</script>';
      const result = sanitizeHtmlContent(html);
      expect(result).toBe('<p>Hello</p>');
    });

    it('should remove dangerous attributes', () => {
      const html = '<p onclick="alert(\'xss\')">Hello</p>';
      const result = sanitizeHtmlContent(html);
      expect(result).toBe('<p>Hello</p>');
    });

    it('should preserve safe HTML', () => {
      const html = '<p><strong>Hello</strong> <a href="https://example.com">world</a></p>';
      const result = sanitizeHtmlContent(html);
      expect(result).toContain('<strong>Hello</strong>');
      expect(result).toContain('<a href="https://example.com">world</a>');
    });
  });

  describe('Spam Detection', () => {
    it('should detect spam keywords', () => {
      const result = checkSpamContent('FREE MONEY NOW!', 'Click here to win a prize!');
      expect(result.isSpam).toBe(true);
      expect(result.score).toBeGreaterThan(30);
      expect(result.reasons).toContain('Contains spam keyword: free money');
    });

    it('should detect excessive capitalization', () => {
      const result = checkSpamContent('URGENT ACTION REQUIRED', 'Normal content');
      expect(result.score).toBeGreaterThan(0);
      expect(result.reasons).toContain('Excessive capitalization in subject');
    });

    it('should allow normal content', () => {
      const result = checkSpamContent('Welcome to MindTrack', 'Thank you for signing up!');
      expect(result.isSpam).toBe(false);
      expect(result.score).toBeLessThan(30);
    });
  });

  describe('Email Domain Validation', () => {
    it('should validate allowed domains', () => {
      const config = { 
        enableRateLimit: true,
        enableHtmlSanitization: true,
        enableSpamFilter: true,
        enableUnsubscribeLinks: true,
        maxEmailSize: 1024,
        allowedDomains: ['example.com', 'test.com']
      };
      
      const validResult = validateEmailDomain('user@example.com', config);
      expect(validResult.valid).toBe(true);
      
      const invalidResult = validateEmailDomain('user@blocked.com', config);
      expect(invalidResult.valid).toBe(false);
    });

    it('should block blocked domains', () => {
      const config = { 
        enableRateLimit: true,
        enableHtmlSanitization: true,
        enableSpamFilter: true,
        enableUnsubscribeLinks: true,
        maxEmailSize: 1024,
        blockedDomains: ['spam.com', 'blocked.com']
      };
      
      const result = validateEmailDomain('user@spam.com', config);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Domain is blocked');
    });
  });

  describe('Unsubscribe Links', () => {
    it('should add unsubscribe link to HTML', () => {
      const html = '<p>Hello world</p>';
      const text = 'Hello world';
      const result = addUnsubscribeLink(html, text, 'user@example.com', 123);
      
      expect(result.html).toContain('unsubscribe');
      expect(result.html).toContain('user%40example.com');
      expect(result.html).toContain('org=123');
      expect(result.text).toContain('unsubscribe');
    });

    it('should handle HTML with body tag', () => {
      const html = '<html><body><p>Hello</p></body></html>';
      const text = 'Hello';
      const result = addUnsubscribeLink(html, text, 'user@example.com');
      
      expect(result.html).toContain('</body>');
      expect(result.html.indexOf('unsubscribe')).toBeLessThan(result.html.indexOf('</body>'));
    });
  });
});

describe('Email Integration Tests', () => {
  it('should perform comprehensive security check', async () => {
    const emailData = {
      to: 'user@example.com',
      subject: 'Test Email',
      html: '<p>Hello <script>alert("xss")</script></p>',
      text: 'Hello world',
      userId: 1,
      organizationId: 1
    };

    const result = await performSecurityCheck(emailData);
    
    expect(result.sanitizedHtml).not.toContain('<script>');
    expect(result.sanitizedHtml).toContain('unsubscribe');
    expect(result.warnings).toBeDefined();
  });
});
