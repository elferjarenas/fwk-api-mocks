/**
 * Card Detail Request Validator
 * Validates path and query parameters for GET /cards/:cardId endpoint
 */

import { BaseValidator } from '../../common/validators/base-validator.js';

export interface CardDetailParams {
  cardId: string;
  extraFields?: string;
}

/**
 * Validates Card Detail request parameters
 */
export class CardDetailValidator extends BaseValidator<CardDetailParams> {
  protected validate(): void {
    // Required fields validation
    if (!this.data.cardId) {
      this.addError('cardId', 'cardId is required');
      return;
    }

    // cardId format validation (should be numeric, typically 16-19 digits)
    const cardIdPattern = /^\d{13,19}$/;
    if (!cardIdPattern.test(this.data.cardId)) {
      this.addError('cardId', 'cardId must be numeric between 13-19 digits');
    }

    // extraFields validation (optional, must be 'Y' or 'N')
    if (this.data.extraFields && !['Y', 'N'].includes(this.data.extraFields)) {
      this.addError('extraFields', 'extraFields must be Y or N');
    }
  }
}
