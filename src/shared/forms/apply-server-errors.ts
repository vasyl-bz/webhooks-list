import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { isValidationError } from '../../api/http/errors';
import { getErrorMessage } from '../errors/get-error-message';

export const FORM_ERROR_KEY = 'root.server';

export function applyServerErrors<TValues extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<TValues>,
  fields: readonly Path<TValues>[],
): void {
  if (!isValidationError(error)) {
    setError(FORM_ERROR_KEY, { type: 'server', message: getErrorMessage(error) });
    return;
  }

  const unmatched: string[] = [];
  let focused = false;

  for (const [key, messages] of Object.entries(error.payload)) {
    const message = messages[0];
    if (message === undefined) continue;

    const field = fields.find((name) => name === key);
    if (field === undefined) {
      unmatched.push(message);
      continue;
    }

    setError(field, { type: 'server', message }, { shouldFocus: !focused });
    focused = true;
  }

  if (unmatched.length > 0 || !focused) {
    setError(FORM_ERROR_KEY, {
      type: 'server',
      message: unmatched.length > 0 ? unmatched.join(' ') : getErrorMessage(error),
    });
  }
}
