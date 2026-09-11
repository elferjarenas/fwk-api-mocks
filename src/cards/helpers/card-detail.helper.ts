import { UserRepository } from '../../repository/user-repository.js';
import { CardFormatter } from '../support/card-formatter.js';
import { CardsResponseTemplates } from '../messages/cards-response.js';
import { ATLAS_ERROR_CODES } from '../constants/parameters.js';
import { CardsPersonality } from '../constants/api-codes.js';
import { HttpStatusCodes } from '../../common/http-status-codes.js';

export class CardDetailHelper {
  /**
   * Obtiene detalle de una card específica (Sprint 2: CON extraFields)
   */
  static async getCardById(
    cardId: string,
    extraFields?: string
  ): Promise<{
    status: number;
    body: string;
  }> {
    try {
      // 1. Buscar usuario por cardId (para verificar personalidades primero)
      const user = UserRepository.findUserByCardNumber(cardId);

      // 2. Si existe usuario, verificar personalidades ANTES de validar tarjeta
      if (user) {
        const specialCase = this.handleSpecialCases(user, cardId);
        if (specialCase) return specialCase;
      }

      // 3. Buscar card por cardId
      const card = UserRepository.findCardByNumber(cardId);

      // 4. Si no existe card, retornar 400
      if (!card) {
        return {
          status: HttpStatusCodes.BAD_REQUEST,
          body: CardsResponseTemplates.cardNotFound(),
        };
      }

      // 5. Validar que tengamos el usuario (debe existir si card existe)
      if (!user) {
        return {
          status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
          body: CardsResponseTemplates.errorAtlas(
            ATLAS_ERROR_CODES.UNEXPECTED_ERROR,
            'No se encontró el usuario asociado a la tarjeta'
          ),
        };
      }

      // 6. Determinar si incluir products
      const includeProducts = extraFields === 'true';

      // 7. Formatear card con detalles completos
      const formattedCard = CardFormatter.formatCardDetail(card, user, includeProducts);

      // 8. Retornar respuesta
      return {
        status: HttpStatusCodes.OK,
        body: JSON.stringify(formattedCard),
      };
    } catch (error) {
      console.error('Error in CardDetailHelper.getCardById:', error);
      return {
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
        body: CardsResponseTemplates.errorAtlas(
          ATLAS_ERROR_CODES.UNEXPECTED_ERROR,
          'Ocurrió un error inesperado'
        ),
      };
    }
  }

