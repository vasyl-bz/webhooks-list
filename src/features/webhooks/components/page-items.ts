export type PageItem = number | 'gap';

const MAX_VISIBLE = 7;

export function getPageItems(current: number, last: number): PageItem[] {
  if (last <= MAX_VISIBLE) return Array.from({ length: last }, (_, index) => index + 1);

  const pages = [...new Set([1, current - 1, current, current + 1, last])]
    .filter((page) => page >= 1 && page <= last)
    .sort((a, b) => a - b);

  return pages.flatMap((page, index): PageItem[] => {
    const previous = pages[index - 1];
    return previous !== undefined && page - previous > 1 ? ['gap', page] : [page];
  });
}
