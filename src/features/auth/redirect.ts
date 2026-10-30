export const LOGIN_PATH = '/login';
export const LOGOUT_PATH = '/logout';
export const HOME_PATH = '/webhooks';
export const REDIRECT_PARAM = 'redirectTo';

export function buildLoginPath(target?: string): string {
  if (!target || target === '/' || target.startsWith(LOGIN_PATH)) return LOGIN_PATH;
  return `${LOGIN_PATH}?${new URLSearchParams({ [REDIRECT_PARAM]: target })}`;
}

export function getSafeRedirect(value: string | null): string {
  const isInternalPath =
    value !== null && value.startsWith('/') && !value.startsWith('//') && !value.startsWith('/\\');
  return isInternalPath && !value.startsWith(LOGIN_PATH) ? value : HOME_PATH;
}

export function getRequestPath(request: Request): string {
  const url = new URL(request.url);
  return `${url.pathname}${url.search}`;
}
