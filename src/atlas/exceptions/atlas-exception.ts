import { BusinessException, type ErrorBody } from '../../common/exceptions.js';

/**
 * Base Atlas Exception
 * Extends BusinessException - allows app.ts to handle all businesses generically
 */
export class AtlasException extends BusinessException {
  data?: unknown;
  
  constructor(message: string, errorBody: ErrorBody, data?: unknown) {
    super(message, errorBody.status, errorBody);
    this.data = data;
  }
}

// HTTP Error Exceptions
export class AtlasBadRequestException extends AtlasException {}
export class AtlasNotFoundException extends AtlasException {}
export class AtlasInternalErrorException extends AtlasException {}

/**
 * Validation Exception for Atlas
 * Used for parameter validation errors (400)
 */
export class AtlasValidationException extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.name = 'AtlasValidationException';
    this.statusCode = statusCode;
  }
}
