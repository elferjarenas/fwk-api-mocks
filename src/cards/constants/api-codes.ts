export enum CardsPersonality {
  CARDS_OK = 'YPCARD000',

  CARDS_ERROR_TOKEN = 'YPCARD001',           // 401 - Token inválido o expirado
  CARDS_ERROR_IDC_INVALIDO = 'YPCARD003',    // 400 - IDC inválido
  CARDS_ERROR_DATOS_INCORRECTOS = 'YPCARD009', // 400 - Datos incorrectos
  CARDS_ERROR_TIPO_TARJETA = 'YPCARD010',    // 400 - Tipo de tarjeta inválido

  CARDS_ERROR_SERVICIO_EXTERNO = 'YPCARD007', // 409 - Servicio externo no disponible

  CARDS_ERROR_BACKEND = 'YPCARD008',         // 500 - Error en backend
  CARDS_SERVICIO_NO_DISPONIBLE = 'YPCARD004', // 500 - Servicio no disponible
  CARDS_ERROR_CIRCUIT_BREAKER_500 = 'YPCARD005', // 500 - Circuit breaker abierto

  CARDS_ERROR_TIMEOUT = 'YPCARD002',         // 503 - Timeout de servicio
  CARDS_ERROR_CIRCUIT_BREAKER_503 = 'YPCARD006', // 503 - Circuit breaker abierto
}