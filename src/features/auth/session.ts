import { type LoaderFunctionArgs, redirect } from 'react-router';
import { api, isUnauthorizedError } from '../../api';
import { LOGIN_PATH, buildLoginPath, getRequestPath } from './redirect';

export function withSession<TArgs extends LoaderFunctionArgs, TResult>(
  loader: (args: TArgs) => Promise<TResult>,
): (args: TArgs) => Promise<TResult> {
  return async (args) => {
    try {
      return await loader(args);
    } catch (error) {
      if (isUnauthorizedError(error)) throw redirect(buildLoginPath(getRequestPath(args.request)));
      throw error;
    }
  };
}

export const sessionLoader = withSession(async ({ request }: LoaderFunctionArgs) => ({
  user: await api.auth.me(request.signal),
}));

export async function logoutAction() {
  await api.auth.revoke().catch(() => undefined);
  return redirect(LOGIN_PATH);
}