  /**
   * Maneja casos especiales basados en personalities del usuario
   * 
   * LÓGICA DE PERSONALITIES (soporta múltiples personalities):
   * 1. Sin personality → retornar null (flujo normal, devuelve la tarjeta)
   * 2. Con YPCARD000 → retornar null (flujo normal, success personality)
   * 3. Sin NINGÚN personality de Cards (no contiene YPCARD) → retornar error 404 (tarjeta no encontrada)
   * 4. Con YPCARD001-010 → procesar el error específico correspondiente
   * 
   * Un usuario puede tener múltiples personalities (ej: "YTIKABANK,YPCARD000").
   * Cada squad verifica solo sus personalities sin bloquear otras funcionalidades.
   */
  private static handleSpecialCases(
    user: any,
    cardId: string
  ): {
    status: number;
    body: string;
  } | null {
    const personalities = user.personalities || [];

    // 1. Sin personality → 404 Not Found
    // Solo usuarios con YPCARD* pueden ver detalles de tarjetas
    if (personalities.length === 0) {
      return {
        status: HttpStatusCodes.NOT_FOUND,
        body: JSON.stringify({
          code: 'NOT_FOUND',
          message: 'Tarjeta no encontrada',
        }),
      };
    }

    // 2. Contiene YPCARD000 → flujo normal (success personality)
    // Soporta múltiples personalities: ["YPCARD000", "YTIKABANK"]
    if (personalities.includes(CardsPersonality.CARDS_OK)) {
      return null;
    }

    // 3. NO contiene ninguna personality de Cards → 404 Not Found
    // Esto cubre: ["YTIKABANK"] o ["YPATLS001"] (sin YPCARD)
    if (!personalities.some((p: string) => p.includes('YPCARD'))) {
      return {
        status: HttpStatusCodes.NOT_FOUND,
        body: JSON.stringify({
          code: 'NOT_FOUND',
          message: 'Tarjeta no encontrada',
        }),
      };
    }

    // 4. Procesar YPCARD001-010 (errores específicos)

    // YPCARD009 - Datos incorrectos (400)
    if (personalities.includes(CardsPersonality.CARDS_ERROR_DATOS_INCORRECTOS)) {
      return {
        status: HttpStatusCodes.BAD_REQUEST,
        body: JSON.stringify({
          code: 'BAD_REQUEST',
          message: 'Datos incorrectos en la solicitud',
        }),
      };
    }

    // YPCARD010 - Tipo de tarjeta inválido (400)
    if (personalities.includes(CardsPersonality.CARDS_ERROR_TIPO_TARJETA)) {
      return {
        status: HttpStatusCodes.BAD_REQUEST,
        body: JSON.stringify({
          code: 'BAD_REQUEST',
          message: 'Tipo de tarjeta inválido',
        }),
      };
    }

    // YPCARD001 - Error token (401)
    if (personalities.includes(CardsPersonality.CARDS_ERROR_TOKEN)) {
      return {
        status: HttpStatusCodes.UNAUTHORIZED,
        body: CardsResponseTemplates.errorToken(),
      };
    }

    // YPCARD007 - Error servicio externo (409)
    if (personalities.includes(CardsPersonality.CARDS_ERROR_SERVICIO_EXTERNO)) {
      return {
        status: HttpStatusCodes.CONFLICT,
        body: CardsResponseTemplates.errorAtlas(
          ATLAS_ERROR_CODES.SERVICE_UNAVAILABLE,
          'El servicio no se encuentra disponible'
        ),
      };
    }

    // YPCARD008 - Error backend (500)
    if (personalities.includes(CardsPersonality.CARDS_ERROR_BACKEND)) {
      return {
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
        body: CardsResponseTemplates.errorAtlas(
          ATLAS_ERROR_CODES.BACKEND_ERROR,
          'Ocurrio un error en el servicio externo'
        ),
      };
    }

    // YPCARD002 - Error timeout (503)
    if (personalities.includes(CardsPersonality.CARDS_ERROR_TIMEOUT)) {
      return {
        status: HttpStatusCodes.SERVICE_UNAVAILABLE,
        body: CardsResponseTemplates.errorTimeout(),
      };
    }

    // YPCARD004 - Servicio no disponible (500)
    if (personalities.includes(CardsPersonality.CARDS_SERVICIO_NO_DISPONIBLE)) {
      return {
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
        body: CardsResponseTemplates.errorAtlas(
          ATLAS_ERROR_CODES.UNEXPECTED_ERROR,
          'Ocurrio un error inesperado'
        ),
      };
    }

    // YPCARD005 - Circuit breaker 500
    if (personalities.includes(CardsPersonality.CARDS_ERROR_CIRCUIT_BREAKER_500)) {
      return {
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
        body: CardsResponseTemplates.errorCircuitBreaker(HttpStatusCodes.INTERNAL_SERVER_ERROR),
      };
    }

    // YPCARD006 - Circuit breaker 503
    if (personalities.includes(CardsPersonality.CARDS_ERROR_CIRCUIT_BREAKER_503)) {
      return {
        status: HttpStatusCodes.SERVICE_UNAVAILABLE,
        body: CardsResponseTemplates.errorCircuitBreaker(HttpStatusCodes.SERVICE_UNAVAILABLE),
      };
    }

    // No es caso especial
    return null;
  }
}
