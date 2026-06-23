/**
 * CIAM Exception Builder
 * Simple factory to create CIAM exceptions with proper error bodies
 */

import { HttpStatusCodes } from '../../common/http-status-codes.js';
import type { ErrorBody } from '../../common/exceptions.js';
import {
  CiamBadRequestException,
  CiamUnauthorizedException,
  CiamForbiddenException,
  CiamInternalErrorException,
  CiamPreconditionFailedException,
  CiamValidationException,
} from './ciam-exception.js';

/**
 * Build error body for CIAM exceptions
 */
function buildErrorBody(
  status: number,
  error: string,
  message: string,
  instance: string = 'ciam'
): ErrorBody {
  return {
    status,
    type: `/ciam/errors/${error}`,
    title: message,
    detail: message,
    instance,
  };
}

/**
 * Create validation exception (400)
 */
export function createValidationException(message: string): CiamBadRequestException {
  const errorBody = buildErrorBody(HttpStatusCodes.BAD_REQUEST, 'VALIDATION_ERROR', message);
  return new CiamBadRequestException(message, errorBody);
}

/**
 * Create bad request exception (400)
 */
export function createBadRequestException(error: string, message: string): CiamBadRequestException {
  const errorBody = buildErrorBody(HttpStatusCodes.BAD_REQUEST, error, message);
  return new CiamBadRequestException(message, errorBody);
}

/**
 * Create unauthorized exception (401)
 */
export function createUnauthorizedException(error: string, message: string): CiamUnauthorizedException {
  const errorBody = buildErrorBody(HttpStatusCodes.UNAUTHORIZED, error, message);
  return new CiamUnauthorizedException(message, errorBody);
}

/**
 * Create forbidden exception (403)
 */
export function createForbiddenException(error: string, message: string): CiamForbiddenException {
  const errorBody = buildErrorBody(HttpStatusCodes.FORBIDDEN, error, message);
  return new CiamForbiddenException(message, errorBody);
}

/**
 * Create internal error exception (500)
 */
export function createInternalErrorException(error: string, message: string): CiamInternalErrorException {
  const errorBody = buildErrorBody(HttpStatusCodes.INTERNAL_SERVER_ERROR, error, message);
  return new CiamInternalErrorException(message, errorBody);
}

/**
 * Create precondition failed exception (412)
 */
export function createPreconditionFailedException(error: string, message: string): CiamPreconditionFailedException {
  const errorBody = buildErrorBody(HttpStatusCodes.PRECONDITION_FAILED, error, message);
  return new CiamPreconditionFailedException(message, errorBody);
}

/**
 * Create exception by status code (generic)
 */
export function createCiamException(statusCode: number, error: string, message: string): Error {
  switch (statusCode) {
    case HttpStatusCodes.BAD_REQUEST:
      return createBadRequestException(error, message);
    case HttpStatusCodes.UNAUTHORIZED:
      return createUnauthorizedException(error, message);
    case HttpStatusCodes.FORBIDDEN:
      return createForbiddenException(error, message);
    case HttpStatusCodes.PRECONDITION_FAILED:
      return createPreconditionFailedException(error, message);
    case HttpStatusCodes.INTERNAL_SERVER_ERROR:
      return createInternalErrorException(error, message);
    default:
      return createInternalErrorException(error, message);
  }
}
