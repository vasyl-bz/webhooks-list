import { Link } from 'react-router';
import { cx } from '../../../shared/lib/cx';
import { getPageItems } from './page-items';

interface PaginationProps {
  current: number;
  last: number;
  searchFor: (page: number) => string;
}

export function Pagination({ current, last, searchFor }: PaginationProps) {
  if (last <= 1) return null;

  return (
    <nav className="pagination" aria-label="Сторінки">
      <StepLink page={current - 1} disabled={current <= 1} searchFor={searchFor} label="Попередня сторінка">
        ‹
      </StepLink>
      {getPageItems(current, last).map((item, index) =>
        item === 'gap' ? (
          <span key={`gap-${index}`} className="pagination__gap" aria-hidden="true">
            …
          </span>
        ) : (
          <Link
            key={item}
            to={{ search: searchFor(item) }}
            className={cx('pagination__item', item === current && 'is-current')}
            aria-current={item === current ? 'page' : undefined}
          >
            {item}
          </Link>
        ),
      )}
      <StepLink page={current + 1} disabled={current >= last} searchFor={searchFor} label="Наступна сторінка">
        ›
      </StepLink>
    </nav>
  );
}

interface StepLinkProps {
  page: number;
  disabled: boolean;
  searchFor: (page: number) => string;
  label: string;
  children: string;
}

function StepLink({ page, disabled, searchFor, label, children }: StepLinkProps) {
  if (disabled) {
    return (
      <span className="pagination__item is-disabled" aria-hidden="true">
        {children}
      </span>
    );
  }
  return (
    <Link to={{ search: searchFor(page) }} className="pagination__item" aria-label={label}>
      {children}
    </Link>
  );
}
