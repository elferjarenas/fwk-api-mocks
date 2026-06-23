import { HttpStatusCodes } from '../../common/http-status-codes';
import { CardsPersonality } from './api-codes';

export const PERSONALITY_BY_ENDPOINT: Record<string, Set<CardsPersonality>> = {
  GLOBAL: new Set([
    CardsPersonality.CARDS_ERROR_TOKEN,
    CardsPersonality.CARDS_ERROR_BACKEND,
    CardsPersonality.CARDS_ERROR_TIMEOUT,
    CardsPersonality.CARDS_SERVICIO_NO_DISPONIBLE,
  ]),
  CARDS_LIST: new Set([
    CardsPersonality.CARDS_ERROR_IDC_INVALIDO,
    CardsPersonality.CARDS_ERROR_SERVICIO_EXTERNO,
    CardsPersonality.CARDS_ERROR_CIRCUIT_BREAKER_500,
    CardsPersonality.CARDS_ERROR_CIRCUIT_BREAKER_503,
  ]),
  CARDS_DETAIL: new Set([
    CardsPersonality.CARDS_ERROR_DATOS_INCORRECTOS,
    CardsPersonality.CARDS_ERROR_TIPO_TARJETA,
    CardsPersonality.CARDS_ERROR_CIRCUIT_BREAKER_500,
    CardsPersonality.CARDS_ERROR_CIRCUIT_BREAKER_503,
  ]),
  CARDS_UPDATE: new Set([
    CardsPersonality.CARDS_ERROR_DATOS_INCORRECTOS,
    CardsPersonality.CARDS_ERROR_SERVICIO_EXTERNO,
  ]),
};

export const SUCCESS_PERSONALITIES = new Set<CardsPersonality>([
  CardsPersonality.CARDS_OK,
]);

export const PERSONALITY_STATUS_MAP: Record<CardsPersonality, number> = {
  [CardsPersonality.CARDS_OK]: HttpStatusCodes.OK,
  [CardsPersonality.CARDS_ERROR_TOKEN]: HttpStatusCodes.UNAUTHORIZED,
  [CardsPersonality.CARDS_ERROR_IDC_INVALIDO]: HttpStatusCodes.BAD_REQUEST,
  [CardsPersonality.CARDS_ERROR_DATOS_INCORRECTOS]: HttpStatusCodes.BAD_REQUEST,
  [CardsPersonality.CARDS_ERROR_TIPO_TARJETA]: HttpStatusCodes.BAD_REQUEST,
  [CardsPersonality.CARDS_ERROR_SERVICIO_EXTERNO]: HttpStatusCodes.CONFLICT,
  [CardsPersonality.CARDS_ERROR_BACKEND]: HttpStatusCodes.INTERNAL_SERVER_ERROR,
  [CardsPersonality.CARDS_SERVICIO_NO_DISPONIBLE]: HttpStatusCodes.INTERNAL_SERVER_ERROR,
  [CardsPersonality.CARDS_ERROR_CIRCUIT_BREAKER_500]: HttpStatusCodes.INTERNAL_SERVER_ERROR,
  [CardsPersonality.CARDS_ERROR_TIMEOUT]: HttpStatusCodes.SERVICE_UNAVAILABLE,
  [CardsPersonality.CARDS_ERROR_CIRCUIT_BREAKER_503]: HttpStatusCodes.SERVICE_UNAVAILABLE,
};

export const PERSONALITY_DESCRIPTION_MAP: Record<CardsPersonality, string> = {
  [CardsPersonality.CARDS_OK]: 'Respuesta exitosa',
  [CardsPersonality.CARDS_ERROR_TOKEN]: 'Token inválido o expirado',
  [CardsPersonality.CARDS_ERROR_IDC_INVALIDO]: 'IDC inválido',
  [CardsPersonality.CARDS_ERROR_DATOS_INCORRECTOS]: 'Datos incorrectos en la solicitud',
  [CardsPersonality.CARDS_ERROR_TIPO_TARJETA]: 'Tipo de tarjeta no existe',
  [CardsPersonality.CARDS_ERROR_SERVICIO_EXTERNO]: 'Servicio externo no disponible',
  [CardsPersonality.CARDS_ERROR_BACKEND]: 'Error en backend',
  [CardsPersonality.CARDS_SERVICIO_NO_DISPONIBLE]: 'Servicio no disponible',
  [CardsPersonality.CARDS_ERROR_CIRCUIT_BREAKER_500]: 'Circuit breaker abierto (500)',
  [CardsPersonality.CARDS_ERROR_TIMEOUT]: 'Timeout de servicio',
  [CardsPersonality.CARDS_ERROR_CIRCUIT_BREAKER_503]: 'Circuit breaker abierto (503)',
};
