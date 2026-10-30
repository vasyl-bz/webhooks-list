import { cx } from '../lib/cx';

interface SpinnerProps {
  size?: 'sm' | 'md';
  label?: string;
}

export function Spinner({ size = 'md', label }: SpinnerProps) {
  return (
    <span
      className={cx('spinner', size === 'sm' && 'spinner--sm')}
      role={label ? 'status' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}
