import { query } from '@/lib/db';
import DOMPurify from 'isomorphic-dompurify';

// Rate limiting configuration
const RATE_LIMITS = {
  PER_USER_PER_HOUR: 50,
  PER_USER_PER_DAY: 200,
  PER_ORGANIZATION_PER_HOUR: 500,
  PER_ORGANIZATION_PER_DAY: 2000,
  PER_IP_PER_HOUR: 100
};

// Email security interfaces
export interface RateLimitCheck {
  allowed: boolean;
  remaining: number;
  resetTime: Date;
  limitType: string;
}

export interface EmailSecurityConfig {
  enableRateLimit: boolean;
  enableHtmlSanitization: boolean;
  enableSpamFilter: boolean;
  enableUnsubscribeLinks: boolean;
  maxEmailSize: number; // in bytes
  allowedDomains?: string[];
  blockedDomains?: string[];
}

// Default security configuration
const DEFAULT_SECURITY_CONFIG: EmailSecurityConfig = {
  enableRateLimit: true,
  enableHtmlSanitization: true,
  enableSpamFilter: true,
  enableUnsubscribeLinks: true,
  maxEmailSize: 10 * 1024 * 1024, // 10MB
  allowedDomains: [],
  blockedDomains: []
};

// HTML sanitization
export function sanitizeHtmlContent(htmlContent: string): string {
  try {
    // Configure DOMPurify for email content
    const cleanHtml = DOMPurify.sanitize(htmlContent, {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 'a', 'img', 'table', 'thead', 'tbody', 'tr', 'td', 'th',
        'div', 'span', 'blockquote', 'pre', 'code'
      ],
      ALLOWED_ATTR: [
        'href', 'src', 'alt', 'title', 'width', 'height', 'style', 'class', 'id',
        'target', 'rel', 'border', 'cellpadding', 'cellspacing'
      ],
      ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
      ADD_ATTR: ['target'],
      FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input', 'button'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur']
    });

    return cleanHtml;
  } catch (error) {
    console.error('Error sanitizing HTML content:', error);
    // Return plain text if sanitization fails
    return htmlContent.replace(/<[^>]*>/g, '');
  }
}

// Rate limiting check
export async function checkRateLimit(
  userId?: number,
  organizationId?: number,
  ipAddress?: string
): Promise<RateLimitCheck> {
  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Check user rate limit
    if (userId) {
      const userHourlyResult = await query<{ count: number }>(
        'SELECT COUNT(*) as count FROM email_logs WHERE sent_by_id = $1 AND sent_at >= $2',
        [userId, oneHourAgo]
      );

      const userHourlyCount = parseInt(userHourlyResult.rows[0]?.count?.toString() || '0');
      if (userHourlyCount >= RATE_LIMITS.PER_USER_PER_HOUR) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: new Date(oneHourAgo.getTime() + 60 * 60 * 1000),
          limitType: 'user_hourly'
        };
      }

      const userDailyResult = await query<{ count: number }>(
        'SELECT COUNT(*) as count FROM email_logs WHERE sent_by_id = $1 AND sent_at >= $2',
        [userId, oneDayAgo]
      );

      const userDailyCount = parseInt(userDailyResult.rows[0]?.count?.toString() || '0');
      if (userDailyCount >= RATE_LIMITS.PER_USER_PER_DAY) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: new Date(oneDayAgo.getTime() + 24 * 60 * 60 * 1000),
          limitType: 'user_daily'
        };
      }
    }

    // Check organization rate limit
    if (organizationId) {
      const orgHourlyResult = await query<{ count: number }>(
        'SELECT COUNT(*) as count FROM email_logs WHERE organization_id = $1 AND sent_at >= $2',
        [organizationId, oneHourAgo]
      );

      const orgHourlyCount = parseInt(orgHourlyResult.rows[0]?.count?.toString() || '0');
      if (orgHourlyCount >= RATE_LIMITS.PER_ORGANIZATION_PER_HOUR) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: new Date(oneHourAgo.getTime() + 60 * 60 * 1000),
          limitType: 'organization_hourly'
        };
      }
    }

    // Check IP rate limit
    if (ipAddress) {
      const ipHourlyResult = await query<{ count: number }>(
        'SELECT COUNT(*) as count FROM email_logs el LEFT JOIN audit_logs al ON el.sent_by_id = al.user_id WHERE al.ip_address = $1 AND el.sent_at >= $2',
        [ipAddress, oneHourAgo]
      );

      const ipHourlyCount = parseInt(ipHourlyResult.rows[0]?.count?.toString() || '0');
      if (ipHourlyCount >= RATE_LIMITS.PER_IP_PER_HOUR) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: new Date(oneHourAgo.getTime() + 60 * 60 * 1000),
          limitType: 'ip_hourly'
        };
      }
    }

    // Calculate remaining quota
    const userHourlyRemaining = userId ? RATE_LIMITS.PER_USER_PER_HOUR - (userHourlyCount || 0) : RATE_LIMITS.PER_USER_PER_HOUR;
    
    return {
      allowed: true,
      remaining: userHourlyRemaining,
      resetTime: new Date(oneHourAgo.getTime() + 60 * 60 * 1000),
      limitType: 'user_hourly'
    };

  } catch (error) {
    console.error('Error checking rate limit:', error);
    // Allow by default if rate limit check fails
    return {
      allowed: true,
      remaining: RATE_LIMITS.PER_USER_PER_HOUR,
      resetTime: new Date(Date.now() + 60 * 60 * 1000),
      limitType: 'error'
    };
  }
}

