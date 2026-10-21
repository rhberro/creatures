import { PASSWORD_MAX, PASSWORD_MIN, type AuthErrorCode } from '@creatures/contracts/auth';

export type SignInMessages = {
  genericError: string;
  networkError: string;
  rateLimitedError: string;
};

export const SIGNIN_MESSAGES: SignInMessages = {
  genericError: 'E-mail ou senha inválidos.',
  networkError: 'Erro de conexão. Tente novamente.',
  rateLimitedError: 'Muitas tentativas. Tente novamente em alguns minutos.',
};

export const SIGNUP_MESSAGES = {
  emailTakenError: 'Este e-mail já está cadastrado. Tente Entrar.',
  genericError: 'Não foi possível criar a conta.',
  mismatchPasswordError: 'As senhas não conferem.',
  networkError: 'Erro de conexão. Tente novamente.',
  rateLimitedError: 'Muitas tentativas. Tente novamente em alguns minutos.',
  weakPasswordError: 'A senha deve ter no mínimo 8 caracteres.',
} as const;

export const RESET_MESSAGES = {
  genericError: 'Não foi possível redefinir a senha.',
  mismatchPasswordError: 'As senhas não conferem.',
  networkError: 'Erro de conexão. Tente novamente.',
  rateLimitedError: 'Muitas tentativas. Tente novamente em alguns minutos.',
  samePasswordError: 'A nova senha deve ser diferente da atual.',
  successMessage: 'Senha redefinida com sucesso. Faça login para continuar.',
  weakPasswordError: 'A senha deve ter no mínimo 8 caracteres.',
} as const;

export const FORGOT_MESSAGES = {
  alertMessage: 'Se o e-mail existir em nossa base de dados, enviamos um link de recuperação.',
  genericError: 'Não foi possível enviar o link. Tente novamente.',
  networkError: 'Erro de conexão. Tente novamente.',
  rateLimitedError: 'Muitas tentativas. Tente novamente em alguns minutos.',
} as const;

/**
 * The message of every code of failure.
 *
 * The maps are exhaustive: a code that enters the contract and does not enter
 * a map breaks the build, instead of falling into a message that is not its.
 */
export const SIGNIN_ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  email_already_exists: SIGNIN_MESSAGES.genericError,
  email_confirmation_required: SIGNIN_MESSAGES.genericError,
  invalid_credentials: SIGNIN_MESSAGES.genericError,
  invalid_email: SIGNIN_MESSAGES.genericError,
  invalid_recovery_link: SIGNIN_MESSAGES.genericError,
  network: SIGNIN_MESSAGES.networkError,
  rate_limited: SIGNIN_MESSAGES.rateLimitedError,
  same_password: SIGNIN_MESSAGES.genericError,
  unknown: SIGNIN_MESSAGES.genericError,
  weak_password: SIGNIN_MESSAGES.genericError,
};

export const SIGNUP_ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  email_already_exists: SIGNUP_MESSAGES.emailTakenError,
  email_confirmation_required: SIGNUP_MESSAGES.genericError,
  invalid_credentials: SIGNUP_MESSAGES.genericError,
  invalid_email: SIGNUP_MESSAGES.genericError,
  invalid_recovery_link: SIGNUP_MESSAGES.genericError,
  network: SIGNUP_MESSAGES.networkError,
  rate_limited: SIGNUP_MESSAGES.rateLimitedError,
  same_password: SIGNUP_MESSAGES.genericError,
  unknown: SIGNUP_MESSAGES.genericError,
  weak_password: SIGNUP_MESSAGES.weakPasswordError,
};

export const RESET_ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  email_already_exists: RESET_MESSAGES.genericError,
  email_confirmation_required: RESET_MESSAGES.genericError,
  invalid_credentials: RESET_MESSAGES.genericError,
  invalid_email: RESET_MESSAGES.genericError,
  invalid_recovery_link: RESET_MESSAGES.genericError,
  network: RESET_MESSAGES.networkError,
  rate_limited: RESET_MESSAGES.rateLimitedError,
  same_password: RESET_MESSAGES.samePasswordError,
  unknown: RESET_MESSAGES.genericError,
  weak_password: RESET_MESSAGES.weakPasswordError,
};

export const FORGOT_ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  email_already_exists: FORGOT_MESSAGES.genericError,
  email_confirmation_required: FORGOT_MESSAGES.genericError,
  invalid_credentials: FORGOT_MESSAGES.genericError,
  invalid_email: FORGOT_MESSAGES.genericError,
  invalid_recovery_link: FORGOT_MESSAGES.genericError,
  network: FORGOT_MESSAGES.networkError,
  rate_limited: FORGOT_MESSAGES.rateLimitedError,
  same_password: FORGOT_MESSAGES.genericError,
  unknown: FORGOT_MESSAGES.genericError,
  weak_password: FORGOT_MESSAGES.genericError,
};

/**
 * The message of the account that still waits for the confirmation of the
 * e-mail.
 *
 * The project may have the automatic confirmation turned off: in that case
 * the account exists, but the session only comes after the player confirms
 * the e-mail.
 */
export function buildConfirmationRequiredMessage(email: string): string {
  return `Enviamos um e-mail de confirmação para ${email}. Confirme para entrar.`;
}

/**
 * As mensagens dos campos.
 *
 * Sao as que o schema do Zod usa: cada campo tem a sua, e a mesma frase
 * aparece em todos os formularios que tem o campo. A senha fraca e a senha
 * que nao confere sao as mesmas no cadastro e na redefinicao.
 */
export const FIELD_MESSAGES = {
  confirmPasswordRequired: 'Confirme a senha.',
  emailInvalid: 'Informe um e-mail válido.',
  emailRequired: 'Informe o e-mail.',
  mismatchPassword: 'As senhas não conferem.',
  passwordRequired: 'Informe a senha.',
  passwordTooLong: `A senha deve ter no máximo ${PASSWORD_MAX} caracteres.`,
  weakPassword: `A senha deve ter no mínimo ${PASSWORD_MIN} caracteres.`,
} as const;
