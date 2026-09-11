export interface EncryptedData {
  data: string;
  key: string;
  iv: string;
}

export interface RegisterRequest {
  codigoCliente: string;
  montoSolicitado: string;
  cantidadCuotas: string;
  numeroDiaPago: string;
  loanId: string;
  encryptedData: EncryptedData;
}

export interface RegisterResponse {
  status: number;
}

export interface RegisterErrorResponse {
  status: number;
  type: string;
  title: string;
  detail: string;
  instance: string;
}
