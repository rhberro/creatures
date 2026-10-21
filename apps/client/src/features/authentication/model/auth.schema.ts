import { PASSWORD_MAX, PASSWORD_MIN } from '@creatures/contracts/auth';
import { z } from 'zod';

import { FIELD_MESSAGES } from './auth.messages';

/**
 * As regras dos campos de autenticacao.
 *
 * O e-mail e a senha tem as mesmas regras em todos os formularios, e a
 * confirmacao de senha tambem. O que muda de um formulario para outro e o
 * conjunto: entrar pede e-mail e senha, cadastrar pede os tres.
 */
export const emailSchema = z
  .string()
  .trim()
  .min(1, FIELD_MESSAGES.emailRequired)
  .pipe(z.email(FIELD_MESSAGES.emailInvalid));

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN, FIELD_MESSAGES.weakPassword)
  .max(PASSWORD_MAX, FIELD_MESSAGES.passwordTooLong);

export const confirmPasswordSchema = z.string().min(1, FIELD_MESSAGES.confirmPasswordRequired);

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, FIELD_MESSAGES.passwordRequired),
});

export const signUpSchema = z
  .object({
    confirmPassword: confirmPasswordSchema,
    email: emailSchema,
    password: passwordSchema,
  })
  .refine(matchesConfirmation, {
    error: FIELD_MESSAGES.mismatchPassword,
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    confirmPassword: confirmPasswordSchema,
    password: passwordSchema,
  })
  .refine(matchesConfirmation, {
    error: FIELD_MESSAGES.mismatchPassword,
    path: ['confirmPassword'],
  });

export type SignInValues = z.infer<typeof signInSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

function matchesConfirmation(values: { confirmPassword: string; password: string }): boolean {
  return values.password === values.confirmPassword;
}
