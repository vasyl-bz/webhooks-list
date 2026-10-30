import type { HttpClient } from './http/client';
import type { Credentials, LoginResponse, User } from './types';

const PUBLIC = { skipSessionRefresh: true } as const;

export function createAuthApi(http: HttpClient, getFingerprint: () => string) {
  return {
    async signIn(credentials: Credentials, captchaToken: string): Promise<void> {
      const fingerprint = getFingerprint();
      const { device_session_token } = await http.post<LoginResponse>(
        '/auth/login',
        { ...credentials, fingerprint },
        { ...PUBLIC, headers: { 'X-Captcha-Token': captchaToken } },
      );
      await http.post<void>('/auth/token/issue', { device_session_token, fingerprint }, PUBLIC);
    },

    rotate(): Promise<void> {
      return http.post<void>('/auth/token/rotate', { fingerprint: getFingerprint() }, PUBLIC);
    },

    revoke(): Promise<void> {
      return http.post<void>('/auth/token/revoke', { fingerprint: getFingerprint() }, PUBLIC);
    },

    me(signal?: AbortSignal): Promise<User> {
      return http.get<User>('/v1/me', { signal });
    },
  };
}

export type AuthApi = ReturnType<typeof createAuthApi>;
