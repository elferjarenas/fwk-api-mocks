/**
 * Ticabank Error Templates
 * Contains structured error responses with type, title, detail, and instance
 */

import { ErrorVariant } from '../constants/personality-mappings.js';
import { HttpStatusCodes } from '../../common/http-status-codes.js';

export interface ErrorTemplate {
  type: string;
  detail: string;
  instance: string;
}

export interface ErrorResponseBody {
  status: number;
  type: string;
  title: string;
  detail: string;
  instance: string;
}

/**
 * Error titles by HTTP status code
 * Corresponds to Ruby's TITLE_202, TITLE_400, etc.
 */
export const ERROR_TITLES: Record<number, string> = {
  [HttpStatusCodes.ACCEPTED]: 'La solicitud posee un error funcional.',
  [HttpStatusCodes.BAD_REQUEST]: 'La solicitud posee una sintaxis incorrecta o falta parámetro(s) requerido(s).',
  [HttpStatusCodes.UNAUTHORIZED]: 'La solicitud posee un token inválido o no presenta token.',
  [HttpStatusCodes.NOT_FOUND]: 'No se encuentra el recurso solicitado.',
  [HttpStatusCodes.METHOD_NOT_ALLOWED]: 'Método no soportado',
  [HttpStatusCodes.TOO_MANY_REQUESTS]: 'La solicitud excedió la cantidad de peticiones.',
  [HttpStatusCodes.INTERNAL_SERVER_ERROR]: 'Se ha producido un error interno en el servidor.',
  [HttpStatusCodes.GATEWAY_TIMEOUT]: 'La solicitud posee un error de timeout del servidor.',
};

/**
 * 202 Error Messages (Functional Errors) by variant and service
 * Corresponds to Ruby's MESSAGES_202
 */
export const MESSAGES_202: Record<ErrorVariant, Record<string, ErrorTemplate>> = {
  base: {
    offer: {
      type: 'lead/errors/LEAD-FUNC-001',
      detail: 'No se identifica lead para esta solicitud',
      instance: 'lead.consultar',
    },
    paydate: {
      type: 'paydate/errors/PAYDATE-FUNC-001',
      detail: 'No se encuentran días de pago disponibles',
      instance: 'paydate.obtener',
    },
    simulate: {
      type: 'simulate/errors/SIMULATE-FUNC-001',
      detail: 'No se puede simular el préstamo para este cliente',
      instance: 'simulate.generar',
    },
    quote: {
      type: 'quote/errors/QUOTE-FUNC-001',
      detail: 'No se puede generar cronograma para esta solicitud',
      instance: 'quote.obtener',
    },
    register: {
      type: 'register/errors/REGISTER-FUNC-001',
      detail: 'No se puede registrar el préstamo para este cliente',
      instance: 'register.crear',
    },
  },
  e01: {
    offer: {
      type: 'lead/errors/LEAD-FUNC-002',
      detail: 'El lead del cliente no se encuentra confirmado',
      instance: 'lead.consultar',
    },
  },
  e02: {
    offer: {
      type: 'lead/errors/LEAD-FUNC-003',
      detail: 'Cliente ya tiene solicitud vigente en curso',
      instance: 'lead.consultar',
    },
  },
  e03: {
    offer: {
      type: 'lead/errors/LEAD-FUNC-004',
      detail: 'Cliente ya tiene un desembolso o se actualizaron sus EEFF hoy',
      instance: 'lead.consultar',
    },
  },
  e04: {
    offer: {
      type: 'lead/errors/LEAD-FUNC-005',
      detail: 'Sistema no disponible - proceso de cadena en curso',
      instance: 'lead.consultar',
    },
  },
  e05: {
    offer: {
      type: 'lead/errors/LEAD-FUNC-006',
      detail: 'El lead ya se encuentra vendido',
      instance: 'lead.consultar',
    },
  },
};

/**
 * 400 Error Messages by service
 */
export const MESSAGES_400: Record<string, ErrorTemplate> = {
  offer: {
    type: 'bff-ticabank-azure-lead/sales/customer-offer/v1/lead',
    detail: 'Bad Request',
    instance: 'lead.consultar',
  },
  paydate: {
    type: 'creditos-ticabank/servicing/servicing-order/v1/simulacion/obtener-dias-pago',
    detail: 'Bad Request - Parámetros inválidos',
    instance: 'paydate.obtener',
  },
  simulate: {
    type: 'creditos-ticabank/servicing/servicing-order/v1/simulacion/generar',
    detail: 'Bad Request - Parámetros inválidos o fuera de rango',
    instance: 'simulate.generar',
  },
  quote: {
    type: 'creditos-ticabank/servicing/servicing-order/v1/simulacion/obtener-cronograma',
    detail: 'Bad Request - Parámetros inválidos o fuera de rango',
    instance: 'quote.obtener',
  },
  register: {
    type: 'creditos-ticabank/sales/customer-offer/v1/lead/registro',
    detail: 'Bad Request - Parámetros inválidos o fuera de rango',
    instance: 'register.crear',
  },
};

