import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';
import { type Webhook, api } from '../../../api';
import { applyServerErrors } from '../../../shared/forms/apply-server-errors';
import { Alert } from '../../../shared/ui/Alert';
import { Button } from '../../../shared/ui/Button';
import { TextField } from '../../../shared/ui/TextField';
import type { ListLocationState } from '../navigation';
import { WEBHOOK_FIELDS, type WebhookFormValues, webhookFormSchema } from '../webhook-schema';

interface WebhookFormProps {
  webhook: Webhook;
  backTo: string;
}

export function WebhookForm({ webhook, backTo }: WebhookFormProps) {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<WebhookFormValues>({
    resolver: zodResolver(webhookFormSchema),
    defaultValues: { name: webhook.name, url: webhook.url },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const updated = await api.webhooks.update(webhook.id, values);
      const state: ListLocationState = { savedWebhookId: updated.id };
      await navigate(backTo, { state });
    } catch (error) {
      applyServerErrors(error, setError, WEBHOOK_FIELDS);
    }
  });

  const formError = errors.root?.server?.message;

  return (
    <form className="form" onSubmit={onSubmit} noValidate>
      {formError && <Alert>{formError}</Alert>}
      <TextField label="Назва" autoComplete="off" error={errors.name?.message} {...register('name')} />
      <TextField
        label="URL"
        type="url"
        inputMode="url"
        autoComplete="off"
        spellCheck={false}
        placeholder="https://"
        hint="Адреса, на яку надсилатимуться події"
        error={errors.url?.message}
        {...register('url')}
      />
      <div className="form__actions">
        <Link to={backTo} className="btn btn--secondary">
          Скасувати
        </Link>
        <Button type="submit" loading={isSubmitting} disabled={!isDirty}>
          Зберегти
        </Button>
      </div>
    </form>
  );
}
