import type { ReactNode } from 'react';
import { cx } from '../lib/cx';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  tone?: 'neutral' | 'error';
}

export function EmptyState({ title, description, action, tone = 'neutral' }: EmptyStateProps) {
  return (
    <div className={cx('empty', tone === 'error' && 'empty--error')} role={tone === 'error' ? 'alert' : undefined}>
      <span className="empty__icon" aria-hidden="true">
        {tone === 'error' ? '!' : '∅'}
      </span>
      <h2 className="empty__title">{title}</h2>
      {description && <p className="empty__description">{description}</p>}
      {action && <div className="empty__action">{action}</div>}
    </div>
  );
}
