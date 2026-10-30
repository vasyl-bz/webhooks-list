import { z } from 'zod';

export const webhookFormSchema = z.object({
  name: z.string().trim().min(1, 'Вкажіть назву').max(255, 'Назва має бути не довшою за 255 символів'),
  url: z.string().trim().min(1, 'Вкажіть URL'),
});

export type WebhookFormValues = z.infer<typeof webhookFormSchema>;

export const WEBHOOK_FIELDS = ['name', 'url'] as const satisfies readonly (keyof WebhookFormValues)[];
