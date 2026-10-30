import { type ComponentPropsWithRef, useId } from 'react';
import { cx } from '../lib/cx';

interface TextFieldProps extends ComponentPropsWithRef<'input'> {
  label: string;
  error?: string | undefined;
  hint?: string;
}

export function TextField({ label, error, hint, id, className, ...inputProps }: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const messageId = `${inputId}-message`;
  const message = error ?? hint;

  return (
    <div className={cx('field', error && 'field--invalid', className)}>
      <label htmlFor={inputId} className="field__label">
        {label}
      </label>
      <input
        id={inputId}
        className="field__input"
        aria-invalid={error ? true : undefined}
        aria-describedby={message ? messageId : undefined}
        {...inputProps}
      />
      {message && (
        <p id={messageId} className={error ? 'field__error' : 'field__hint'}>
          {message}
        </p>
      )}
    </div>
  );
}
