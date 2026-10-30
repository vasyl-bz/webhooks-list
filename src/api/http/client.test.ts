import { setupServer } from 'msw/node';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { SESSION_TTL_MS, createMockDb, type MockDb } from '../../mocks/db';
import { createHandlers } from '../../mocks/handlers';
import { MOCK_CREDENTIALS } from '../../mocks/seed';
import { createApi } from '../create-api';

const BASE_URL = 'http://localhost/api';
const FINGERPRINT = '0123456789abcdef0123456789abcdef';
const FIRST_PAGE = { page: 1, limit: 10, search: '' };

const server = setupServer();
let db: MockDb;
let clock: number;
let requests: string[];

server.events.on('request:start', ({ request }) => {
  requests.push(`${request.method} ${new URL(request.url).pathname}`);
});

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());

beforeEach(() => {
  clock = Date.UTC(2026, 0, 1);
  db = createMockDb({ now: () => clock });
  server.resetHandlers(...createHandlers(db, { latencyMs: 10 }));
  requests = [];
});

function countRequests(entry: string): number {
  return requests.filter((request) => request === entry).length;
}

async function createSignedInApi() {
  const api = createApi({ baseUrl: BASE_URL, getFingerprint: () => FINGERPRINT });
  await api.auth.signIn(MOCK_CREDENTIALS, 'test-captcha-token');
  requests = [];
  return api;
}

describe('session refresh', () => {
  it('shares one rotate between parallel 401 responses and retries both requests', async () => {
    const api = await createSignedInApi();
    clock += SESSION_TTL_MS + 1;

    const [user, list] = await Promise.all([api.auth.me(), api.webhooks.list(FIRST_PAGE)]);

    expect(user.email).toBe(MOCK_CREDENTIALS.email);
    expect(list.data).toHaveLength(10);
    expect(countRequests('POST /api/auth/token/rotate')).toBe(1);
    expect(countRequests('GET /api/v1/me')).toBe(2);
    expect(countRequests('GET /api/v1/webhooks')).toBe(2);
  });

  it('ends the local session once when rotate fails', async () => {
    const api = await createSignedInApi();
    const onExpired = vi.fn();
    api.onSessionExpired(onExpired);
    db.session = null;

    await expect(Promise.all([api.auth.me(), api.webhooks.list(FIRST_PAGE)])).rejects.toMatchObject({
      status: 401,
    });

    expect(countRequests('POST /api/auth/token/rotate')).toBe(1);
    expect(onExpired).toHaveBeenCalledTimes(1);
  });
});

describe('csrf', () => {
  it('requests the token before the first API call', async () => {
    const api = createApi({ baseUrl: BASE_URL, getFingerprint: () => FINGERPRINT });

    await api.auth.signIn(MOCK_CREDENTIALS, 'test-captcha-token');

    expect(requests).toEqual(['GET /api/csrf', 'POST /api/auth/login', 'POST /api/auth/token/issue']);
  });

  it('refreshes the token on 419 and retries the request once', async () => {
    const api = await createSignedInApi();
    db.csrfToken = 'regenerated-token';

    const updated = await api.webhooks.update(1, { name: 'Renamed', url: 'https://example.com/hook' });

    expect(updated.name).toBe('Renamed');
    expect(requests).toEqual(['PUT /api/v1/webhooks/1', 'GET /api/csrf', 'PUT /api/v1/webhooks/1']);
  });
});
