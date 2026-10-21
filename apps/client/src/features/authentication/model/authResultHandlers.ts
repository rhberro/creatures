import { createElement, type ReactElement } from 'react';
import type { NavigateFunction } from 'react-router-dom';

import { ForgotAlertIcon } from '~/features/authentication/ui/ForgotAlertIcon';
import { ForgotAlertMessage } from '~/features/authentication/ui/ForgotAlertMessage';
import { SuccessIcon } from '~/features/authentication/ui/SuccessIcon';
import { SuccessMessage } from '~/features/authentication/ui/SuccessMessage';
import type { AuthErrorCode, AuthResult } from '~/shared/auth';

import { FORGOT_MESSAGES, RESET_MESSAGES, SIGNIN_MESSAGES, SIGNUP_MESSAGES } from './auth.messages';
import { decideDestinationAfterAuth } from './postAuthRedirect';

const ALERT_DURATION_MS = 6000;
const SIGNIN_PATH = '/signin';

type SetFormError = (message: string) => void;

export function buildSignInResultHandler(
  navigate: NavigateFunction,
  setError: SetFormError,
): (result: AuthResult) => void {
  return function handle(result: AuthResult): void {
    if (result.ok) {
      redirectAfterAuth(navigate);
      return;
    }
    setError(messageForFormErrorMessage(result.code));
  };
}

export function buildOAuthResultHandler(setError: SetFormError): (result: AuthResult) => void {
  return function handle(result: AuthResult): void {
    if (result.ok) {
      if (result.redirectUrl !== undefined) {
        globalThis.location.href = result.redirectUrl;
      }
      return;
    }
    setError(messageForFormErrorMessage(result.code));
  };
}

export function buildSignUpResultHandler(
  navigate: NavigateFunction,
  setError: SetFormError,
): (result: AuthResult) => void {
  return function handle(result: AuthResult): void {
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
  setError: SetFormError,
  signOut: () => Promise<void>,
): (result: AuthResult) => void {
  return function handle(result: AuthResult): void {
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
  setError: SetFormError,
): (result: AuthResult) => void {
  return function handle(result: AuthResult): void {
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
  setError: SetFormError,
  networkMessage: string,
): () => void {
  return function handle(): void {
    setError(networkMessage);
  };
}

function messageForFormErrorMessage(code: AuthErrorCode): string {
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
