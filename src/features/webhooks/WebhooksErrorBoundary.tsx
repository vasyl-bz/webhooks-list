import { Link, isRouteErrorResponse, useRevalidator, useRouteError } from 'react-router';
import { isNotFoundError } from '../../api';
import { getErrorMessage } from '../../shared/errors/get-error-message';
import { Button } from '../../shared/ui/Button';
import { EmptyState } from '../../shared/ui/EmptyState';
import { WEBHOOKS_PATH } from './navigation';

export function WebhooksErrorBoundary() {
  const error = useRouteError();
  const revalidator = useRevalidator();
  const notFound = isNotFoundError(error) || (isRouteErrorResponse(error) && error.status === 404);

  return (
    <section className="page">
      <div className="card">
        {notFound ? (
          <EmptyState
            title="Вебхук не знайдено"
            description="Можливо, його видалили або посилання некоректне."
            action={
              <Link to={WEBHOOKS_PATH} className="btn btn--secondary">
                До списку
              </Link>
            }
          />
        ) : (
          <EmptyState
            tone="error"
            title="Не вдалося завантажити дані"
            description={getErrorMessage(error)}
            action={
              <Button
                variant="secondary"
                loading={revalidator.state === 'loading'}
                onClick={() => void revalidator.revalidate()}
              >
                Спробувати знову
              </Button>
            }
          />
        )}
      </div>
    </section>
  );
}
