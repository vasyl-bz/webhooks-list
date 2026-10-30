import { createApi } from './create-api';
import { createFingerprintProvider } from './fingerprint';

export const api = createApi({
  baseUrl: import.meta.env.VITE_API_BASE_URL ?? '/api',
  getFingerprint: createFingerprintProvider(window.localStorage),
});

export * from './http/errors';
export type * from './types';
