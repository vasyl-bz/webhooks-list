import { Link } from 'react-router';
import { HOME_PATH } from '../features/auth/redirect';
import { EmptyState } from '../shared/ui/EmptyState';

export function NotFoundPage() {
  return (
    <main className="full-page">
      <div className="card card--narrow">
        <EmptyState
          title="Сторінку не знайдено"
          description="Перевірте адресу або поверніться до списку вебхуків."
          action={
            <Link to={HOME_PATH} className="btn btn--primary">
              До вебхуків
            </Link>
          }
        />
      </div>
    </main>
  );
}
