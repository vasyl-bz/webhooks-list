import { cx } from '../../../shared/lib/cx';

export function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span className={cx('badge', active ? 'badge--active' : 'badge--inactive')}>
      <span className="badge__dot" aria-hidden="true" />
      {active ? 'Активний' : 'Вимкнений'}
    </span>
  );
}
