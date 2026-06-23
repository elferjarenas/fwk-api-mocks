/**
 * Mibanco Exceptions
 * Error classes for Mibanco business logic
 * Extends BusinessException for modularity across businesses
 */

import { BusinessException, type ErrorBody } from '../../common/exceptions.js';

/**
 * Base Mibanco Exception
 * Extends BusinessException - allows app.ts to handle all businesses generically
 */
export class MibancoException extends BusinessException {
  constructor(message: string, errorBody: ErrorBody) {
    super(message, errorBody.status, errorBody);
  }
}

// HTTP Error Exceptions
export class BadRequestException extends MibancoException {}
export class UnauthorizedException extends MibancoException {}
export class NotFoundException extends MibancoException {}
export class OfferCallFailedException extends MibancoException {}
export class MethodNotAllowedException extends MibancoException {}
export class TooManyRequestsException extends MibancoException {}
export class ServerErrorException extends MibancoException {}
export class OfferTimeoutException extends MibancoException {}

// Business Logic Exceptions (202)
export class OfferNoDataException extends MibancoException {}
export class NotConfirmedException extends MibancoException {}
export class InvalidTermException extends MibancoException {}
export class ProductRegisteredException extends MibancoException {}
export class UnableLeadException extends MibancoException {}
export class LeadSoldException extends MibancoException {}

/**
 * Validation Exception for Mibanco
 * Used for parameter validation errors (400)
 */
export class MibancoValidationException extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.name = 'MibancoValidationException';
    this.statusCode = statusCode;
  }
}
