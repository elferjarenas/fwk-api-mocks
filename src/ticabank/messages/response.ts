import { HttpStatusCodes } from '../../common/http-status-codes.js';
import { ErrorVariant } from '../constants/personality-mappings.js';
import * as getValue from './templates.js';

/**
 * Build error response body
 * @param httpStatus HTTP status code
 * @param serviceName Service name (offer, simulate, etc.)
 * @param variant Error variant for 202 errors (optional)
 * @returns Complete error response body
 */
export function buildErrorResponse(
  httpStatus: number,
  serviceName: string,
  variant?: ErrorVariant,
): getValue.ErrorResponseBody {
  const title = getValue.ERROR_TITLES[httpStatus] || 'Error desconocido';

  let template: getValue.ErrorTemplate | undefined;

  if (httpStatus === HttpStatusCodes.ACCEPTED && variant) {
    template = getValue.MESSAGES_202[variant]?.[serviceName];
  } else {
    const messageMap = {
      [HttpStatusCodes.BAD_REQUEST]: getValue.MESSAGES_400,
      [HttpStatusCodes.UNAUTHORIZED]: getValue.MESSAGES_401,
      [HttpStatusCodes.NOT_FOUND]: getValue.MESSAGES_404,
      [HttpStatusCodes.METHOD_NOT_ALLOWED]: getValue.MESSAGES_405,
      [HttpStatusCodes.TOO_MANY_REQUESTS]: getValue.MESSAGES_429,
      [HttpStatusCodes.INTERNAL_SERVER_ERROR]: getValue.MESSAGES_500,
      [HttpStatusCodes.GATEWAY_TIMEOUT]: getValue.MESSAGES_504,
    }[httpStatus];

    template = messageMap?.[serviceName];
  }

  if (!template) {
    template = {
      type: `${serviceName}/errors/UNKNOWN`,
      detail: `Error ${httpStatus}`,
      instance: serviceName,
    };
  }

  return {
    status: httpStatus,
    type: template.type.startsWith('/') ? template.type : `/${template.type}`,
    title,
    detail: template.detail,
    instance: template.instance,
  };
}

/**
 * Get error message for a specific API and status code
 * @param apiType - API type (OFFER, PAYDATE, SIMULATE, QUOTE, etc.)
 * @param statusCode - HTTP status code
 * @returns Error message detail
 */
export function getErrorMessage(apiType: string, statusCode: number): string {
  const serviceName = apiType.toLowerCase();
  const response = buildErrorResponse(statusCode, serviceName);
  return response.detail;
}
