import { type RouteObject, createBrowserRouter, redirect } from 'react-router';
import { api } from '../api';
import { LoginPage } from '../features/auth/LoginPage';
import { HOME_PATH, LOGIN_PATH, LOGOUT_PATH, buildLoginPath } from '../features/auth/redirect';
import { logoutAction, sessionLoader } from '../features/auth/session';
import { WebhookEditPage } from '../features/webhooks/WebhookEditPage';
import { WebhooksErrorBoundary } from '../features/webhooks/WebhooksErrorBoundary';
import { WebhooksListPage } from '../features/webhooks/WebhooksListPage';
import { webhookEditLoader, webhooksListLoader } from '../features/webhooks/loaders';
import { FullPageLoader } from '../shared/ui/FullPageLoader';
import { AppLayout } from './AppLayout';
import { NotFoundPage } from './NotFoundPage';
import { RootErrorBoundary } from './RootErrorBoundary';
import { RootLayout } from './RootLayout';

const routes: RouteObject[] = [
  {
    element: <RootLayout />,
    errorElement: <RootErrorBoundary />,
    hydrateFallbackElement: <FullPageLoader />,
    children: [
      { path: LOGIN_PATH, element: <LoginPage /> },
      { path: LOGOUT_PATH, action: logoutAction },
      {
        path: '/',
        loader: sessionLoader,
        shouldRevalidate: () => false,
        element: <AppLayout />,
        children: [
          { index: true, loader: () => redirect(HOME_PATH) },
          {
            errorElement: <WebhooksErrorBoundary />,
            children: [
              { path: 'webhooks', loader: webhooksListLoader, element: <WebhooksListPage /> },
              { path: 'webhooks/:id/edit', loader: webhookEditLoader, element: <WebhookEditPage /> },
            ],
          },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];

export function createAppRouter() {
  const router = createBrowserRouter(routes);

  api.onSessionExpired(() => {
    const { initialized, navigation, location } = router.state;
    if (!initialized || navigation.state !== 'idle' || location.pathname === LOGIN_PATH) return;
    void router.navigate(buildLoginPath(`${location.pathname}${location.search}`), { replace: true });
  });

  return router;
}
