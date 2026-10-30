import { Form, Link, Outlet, useLoaderData, useNavigation } from 'react-router';
import { HOME_PATH, LOGOUT_PATH } from '../features/auth/redirect';
import type { sessionLoader } from '../features/auth/session';
import { getInitials } from '../shared/lib/format';
import { Button } from '../shared/ui/Button';

export function AppLayout() {
  const { user } = useLoaderData<typeof sessionLoader>();
  const navigation = useNavigation();
  const isLoggingOut = navigation.formAction === LOGOUT_PATH;

  return (
    <div className="shell">
      <header className="topbar">
        <div className="topbar__inner">
          <Link to={HOME_PATH} className="brand">
            <span className="brand-mark" aria-hidden="true" />
            Webhooks
          </Link>
          <div className="topbar__end">
            <div className="user">
              <span className="user__avatar" aria-hidden="true">
                {getInitials(user.first_name, user.last_name)}
              </span>
              <span className="user__meta">
                <span className="user__name">{user.name}</span>
                <span className="user__email">{user.email}</span>
              </span>
            </div>
            <Form method="post" action={LOGOUT_PATH}>
              <Button type="submit" variant="ghost" loading={isLoggingOut}>
                Вийти
              </Button>
            </Form>
          </div>
        </div>
      </header>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
