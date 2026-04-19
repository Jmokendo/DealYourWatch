export type ServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; status: number };

export function serviceOk<T>(data: T): ServiceResult<T> {
  return { ok: true, data };
}

export function serviceFail<T = never>(error: string, status: number): ServiceResult<T> {
  return { ok: false, error, status };
}

export class ServiceError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ServiceError";
  }
}
