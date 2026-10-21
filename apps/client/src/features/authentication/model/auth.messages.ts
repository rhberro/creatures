import { PASSWORD_MAX, PASSWORD_MIN } from '@creatures/contracts/auth';

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
  weakPasswordError: 'A senha deve ter no mínimo 8 caracteres.',
} as const;

export const FORGOT_MESSAGES = {
  alertMessage: 'Se o e-mail existir em nossa base de dados, enviamos um link de recuperação.',
  genericError: 'Não foi possível enviar o link. Tente novamente.',
  networkError: 'Erro de conexão. Tente novamente.',
  rateLimitedError: 'Muitas tentativas. Tente novamente em alguns minutos.',
} as const;

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
