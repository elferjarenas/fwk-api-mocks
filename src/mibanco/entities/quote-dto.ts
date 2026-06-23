export interface QuoteRequest {
  codigoCliente: number;
  montoSolicitado: number;
  cantidadCuotas: number;
  numeroDiaPago: number;
}

export interface ScheduleItem {
  numeroCuota: number;
  montoCapital: number;
  montoInteres: number;
  fechaVencimientoCuota: string;
}

export interface QuoteData {
  numeroDiaPago: number;
  fechaVencimiento: string;
  montoTotalCapital: number;
  montoTotalInteres: number;
  montoImpuestoTransaccionesFinancieras: number;
  montoPrimaDesgravamen: number;
  porcentajeTasaSeguroDesgravamen: number;
  montoCuotaSimulacion: number;
  porcentajeTasaInteres: number;
  porcentajeTasaEfectivaAnual: number;
  porcentajeTasaCostoEfectivaAnual: number;
  montoNetoSolicitado: number;
  porcentajeTasaMora: number;
  cronograma: ScheduleItem[];
}

export interface QuoteResponse {
  status: number;
  data: QuoteData;
}

export interface QuoteErrorResponse {
  status: number;
  data: {
    code: string;
    message: string;
    field?: string;
  };
}
