/**
 * Base Validator
 * Abstract class that implements common validation logic
 * Follows DRY and Open/Closed Principle (SOLID)
 * 
 * Usage:
 * ```typescript
 * export class MyValidator extends BaseValidator<MyData> {
 *   protected validate(): void {
 *     if (!this.data.field) {
 *       this.addError('field', 'field is required');
 *     }
 *   }
 * }
 * ```
 */

export interface ValidationError {
  field: string;
  message: string;
}

export abstract class BaseValidator<T> {
  protected errors: ValidationError[] = [];
  
  constructor(protected data: Partial<T>) {}
  
  /**
   * Abstract method - subclasses implement specific validation rules
   */
  protected abstract validate(): void;
  
  /**
   * Validate data and return true if valid
   * Resets errors and runs validation
   */
  valid(): boolean {
    this.errors = [];
    this.validate();
    return this.errors.length === 0;
  }
  
  /**
   * Get all validation errors
   */
  getErrors(): ValidationError[] {
    return this.errors;
  }
  
  /**
   * Get first validation error (useful for API responses)
   */
  getFirstError(): ValidationError | undefined {
    return this.errors[0];
  }
  
  /**
   * Check if there are any validation errors
   */
  hasErrors(): boolean {
    return this.errors.length > 0;
  }
  
  /**
   * Add a validation error (used by subclasses)
   */
  protected addError(field: string, message: string): void {
    this.errors.push({ field, message });
  }
}
