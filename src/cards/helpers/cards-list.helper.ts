import { UserRepository } from '../../repository/user-repository.js';
import { CardFormatter } from '../support/card-formatter.js';
import { CardsResponseTemplates } from '../messages/cards-response.js';
import { ATLAS_ERROR_CODES } from '../constants/parameters.js';
import { CardsPersonality } from '../constants/api-codes.js';
import { Pagination } from '../support/pagination.js';
import { HttpStatusCodes } from '../../common/http-status-codes.js';

export class CardsListHelper {
  /**
   * Obtiene lista de cards (CON paginación en Sprint 2, CON extraFields)
   */
  static async getCards(
    personId: string,
    pageNumber?: string,
    extraFields?: string
  ): Promise<{
    status: number;
    body: string;
    headers: Record<string, string>;
  }> {
    try {
      // 1. Extraer IDC (quitar últimos 3 dígitos)
      const idc = personId.substring(0, personId.length - 3);

      // 2. Buscar persona
      const user = await UserRepository.findByIdc(idc);

      // 3. Validar casos especiales (personalities)
      const specialCase = this.handleSpecialCases(user);
      if (specialCase) return specialCase;

      // 4. Obtener cards del usuario
      const allCards = user!.cards || [];

      // 5. Si no tiene tarjetas, retornar array vacío
      if (allCards.length === 0) {
        return {
          status: HttpStatusCodes.OK,
          body: CardsResponseTemplates.emptyArray(),
          headers: {
            ...CardsResponseTemplates.getDefaultHeaders(),
            'items-pending': 'false',
          },
        };
      }

      // 6. Aplicar paginación (15 cards por página)
      const paginationResult = Pagination.paginate(allCards, pageNumber, 15);

      // 7. Determinar si incluir products
      const includeProducts = extraFields === 'true';

      // 8. Formatear cards
      const formattedCards = paginationResult.items.map((card) => CardFormatter.formatCard(card, includeProducts));

      // 9. Construir headers con paginación
      const headers: Record<string, string> = {
        ...CardsResponseTemplates.getDefaultHeaders(),
        'items-pending': paginationResult.hasMore.toString(),
        'content-type': 'application/stream+json; charset=utf-8',
      };

      // Agregar page-number solo si hay más páginas
      if (paginationResult.nextCursor) {
        headers['page-number'] = paginationResult.nextCursor;
      }

      // 10. Construir respuesta
      return {
        status: HttpStatusCodes.OK,
        body: JSON.stringify(formattedCards),
        headers: headers,
      };
    } catch (error) {
      console.error('Error in CardsListHelper.getCards:', error);
      return {
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
        body: CardsResponseTemplates.errorAtlas(
          ATLAS_ERROR_CODES.UNEXPECTED_ERROR,
          'Ocurrió un error inesperado'
        ),
        headers: CardsResponseTemplates.getDefaultHeaders(),
      };
    }
  }

