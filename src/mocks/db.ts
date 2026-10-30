import type { User, Webhook } from '../api/types';
import { MOCK_CREDENTIALS, MOCK_CSRF_TOKEN, MOCK_USER, createSeedWebhooks } from './seed';

export const SESSION_TTL_MS = 30_000;

interface MockSession {
  fingerprint: string;
  expiresAt: number;
}

export interface MockDbOptions {
  now?: () => number;
  sessionTtlMs?: number;
}

export interface MockDb {
  now: () => number;
  sessionTtlMs: number;
  csrfToken: string;
  credentials: { email: string; password: string };
  user: User;
  webhooks: Webhook[];
  deviceTokens: Map<string, string>;
  session: MockSession | null;
}

export function createMockDb({ now = Date.now, sessionTtlMs = SESSION_TTL_MS }: MockDbOptions = {}): MockDb {
  return {
    now,
    sessionTtlMs,
    csrfToken: MOCK_CSRF_TOKEN,
    credentials: { ...MOCK_CREDENTIALS },
    user: { ...MOCK_USER },
    webhooks: createSeedWebhooks(),
    deviceTokens: new Map(),
    session: null,
  };
}

export function startSession(db: MockDb, fingerprint: string) {
  db.session = { fingerprint, expiresAt: db.now() + db.sessionTtlMs };
}

export function isSessionActive(db: MockDb): boolean {
  return db.session !== null && db.now() < db.session.expiresAt;
}
