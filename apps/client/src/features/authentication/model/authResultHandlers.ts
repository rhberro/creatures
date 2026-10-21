import { createElement } from 'react';
import type { NavigateFunction } from 'react-router-dom';

import { EmailConfirmationIcon } from '~/features/authentication/ui/EmailConfirmationIcon';
import { EmailConfirmationMessage } from '~/features/authentication/ui/EmailConfirmationMessage';
import { ForgotAlertIcon } from '~/features/authentication/ui/ForgotAlertIcon';
import { ForgotAlertMessage } from '~/features/authentication/ui/ForgotAlertMessage';
import { SuccessIcon } from '~/features/authentication/ui/SuccessIcon';
import { SuccessMessage } from '~/features/authentication/ui/SuccessMessage';
import type { AuthResult } from '~/shared/auth';
import type { AlertInput } from '~/shared/ui/alert';

import {
  FORGOT_ERROR_MESSAGES,
  RESET_ERROR_MESSAGES,
  SIGNIN_ERROR_MESSAGES,
  SIGNUP_ERROR_MESSAGES,
} from './auth.messages';
import { decideDestinationAfterAuth } from './postAuthRedirect';

const ALERT_DURATION_MS = 6000;
const SIGNIN_PATH = '/signin';

type SetFormError = (message: string) => void;
type ShowAlert = (input: AlertInput) => string;
type ReadEmail = () => string;

export function buildSignInResultHandler(
  navigate: NavigateFunction,
  setError: SetFormError,
): (result: AuthResult) => void {
  return function handle(result: AuthResult): void {
    if (result.ok) {
      redirectAfterAuth(navigate);
      return;
    }
    setError(SIGNIN_ERROR_MESSAGES[result.code]);
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
    setError(SIGNIN_ERROR_MESSAGES[result.code]);
  };
}

/**
 * The answer of the signup.
 *
 * The account may be created without a session: the project can have the
 * automatic confirmation of the e-mail turned off. In that case the player
 * has to confirm the e-mail before entering, and the screen says so instead
 * of showing an error.
 */
export function buildSignUpResultHandler(
  navigate: NavigateFunction,
  setError: SetFormError,
  show: ShowAlert,
  readEmail: ReadEmail,
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
    if (result.code === 'email_confirmation_required') {
      showEmailConfirmationRequired(show, readEmail());
      return;
    }
    setError(SIGNUP_ERROR_MESSAGES[result.code]);
  };
}

export function buildResetResultHandler(
  navigate: NavigateFunction,
  show: ShowAlert,
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
    setError(RESET_ERROR_MESSAGES[result.code]);
  };
}

export function buildForgotResultHandler(
  show: ShowAlert,
  setError: SetFormError,
): (result: AuthResult) => void {
  return function handle(result: AuthResult): void {
    show({
      content: createElement(ForgotAlertMessage),
      duration: ALERT_DURATION_MS,
      icon: createElement(ForgotAlertIcon),
    });
    if (!result.ok) {
      setError(FORGOT_ERROR_MESSAGES[result.code]);
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

function showEmailConfirmationRequired(show: ShowAlert, email: string): void {
  show({
    content: createElement(EmailConfirmationMessage, { email }),
    duration: ALERT_DURATION_MS,
    icon: createElement(EmailConfirmationIcon),
  });
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