  /**
   * Maneja casos especiales basados en personalities
   * Lógica (soporta múltiples personalities):
   * - Si no hay usuario: retorna array vacío (200)
   * - Si no tiene personality: permite flujo normal (retorna null)
   * - Si tiene personality YPCARD000: permite flujo normal (success)
   * - Si NO contiene ningún YPCARD: retorna array vacío (otro squad)
   * - Si contiene YPCARD###: evalúa error correspondiente
   * 
   * Un usuario puede tener múltiples personalities (ej: "YPMIBANCO,YPCARD000").
   * Cada squad verifica solo sus personalities sin bloquear otras funcionalidades.
   */
  private static handleSpecialCases(user: any): {
    status: number;
    body: string;
    headers: Record<string, string>;
  } | null {
    // Usuario no existe
    if (!user) {
      return {
        status: HttpStatusCodes.OK,
        body: CardsResponseTemplates.emptyArray(),
        headers: {
          ...CardsResponseTemplates.getDefaultHeaders(),
          'items-pending': 'false',
        },
      };
    }

    const personalities = user.personalities || [];

    // Si no tiene personalities, devuelve array vacío
    // Solo usuarios con YPCARD* pueden ver sus tarjetas
    if (personalities.length === 0) {
      return {
        status: HttpStatusCodes.OK,
        body: CardsResponseTemplates.emptyArray(),
        headers: {
          ...CardsResponseTemplates.getDefaultHeaders(),
          'items-pending': 'false',
        },
      };
    }

    // Si contiene personality YPCARD000 (success), permite flujo normal
    // Soporta múltiples personalities: ["YPCARD000", "YPMIBANCO"]
    if (personalities.includes(CardsPersonality.CARDS_OK)) {
      return null;
    }

    // Si NO contiene ninguna personality de Cards, retorna vacío
    // Esto cubre: ["YPMIBANCO"] o ["YPATLS001"] (sin YPCARD)
    if (!personalities.some((p: string) => p.includes('YPCARD'))) {
      return {
        status: HttpStatusCodes.OK,
        body: CardsResponseTemplates.emptyArray(),
        headers: {
          ...CardsResponseTemplates.getDefaultHeaders(),
          'items-pending': 'false',
        },
      };
    }

    // YPCARD003 - IDC inválido (400)
    if (personalities.includes(CardsPersonality.CARDS_ERROR_IDC_INVALIDO)) {
      return {
        status: HttpStatusCodes.BAD_REQUEST,
        body: CardsResponseTemplates.idcInvalido(),
        headers: CardsResponseTemplates.getDefaultHeaders(),
      };
    }

    // YPCARD001 - Error token (401)
    if (personalities.includes(CardsPersonality.CARDS_ERROR_TOKEN)) {
      return {
        status: HttpStatusCodes.UNAUTHORIZED,
        body: CardsResponseTemplates.errorToken(),
        headers: CardsResponseTemplates.getDefaultHeaders(),
      };
    }

    // YPCARD007 - Error servicio externo (409)
    if (personalities.includes(CardsPersonality.CARDS_ERROR_SERVICIO_EXTERNO)) {
      return {
        status: HttpStatusCodes.CONFLICT,
        body: CardsResponseTemplates.errorAtlas(
          ATLAS_ERROR_CODES.SERVICE_UNAVAILABLE,
          'El servicio no se encuentra disponible. Por favor reintente mas tarde'
        ),
        headers: CardsResponseTemplates.getDefaultHeaders(),
      };
    }

    // YPCARD008 - Error backend (500)
    if (personalities.includes(CardsPersonality.CARDS_ERROR_BACKEND)) {
      return {
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
        body: CardsResponseTemplates.errorAtlas(
          ATLAS_ERROR_CODES.BACKEND_ERROR,
          'Ocurrio un error en el servicio externo.'
        ),
        headers: CardsResponseTemplates.getDefaultHeaders(),
      };
    }

    // YPCARD004 - Servicio no disponible (500)
    if (personalities.includes(CardsPersonality.CARDS_SERVICIO_NO_DISPONIBLE)) {
      return {
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
        body: CardsResponseTemplates.errorAtlas(
          ATLAS_ERROR_CODES.UNEXPECTED_ERROR,
          'Ocurrio un error inesperado. Por favor contactarse con el Soporte Tecnico'
        ),
        headers: CardsResponseTemplates.getDefaultHeaders(),
      };
    }

    // YPCARD002 - Error timeout (503)
    if (personalities.includes(CardsPersonality.CARDS_ERROR_TIMEOUT)) {
      return {
        status: HttpStatusCodes.SERVICE_UNAVAILABLE,
        body: CardsResponseTemplates.errorTimeout(),
        headers: CardsResponseTemplates.getDefaultHeaders(),
      };
    }

    // YPCARD005 - Error circuit breaker 500
    if (personalities.includes(CardsPersonality.CARDS_ERROR_CIRCUIT_BREAKER_500)) {
      return {
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
        body: CardsResponseTemplates.errorCircuitBreaker(HttpStatusCodes.INTERNAL_SERVER_ERROR),
        headers: CardsResponseTemplates.getDefaultHeaders(),
      };
    }

    // YPCARD006 - Error circuit breaker 503
    if (personalities.includes(CardsPersonality.CARDS_ERROR_CIRCUIT_BREAKER_503)) {
      return {
        status: HttpStatusCodes.SERVICE_UNAVAILABLE,
        body: CardsResponseTemplates.errorCircuitBreaker(HttpStatusCodes.SERVICE_UNAVAILABLE),
        headers: CardsResponseTemplates.getDefaultHeaders(),
      };
    }

    // No es caso especial
    return null;
  }
}
