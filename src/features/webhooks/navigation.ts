import type { WebhookId } from '../../api';

export const WEBHOOKS_PATH = '/webhooks';

export function getEditPath(id: WebhookId): string {
  return `${WEBHOOKS_PATH}/${id}/edit`;
}

export interface EditLocationState {
  listSearch: string;
}

export interface ListLocationState {
  savedWebhookId: WebhookId;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function readListSearch(state: unknown): string {
  if (!isRecord(state) || typeof state.listSearch !== 'string') return '';
  return state.listSearch.startsWith('?') ? state.listSearch : '';
}

export function readSavedWebhookId(state: unknown): WebhookId | null {
  return isRecord(state) && typeof state.savedWebhookId === 'number' ? state.savedWebhookId : null;
}
