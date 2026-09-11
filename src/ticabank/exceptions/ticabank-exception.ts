/**
 * Ticabank Exceptions
 * Error classes for Ticabank business logic
 * Extends BusinessException for modularity across businesses
 */

import { BusinessException, type ErrorBody } from '../../common/exceptions.js';

/**
 * Base Ticabank Exception
 * Extends BusinessException - allows app.ts to handle all businesses generically
 */
export class TicabankException extends BusinessException {
  constructor(message: string, errorBody: ErrorBody) {
    super(message, errorBody.status, errorBody);
  }
}

// HTTP Error Exceptions
export class BadRequestException extends TicabankException {}
export class UnauthorizedException extends TicabankException {}
export class NotFoundException extends TicabankException {}
export class OfferCallFailedException extends TicabankException {}
export class MethodNotAllowedException extends TicabankException {}
export class TooManyRequestsException extends TicabankException {}
export class ServerErrorException extends TicabankException {}
export class OfferTimeoutException extends TicabankException {}

// Business Logic Exceptions (202)
export class OfferNoDataException extends TicabankException {}
export class NotConfirmedException extends TicabankException {}
export class InvalidTermException extends TicabankException {}
export class ProductRegisteredException extends TicabankException {}
export class UnableLeadException extends TicabankException {}
export class LeadSoldException extends TicabankException {}

/**
 * Validation Exception for Ticabank
 * Used for parameter validation errors (400)
 */
export class TicabankValidationException extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.name = 'TicabankValidationException';
    this.statusCode = statusCode;
  }
}
