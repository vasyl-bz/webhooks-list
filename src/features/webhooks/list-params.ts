export const PAGE_SIZE = 10;

const PAGE_PATTERN = /^[1-9]\d*$/;

export interface ListParams {
  page: number;
  search: string;
}

export function parseListParams(searchParams: URLSearchParams): ListParams {
  const rawPage = searchParams.get('page');
  return {
    page: rawPage !== null && PAGE_PATTERN.test(rawPage) ? Number(rawPage) : 1,
    search: (searchParams.get('search') ?? '').trim(),
  };
}

export function toSearchParams({ page, search }: ListParams): URLSearchParams {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (page > 1) params.set('page', String(page));
  return params;
}

export function toListSearch(params: ListParams): string {
  const query = toSearchParams(params).toString();
  return query ? `?${query}` : '';
}

export function isCanonical(searchParams: URLSearchParams, params: ListParams): boolean {
  return searchParams.toString() === toSearchParams(params).toString();
}
