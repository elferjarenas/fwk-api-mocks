export interface ErrorBody {
  status: number;
  type: string;
  title: string;
  detail: string;
  instance: string;
}

export abstract class BusinessException extends Error {
  public readonly status: number;
  public readonly errorBody: ErrorBody;

  constructor(message: string, status: number, errorBody: ErrorBody) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.errorBody = errorBody;

    Error.captureStackTrace(this, this.constructor);
  }
}

export function isBusinessException(error: unknown): error is BusinessException {
  return error instanceof BusinessException;
}
