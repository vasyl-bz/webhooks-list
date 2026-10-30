import { type LoaderFunctionArgs, data, redirect } from 'react-router';
import { api } from '../../api';
import { withSession } from '../auth/session';
import { PAGE_SIZE, isCanonical, parseListParams, toListSearch } from './list-params';

const ID_PATTERN = /^[1-9]\d*$/;

export const webhooksListLoader = withSession(async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const params = parseListParams(url.searchParams);

  if (!isCanonical(url.searchParams, params)) {
    throw redirect(`${url.pathname}${toListSearch(params)}`);
  }

  const list = await api.webhooks.list({ ...params, limit: PAGE_SIZE }, request.signal);
  const { last } = list.paging.pages;

  if (params.page > last) {
    throw redirect(`${url.pathname}${toListSearch({ ...params, page: last })}`);
  }

  return { params, list };
});

export const webhookEditLoader = withSession(async ({ params, request }: LoaderFunctionArgs) => {
  if (params.id === undefined || !ID_PATTERN.test(params.id)) {
    throw data('Webhook not found', { status: 404 });
  }
  return api.webhooks.get(Number(params.id), request.signal);
});
