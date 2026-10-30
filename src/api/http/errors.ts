import type { ApiErrorBody, ValidationPayload } from '../types';

export const NETWORK_ERROR_STATUS = 0;

export class ApiError extends Error {
  readonly status: number;
  readonly type: string;
  readonly payload: ValidationPayload | undefined;

  constructor(status: number, type: string, message: string, payload?: ValidationPayload) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.type = type;
    this.payload = payload;
  }
}

export interface ValidationError extends ApiError {
  readonly status: 422;
  readonly payload: ValidationPayload;
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function isValidationError(error: unknown): error is ValidationError {
  return isApiError(error) && error.status === 422 && error.payload !== undefined;
}

export function isUnauthorizedError(error: unknown): error is ApiError {
  return isApiError(error) && error.status === 401;
}

export function isNotFoundError(error: unknown): error is ApiError {
  return isApiError(error) && error.status === 404;
}

export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isValidationPayload(value: unknown): value is ValidationPayload {
  return (
    isRecord(value) &&
    Object.values(value).every(
      (messages) => Array.isArray(messages) && messages.every((message) => typeof message === 'string'),
    )
  );
}

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  if (!isRecord(value) || !isRecord(value.error)) return false;
  const { type, message, payload } = value.error;
  return (
    typeof type === 'string' &&
    typeof message === 'string' &&
    (payload === undefined || isValidationPayload(payload))
  );
}

export async function toApiError(response: Response): Promise<ApiError> {
  const body: unknown = await response.json().catch(() => null);
  if (isApiErrorBody(body)) {
    const { type, message, payload } = body.error;
    return new ApiError(response.status, type, message, payload);
  }
  return new ApiError(response.status, 'UnknownError', response.statusText || 'Unexpected response');
}
