import { ATLAS_ERROR_CODES } from '../constants/parameters.js';

export class CardsResponseTemplates {
  /**
   * Response para IDC no existe o sin tarjetas
   */
  static emptyArray(): string {
    return '[]';
  }

  /**
   * Response para IDC inválido
   */
  static idcInvalido(): string {
    return JSON.stringify({
      code: 'BAD_REQUEST',
      message: 'IDC inválido',
    });
  }

  /**
   * Response para error de token
   */
  static errorToken(): string {
    return JSON.stringify({
      code: 'UNAUTHORIZED',
      message: 'Token inválido o expirado',
    });
  }

  /**
   * Response para errores de Atlas
   */
  static errorAtlas(errorCode: string, errorDescription: string): string {
    return JSON.stringify({
      errorCode,
      errorDescription,
    });
  }

  /**
   * Response para timeout
   */
  static errorTimeout(): string {
    return JSON.stringify({
      code: 'SERVICE_UNAVAILABLE',
      message: 'Timeout al procesar la solicitud',
    });
  }

  /**
   * Response para servicio externo (409)
   */
  static errorServicioExterno(): string {
    return JSON.stringify({
      errorCode: 'TL0004',
      errorDescription: 'Error en servicio externo',
    });
  }

  /**
   * Response para error de comunicación con backend (500)
   */
  static errorComunicacionBackend(): string {
    return JSON.stringify({
      errorCode: 'TL0006',
      errorDescription: 'Error de comunicación con backend',
    });
  }

  /**
   * Response para error en backend (500)
   */
  static errorBackend(): string {
    return JSON.stringify({
      errorCode: 'TL0001',
      errorDescription: 'Error en el backend',
    });
  }

  /**
   * Response para servicio no disponible (500)
   */
  static servicioNoDisponible(): string {
    return JSON.stringify({
      errorCode: 'TL0005',
      errorDescription: 'Servicio no disponible',
    });
  }

  /**
   * Response para circuit breaker con código específico
   */
  static errorCircuitBreaker(statusCode: number): string {
    return JSON.stringify({
      errorCode: `CB${statusCode}`,
      errorDescription: `Circuit breaker abierto - Status ${statusCode}`,
    });
  }

  /**
   * Response para datos incorrectos (400)
   */
  static errorDatosIncorrectos(): string {
    return JSON.stringify({
      code: 'BAD_REQUEST',
      message: 'Datos incorrectos en la solicitud',
    });
  }

  /**
   * Response para tipo de tarjeta no válido (400)
   */
  static errorTipoTarjeta(): string {
    return JSON.stringify({
      code: 'BAD_REQUEST',
      message: 'Tipo de tarjeta no válido',
    });
  }

  /**
   * Response para tarjeta no existe
   */
  static cardNotFound(): string {
    return JSON.stringify({
      code: 'BAD_REQUEST',
      message: 'Tarjeta no encontrada',
    });
  }

  /**
   * Headers por defecto
   */
  static getDefaultHeaders(): Record<string, string> {
    return {
      'Request-ID': this.generateUUID(),
      'opn-nro-host': this.generateUUID(),
    };
  }

  private static generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
