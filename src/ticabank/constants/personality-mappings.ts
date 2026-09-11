import { HttpStatusCodes } from '../../common/http-status-codes.js';
import { TicabankPersonality } from './api-codes.js';

export const PERSONALITY_BY_API: Record<string, Set<TicabankPersonality>> = {

  GLOBAL: new Set([
    TicabankPersonality.TICABANK_BAD_REQUEST,
    TicabankPersonality.TICABANK_UNAUTHORIZED,
    TicabankPersonality.METHOD_NOT_ALLOWED,
    TicabankPersonality.LOAN_MANY_REQUESTS,
    TicabankPersonality.TICABANK_SERVER_ERROR,
    TicabankPersonality.TICABANK_NOT_CONFIRMED,
    TicabankPersonality.TICABANK_INVALID_TERM,
    TicabankPersonality.TICABANK_PRODUCT_REGISTER,
    TicabankPersonality.TICABANK_UNABLE_LEAD,
    TicabankPersonality.TICABANK_LEAD_SOLD,
  ]),
  OFFER: new Set([
    TicabankPersonality.OFFER_NO_DATA,
    TicabankPersonality.OFFER_CALL_FAILED,
    TicabankPersonality.OFFER_CALL_TIMEOUT,
  ]),
  SIMULATE: new Set([
    TicabankPersonality.SIMULATE_NO_DATA,
    TicabankPersonality.SIMULATE_CALL_FAILED,
    TicabankPersonality.SIMULATE_CALL_TIMEOUT,
  ]),
  PAYDATE: new Set([
    TicabankPersonality.PAYDATE_NO_DATA,
    TicabankPersonality.PAYDATE_CALL_FAILED,
    TicabankPersonality.PAYDATE_CALL_TIMEOUT,
  ]),
  QUOTE: new Set([
    TicabankPersonality.QUOTE_NO_DATA,
    TicabankPersonality.QUOTE_CALL_FAILED,
    TicabankPersonality.QUOTE_CALL_TIMEOUT,
  ]),
  REGISTER: new Set([
    TicabankPersonality.REGISTER_NO_DATA,
    TicabankPersonality.REGISTER_CALL_FAILED,
    TicabankPersonality.REGISTER_CALL_TIMEOUT,
  ]),

};

export const SUCCESS_PERSONALITIES = new Set<TicabankPersonality>([
  TicabankPersonality.LOAN_TICABANK_OK,
]);

export type ErrorVariant = 'base' | 'e01' | 'e02' | 'e03' | 'e04' | 'e05';

export const VARIANT_BY_PERSONALITY: Record<TicabankPersonality, ErrorVariant | null> = {
  [TicabankPersonality.LOAN_TICABANK_OK]: null,
  
  [TicabankPersonality.OFFER_NO_DATA]: 'base',
  [TicabankPersonality.OFFER_CALL_FAILED]: 'base',
  [TicabankPersonality.OFFER_CALL_TIMEOUT]: 'base',
  [TicabankPersonality.SIMULATE_NO_DATA]: 'base',
  [TicabankPersonality.SIMULATE_CALL_FAILED]: 'base',
  [TicabankPersonality.SIMULATE_CALL_TIMEOUT]: 'base',

  [TicabankPersonality.PAYDATE_NO_DATA]: 'base',
  [TicabankPersonality.PAYDATE_CALL_FAILED]: 'base',
  [TicabankPersonality.PAYDATE_CALL_TIMEOUT]: 'base',

  [TicabankPersonality.QUOTE_NO_DATA]: 'base',
  [TicabankPersonality.QUOTE_CALL_FAILED]: 'base',
  [TicabankPersonality.QUOTE_CALL_TIMEOUT]: 'base',

  [TicabankPersonality.REGISTER_NO_DATA]: 'base',
  [TicabankPersonality.REGISTER_CALL_FAILED]: 'base',
  [TicabankPersonality.REGISTER_CALL_TIMEOUT]: 'base',

  [TicabankPersonality.TICABANK_NOT_CONFIRMED]: 'e01',
  [TicabankPersonality.TICABANK_INVALID_TERM]: 'e02',
  [TicabankPersonality.TICABANK_PRODUCT_REGISTER]: 'e03',
  [TicabankPersonality.TICABANK_UNABLE_LEAD]: 'e04',
  [TicabankPersonality.TICABANK_LEAD_SOLD]: 'e05',

  [TicabankPersonality.TICABANK_BAD_REQUEST]: null,
  [TicabankPersonality.TICABANK_UNAUTHORIZED]: null,
  [TicabankPersonality.METHOD_NOT_ALLOWED]: null,
  [TicabankPersonality.LOAN_MANY_REQUESTS]: null,
  [TicabankPersonality.TICABANK_SERVER_ERROR]: null,
};

