/**
 * CIAM Response Builders
 * Simple functions to build success/error responses
 */

import { v4 as uuidv4 } from 'uuid';
import { ErrorTemplate, ErrorResponseBody } from './templates.js';

/**
 * Build error response body
 */
export function buildErrorResponse(template: ErrorTemplate): ErrorResponseBody {
  const response: ErrorResponseBody = {
    code: template.code,
    description: template.description,
    errorType: template.errorType,
  };

  if (template.component) {
    response.exceptionDetails = {
      component: template.component,
    };
  }

  return response;
}

/**
 * Build biometry status success response
 */
export function buildBiometryStatusResponse(isFacialEnrolled: boolean): {
  personData: { isFacialEnrolled: boolean };
  processData: { flowProcessId: string };
} {
  return {
    personData: {
      isFacialEnrolled,
    },
    processData: {
      flowProcessId: uuidv4(),
    },
  };
}

/**
 * Build enrollment success response
 */
export function buildEnrollmentResponse(
  firstName: string,
  fatherLastName: string,
  motherLastName: string
): {
  personData: {
    firstName: string;
    fatherLastName: string;
    motherLastName: string;
    ciamDeviceId: string;
  };
  processData: {
    biometricGatewayIdTransaction: string;
    flowProcessId: string;
  };
  userTokenData: {
    accessToken: string;
    refreshToken: string;
    tokenTimeLife: number;
  };
} {
  return {
    personData: {
      firstName,
      fatherLastName,
      motherLastName,
      ciamDeviceId: uuidv4(),
    },
    processData: {
      biometricGatewayIdTransaction: Date.now().toString(),
      flowProcessId: uuidv4(),
    },
    userTokenData: {
      accessToken: uuidv4(),
      refreshToken: uuidv4(),
      tokenTimeLife: 300,
    },
  };
}

/**
 * Build authentication success response
 */
export function buildAuthenticationResponse(): {
  access_token: string;
  id_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
} {
  return {
    access_token: uuidv4(),
    id_token: uuidv4(),
    refresh_token: uuidv4(),
    token_type: 'bearer',
    expires_in: 300,
    scope: uuidv4(),
  };
}