// Email domain validation
export function validateEmailDomain(email: string, config: EmailSecurityConfig): { valid: boolean; reason?: string } {
  try {
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) {
      return { valid: false, reason: 'Invalid email format' };
    }

    // Check blocked domains
    if (config.blockedDomains && config.blockedDomains.includes(domain)) {
      return { valid: false, reason: 'Domain is blocked' };
    }

    // Check allowed domains (if specified)
    if (config.allowedDomains && config.allowedDomains.length > 0) {
      if (!config.allowedDomains.includes(domain)) {
        return { valid: false, reason: 'Domain is not in allowed list' };
      }
    }

    return { valid: true };
  } catch (error) {
    console.error('Error validating email domain:', error);
    return { valid: false, reason: 'Domain validation error' };
  }
}

// Spam filter (basic implementation)
export function checkSpamContent(subject: string, content: string): { isSpam: boolean; score: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 0;

  // Check for spam keywords
  const spamKeywords = [
    'free money', 'click here', 'act now', 'limited time', 'urgent',
    'congratulations', 'winner', 'prize', 'lottery', 'casino',
    'viagra', 'cialis', 'pharmacy', 'weight loss', 'diet pills'
  ];

  const combinedText = (subject + ' ' + content).toLowerCase();
  
  spamKeywords.forEach(keyword => {
    if (combinedText.includes(keyword)) {
      score += 10;
      reasons.push(`Contains spam keyword: ${keyword}`);
    }
  });

  // Check for excessive capitalization
  const capsRatio = (subject.match(/[A-Z]/g) || []).length / subject.length;
  if (capsRatio > 0.5 && subject.length > 10) {
    score += 15;
    reasons.push('Excessive capitalization in subject');
  }

  // Check for excessive exclamation marks
  const exclamationCount = (combinedText.match(/!/g) || []).length;
  if (exclamationCount > 3) {
    score += 10;
    reasons.push('Excessive exclamation marks');
  }

  // Check for suspicious URLs
  const urlPattern = /https?:\/\/[^\s]+/gi;
  const urls = combinedText.match(urlPattern) || [];
  if (urls.length > 5) {
    score += 20;
    reasons.push('Too many URLs');
  }

  return {
    isSpam: score >= 30,
    score,
    reasons
  };
}

// Add unsubscribe link to email content
export function addUnsubscribeLink(
  htmlContent: string,
  textContent: string,
  recipientEmail: string,
  organizationId?: number
): { html: string; text: string } {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mindtrack.com';
  const unsubscribeUrl = `${baseUrl}/unsubscribe?email=${encodeURIComponent(recipientEmail)}${organizationId ? `&org=${organizationId}` : ''}`;

  // Add to HTML content
  const unsubscribeHtml = `
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; text-align: center;">
      <p>You received this email because you are subscribed to MindTrack notifications.</p>
      <p><a href="${unsubscribeUrl}" style="color: #666;">Unsubscribe</a> | <a href="${baseUrl}/privacy" style="color: #666;">Privacy Policy</a></p>
    </div>
  `;

  let updatedHtml = htmlContent;
  if (htmlContent.includes('</body>')) {
    updatedHtml = htmlContent.replace('</body>', `${unsubscribeHtml}</body>`);
  } else {
    updatedHtml += unsubscribeHtml;
  }

  // Add to text content
  const unsubscribeText = `

---
You received this email because you are subscribed to MindTrack notifications.
To unsubscribe, visit: ${unsubscribeUrl}
Privacy Policy: ${baseUrl}/privacy`;

  const updatedText = textContent + unsubscribeText;

  return {
    html: updatedHtml,
    text: updatedText
  };
}

