export interface OfferRequestDto {
  codigoPaisDocumento: string;
  tipoDocumentoIdentidad: string;
}

export interface OfferDataDto {
  codigoCliente: number;
  montoMaximoOferta: number;
  montoMinimoOferta: number;
}

export interface OfferResponseDto {
  status: number;
  data?: OfferDataDto;
}

export interface OfferErrorResponseDto {
  status: number;
  type: string;
  title: string;
  detail: string;
  instance: string;
}
