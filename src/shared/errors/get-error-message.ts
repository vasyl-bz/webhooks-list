import { NETWORK_ERROR_STATUS, isApiError } from '../../api/http/errors';

const MESSAGES_BY_STATUS: Record<number, string> = {
  [NETWORK_ERROR_STATUS]: 'Немає зʼєднання з сервером. Перевірте мережу та спробуйте ще раз.',
  400: 'Запит не вдалося обробити.',
  401: 'Сесія завершилась. Увійдіть знову.',
  404: 'Запис не знайдено.',
  419: 'Не вдалося підтвердити запит. Оновіть сторінку.',
  422: 'Перевірте правильність заповнення полів.',
};

const FALLBACK_MESSAGE = 'Щось пішло не так. Спробуйте ще раз пізніше.';

export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) return MESSAGES_BY_STATUS[error.status] ?? FALLBACK_MESSAGE;
  return FALLBACK_MESSAGE;
}
