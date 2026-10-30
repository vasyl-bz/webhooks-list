import { createAuthApi } from './auth';
import { createHttpClient } from './http/client';
import { createWebhooksApi } from './webhooks';

export interface ApiConfig {
  baseUrl: string;
  getFingerprint: () => string;
}

export function createApi({ baseUrl, getFingerprint }: ApiConfig) {
  const http = createHttpClient({
    baseUrl,
    refreshSession: () => auth.rotate(),
  });
  const auth = createAuthApi(http, getFingerprint);

  return {
    auth,
    webhooks: createWebhooksApi(http),
    onSessionExpired: http.onSessionExpired,
  };
}

export type Api = ReturnType<typeof createApi>;
