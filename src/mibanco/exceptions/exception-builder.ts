/**
 * Mibanco Exception Builder
 * Factory to create Mibanco exceptions with proper error bodies
 */

import { HttpStatusCodes } from '../../common/http-status-codes.js';
import type { ErrorBody } from '../../common/exceptions.js';
import {
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  OfferCallFailedException,
  MethodNotAllowedException,
  TooManyRequestsException,
  ServerErrorException,
  OfferTimeoutException,
  OfferNoDataException,
  NotConfirmedException,
  InvalidTermException,
  ProductRegisteredException,
  UnableLeadException,
  LeadSoldException,
  MibancoValidationException,
} from './mibanco-exception.js';

/**
 * Build error body for Mibanco exceptions
 */
function buildErrorBody(
  status: number,
  error: string,
  message: string,
  instance: string = 'mibanco'
): ErrorBody {
  return {
    status,
    type: `/mibanco/errors/${error}`,
    title: message,
    detail: message,
    instance,
  };
}

/**
 * Create validation exception (400)
 */
export function createValidationException(message: string): MibancoValidationException {
  return new MibancoValidationException(message, HttpStatusCodes.BAD_REQUEST);
}

/**
 * Create bad request exception (400)
 */
export function createBadRequestException(message: string, errorBody: ErrorBody): BadRequestException {
  return new BadRequestException(message, errorBody);
}

/**
 * Create unauthorized exception (401)
 */
export function createUnauthorizedException(message: string, errorBody: ErrorBody): UnauthorizedException {
  return new UnauthorizedException(message, errorBody);
}

/**
 * Create not found exception (404)
 */
export function createNotFoundException(message: string, errorBody: ErrorBody): NotFoundException {
  return new NotFoundException(message, errorBody);
}

/**
 * Create offer call failed exception (404)
 */
export function createOfferCallFailedException(message: string, errorBody: ErrorBody): OfferCallFailedException {
  return new OfferCallFailedException(message, errorBody);
}

/**
 * Create method not allowed exception (405)
 */
export function createMethodNotAllowedException(message: string, errorBody: ErrorBody): MethodNotAllowedException {
  return new MethodNotAllowedException(message, errorBody);
}

/**
 * Create too many requests exception (429)
 */
export function createTooManyRequestsException(message: string, errorBody: ErrorBody): TooManyRequestsException {
  return new TooManyRequestsException(message, errorBody);
}

/**
 * Create server error exception (500)
 */
export function createServerErrorException(message: string, errorBody: ErrorBody): ServerErrorException {
  return new ServerErrorException(message, errorBody);
}

/**
 * Create offer timeout exception (504)
 */
export function createOfferTimeoutException(message: string, errorBody: ErrorBody): OfferTimeoutException {
  return new OfferTimeoutException(message, errorBody);
}

/**
 * Create offer no data exception (202)
 */
export function createOfferNoDataException(message: string, errorBody: ErrorBody): OfferNoDataException {
  return new OfferNoDataException(message, errorBody);
}

/**
 * Create not confirmed exception (202)
 */
export function createNotConfirmedException(message: string, errorBody: ErrorBody): NotConfirmedException {
  return new NotConfirmedException(message, errorBody);
}

/**
 * Create invalid term exception (202)
 */
export function createInvalidTermException(message: string, errorBody: ErrorBody): InvalidTermException {
  return new InvalidTermException(message, errorBody);
}

/**
 * Create product registered exception (202)
 */
export function createProductRegisteredException(message: string, errorBody: ErrorBody): ProductRegisteredException {
  return new ProductRegisteredException(message, errorBody);
}

/**
 * Create unable lead exception (202)
 */
export function createUnableLeadException(message: string, errorBody: ErrorBody): UnableLeadException {
  return new UnableLeadException(message, errorBody);
}

/**
 * Create lead sold exception (202)
 */
export function createLeadSoldException(message: string, errorBody: ErrorBody): LeadSoldException {
  return new LeadSoldException(message, errorBody);
}
