/**
 * Cards Exception Builder
 * Factory to create Cards exceptions with proper error bodies
 */

import { HttpStatusCodes } from '../../common/http-status-codes.js';
import type { ErrorBody } from '../../common/exceptions.js';
import {
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  MethodNotAllowedException,
  TooManyRequestsException,
  ServerErrorException,
  ServiceUnavailableException,
  GatewayTimeoutException,
  AtlasIntegrationException,
  AtlasTimeoutException,
  CardsValidationException,
} from './cards-exception.js';

/**
 * Build error body for Cards exceptions
 */
function buildErrorBody(
  status: number,
  error: string,
  message: string,
  instance: string = 'cards'
): ErrorBody {
  return {
    status,
    type: `/cards/errors/${error}`,
    title: message,
    detail: message,
    instance,
  };
}

/**
 * Create validation exception (400)
 */
export function createValidationException(message: string): CardsValidationException {
  return new CardsValidationException(message, HttpStatusCodes.BAD_REQUEST);
}

/**
 * Create bad request exception (400)
 */
export function createBadRequestException(message: string): BadRequestException {
  const errorBody = buildErrorBody(
    HttpStatusCodes.BAD_REQUEST,
    'BAD_REQUEST',
    message
  );
  return new BadRequestException(message, errorBody);
}

/**
 * Create unauthorized exception (401)
 */
export function createUnauthorizedException(message: string): UnauthorizedException {
  const errorBody = buildErrorBody(
    HttpStatusCodes.UNAUTHORIZED,
    'UNAUTHORIZED',
    message
  );
  return new UnauthorizedException(message, errorBody);
}

/**
 * Create not found exception (404)
 */
export function createNotFoundException(message: string): NotFoundException {
  const errorBody = buildErrorBody(
    HttpStatusCodes.NOT_FOUND,
    'NOT_FOUND',
    message
  );
  return new NotFoundException(message, errorBody);
}

/**
 * Create method not allowed exception (405)
 */
export function createMethodNotAllowedException(message: string): MethodNotAllowedException {
  const errorBody = buildErrorBody(
    HttpStatusCodes.METHOD_NOT_ALLOWED,
    'METHOD_NOT_ALLOWED',
    message
  );
  return new MethodNotAllowedException(message, errorBody);
}

/**
 * Create too many requests exception (429)
 */
export function createTooManyRequestsException(message: string): TooManyRequestsException {
  const errorBody = buildErrorBody(
    HttpStatusCodes.TOO_MANY_REQUESTS,
    'TOO_MANY_REQUESTS',
    message
  );
  return new TooManyRequestsException(message, errorBody);
}

/**
 * Create server error exception (500)
 */
export function createServerErrorException(message: string): ServerErrorException {
  const errorBody = buildErrorBody(
    HttpStatusCodes.INTERNAL_SERVER_ERROR,
    'INTERNAL_SERVER_ERROR',
    message
  );
  return new ServerErrorException(message, errorBody);
}

/**
 * Create service unavailable exception (503)
 */
export function createServiceUnavailableException(message: string): ServiceUnavailableException {
  const errorBody = buildErrorBody(
    HttpStatusCodes.SERVICE_UNAVAILABLE,
    'SERVICE_UNAVAILABLE',
    message
  );
  return new ServiceUnavailableException(message, errorBody);
}

/**
 * Create gateway timeout exception (504)
 */
export function createGatewayTimeoutException(message: string): GatewayTimeoutException {
  const errorBody = buildErrorBody(
    HttpStatusCodes.GATEWAY_TIMEOUT,
    'GATEWAY_TIMEOUT',
    message
  );
  return new GatewayTimeoutException(message, errorBody);
}

/**
 * Create Atlas integration exception (500)
 */
export function createAtlasIntegrationException(
  message: string,
  atlasErrorCode?: string,
  atlasErrorDescription?: string
): AtlasIntegrationException {
  const detail = atlasErrorDescription
    ? `${message}: ${atlasErrorCode} - ${atlasErrorDescription}`
    : message;
  
  const errorBody = buildErrorBody(
    HttpStatusCodes.INTERNAL_SERVER_ERROR,
    'ATLAS_INTEGRATION_ERROR',
    detail
  );
  return new AtlasIntegrationException(message, errorBody);
}

/**
 * Create Atlas timeout exception (504)
 */
export function createAtlasTimeoutException(message: string): AtlasTimeoutException {
  const errorBody = buildErrorBody(
    HttpStatusCodes.GATEWAY_TIMEOUT,
    'ATLAS_TIMEOUT',
    message
  );
  return new AtlasTimeoutException(message, errorBody);
}
