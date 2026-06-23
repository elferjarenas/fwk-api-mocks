export interface PaydateResponse {
  status: number;
  data: {
    numeroDiasPago: number[];
  };
}

export interface PaydateErrorResponse {
  status: number;
  data: {
    code: string;
    message: string;
    details?: string;
  };
}
