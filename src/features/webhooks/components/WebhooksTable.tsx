import { Link } from 'react-router';
import type { Webhook, WebhookId } from '../../../api';
import { cx } from '../../../shared/lib/cx';
import { type EditLocationState, getEditPath } from '../navigation';
import { ActiveBadge } from './ActiveBadge';

interface WebhooksTableProps {
  webhooks: Webhook[];
  listSearch: string;
  highlightedId: WebhookId | null;
}

export function WebhooksTable({ webhooks, listSearch, highlightedId }: WebhooksTableProps) {
  const editState: EditLocationState = { listSearch };

  return (
    <div className="table-scroll">
      <table className="table">
        <thead>
          <tr>
            <th scope="col">Назва</th>
            <th scope="col">URL</th>
            <th scope="col">Статус</th>
            <th scope="col">
              <span className="sr-only">Дії</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {webhooks.map((webhook) => (
            <tr key={webhook.id} className={cx(webhook.id === highlightedId && 'is-highlighted')}>
              <td className="table__name">{webhook.name}</td>
              <td>
                <span className="table__url" title={webhook.url}>
                  {webhook.url}
                </span>
              </td>
              <td>
                <ActiveBadge active={webhook.active} />
              </td>
              <td className="table__actions">
                <Link
                  to={getEditPath(webhook.id)}
                  state={editState}
                  className="btn btn--ghost btn--sm"
                  aria-label={`Редагувати «${webhook.name}»`}
                >
                  Редагувати
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
