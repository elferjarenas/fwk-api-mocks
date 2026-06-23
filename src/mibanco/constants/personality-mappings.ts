import { HttpStatusCodes } from '../../common/http-status-codes.js';
import { MibancoPersonality } from './api-codes.js';

export const PERSONALITY_BY_API: Record<string, Set<MibancoPersonality>> = {

  GLOBAL: new Set([
    MibancoPersonality.MIBANCO_BAD_REQUEST,
    MibancoPersonality.MIBANCO_UNAUTHORIZED,
    MibancoPersonality.METHOD_NOT_ALLOWED,
    MibancoPersonality.LOAN_MANY_REQUESTS,
    MibancoPersonality.MIBANCO_SERVER_ERROR,
    MibancoPersonality.MIBANCO_NOT_CONFIRMED,
    MibancoPersonality.MIBANCO_INVALID_TERM,
    MibancoPersonality.MIBANCO_PRODUCT_REGISTER,
    MibancoPersonality.MIBANCO_UNABLE_LEAD,
    MibancoPersonality.MIBANCO_LEAD_SOLD,
  ]),
  OFFER: new Set([
    MibancoPersonality.OFFER_NO_DATA,
    MibancoPersonality.OFFER_CALL_FAILED,
    MibancoPersonality.OFFER_CALL_TIMEOUT,
  ]),
  SIMULATE: new Set([
    MibancoPersonality.SIMULATE_NO_DATA,
    MibancoPersonality.SIMULATE_CALL_FAILED,
    MibancoPersonality.SIMULATE_CALL_TIMEOUT,
  ]),
  PAYDATE: new Set([
    MibancoPersonality.PAYDATE_NO_DATA,
    MibancoPersonality.PAYDATE_CALL_FAILED,
    MibancoPersonality.PAYDATE_CALL_TIMEOUT,
  ]),
  QUOTE: new Set([
    MibancoPersonality.QUOTE_NO_DATA,
    MibancoPersonality.QUOTE_CALL_FAILED,
    MibancoPersonality.QUOTE_CALL_TIMEOUT,
  ]),
  REGISTER: new Set([
    MibancoPersonality.REGISTER_NO_DATA,
    MibancoPersonality.REGISTER_CALL_FAILED,
    MibancoPersonality.REGISTER_CALL_TIMEOUT,
  ]),

};

export const SUCCESS_PERSONALITIES = new Set<MibancoPersonality>([
  MibancoPersonality.LOAN_MIBANCO_OK,
]);

export type ErrorVariant = 'base' | 'e01' | 'e02' | 'e03' | 'e04' | 'e05';

export const VARIANT_BY_PERSONALITY: Record<MibancoPersonality, ErrorVariant | null> = {
  [MibancoPersonality.LOAN_MIBANCO_OK]: null,
  
  [MibancoPersonality.OFFER_NO_DATA]: 'base',
  [MibancoPersonality.OFFER_CALL_FAILED]: 'base',
  [MibancoPersonality.OFFER_CALL_TIMEOUT]: 'base',
  [MibancoPersonality.SIMULATE_NO_DATA]: 'base',
  [MibancoPersonality.SIMULATE_CALL_FAILED]: 'base',
  [MibancoPersonality.SIMULATE_CALL_TIMEOUT]: 'base',

  [MibancoPersonality.PAYDATE_NO_DATA]: 'base',
  [MibancoPersonality.PAYDATE_CALL_FAILED]: 'base',
  [MibancoPersonality.PAYDATE_CALL_TIMEOUT]: 'base',

  [MibancoPersonality.QUOTE_NO_DATA]: 'base',
  [MibancoPersonality.QUOTE_CALL_FAILED]: 'base',
  [MibancoPersonality.QUOTE_CALL_TIMEOUT]: 'base',

  [MibancoPersonality.REGISTER_NO_DATA]: 'base',
  [MibancoPersonality.REGISTER_CALL_FAILED]: 'base',
  [MibancoPersonality.REGISTER_CALL_TIMEOUT]: 'base',

  [MibancoPersonality.MIBANCO_NOT_CONFIRMED]: 'e01',
  [MibancoPersonality.MIBANCO_INVALID_TERM]: 'e02',
  [MibancoPersonality.MIBANCO_PRODUCT_REGISTER]: 'e03',
  [MibancoPersonality.MIBANCO_UNABLE_LEAD]: 'e04',
  [MibancoPersonality.MIBANCO_LEAD_SOLD]: 'e05',

  [MibancoPersonality.MIBANCO_BAD_REQUEST]: null,
  [MibancoPersonality.MIBANCO_UNAUTHORIZED]: null,
  [MibancoPersonality.METHOD_NOT_ALLOWED]: null,
  [MibancoPersonality.LOAN_MANY_REQUESTS]: null,
  [MibancoPersonality.MIBANCO_SERVER_ERROR]: null,
};

