import { useLoaderData, useLocation, useNavigation, useSearchParams } from 'react-router';
import { Button } from '../../shared/ui/Button';
import { EmptyState } from '../../shared/ui/EmptyState';
import { Pagination } from './components/Pagination';
import { SearchField } from './components/SearchField';
import { WebhooksTable } from './components/WebhooksTable';
import { toSearchParams } from './list-params';
import type { webhooksListLoader } from './loaders';
import { readSavedWebhookId } from './navigation';

export function WebhooksListPage() {
  const { params, list } = useLoaderData<typeof webhooksListLoader>();
  const location = useLocation();
  const navigation = useNavigation();
  const [, setSearchParams] = useSearchParams();

  const isRefreshing = navigation.state === 'loading' && navigation.location.pathname === location.pathname;
  const { total, limitation } = list.paging.results;
  const { current, last } = list.paging.pages;
  const from = (current - 1) * limitation + 1;
  const to = from + list.data.length - 1;

  const handleSearch = (search: string) => setSearchParams(toSearchParams({ page: 1, search }));
  const searchFor = (page: number) => toSearchParams({ ...params, page }).toString();

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Вебхуки</h1>
          <p className="page-subtitle">
            {total > 0 ? `${from}–${to} з ${total}` : 'Немає записів'}
          </p>
        </div>
        <SearchField value={params.search} onSearch={handleSearch} />
      </header>

      <div className="card" aria-busy={isRefreshing}>
        <div className={isRefreshing ? 'is-refreshing' : undefined}>
          {list.data.length > 0 ? (
            <WebhooksTable
              webhooks={list.data}
              listSearch={location.search}
              highlightedId={readSavedWebhookId(location.state)}
            />
          ) : params.search ? (
            <EmptyState
              title="Нічого не знайдено"
              description={`За запитом «${params.search}» вебхуків немає.`}
              action={
                <Button variant="secondary" onClick={() => handleSearch('')}>
                  Скинути пошук
                </Button>
              }
            />
          ) : (
            <EmptyState title="Вебхуків ще немає" description="Коли вебхуки зʼявляться, вони будуть тут." />
          )}
        </div>
      </div>

      <Pagination current={current} last={last} searchFor={searchFor} />
    </section>
  );
}
