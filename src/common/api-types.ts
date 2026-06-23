export interface ApiError {
  status: number;
  type: string;
  title: string;
  detail: string;
  instance: string;
}

export interface ApiResponse<T = unknown> {
  status: number;
  data?: T;
  message?: string;
}

export interface TestingResponse {
  success: boolean;
  message: string;
  email?: string;
  personality?: string | null;
  [key: string]: unknown;
}

export interface PopulateResult {
  usersCreated: number;
  personalitiesSet: number;
  cardsCreated: number;
  accountsCreated: number;
  errors: string[];
}
