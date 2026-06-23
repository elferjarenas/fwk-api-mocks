export interface BiometryStatusRequest {
  documentType: string;
  documentNumber: string;
  identificationType: string;
}

export interface BiometryStatusResponse {
  isFacialEnrolled: boolean;
  flowProcessId: string;
}
