import { replace } from 'react-router-dom';

import { getAuthStore, selectStatus } from '~/auth/store/authClient';
import type { AuthStore } from '~/auth/store/authStore';
import type { AuthStatus } from '~/auth/store/types';

const INITIALIZING: AuthStatus = 'INITIALIZING';
const RESET_PASSWORD_PATH = '/reset-password';
const SIGNIN_PATH = '/signin';
const TRAINERS_PATH = '/trainers';

// Supabase emite o primeiro INITIAL_SESSION de forma assíncrona, então um loader
// que decide com o status ainda em INITIALIZING redirecionaria deep links válidos
// (retorno do OAuth, link de recuperação). Espera o primeiro status definitivo.
export function requireAuthLoader(): Promise<null> {
  return awaitSettledStatus(getAuthStore()).then(buildAuthGuard());
}

export function resetPasswordLoader(): Promise<null> {
  return awaitSettledStatus(getAuthStore()).then(buildResetGuard());
}

export function redirectIfAuthenticatedLoader(): Promise<null> {
  return awaitSettledStatus(getAuthStore()).then(redirectIfAuthenticated);
}

export function redirectIfAuthenticatedOrRecoveringLoader(): Promise<null> {
  return awaitSettledStatus(getAuthStore()).then(redirectIfAuthenticatedOrRecovering);
}

export function notFoundLoader(): never {
  throw replace(SIGNIN_PATH);
}

function redirectIfAuthenticated(status: AuthStatus): null {
  if (status === 'AUTHENTICATED') {
    throw replace(TRAINERS_PATH);
  }
  return null;
}

// Durante RECOVERING o usuário tem uma sessão parcial e pertence à tela de reset,
// então volta para lá em vez de ficar preso num formulário de entrada. O loader
// "puro" fica em /forgot-password porque o "Voltar" da tela de reset aponta para
// lá: redirecionar RECOVERING de /forgot-password criaria um loop.
function redirectIfAuthenticatedOrRecovering(status: AuthStatus): null {
  if (status === 'RECOVERING') {
    throw replace(RESET_PASSWORD_PATH);
  }
  return redirectIfAuthenticated(status);
}

function awaitSettledStatus(store: AuthStore): Promise<AuthStatus> {
  const status = selectStatus(store.getState());
  if (status !== INITIALIZING) {
    return Promise.resolve(status);
  }
  return new Promise(buildStatusWaiter(store));
}

function buildStatusWaiter(store: AuthStore): (resolve: (status: AuthStatus) => void) => void {
  return function wait(resolve): void {
    const unsubscribe = store.subscribe(function onStatusChanged(state): void {
      const status = selectStatus(state);
      if (status !== INITIALIZING) {
        unsubscribe();
        resolve(status);
      }
    });
  };
}

function buildAuthGuard(): (status: AuthStatus) => null {
  return function guard(status): null {
    if (status === 'AUTHENTICATED') {
      return null;
    }
    throw replace(SIGNIN_PATH);
  };
}

function buildResetGuard(): (status: AuthStatus) => null {
  return function guard(status): null {
    if (status === 'RECOVERING' || status === 'AUTHENTICATED') {
      return null;
    }
    throw replace(SIGNIN_PATH);
  };
}
