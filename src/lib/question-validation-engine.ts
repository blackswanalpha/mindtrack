import { Question, ValidationRules, QuestionType } from '@/types/database';

/**
 * Question Validation Engine for MindTrack
 * Handles validation for all question types with comprehensive rules
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export class QuestionValidationEngine {
  /**
   * Validate an answer against question validation rules
   */
  static validateAnswer(question: Question, value: any): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    // Skip validation if question is not required and value is empty
    if (!question.required && this.isEmpty(value)) {
      return result;
    }

    // Required field validation
    if (question.required && this.isEmpty(value)) {
      result.errors.push(question.error_message || 'This field is required');
      result.isValid = false;
      return result;
    }

    // Type-specific validation
    const typeValidation = this.validateByType(question.type, value, question.validation_rules);
    if (!typeValidation.isValid) {
      result.errors.push(...typeValidation.errors);
      result.isValid = false;
    }

    // Custom validation rules
    if (question.validation_rules) {
      const rulesValidation = this.validateRules(value, question.validation_rules);
      if (!rulesValidation.isValid) {
        result.errors.push(...rulesValidation.errors);
        result.isValid = false;
      }
      if (rulesValidation.warnings) {
        result.warnings?.push(...rulesValidation.warnings);
      }
    }

    return result;
  }

  /**
   * Validate value based on question type
   */
  private static validateByType(type: QuestionType, value: any, rules?: ValidationRules): ValidationResult {
    const result: ValidationResult = { isValid: true, errors: [] };

    switch (type) {
      case 'text':
      case 'textarea':
        return this.validateText(value, rules);
      
      case 'rich_text':
        return this.validateRichText(value, rules);
      
      case 'number':
      case 'decimal':
        return this.validateNumber(value, rules, type === 'decimal');
      
      case 'date':
        return this.validateDate(value, rules);
      
      case 'time':
        return this.validateTime(value, rules);
      
      case 'datetime':
        return this.validateDateTime(value, rules);
      
      case 'multiple_choice':
        return this.validateMultipleChoice(value, rules);
      
      case 'single_choice':
      case 'dropdown':
        return this.validateSingleChoice(value, rules);
      
      case 'rating':
      case 'likert':
      case 'star_rating':
        return this.validateRating(value, rules);
      
      case 'boolean':
        return this.validateBoolean(value);
      
      case 'file_upload':
      case 'image_upload':
        return this.validateFile(value, rules, type === 'image_upload');
      
      case 'country':
      case 'state':
      case 'city':
        return this.validateGeographic(value, rules);
      
      default:
        return result;
    }
  }

  /**
   * Text validation
   */
  private static validateText(value: any, rules?: ValidationRules): ValidationResult {
    const result: ValidationResult = { isValid: true, errors: [] };
    
    if (typeof value !== 'string') {
      result.errors.push('Value must be text');
      result.isValid = false;
      return result;
    }

    if (rules?.min_length && value.length < rules.min_length) {
      result.errors.push(`Text must be at least ${rules.min_length} characters long`);
      result.isValid = false;
    }

    if (rules?.max_length && value.length > rules.max_length) {
      result.errors.push(`Text must not exceed ${rules.max_length} characters`);
      result.isValid = false;
    }

    if (rules?.pattern) {
      const regex = new RegExp(rules.pattern);
      if (!regex.test(value)) {
        result.errors.push('Text format is invalid');
        result.isValid = false;
      }
    }

    return result;
  }

  /**
   * Rich text validation
   */
  private static validateRichText(value: any, rules?: ValidationRules): ValidationResult {
    const result: ValidationResult = { isValid: true, errors: [] };
    
    if (typeof value !== 'string') {
      result.errors.push('Value must be text');
      result.isValid = false;
      return result;
    }

    // Strip HTML tags for length validation
    const textContent = value.replace(/<[^>]*>/g, '');
    
    if (rules?.min_length && textContent.length < rules.min_length) {
      result.errors.push(`Content must be at least ${rules.min_length} characters long`);
      result.isValid = false;
    }

    if (rules?.max_length && textContent.length > rules.max_length) {
      result.errors.push(`Content must not exceed ${rules.max_length} characters`);
      result.isValid = false;
    }

    return result;
  }

  /**
   * Number validation
   */
  private static validateNumber(value: any, rules?: ValidationRules, allowDecimals = false): ValidationResult {
    const result: ValidationResult = { isValid: true, errors: [] };
    
    const numValue = typeof value === 'number' ? value : parseFloat(value);
    
    if (isNaN(numValue)) {
      result.errors.push('Value must be a valid number');
      result.isValid = false;
      return result;
    }

    if (!allowDecimals && numValue % 1 !== 0) {
      result.errors.push('Value must be a whole number');
      result.isValid = false;
    }

    if (rules?.min_value !== undefined && numValue < rules.min_value) {
      result.errors.push(`Value must be at least ${rules.min_value}`);
      result.isValid = false;
    }

    if (rules?.max_value !== undefined && numValue > rules.max_value) {
      result.errors.push(`Value must not exceed ${rules.max_value}`);
      result.isValid = false;
    }

    if (allowDecimals && rules?.decimal_places !== undefined) {
      const decimalPlaces = (numValue.toString().split('.')[1] || '').length;
      if (decimalPlaces > rules.decimal_places) {
        result.errors.push(`Value must have at most ${rules.decimal_places} decimal places`);
        result.isValid = false;
      }
    }

    return result;
  }

  /**
   * Date validation
   */
  private static validateDate(value: any, rules?: ValidationRules): ValidationResult {
    const result: ValidationResult = { isValid: true, errors: [] };
    
    const date = new Date(value);
    
    if (isNaN(date.getTime())) {
      result.errors.push('Value must be a valid date');
      result.isValid = false;
      return result;
    }

    if (rules?.min_date) {
      const minDate = new Date(rules.min_date);
      if (date < minDate) {
        result.errors.push(`Date must be after ${minDate.toLocaleDateString()}`);
        result.isValid = false;
      }
    }

    if (rules?.max_date) {
      const maxDate = new Date(rules.max_date);
      if (date > maxDate) {
        result.errors.push(`Date must be before ${maxDate.toLocaleDateString()}`);
        result.isValid = false;
      }
    }

    return result;
  }

  /**
   * Time validation
   */
  private static validateTime(value: any, rules?: ValidationRules): ValidationResult {
    const result: ValidationResult = { isValid: true, errors: [] };
    
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    
    if (!timeRegex.test(value)) {
      result.errors.push('Value must be a valid time (HH:MM)');
      result.isValid = false;
    }

    return result;
  }

  /**
   * DateTime validation
   */
  private static validateDateTime(value: any, rules?: ValidationRules): ValidationResult {
    return this.validateDate(value, rules);
  }

  /**
   * Multiple choice validation
   */
  private static validateMultipleChoice(value: any, rules?: ValidationRules): ValidationResult {
    const result: ValidationResult = { isValid: true, errors: [] };
    
    if (!Array.isArray(value)) {
      result.errors.push('Value must be an array of selections');
      result.isValid = false;
      return result;
    }

    if (rules?.min_selections && value.length < rules.min_selections) {
      result.errors.push(`Please select at least ${rules.min_selections} option(s)`);
      result.isValid = false;
    }

    if (rules?.max_selections && value.length > rules.max_selections) {
      result.errors.push(`Please select at most ${rules.max_selections} option(s)`);
      result.isValid = false;
    }

    return result;
  }

  /**
   * Single choice validation
   */
  private static validateSingleChoice(value: any, rules?: ValidationRules): ValidationResult {
    const result: ValidationResult = { isValid: true, errors: [] };
    
    if (value === null || value === undefined || value === '') {
      result.errors.push('Please select an option');
      result.isValid = false;
    }

    return result;
  }

  /**
   * Rating validation
   */
  private static validateRating(value: any, rules?: ValidationRules): ValidationResult {
    const result: ValidationResult = { isValid: true, errors: [] };
    
    const numValue = typeof value === 'number' ? value : parseFloat(value);
    
    if (isNaN(numValue)) {
      result.errors.push('Please provide a rating');
      result.isValid = false;
      return result;
    }

    if (rules?.min_value !== undefined && numValue < rules.min_value) {
      result.errors.push(`Rating must be at least ${rules.min_value}`);
      result.isValid = false;
    }

    if (rules?.max_value !== undefined && numValue > rules.max_value) {
      result.errors.push(`Rating must not exceed ${rules.max_value}`);
      result.isValid = false;
    }

    return result;
  }

  /**
   * Boolean validation
   */
  private static validateBoolean(value: any): ValidationResult {
    const result: ValidationResult = { isValid: true, errors: [] };
    
    if (typeof value !== 'boolean' && value !== 'true' && value !== 'false') {
      result.errors.push('Please select an option');
      result.isValid = false;
    }

    return result;
  }

  /**
   * File validation
   */
  private static validateFile(value: any, rules?: ValidationRules, imageOnly = false): ValidationResult {
    const result: ValidationResult = { isValid: true, errors: [] };
    
    if (!value || (Array.isArray(value) && value.length === 0)) {
      result.errors.push('Please upload a file');
      result.isValid = false;
      return result;
    }

    const files = Array.isArray(value) ? value : [value];

    if (rules?.max_files && files.length > rules.max_files) {
      result.errors.push(`Please upload at most ${rules.max_files} file(s)`);
      result.isValid = false;
    }

    for (const file of files) {
      if (rules?.max_file_size && file.size > rules.max_file_size) {
        result.errors.push(`File "${file.name}" is too large. Maximum size is ${this.formatFileSize(rules.max_file_size)}`);
        result.isValid = false;
      }

      if (rules?.allowed_file_types && !rules.allowed_file_types.includes(file.type)) {
        result.errors.push(`File "${file.name}" has an invalid type. Allowed types: ${rules.allowed_file_types.join(', ')}`);
        result.isValid = false;
      }

      if (imageOnly && !file.type.startsWith('image/')) {
        result.errors.push(`File "${file.name}" must be an image`);
        result.isValid = false;
      }
    }

    return result;
  }

  /**
   * Geographic validation
   */
  private static validateGeographic(value: any, rules?: ValidationRules): ValidationResult {
    const result: ValidationResult = { isValid: true, errors: [] };
    
    if (!value || value === '') {
      result.errors.push('Please select an option');
      result.isValid = false;
    }

    return result;
  }

  /**
   * Validate custom rules
   */
  private static validateRules(value: any, rules: ValidationRules): ValidationResult {
    const result: ValidationResult = { isValid: true, errors: [], warnings: [] };

    if (rules.custom_validation) {
      try {
        // Note: In a real implementation, you'd want to safely evaluate custom functions
        // This is a simplified example
        const isValid = eval(rules.custom_validation.function.replace('value', JSON.stringify(value)));
        if (!isValid) {
          result.errors.push(rules.custom_validation.message);
          result.isValid = false;
        }
      } catch (error) {
        result.warnings?.push('Custom validation function failed to execute');
      }
    }

    return result;
  }

  /**
   * Check if value is empty
   */
  private static isEmpty(value: any): boolean {
    return value === null || 
           value === undefined || 
           value === '' || 
           (Array.isArray(value) && value.length === 0) ||
           (typeof value === 'object' && Object.keys(value).length === 0);
  }

  /**
   * Format file size for display
   */
  private static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
