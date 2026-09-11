import { UserRepository } from '../../repository/user-repository.js';
import { CardsResponseTemplates } from '../messages/cards-response.js';
import { CardsPersonality } from '../constants/api-codes.js';
import { HttpStatusCodes } from '../../common/http-status-codes.js';

export class CardUpdateHelper {
  /**
   * Actualiza configuración de una tarjeta (electronicCommerce, abroadUsage)
   */
  static async updateCard(
    cardId: string,
    body: { ecommerceEnabled?: boolean; abroadUseEnabled?: boolean }
  ): Promise<{
    status: number;
    body?: string;
  }> {
    try {
      // Validar que al menos uno esté presente
      if (body.ecommerceEnabled === undefined && body.abroadUseEnabled === undefined) {
        return {
          status: HttpStatusCodes.BAD_REQUEST,
          body: JSON.stringify({
            code: 'BAD_REQUEST',
            message: "Missing body 'abroadUseEnabled and ecommerceEnabled'",
          }),
        };
      }

      // 1. Buscar usuario por cardId (para verificar personalidades primero)
      const user = UserRepository.findUserByCardNumber(cardId);

      // 2. Si existe usuario, verificar personalidades ANTES de validar tarjeta
      if (user) {
        const specialCase = this.handleSpecialCases(user);
        if (specialCase) return specialCase;
      }

      // 3. Buscar card por número
      const card = UserRepository.findCardByNumber(cardId);

      if (!card) {
        return {
          status: HttpStatusCodes.BAD_REQUEST,
          body: CardsResponseTemplates.cardNotFound(),
        };
      }

      // 4. Validar que tengamos el usuario (debe existir si card existe)
      if (!user) {
        return {
          status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
          body: JSON.stringify({
            code: 'INTERNAL_ERROR',
            message: 'No se encontró el usuario asociado a la tarjeta',
          }),
        };
      }

      // Actualizar campos si están presentes
      if (body.ecommerceEnabled !== undefined) {
        card.electronic_commerce = body.ecommerceEnabled as any;
      }

      if (body.abroadUseEnabled !== undefined) {
        card.abroadUsageEnabled = body.abroadUseEnabled as any;
      }

      // Retornar 204 sin body
      return {
        status: 204,
      };
    } catch (error) {
      console.error('Error in CardUpdateHelper.updateCard:', error);
      return {
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
        body: JSON.stringify({
          code: 'INTERNAL_ERROR',
          message: 'Ocurrió un error inesperado',
        }),
      };
    }
  }

  /**
   * Maneja casos especiales basados en personalities
   * 
   * LÓGICA DE PERSONALITIES (soporta múltiples personalities):
   * 1. Sin personality → retornar null (flujo normal, actualiza la tarjeta)
   * 2. Con YPCARD000 → retornar null (flujo normal, success personality)
   * 3. Sin NINGÚN personality de Cards (no contiene YPCARD) → retornar error 404 (tarjeta no encontrada)
   * 4. Con YPCARD001-010 → procesar el error específico correspondiente
   * 
   * Un usuario puede tener múltiples personalities (ej: "YTIKABANK,YPCARD000").
   * Cada squad verifica solo sus personalities sin bloquear otras funcionalidades.
   */
  private static handleSpecialCases(user: any): {
    status: number;
    body?: string;
  } | null {
    const personalities = user.personalities || [];

    // 1. Sin personality → 404 Not Found
    // Solo usuarios con YPCARD* pueden actualizar tarjetas
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

    // YPCARD001 - Error token (401)
    if (personalities.includes(CardsPersonality.CARDS_ERROR_TOKEN)) {
      return {
        status: HttpStatusCodes.UNAUTHORIZED,
        body: CardsResponseTemplates.errorToken(),
      };
    }

    // YPCARD009 - Datos incorrectos (400)
    if (personalities.includes(CardsPersonality.CARDS_ERROR_DATOS_INCORRECTOS)) {
      return {
        status: HttpStatusCodes.BAD_REQUEST,
        body: CardsResponseTemplates.errorDatosIncorrectos(),
      };
    }

    // YPCARD007 - Error servicio externo (409)
    if (personalities.includes(CardsPersonality.CARDS_ERROR_SERVICIO_EXTERNO)) {
      return {
        status: HttpStatusCodes.CONFLICT,
        body: CardsResponseTemplates.errorServicioExterno(),
      };
    }

    // YPCARD008 - Error backend (500)
    if (personalities.includes(CardsPersonality.CARDS_ERROR_BACKEND)) {
      return {
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
        body: CardsResponseTemplates.errorBackend(),
      };
    }

    // YPCARD002 - Error timeout (503)
    if (personalities.includes(CardsPersonality.CARDS_ERROR_TIMEOUT)) {
      return {
        status: HttpStatusCodes.SERVICE_UNAVAILABLE,
        body: CardsResponseTemplates.errorTimeout(),
      };
    }

    // No es caso especial
    return null;
  }
}