export const HTTP_STATUS_BY_PERSONALITY: Record<MibancoPersonality, number> = {
  [MibancoPersonality.LOAN_MIBANCO_OK]: HttpStatusCodes.OK,

  [MibancoPersonality.OFFER_NO_DATA]: HttpStatusCodes.ACCEPTED,
  [MibancoPersonality.OFFER_CALL_FAILED]: HttpStatusCodes.NOT_FOUND,
  [MibancoPersonality.OFFER_CALL_TIMEOUT]: HttpStatusCodes.GATEWAY_TIMEOUT,

  [MibancoPersonality.SIMULATE_NO_DATA]: HttpStatusCodes.ACCEPTED,
  [MibancoPersonality.SIMULATE_CALL_FAILED]: HttpStatusCodes.NOT_FOUND,
  [MibancoPersonality.SIMULATE_CALL_TIMEOUT]: HttpStatusCodes.GATEWAY_TIMEOUT,

  [MibancoPersonality.PAYDATE_NO_DATA]: HttpStatusCodes.ACCEPTED,
  [MibancoPersonality.PAYDATE_CALL_FAILED]: HttpStatusCodes.NOT_FOUND,
  [MibancoPersonality.PAYDATE_CALL_TIMEOUT]: HttpStatusCodes.GATEWAY_TIMEOUT,

  [MibancoPersonality.QUOTE_NO_DATA]: HttpStatusCodes.ACCEPTED,
  [MibancoPersonality.QUOTE_CALL_FAILED]: HttpStatusCodes.NOT_FOUND,
  [MibancoPersonality.QUOTE_CALL_TIMEOUT]: HttpStatusCodes.GATEWAY_TIMEOUT,

  [MibancoPersonality.REGISTER_NO_DATA]: HttpStatusCodes.ACCEPTED,
  [MibancoPersonality.REGISTER_CALL_FAILED]: HttpStatusCodes.NOT_FOUND,
  [MibancoPersonality.REGISTER_CALL_TIMEOUT]: HttpStatusCodes.GATEWAY_TIMEOUT,

  [MibancoPersonality.MIBANCO_NOT_CONFIRMED]: HttpStatusCodes.ACCEPTED,
  [MibancoPersonality.MIBANCO_INVALID_TERM]: HttpStatusCodes.ACCEPTED,
  [MibancoPersonality.MIBANCO_PRODUCT_REGISTER]: HttpStatusCodes.ACCEPTED,
  [MibancoPersonality.MIBANCO_UNABLE_LEAD]: HttpStatusCodes.ACCEPTED,
  [MibancoPersonality.MIBANCO_LEAD_SOLD]: HttpStatusCodes.ACCEPTED,

  [MibancoPersonality.MIBANCO_BAD_REQUEST]: HttpStatusCodes.BAD_REQUEST,
  [MibancoPersonality.MIBANCO_UNAUTHORIZED]: HttpStatusCodes.UNAUTHORIZED,
  [MibancoPersonality.METHOD_NOT_ALLOWED]: HttpStatusCodes.METHOD_NOT_ALLOWED,
  [MibancoPersonality.LOAN_MANY_REQUESTS]: HttpStatusCodes.TOO_MANY_REQUESTS,
  [MibancoPersonality.MIBANCO_SERVER_ERROR]: HttpStatusCodes.INTERNAL_SERVER_ERROR,
};