/**
 * 401 Error Messages by service
 */
export const MESSAGES_401: Record<string, ErrorTemplate> = {
  offer: {
    type: 'creditos-ticabank/sales/customer-offer/v1/lead/consultar',
    detail: 'Unauthorized',
    instance: 'lead.consultar',
  },
  paydate: {
    type: 'creditos-ticabank/servicing/servicing-order/v1/simulacion/obtener-dias-pago',
    detail: 'Unauthorized - Token inválido',
    instance: 'paydate.obtener',
  },
  simulate: {
    type: 'creditos-ticabank/servicing/servicing-order/v1/simulacion/generar',
    detail: 'Unauthorized - Token inválido',
    instance: 'simulate.generar',
  },
  quote: {
    type: 'creditos-ticabank/servicing/servicing-order/v1/simulacion/obtener-cronograma',
    detail: 'Unauthorized - Token inválido',
    instance: 'quote.obtener',
  },
  register: {
    type: 'creditos-ticabank/sales/customer-offer/v1/lead/registro',
    detail: 'Unauthorized - Token inválido',
    instance: 'register.crear',
  },
};

/**
 * 404 Error Messages by service
 */
export const MESSAGES_404: Record<string, ErrorTemplate> = {
  offer: {
    type: 'bff-ticabank-azure-lead/sales/customer-offer/v1/lead',
    detail: 'Operation Not Found',
    instance: 'lead.consultar',
  },
  paydate: {
    type: 'creditos-ticabank/servicing/servicing-order/v1',
    detail: 'Operation Not Found',
    instance: 'obtener.dias',
  },
  simulate: {
    type: 'creditos-ticabank/servicing/servicing-order/v1',
    detail: 'Operation Not Found',
    instance: 'simulacion.generar',
  },
  quote: {
    type: 'creditos-ticabank/servicing/servicing-order/v1',
    detail: 'Operation Not Found',
    instance: 'simulacion.generar',
  },
  register: {
    type: 'creditos-ticabank/loans-deposits/consumer-loan/v1/desembolso',
    detail: 'Operation Not Found',
    instance: 'desembolso.generar',
  },
};

/**
 * 405 Error Messages by service
 */
export const MESSAGES_405: Record<string, ErrorTemplate> = {
  offer: {
    type: 'bff-ticabank-azure-lead/sales/customer-offer/v1/lead',
    detail: 'Method Not Allowed',
    instance: 'lead.consultar',
  },
};

/**
 * 429 Error Messages by service
 */
export const MESSAGES_429: Record<string, ErrorTemplate> = {
  offer: {
    type: 'bff-ticabank-azure-lead/sales/customer-offer/v1/lead',
    detail: 'Too Many Requests',
    instance: 'lead.consultar',
  },
};

/**
 * 500 Error Messages by service
 */
export const MESSAGES_500: Record<string, ErrorTemplate> = {
  offer: {
    type: 'bff-ticabank-azure-lead/sales/customer-offer/v1/lead',
    detail: 'Internal Server Error',
    instance: 'lead.consultar',
  },
  paydate: {
    type: 'creditos-ticabank/servicing/servicing-order/v1/simulacion/obtener-dias-pago',
    detail: 'Internal Server Error',
    instance: 'paydate.obtener',
  },
  simulate: {
    type: 'creditos-ticabank/servicing/servicing-order/v1/simulacion/generar',
    detail: 'Internal Server Error',
    instance: 'simulate.generar',
  },
  quote: {
    type: 'creditos-ticabank/servicing/servicing-order/v1/simulacion/obtener-cronograma',
    detail: 'Internal Server Error',
    instance: 'quote.obtener',
  },
  register: {
    type: 'creditos-ticabank/sales/customer-offer/v1/lead/registro',
    detail: 'Internal Server Error',
    instance: 'register.crear',
  },
};

/**
 * 504 Error Messages by service
 */
export const MESSAGES_504: Record<string, ErrorTemplate> = {
  offer: {
    type: 'bff-ticabank-azure-lead/sales/customer-offer/v1/lead',
    detail: 'Gateway Timeout',
    instance: 'lead.consultar',
  },
  paydate: {
    type: 'creditos-ticabank/servicing/servicing-order/v1/simulacion/obtener-dias-pago',
    detail: 'Gateway Timeout',
    instance: 'paydate.obtener',
  },
  simulate: {
    type: 'creditos-ticabank/servicing/servicing-order/v1/simulacion/generar',
    detail: 'Gateway Timeout',
    instance: 'simulate.generar',
  },
  quote: {
    type: 'creditos-ticabank/servicing/servicing-order/v1/simulacion/obtener-cronograma',
    detail: 'Gateway Timeout',
    instance: 'quote.obtener',
  },
  register: {
    type: 'creditos-ticabank/sales/customer-offer/v1/lead/registro',
    detail: 'Gateway Timeout',
    instance: 'register.crear',
  },
};
