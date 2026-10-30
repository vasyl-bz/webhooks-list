import { useRouteError } from 'react-router';
import { getErrorMessage } from '../shared/errors/get-error-message';
import { Button } from '../shared/ui/Button';
import { EmptyState } from '../shared/ui/EmptyState';

export function RootErrorBoundary() {
  const error = useRouteError();

  return (
    <main className="full-page">
      <div className="card card--narrow">
        <EmptyState
          tone="error"
          title="Сталася помилка"
          description={getErrorMessage(error)}
          action={<Button onClick={() => window.location.reload()}>Оновити сторінку</Button>}
        />
      </div>
    </main>
  );
}
