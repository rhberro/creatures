import { createElement, type ReactElement } from 'react';
import type { NavigateFunction } from 'react-router-dom';

import type { AuthErrorCode, AuthResult } from '~/auth/store/types';
import { ForgotAlertIcon } from '~/pages/auth/ForgotAlertIcon';
import { ForgotAlertMessage } from '~/pages/auth/ForgotAlertMessage';
import { SuccessIcon } from '~/pages/auth/SuccessIcon';
import { SuccessMessage } from '~/pages/auth/SuccessMessage';
import { decideDestinationAfterAuth } from '~/trainers/postAuthRedirect';

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

const ALERT_DURATION_MS = 6000;
const SIGNIN_PATH = '/signin';

export function buildSignInResultHandler(
  navigate: NavigateFunction,
  setError: (message: string) => void,
  setIsSubmitting: (value: boolean) => void,
): (result: AuthResult) => void {
  return function handle(result: AuthResult): void {
    setIsSubmitting(false);
    if (result.ok) {
      redirectAfterAuth(navigate);
      return;
    }
    setError(messageForSignInError(result.code));
  };
}

export function buildOAuthResultHandler(
  setError: (message: string) => void,
  setIsSubmitting: (value: boolean) => void,
): (result: AuthResult) => void {
  return function handle(result: AuthResult): void {
    setIsSubmitting(false);
    if (result.ok) {
      if (result.redirectUrl !== undefined) {
        globalThis.location.href = result.redirectUrl;
        return;
      }
      return;
    }
    setError(messageForSignInError(result.code));
  };
}

export function buildSignUpResultHandler(
  navigate: NavigateFunction,
  setError: (message: string) => void,
  setIsSubmitting: (value: boolean) => void,
): (result: AuthResult) => void {
  return function handle(result: AuthResult): void {
    setIsSubmitting(false);
    if (result.ok) {
      if (result.redirectUrl !== undefined) {
        globalThis.location.href = result.redirectUrl;
        return;
      }
      redirectAfterAuth(navigate);
      return;
    }
    setError(messageForSignUpError(result.code));
  };
}

export function buildResetResultHandler(
  navigate: NavigateFunction,
  show: (input: { content: ReactElement; duration: number; icon: ReactElement }) => string,
  setError: (message: string) => void,
  setIsSubmitting: (value: boolean) => void,
  signOut: () => Promise<void>,
): (result: AuthResult) => void {
  return function handle(result: AuthResult): void {
    setIsSubmitting(false);
    if (result.ok) {
      show({
        content: createElement(SuccessMessage),
        duration: ALERT_DURATION_MS,
        icon: createElement(SuccessIcon),
      });
      signOut().then(redirectToSignin(navigate), noop);
      return;
    }
    setError(messageForResetError(result.code));
  };
}

export function buildForgotResultHandler(
  show: (input: { content: ReactElement; duration: number; icon: ReactElement }) => string,
  setError: (message: string) => void,
  setIsSubmitting: (value: boolean) => void,
): (result: AuthResult) => void {
  return function handle(result: AuthResult): void {
    setIsSubmitting(false);
    show({
      content: createElement(ForgotAlertMessage),
      duration: ALERT_DURATION_MS,
      icon: createElement(ForgotAlertIcon),
    });
    if (!result.ok) {
      setError(messageForForgotError(result.code));
    }
  };
}

export function buildAuthFailureHandler(
  setError: (message: string) => void,
  setIsSubmitting: (value: boolean) => void,
  networkMessage: string,
): (error: unknown) => void {
  return function handle(): void {
    setIsSubmitting(false);
    setError(networkMessage);
  };
}

function messageForSignInError(code: AuthErrorCode): string {
  switch (code) {
    case 'invalid_credentials':
      return SIGNIN_MESSAGES.genericError;
    case 'rate_limited':
      return SIGNIN_MESSAGES.rateLimitedError;
    case 'network':
      return SIGNIN_MESSAGES.networkError;
    default:
      return SIGNIN_MESSAGES.genericError;
  }
}

function messageForSignUpError(code: AuthErrorCode): string {
  switch (code) {
    case 'email_already_exists':
      return SIGNUP_MESSAGES.emailTakenError;
    case 'weak_password':
      return SIGNUP_MESSAGES.weakPasswordError;
    case 'network':
      return SIGNUP_MESSAGES.networkError;
    case 'rate_limited':
      return SIGNUP_MESSAGES.rateLimitedError;
    default:
      return SIGNUP_MESSAGES.genericError;
  }
}

function messageForResetError(code: AuthErrorCode): string {
  switch (code) {
    case 'weak_password':
      return RESET_MESSAGES.weakPasswordError;
    case 'same_password':
      return RESET_MESSAGES.samePasswordError;
    case 'network':
      return RESET_MESSAGES.networkError;
    case 'rate_limited':
      return RESET_MESSAGES.rateLimitedError;
    default:
      return RESET_MESSAGES.genericError;
  }
}

function messageForForgotError(code: AuthErrorCode): string {
  switch (code) {
    case 'network':
      return FORGOT_MESSAGES.networkError;
    case 'rate_limited':
      return FORGOT_MESSAGES.rateLimitedError;
    default:
      return FORGOT_MESSAGES.genericError;
  }
}

function redirectToSignin(navigate: NavigateFunction): () => void {
  return function redirect(): void {
    navigate(SIGNIN_PATH, { replace: true });
  };
}

function redirectAfterAuth(navigate: NavigateFunction): void {
  decideDestinationAfterAuth().then(buildDestinationNavigator(navigate));
}

function buildDestinationNavigator(navigate: NavigateFunction): (destination: string) => void {
  return function navigateToDestination(destination: string): void {
    navigate(destination, { replace: true });
  };
}

function noop(): void {
  void 0;
}
