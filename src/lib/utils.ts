import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format date utilities
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const targetDate = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000)
  
  if (diffInSeconds < 60) {
    return 'just now'
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
  }
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
  }
  
  return formatDate(date)
}

// String utilities
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Number utilities
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num)
}

export function formatPercentage(num: number, decimals: number = 1): string {
  return `${(num * 100).toFixed(decimals)}%`
}

// Validation utilities
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/
  return phoneRegex.test(phone)
}

// Array utilities
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const group = String(item[key])
    groups[group] = groups[group] || []
    groups[group].push(item)
    return groups
  }, {} as Record<string, T[]>)
}

export function sortBy<T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1
    if (aVal > bVal) return direction === 'asc' ? 1 : -1
    return 0
  })
}

// Local storage utilities (client-side only)
export function getFromStorage(key: string): string | null {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export function setToStorage(key: string, value: string): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, value)
  } catch {
    // Handle storage errors silently
  }
}

export function removeFromStorage(key: string): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(key)
  } catch {
    // Handle storage errors silently
  }
}

// Questionnaire utility functions
export const questionnaireUtils = {
  // Calculate GAD-7 score
  calculateGAD7Score: (responses: Record<number, string>): number => {
    const scoreMapping = {
      'Not at all': 0,
      'Several days': 1,
      'More than half the days': 2,
      'Nearly every day': 3
    };

    let totalScore = 0;
    for (let i = 1; i <= 7; i++) {
      const response = responses[i];
      if (response && scoreMapping[response as keyof typeof scoreMapping] !== undefined) {
        totalScore += scoreMapping[response as keyof typeof scoreMapping];
      }
    }
    return totalScore;
  },

  // Calculate PHQ-9 score
  calculatePHQ9Score: (responses: Record<number, string>): number => {
    const scoreMapping = {
      'Not at all': 0,
      'Several days': 1,
      'More than half the days': 2,
      'Nearly every day': 3
    };

    let totalScore = 0;
    for (let i = 1; i <= 9; i++) {
      const response = responses[i];
      if (response && scoreMapping[response as keyof typeof scoreMapping] !== undefined) {
        totalScore += scoreMapping[response as keyof typeof scoreMapping];
      }
    }
    return totalScore;
  },

  // Determine risk level based on score and questionnaire type
  determineRiskLevel: (score: number, questionnaireType: string): string => {
    switch (questionnaireType.toLowerCase()) {
      case 'gad-7':
      case 'gad7':
        if (score >= 15) return 'severe';
        if (score >= 10) return 'moderate';
        if (score >= 5) return 'mild';
        return 'minimal';

      case 'phq-9':
      case 'phq9':
        if (score >= 20) return 'severe';
        if (score >= 15) return 'moderately_severe';
        if (score >= 10) return 'moderate';
        if (score >= 5) return 'mild';
        return 'minimal';

      default:
        // Generic scoring
        const percentage = (score / 21) * 100; // Assuming max score of 21
        if (percentage >= 75) return 'severe';
        if (percentage >= 50) return 'moderate';
        if (percentage >= 25) return 'mild';
        return 'minimal';
    }
  },

  // Validate questionnaire responses
  validateResponses: (questions: any[], responses: Record<number, any>): { isValid: boolean; errors: Record<number, string> } => {
    const errors: Record<number, string> = {};
    let isValid = true;

    questions.forEach(question => {
      const value = responses[question.id];

      if (question.required) {
        if (value === undefined || value === null || value === '') {
          errors[question.id] = 'This question is required';
          isValid = false;
        } else if (question.type === 'multiple_choice' && Array.isArray(value) && value.length === 0) {
          errors[question.id] = 'Please select at least one option';
          isValid = false;
        }
      }
    });

    return { isValid, errors };
  },

  // Format completion time
  formatCompletionTime: (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds} seconds`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (remainingSeconds === 0) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    return `${minutes}m ${remainingSeconds}s`;
  },

  // Generate questionnaire URL
  generateQuestionnaireUrl: (questionnaireId: number, baseUrl?: string): string => {
    const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://mindtrack.app');
    return `${base}/questionnaire/${questionnaireId}`;
  },

  // Save draft to localStorage
  saveDraft: (questionnaireId: number, responses: Record<number, any>): void => {
    try {
      setToStorage(`questionnaire_draft_${questionnaireId}`, JSON.stringify({
        responses,
        savedAt: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  },

  // Load draft from localStorage
  loadDraft: (questionnaireId: number): Record<number, any> | null => {
    try {
      const saved = getFromStorage(`questionnaire_draft_${questionnaireId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.responses || {};
      }
    } catch (error) {
      console.error('Failed to load draft:', error);
    }
    return null;
  },

  // Clear draft from localStorage
  clearDraft: (questionnaireId: number): void => {
    try {
      removeFromStorage(`questionnaire_draft_${questionnaireId}`);
    } catch (error) {
      console.error('Failed to clear draft:', error);
    }
  },

  // Check if draft exists
  hasDraft: (questionnaireId: number): boolean => {
    try {
      return getFromStorage(`questionnaire_draft_${questionnaireId}`) !== null;
    } catch (error) {
      return false;
    }
  }
};
