import { HttpStatusCodes } from '../../common/http-status-codes.js';
import type { ErrorBody } from '../../common/exceptions.js';
import {
  AtlasBadRequestException,
  AtlasNotFoundException,
  AtlasInternalErrorException,
  AtlasValidationException,
  AtlasException,
} from './atlas-exception.js';

/**
 * Build error body for Atlas exceptions
 */
function buildErrorBody(
  status: number,
  error: string,
  message: string,
  instance: string = 'atlas'
): ErrorBody {
  return {
    status,
    type: `/atlas/errors/${error}`,
    title: message,
    detail: message,
    instance,
  };
}

/**
 * Create validation exception (400)
 */
export function createValidationException(message: string): AtlasValidationException {
  return new AtlasValidationException(message, HttpStatusCodes.BAD_REQUEST);
}

/**
 * Create bad request exception (400)
 */
export function createBadRequestException(error: string, message: string): AtlasBadRequestException {
  const errorBody = buildErrorBody(HttpStatusCodes.BAD_REQUEST, error, message);
  return new AtlasBadRequestException(message, errorBody);
}

/**
 * Create not found exception (404)
 */
export function createNotFoundException(error: string, message: string): AtlasNotFoundException {
  const errorBody = buildErrorBody(HttpStatusCodes.NOT_FOUND, error, message);
  return new AtlasNotFoundException(message, errorBody);
}

/**
 * Create internal error exception (500)
 * Used for business logic errors like fraud detection or insufficient funds
 */
export function createInternalErrorException(
  error: string,
  message: string,
  data?: unknown
): AtlasInternalErrorException {
  const errorBody = buildErrorBody(HttpStatusCodes.INTERNAL_SERVER_ERROR, error, message);
  return new AtlasInternalErrorException(message, errorBody, data);
}

/**
 * Create Atlas exception with custom data
 * Used for returning exact bank error responses (Lynx, Insufficient Funds, etc.)
 */
export function createAtlasException(
  message: string,
  statusCode: number,
  data: unknown
): AtlasException {
  const errorBody = {
    status: statusCode,
    type: '/atlas/errors/CUSTOM',
    title: message,
    detail: message,
    instance: 'atlas',
  };
  
  return new AtlasException(message, errorBody, data);
}
