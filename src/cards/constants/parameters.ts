export const CARD_STATUS = {
  CONFIRMED: { code: '00', description: 'CONFIRMADA' },
  PENDING_ASSIGN: { code: '02', description: 'POR ASIGNAR' },
  BLOCKED_LOST: { code: '03', description: 'BLOQUEO POR EXTRAVIO' },
  BLOCKED_DAMAGED: { code: '04', description: 'BLOQUEO POR DETERIORO' },
  BLOCKED_PIN_FORGOTTEN: { code: '05', description: 'BLOQUEO POR OLVIDO C' },
  INTERNAL_BLOCK: { code: '06', description: 'BLOQUEO INTERNO' },
  IN_PROCESS: { code: '07', description: 'TARJETA EN TRAMITE' },
  BLOCKED_INSPECTION: { code: '09', description: 'BLOQUEO POR INSPECTORADO' },
  ATM_RETAINED: { code: '11', description: 'RETENIDA EN CAJERO' },
  READ_ERROR: { code: '13', description: 'BLQ X ERROR LECTURA' },
} as const;

export const CARD_TYPE = {
  PHYSICAL: { code: '00', description: 'PHYSICAL' },
  DIGITAL: { code: '01', description: 'DIGITAL' },
} as const;

export const INTERNET_ACCESS_STATUS = {
  ACTIVE: { code: '3', description: 'Activa' },
  NONE: { code: '0', description: 'None' },
} as const;

export const ATLAS_ERROR_CODES = {
  SERVICE_UNAVAILABLE: 'TL0004',
  SERVER_NOT_FOUND: 'TL0005',
  DATA_CRITERIA_ERROR: 'TL0006',
  BACKEND_ERROR: 'TL0007',
  UNEXPECTED_ERROR: 'TL9999',
} as const;
