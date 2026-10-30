import type { HttpClient } from './http/client';
import type { Webhook, WebhookId, WebhookInput, WebhookList, WebhookListQuery } from './types';

export function createWebhooksApi(http: HttpClient) {
  return {
    list({ page, limit, search }: WebhookListQuery, signal?: AbortSignal): Promise<WebhookList> {
      return http.get<WebhookList>('/v1/webhooks', { query: { page, limit, search }, signal });
    },

    get(id: WebhookId, signal?: AbortSignal): Promise<Webhook> {
      return http.get<Webhook>(`/v1/webhooks/${id}`, { signal });
    },

    update(id: WebhookId, input: WebhookInput): Promise<Webhook> {
      return http.put<Webhook>(`/v1/webhooks/${id}`, input);
    },
  };
}

export type WebhooksApi = ReturnType<typeof createWebhooksApi>;
