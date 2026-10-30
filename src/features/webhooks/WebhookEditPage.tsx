import { Link, useLoaderData, useLocation } from 'react-router';
import { formatDate } from '../../shared/lib/format';
import { ActiveBadge } from './components/ActiveBadge';
import { WebhookForm } from './components/WebhookForm';
import type { webhookEditLoader } from './loaders';
import { WEBHOOKS_PATH, readListSearch } from './navigation';

export function WebhookEditPage() {
  const webhook = useLoaderData<typeof webhookEditLoader>();
  const location = useLocation();
  const backTo = `${WEBHOOKS_PATH}${readListSearch(location.state)}`;

  return (
    <section className="page page--narrow">
      <Link to={backTo} className="back-link">
        ← До списку
      </Link>
      <header className="page-header">
        <div>
          <h1 className="page-title">Редагування вебхука</h1>
          <p className="page-subtitle">Створено {formatDate(webhook.created_at)}</p>
        </div>
        <ActiveBadge active={webhook.active} />
      </header>
      <div className="card card--padded">
        <WebhookForm key={webhook.id} webhook={webhook} backTo={backTo} />
      </div>
    </section>
  );
}
