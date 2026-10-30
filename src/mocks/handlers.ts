import { HttpResponse, delay, http } from 'msw';
import type { LoginResponse, User, ValidationPayload, Webhook, WebhookList } from '../api/types';
import { type MockDb, isSessionActive, startSession } from './db';
import { empty, errors } from './responses';

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;
const MAX_NAME_LENGTH = 255;
const FINGERPRINT_PATTERN = /^[0-9a-f]{32}$/;

export interface HandlerOptions {
  latencyMs?: number;
  shouldFail?: (request: Request) => boolean;
}

type Body = Record<string, unknown>;

const endpoint = (path: string) => `*/api${path}`;

function isRecord(value: unknown): value is Body {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

async function readBody(request: Request): Promise<Body> {
  const body: unknown = await request.json().catch(() => null);
  return isRecord(body) ? body : {};
}

function readString(body: Body, key: string): string {
  const value = body[key];
  return typeof value === 'string' ? value : '';
}

function toPositiveInt(value: string | null, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function collectErrors(rules: Record<string, string | null>): ValidationPayload | null {
  const payload: ValidationPayload = {};
  for (const [field, message] of Object.entries(rules)) {
    if (message !== null) payload[field] = [message];
  }
  return Object.keys(payload).length > 0 ? payload : null;
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (url.protocol === 'http:' || url.protocol === 'https:') && url.hostname !== '';
  } catch {
    return false;
  }
}

function validateWebhook(name: string, url: string): ValidationPayload | null {
  return collectErrors({
    name: !name
      ? 'The name field is required.'
      : name.length > MAX_NAME_LENGTH
        ? `The name may not be greater than ${MAX_NAME_LENGTH} characters.`
        : null,
    url: !url ? 'The url field is required.' : isHttpUrl(url) ? null : 'The url must be a valid URL.',
  });
}

export function createHandlers(db: MockDb, { latencyMs = 0, shouldFail = () => false }: HandlerOptions = {}) {
  const wait = () => (latencyMs > 0 ? delay(latencyMs) : Promise.resolve());
  const hasValidCsrf = (request: Request) => request.headers.get('X-CSRF-TOKEN') === db.csrfToken;
  const findWebhook = (id: string) => db.webhooks.find((webhook) => String(webhook.id) === id);

  return [
    http.get(endpoint('/csrf'), async () => {
      await wait();
      return new HttpResponse(null, { status: 204, headers: { 'X-CSRF-TOKEN': db.csrfToken } });
    }),

    http.post(endpoint('/auth/login'), async ({ request }) => {
      await wait();
      if (!hasValidCsrf(request)) return errors.tokenMismatch();

      const body = await readBody(request);
      const email = readString(body, 'email').trim();
      const password = readString(body, 'password');
      const fingerprint = readString(body, 'fingerprint');

      const invalid = collectErrors({
        email: email ? null : 'The email field is required.',
        password: password ? null : 'The password field is required.',
        fingerprint: FINGERPRINT_PATTERN.test(fingerprint)
          ? null
          : 'The fingerprint must be a 32 character hexadecimal string.',
        captcha: request.headers.get('X-Captcha-Token')?.trim() ? null : 'The captcha token is required.',
      });
      if (invalid) return errors.validation(invalid);

      if (email.toLowerCase() !== db.credentials.email) {
        return errors.validation({ email: ['These credentials do not match our records.'] });
      }
      if (password !== db.credentials.password) {
        return errors.validation({ password: ['The provided password is incorrect.'] });
      }

      const deviceSessionToken = crypto.randomUUID();
      db.deviceTokens.set(deviceSessionToken, fingerprint);
      return HttpResponse.json<LoginResponse>({ device_session_token: deviceSessionToken });
    }),

    http.post(endpoint('/auth/token/issue'), async ({ request }) => {
      await wait();
      if (!hasValidCsrf(request)) return errors.tokenMismatch();

      const body = await readBody(request);
      const token = readString(body, 'device_session_token');
      const fingerprint = readString(body, 'fingerprint');

      if (!token || db.deviceTokens.get(token) !== fingerprint) {
        return errors.validation({ device_session_token: ['The device session token is invalid.'] });
      }

      db.deviceTokens.delete(token);
      startSession(db, fingerprint);
      return empty(200);
    }),

    http.post(endpoint('/auth/token/rotate'), async ({ request }) => {
      await wait();
      if (!hasValidCsrf(request)) return errors.tokenMismatch();

      const fingerprint = readString(await readBody(request), 'fingerprint');
      if (!db.session || db.session.fingerprint !== fingerprint) {
        return errors.badRequest('The session cannot be rotated.');
      }

      startSession(db, fingerprint);
      return empty(200);
    }),

    http.post(endpoint('/auth/token/revoke'), async ({ request }) => {
      await wait();
      if (!hasValidCsrf(request)) return errors.tokenMismatch();

      db.session = null;
      return empty(204);
    }),

    http.get(endpoint('/v1/me'), async () => {
      await wait();
      if (!isSessionActive(db)) return errors.unauthenticated();
      return HttpResponse.json<User>(db.user);
    }),

    http.get(endpoint('/v1/webhooks'), async ({ request }) => {
      await wait();
      if (!isSessionActive(db)) return errors.unauthenticated();
      if (shouldFail(request)) return errors.server();

      const params = new URL(request.url).searchParams;
      const page = toPositiveInt(params.get('page'), 1);
      const limit = Math.min(toPositiveInt(params.get('limit'), DEFAULT_LIMIT), MAX_LIMIT);
      const search = (params.get('search') ?? '').trim().toLowerCase();

      const filtered = search
        ? db.webhooks.filter((webhook) => webhook.name.toLowerCase().includes(search))
        : db.webhooks;
      const last = Math.max(1, Math.ceil(filtered.length / limit));

      return HttpResponse.json<WebhookList>({
        data: filtered.slice((page - 1) * limit, page * limit),
        paging: {
          pages: { current: page, last },
          results: { total: filtered.length, limitation: limit },
        },
      });
    }),

    http.get<{ id: string }>(endpoint('/v1/webhooks/:id'), async ({ params }) => {
      await wait();
      if (!isSessionActive(db)) return errors.unauthenticated();

      const webhook = findWebhook(params.id);
      return webhook ? HttpResponse.json<Webhook>(webhook) : errors.notFound();
    }),

    http.put<{ id: string }>(endpoint('/v1/webhooks/:id'), async ({ request, params }) => {
      await wait();
      if (!hasValidCsrf(request)) return errors.tokenMismatch();
      if (!isSessionActive(db)) return errors.unauthenticated();

      const webhook = findWebhook(params.id);
      if (!webhook) return errors.notFound();

      const body = await readBody(request);
      const name = readString(body, 'name').trim();
      const url = readString(body, 'url').trim();

      const invalid = validateWebhook(name, url);
      if (invalid) return errors.validation(invalid);

      Object.assign(webhook, { name, url });
      return HttpResponse.json<Webhook>(webhook);
    }),
  ];
}