// Check if email is unsubscribed
export async function isEmailUnsubscribed(email: string, organizationId?: number): Promise<boolean> {
  try {
    let whereClause = 'WHERE email = $1';
    const params: any[] = [email.toLowerCase()];

    if (organizationId) {
      whereClause += ' AND (organization_id = $2 OR organization_id IS NULL)';
      params.push(organizationId);
    }

    const result = await query<{ id: number }>(
      `SELECT id FROM email_unsubscribes ${whereClause} LIMIT 1`,
      params
    );

    return result.rows.length > 0;
  } catch (error) {
    console.error('Error checking unsubscribe status:', error);
    return false;
  }
}

// Add email to unsubscribe list
export async function unsubscribeEmail(
  email: string,
  reason?: string,
  organizationId?: number,
  ipAddress?: string,
  userAgent?: string
): Promise<boolean> {
  try {
    await query(
      `INSERT INTO email_unsubscribes (email, reason, organization_id, ip_address, user_agent, unsubscribed_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (email) DO UPDATE SET
       reason = EXCLUDED.reason,
       unsubscribed_at = NOW()`,
      [email.toLowerCase(), reason, organizationId, ipAddress, userAgent]
    );

    return true;
  } catch (error) {
    console.error('Error unsubscribing email:', error);
    return false;
  }
}

// Validate email content size
export function validateEmailSize(htmlContent: string, textContent: string, maxSize: number): { valid: boolean; size: number; reason?: string } {
  const totalSize = Buffer.byteLength(htmlContent, 'utf8') + Buffer.byteLength(textContent, 'utf8');
  
  if (totalSize > maxSize) {
    return {
      valid: false,
      size: totalSize,
      reason: `Email content exceeds maximum size of ${Math.round(maxSize / 1024)}KB`
    };
  }

  return { valid: true, size: totalSize };
}

// Comprehensive email security check
export async function performSecurityCheck(
  emailData: {
    to: string;
    subject: string;
    html: string;
    text: string;
    userId?: number;
    organizationId?: number;
  },
  ipAddress?: string,
  config: EmailSecurityConfig = DEFAULT_SECURITY_CONFIG
): Promise<{
  allowed: boolean;
  sanitizedHtml?: string;
  sanitizedText?: string;
  errors: string[];
  warnings: string[];
}> {
  const errors: string[] = [];
  const warnings: string[] = [];
  let sanitizedHtml = emailData.html;
  let sanitizedText = emailData.text;

  try {
    // Check if email is unsubscribed
    if (await isEmailUnsubscribed(emailData.to, emailData.organizationId)) {
      errors.push('Recipient has unsubscribed from emails');
    }

    // Rate limiting check
    if (config.enableRateLimit) {
      const rateLimitResult = await checkRateLimit(emailData.userId, emailData.organizationId, ipAddress);
      if (!rateLimitResult.allowed) {
        errors.push(`Rate limit exceeded: ${rateLimitResult.limitType}`);
      } else if (rateLimitResult.remaining < 5) {
        warnings.push(`Approaching rate limit: ${rateLimitResult.remaining} emails remaining`);
      }
    }

    // Domain validation
    const domainValidation = validateEmailDomain(emailData.to, config);
    if (!domainValidation.valid) {
      errors.push(`Email domain validation failed: ${domainValidation.reason}`);
    }

    // HTML sanitization
    if (config.enableHtmlSanitization && emailData.html) {
      sanitizedHtml = sanitizeHtmlContent(emailData.html);
      if (sanitizedHtml !== emailData.html) {
        warnings.push('HTML content was sanitized for security');
      }
    }

    // Spam filter
    if (config.enableSpamFilter) {
      const spamCheck = checkSpamContent(emailData.subject, emailData.text);
      if (spamCheck.isSpam) {
        errors.push(`Content flagged as spam (score: ${spamCheck.score}): ${spamCheck.reasons.join(', ')}`);
      } else if (spamCheck.score > 15) {
        warnings.push(`Content has moderate spam score (${spamCheck.score}): ${spamCheck.reasons.join(', ')}`);
      }
    }

    // Size validation
    const sizeValidation = validateEmailSize(sanitizedHtml, sanitizedText, config.maxEmailSize);
    if (!sizeValidation.valid) {
      errors.push(sizeValidation.reason!);
    }

    // Add unsubscribe links
    if (config.enableUnsubscribeLinks) {
      const unsubscribeContent = addUnsubscribeLink(sanitizedHtml, sanitizedText, emailData.to, emailData.organizationId);
      sanitizedHtml = unsubscribeContent.html;
      sanitizedText = unsubscribeContent.text;
    }

    return {
      allowed: errors.length === 0,
      sanitizedHtml,
      sanitizedText,
      errors,
      warnings
    };

  } catch (error) {
    console.error('Error performing security check:', error);
    return {
      allowed: false,
      errors: ['Security check failed'],
      warnings: []
    };
  }
}
