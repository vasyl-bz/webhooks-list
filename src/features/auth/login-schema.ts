import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'Вкажіть email').email('Некоректний email'),
  password: z.string().min(1, 'Вкажіть пароль'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const LOGIN_FIELDS = ['email', 'password'] as const satisfies readonly (keyof LoginFormValues)[];
