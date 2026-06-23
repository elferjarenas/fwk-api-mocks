/**
 * Cards Exceptions
 * Error classes for Cards business logic
 * Extends BusinessException for modularity across businesses
 */

import { BusinessException, type ErrorBody } from '../../common/exceptions.js';

/**
 * Base Cards Exception
 * Extends BusinessException - allows app.ts to handle all businesses generically
 */
export class CardsException extends BusinessException {
  constructor(message: string, errorBody: ErrorBody) {
    super(message, errorBody.status, errorBody);
  }
}

// HTTP Error Exceptions
export class BadRequestException extends CardsException {}
export class UnauthorizedException extends CardsException {}
export class NotFoundException extends CardsException {}
export class MethodNotAllowedException extends CardsException {}
export class TooManyRequestsException extends CardsException {}
export class ServerErrorException extends CardsException {}
export class ServiceUnavailableException extends CardsException {}
export class GatewayTimeoutException extends CardsException {}

// Atlas Integration Exceptions (specific to Cards-Atlas interaction)
export class AtlasIntegrationException extends CardsException {}
export class AtlasTimeoutException extends CardsException {}

/**
 * Validation Exception for Cards
 * Used for parameter validation errors (400)
 */
export class CardsValidationException extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.name = 'CardsValidationException';
    this.statusCode = statusCode;
  }
}
