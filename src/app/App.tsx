import { RouterProvider } from 'react-router/dom';
import type { createAppRouter } from './router';

type AppProps = {
  router: ReturnType<typeof createAppRouter>;
};

export function App({ router }: AppProps) {
  return <RouterProvider router={router} />;
}