export const HTTP_STATUS_BY_PERSONALITY: Record<TicabankPersonality, number> = {
  [TicabankPersonality.LOAN_TICABANK_OK]: HttpStatusCodes.OK,

  [TicabankPersonality.OFFER_NO_DATA]: HttpStatusCodes.ACCEPTED,
  [TicabankPersonality.OFFER_CALL_FAILED]: HttpStatusCodes.NOT_FOUND,
  [TicabankPersonality.OFFER_CALL_TIMEOUT]: HttpStatusCodes.GATEWAY_TIMEOUT,

  [TicabankPersonality.SIMULATE_NO_DATA]: HttpStatusCodes.ACCEPTED,
  [TicabankPersonality.SIMULATE_CALL_FAILED]: HttpStatusCodes.NOT_FOUND,
  [TicabankPersonality.SIMULATE_CALL_TIMEOUT]: HttpStatusCodes.GATEWAY_TIMEOUT,

  [TicabankPersonality.PAYDATE_NO_DATA]: HttpStatusCodes.ACCEPTED,
  [TicabankPersonality.PAYDATE_CALL_FAILED]: HttpStatusCodes.NOT_FOUND,
  [TicabankPersonality.PAYDATE_CALL_TIMEOUT]: HttpStatusCodes.GATEWAY_TIMEOUT,

  [TicabankPersonality.QUOTE_NO_DATA]: HttpStatusCodes.ACCEPTED,
  [TicabankPersonality.QUOTE_CALL_FAILED]: HttpStatusCodes.NOT_FOUND,
  [TicabankPersonality.QUOTE_CALL_TIMEOUT]: HttpStatusCodes.GATEWAY_TIMEOUT,

  [TicabankPersonality.REGISTER_NO_DATA]: HttpStatusCodes.ACCEPTED,
  [TicabankPersonality.REGISTER_CALL_FAILED]: HttpStatusCodes.NOT_FOUND,
  [TicabankPersonality.REGISTER_CALL_TIMEOUT]: HttpStatusCodes.GATEWAY_TIMEOUT,

  [TicabankPersonality.TICABANK_NOT_CONFIRMED]: HttpStatusCodes.ACCEPTED,
  [TicabankPersonality.TICABANK_INVALID_TERM]: HttpStatusCodes.ACCEPTED,
  [TicabankPersonality.TICABANK_PRODUCT_REGISTER]: HttpStatusCodes.ACCEPTED,
  [TicabankPersonality.TICABANK_UNABLE_LEAD]: HttpStatusCodes.ACCEPTED,
  [TicabankPersonality.TICABANK_LEAD_SOLD]: HttpStatusCodes.ACCEPTED,

  [TicabankPersonality.TICABANK_BAD_REQUEST]: HttpStatusCodes.BAD_REQUEST,
  [TicabankPersonality.TICABANK_UNAUTHORIZED]: HttpStatusCodes.UNAUTHORIZED,
  [TicabankPersonality.METHOD_NOT_ALLOWED]: HttpStatusCodes.METHOD_NOT_ALLOWED,
  [TicabankPersonality.LOAN_MANY_REQUESTS]: HttpStatusCodes.TOO_MANY_REQUESTS,
  [TicabankPersonality.TICABANK_SERVER_ERROR]: HttpStatusCodes.INTERNAL_SERVER_ERROR,
};
