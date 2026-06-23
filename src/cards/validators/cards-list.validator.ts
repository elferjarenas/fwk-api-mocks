/**
 * Cards List Request Validator
 * Validates query parameters for GET /cards endpoint
 */

import { BaseValidator } from '../../common/validators/base-validator.js';

export interface CardsListQueryParams {
  personId: string;
  pageNumber?: string;
  extraFields?: string;
}

/**
 * Validates Cards List request query parameters
 */
export class CardsListValidator extends BaseValidator<CardsListQueryParams> {
  protected validate(): void {
    // Required fields validation
    if (!this.data.personId) {
      this.addError('personId', 'personId is required');
      return;
    }

    // personId format validation (should be numeric with at least 11 digits + 3 suffix)
    const personIdPattern = /^\d{11,}$/;
    if (!personIdPattern.test(this.data.personId)) {
      this.addError('personId', 'personId must be numeric with minimum 11 digits');
    }

    // pageNumber validation (optional, but if present must be positive integer)
    if (this.data.pageNumber) {
      const pageNum = parseInt(this.data.pageNumber, 10);
      if (isNaN(pageNum) || pageNum < 1) {
        this.addError('pageNumber', 'pageNumber must be a positive integer');
      }
    }

    // extraFields validation (optional, must be 'Y' or 'N')
    if (this.data.extraFields && !['Y', 'N'].includes(this.data.extraFields)) {
      this.addError('extraFields', 'extraFields must be Y or N');
    }
  }
}
