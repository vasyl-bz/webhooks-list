import { createCsrfStore } from './csrf';
import { ApiError, NETWORK_ERROR_STATUS, isAbortError, toApiError } from './errors';

type Method = 'GET' | 'POST' | 'PUT';

type QueryValue = string | number | undefined;

export interface RequestOptions {
  query?: Record<string, QueryValue>;
  headers?: Record<string, string>;
  signal?: AbortSignal | undefined;
  skipSessionRefresh?: boolean;
}

export interface HttpClientConfig {
  baseUrl: string;
  refreshSession: () => Promise<unknown>;
}

export interface HttpClient {
  get<T>(path: string, options?: RequestOptions): Promise<T>;
  post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T>;
  put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T>;
  onSessionExpired(listener: () => void): () => void;
}

interface Attempt {
  csrfRetried: boolean;
  sessionRefreshed: boolean;
}

const CSRF_HEADER = 'X-CSRF-TOKEN';
const STATE_CHANGING_METHODS: ReadonlySet<Method> = new Set(['POST', 'PUT']);

function buildUrl(baseUrl: string, path: string, query: RequestOptions['query']): string {
  const url = new URL(`${baseUrl}${path}`, globalThis.location?.origin);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== '') url.searchParams.set(key, String(value));
  }
  return url.toString();
}

async function parseBody<T>(response: Response): Promise<T> {
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

async function performFetch(url: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(url, { ...init, credentials: 'include' });
  } catch (error) {
    if (isAbortError(error)) throw error;
    throw new ApiError(NETWORK_ERROR_STATUS, 'NetworkError', 'Network request failed');
  }
}

export function createHttpClient({ baseUrl, refreshSession }: HttpClientConfig): HttpClient {
  const expiredListeners = new Set<() => void>();
  let sessionGeneration = 0;
  let refreshing: Promise<void> | null = null;

  const csrf = createCsrfStore(async () => {
    const response = await performFetch(buildUrl(baseUrl, '/csrf', undefined), {
      method: 'GET',
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
    });
    if (!response.ok) throw await toApiError(response);
    const token = response.headers.get(CSRF_HEADER);
    if (!token) throw new ApiError(response.status, 'UnknownError', 'CSRF token header is missing');
    return token;
  });

  function expireSession() {
    for (const listener of expiredListeners) listener();
  }

  function refreshOnce(): Promise<void> {
    refreshing ??= refreshSession()
      .then(() => {
        sessionGeneration += 1;
      })
      .catch((error: unknown) => {
        expireSession();
        throw error;
      })
      .finally(() => {
        refreshing = null;
      });
    return refreshing;
  }

  async function send<T>(
    method: Method,
    path: string,
    body: unknown,
    options: RequestOptions,
    attempt: Attempt,
  ): Promise<T> {
    const csrfToken = await csrf.get();
    const generation = sessionGeneration;

    const headers: Record<string, string> = {
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...options.headers,
    };
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (STATE_CHANGING_METHODS.has(method)) headers[CSRF_HEADER] = csrfToken;

    const response = await performFetch(buildUrl(baseUrl, path, options.query), {
      method,
      headers,
      body: body === undefined ? null : JSON.stringify(body),
      signal: options.signal ?? null,
    });

    if (response.ok) return parseBody<T>(response);

    const error = await toApiError(response);

    if (error.status === 419 && !attempt.csrfRetried) {
      csrf.invalidate(csrfToken);
      return send<T>(method, path, body, options, { ...attempt, csrfRetried: true });
    }

    if (error.status === 401 && !options.skipSessionRefresh) {
      if (attempt.sessionRefreshed) {
        expireSession();
        throw error;
      }
      if (generation === sessionGeneration) {
        try {
          await refreshOnce();
        } catch {
          throw error;
        }
      }
      return send<T>(method, path, body, options, { ...attempt, sessionRefreshed: true });
    }

    throw error;
  }

  const firstAttempt: Attempt = { csrfRetried: false, sessionRefreshed: false };

  return {
    get: (path, options = {}) => send('GET', path, undefined, options, firstAttempt),
    post: (path, body, options = {}) => send('POST', path, body, options, firstAttempt),
    put: (path, body, options = {}) => send('PUT', path, body, options, firstAttempt),
    onSessionExpired(listener) {
      expiredListeners.add(listener);
      return () => {
        expiredListeners.delete(listener);
      };
    },
  };
}
