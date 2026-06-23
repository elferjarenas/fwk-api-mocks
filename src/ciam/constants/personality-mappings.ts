import { HttpStatusCodes } from '../../common/http-status-codes.js';
import { CiamPersonality } from './api-codes.js';

export interface PersonalityConfig {
  enrolled?: boolean;
  statusCode: number;
  error?: string;
  message?: string;
}

export const CIAM_PERSONALITY_CONFIG: Record<CiamPersonality, PersonalityConfig> = {
  [CiamPersonality.ENROLLED]: {
    enrolled: true,
    statusCode: HttpStatusCodes.OK,
  },
  [CiamPersonality.NOT_ENROLLED]: {
    enrolled: false,
    statusCode: HttpStatusCodes.OK,
  },
  [CiamPersonality.ENROLL_OK]: {
    enrolled: true,
    statusCode: HttpStatusCodes.OK,
  },
  [CiamPersonality.INVALID_DOCTYPE]: {
    statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
    error: 'INVALID_DOCTYPE',
  },
  [CiamPersonality.TOKEN_EXPIRED]: {
    statusCode: HttpStatusCodes.UNAUTHORIZED,
    error: 'TOKEN_EXPIRED',
  },
  [CiamPersonality.INSUFFICIENT_HEADERS]: {
    statusCode: HttpStatusCodes.FORBIDDEN,
    error: 'INSUFFICIENT_HEADERS',
  },
  [CiamPersonality.INTERNAL_ERROR]: {
    statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
    error: 'INTERNAL',
  },
  [CiamPersonality.ERROR_ML0006]: {
    statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
    error: 'ML0006',
  },
  [CiamPersonality.ERROR_ML0017]: {
    statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
    error: 'ML0017',
  },
  [CiamPersonality.ERROR_ML0019]: {
    statusCode: HttpStatusCodes.PRECONDITION_FAILED,
    error: 'ML0019',
  },
  [CiamPersonality.ERROR_ML0038]: {
    statusCode: HttpStatusCodes.PRECONDITION_FAILED,
    error: 'ML0038',
  },
};
