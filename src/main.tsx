import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/global.css';

async function bootstrap() {
  const container = document.getElementById('root');
  if (!container) throw new Error('Root container is missing');

  const { worker } = await import('./mocks/browser');
  await worker.start({ onUnhandledRequest: 'bypass', quiet: true });

  const [{ createAppRouter }, { App }] = await Promise.all([import('./app/router'), import('./app/App')]);
  const router = createAppRouter();

  createRoot(container).render(
    <StrictMode>
      <App router={router} />
    </StrictMode>,
  );
}

void bootstrap();
