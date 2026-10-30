import { HttpResponse } from 'msw';
import type { ApiErrorBody, ApiErrorType, ValidationPayload } from '../api/types';

function errorResponse(status: number, type: ApiErrorType | 'ServerException', message: string, payload?: ValidationPayload) {
  const body: ApiErrorBody = { error: payload ? { type, message, payload } : { type, message } };
  return HttpResponse.json(body, { status });
}

export const errors = {
  badRequest: (message = 'Bad request.') => errorResponse(400, 'BadRequestException', message),
  unauthenticated: () => errorResponse(401, 'AuthenticationException', 'Unauthenticated.'),
  notFound: () => errorResponse(404, 'NotFoundException', 'Not found.'),
  tokenMismatch: () => errorResponse(419, 'TokenMismatchException', 'CSRF token mismatch.'),
  validation: (payload: ValidationPayload) =>
    errorResponse(422, 'ValidationException', 'The given data was invalid.', payload),
  server: () => errorResponse(500, 'ServerException', 'Internal server error.'),
};

export const empty = (status: 200 | 204) => new HttpResponse(null, { status });
