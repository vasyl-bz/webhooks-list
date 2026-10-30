import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router';
import { api } from '../../api';
import { applyServerErrors } from '../../shared/forms/apply-server-errors';
import { Alert } from '../../shared/ui/Alert';
import { Button } from '../../shared/ui/Button';
import { TextField } from '../../shared/ui/TextField';
import { getCaptchaToken } from './captcha';
import { LOGIN_FIELDS, type LoginFormValues, loginSchema } from './login-schema';
import { REDIRECT_PARAM, getSafeRedirect } from './redirect';

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = getSafeRedirect(searchParams.get(REDIRECT_PARAM));

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await api.auth.signIn(values, await getCaptchaToken());
      await navigate(redirectTo, { replace: true });
    } catch (error) {
      applyServerErrors(error, setError, LOGIN_FIELDS);
    }
  });

  const formError = errors.root?.server?.message;

  return (
    <main className="auth">
      <div className="auth__card">
        <span className="brand-mark brand-mark--lg" aria-hidden="true" />
        <h1 className="auth__title">Вхід</h1>
        <p className="auth__subtitle">Увійдіть, щоб керувати вебхуками</p>

        <form className="form" onSubmit={onSubmit} noValidate>
          {formError && <Alert>{formError}</Alert>}
          <TextField
            label="Email"
            type="email"
            autoComplete="username"
            autoFocus
            error={errors.email?.message}
            {...register('email')}
          />
          <TextField
            label="Пароль"
            type="password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />
          <Button type="submit" className="btn--block" loading={isSubmitting}>
            Увійти
          </Button>
        </form>
      </div>
    </main>
  );
}
