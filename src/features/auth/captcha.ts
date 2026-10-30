const MOCK_CAPTCHA_TOKEN = 'mock-captcha-token';

export function getCaptchaToken(): Promise<string> {
  return Promise.resolve(MOCK_CAPTCHA_TOKEN);
}
