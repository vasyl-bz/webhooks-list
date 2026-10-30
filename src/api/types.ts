export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  name: string;
}

export interface Credentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  device_session_token: string;
}

export type WebhookId = number;

export interface Webhook {
  id: WebhookId;
  name: string;
  url: string;
  active: boolean;
  created_at: string;
}

export interface WebhookInput {
  name: string;
  url: string;
}

export interface Paging {
  pages: { current: number; last: number };
  results: { total: number; limitation: number };
}

export interface WebhookList {
  data: Webhook[];
  paging: Paging;
}

export interface WebhookListQuery {
  page: number;
  limit: number;
  search: string;
}

export type ValidationPayload = Record<string, string[]>;

export type ApiErrorType =
  | 'BadRequestException'
  | 'AuthenticationException'
  | 'NotFoundException'
  | 'TokenMismatchException'
  | 'ValidationException';

export interface ApiErrorBody {
  error: {
    type: ApiErrorType | (string & {});
    message: string;
    payload?: ValidationPayload;
  };
}
