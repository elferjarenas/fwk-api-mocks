/**
 * CIAM Exceptions
 * Simple error classes for CIAM business logic
 * Extends BusinessException for modularity across businesses
 */

import { BusinessException, type ErrorBody } from '../../common/exceptions.js';

/**
 * Base CIAM Exception
 * Extends BusinessException - allows app.ts to handle all businesses generically
 */
export class CiamException extends BusinessException {
  constructor(message: string, errorBody: ErrorBody) {
    super(message, errorBody.status, errorBody);
  }
}

// HTTP Error Exceptions
export class CiamBadRequestException extends CiamException {}
export class CiamUnauthorizedException extends CiamException {}
export class CiamForbiddenException extends CiamException {}
export class CiamInternalErrorException extends CiamException {}
export class CiamPreconditionFailedException extends CiamException {}

/**
 * Validation Exception for CIAM
 * Used for parameter validation errors (400)
 */
export class CiamValidationException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CiamValidationException';
  }
}
