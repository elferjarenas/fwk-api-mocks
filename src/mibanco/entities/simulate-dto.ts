export interface SimulateRequest {
  codigoCliente: number;
  montoSolicitado: number;
  numeroDiaPago: number;
}

export interface Installment {
  montoCuotaSimulacion: number;
  cantidadCuotas: number;
}

export interface SimulateResponse {
  status: number;
  data: Installment[];
}

export interface SimulateErrorResponse {
  status: number;
  data: {
    code: string;
    message: string;
    field?: string;
  };
}
