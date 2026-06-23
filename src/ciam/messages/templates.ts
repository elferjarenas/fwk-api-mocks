/**
 * CIAM Error Templates
 * Simple DTO structure for error responses
 */

import { HttpStatusCodes } from '../../common/http-status-codes.js';

export interface ErrorTemplate {
  code: string;
  description: string;
  errorType: string;
  component?: string;
}

export interface ErrorResponseBody {
  code: string;
  description: string;
  errorType: string;
  exceptionDetails?: {
    component: string;
  };
}

/**
 * 400 Errors
 */
export const ERRORS_400: Record<string, ErrorTemplate> = {
  INVALID_DOCTYPE: {
    code: 'ML0001',
    description: 'Tipo de documento no soportado.',
    errorType: 'FUNCTIONAL',
  },
};

/**
 * 401 Errors
 */
export const ERRORS_401: Record<string, ErrorTemplate> = {
  TOKEN_EXPIRED: {
    code: 'ML0401',
    description: 'Token OAuth vencido.',
    errorType: 'FUNCTIONAL',
  },
};

/**
 * 403 Errors
 */
export const ERRORS_403: Record<string, ErrorTemplate> = {
  INSUFFICIENT_HEADERS: {
    code: 'ML0403',
    description: 'Parámetros insuficientes en validación de token OAuth.',
    errorType: 'FUNCTIONAL',
  },
};

/**
 * 412 Errors
 */
export const ERRORS_412: Record<string, ErrorTemplate> = {
  ML0019: {
    code: 'ML0019',
    description: 'Superaste el número de intentos de ingreso.',
    errorType: 'FUNCTIONAL',
  },
  ML0038: {
    code: 'ML0038',
    description: 'Usuario bloqueado por CIAM.',
    errorType: 'FUNCTIONAL',
  },
};

/**
 * 500 Errors
 */
export const ERRORS_500: Record<string, ErrorTemplate> = {
  INTERNAL: {
    code: 'ML0500',
    description: 'Error interno en el servicio CIAM.',
    errorType: 'TECHNICAL',
  },
  ML0006: {
    code: 'ML0006',
    description: 'Error de conexión. Problema con el backend.',
    errorType: 'TECHNICAL',
  },
  ML0017: {
    code: 'ML0017',
    description: 'Ocurrió un error con el componente de validación facial.',
    errorType: 'FUNCTIONAL',
    component: 'channel-ciam-mobile-login-v1',
  },
};

/**
 * Get error template by status code and key
 */
export function getErrorTemplate(statusCode: number, key: string): ErrorTemplate | null {
  const errorMap: Record<number, Record<string, ErrorTemplate>> = {
    [HttpStatusCodes.BAD_REQUEST]: ERRORS_400,
    [HttpStatusCodes.UNAUTHORIZED]: ERRORS_401,
    [HttpStatusCodes.FORBIDDEN]: ERRORS_403,
    [HttpStatusCodes.PRECONDITION_FAILED]: ERRORS_412,
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: ERRORS_500,
  };

  return errorMap[statusCode]?.[key] || null;
}
