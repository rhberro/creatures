import type { NavigateFunction } from 'react-router-dom';

import { switchTrainer } from '~/pages/play/model/switchTrainer';
import type { SwitchTrainerResult } from '~/pages/play/model/switchTrainer';

const SIGNIN_PATH = '/signin';
const SWITCH_FAILED_MESSAGE = 'Não foi possível trocar de treinador. Tente de novo.';
const TRAINERS_PATH = '/trainers';

export type SessionActions = {
  onSignOut: () => void;
  onSwitchTrainer: () => void;
};

/**
 * The two actions of the session, offered by the menu of the settings.
 *
 * Signing out ends the session of the account. Switching the trainer only
 * disconnects the trainer from the service: the session stays alive, and the
 * player goes back to the list of trainers.
 */
export function buildSessionActions(
  signOut: () => Promise<void>,
  navigate: NavigateFunction,
  notify: (message: string) => void,
): SessionActions {
  return {
    onSignOut: handleSignOut(signOut, navigate),
    onSwitchTrainer: handleSwitchTrainer(navigate, notify),
  };
}

function handleSignOut(signOut: () => Promise<void>, navigate: NavigateFunction): () => void {
  return function signOutAndRedirect(): void {
    signOut().then(redirectToSignin(navigate), noop);
  };
}

function handleSwitchTrainer(
  navigate: NavigateFunction,
  notify: (message: string) => void,
): () => void {
  return function switchTrainerAndRedirect(): void {
    switchTrainer().then(handleSwitchResult(navigate, notify));
  };
}

function handleSwitchResult(
  navigate: NavigateFunction,
  notify: (message: string) => void,
): (result: SwitchTrainerResult) => void {
  return function handleResult(result: SwitchTrainerResult): void {
    if (!result.ok) {
      notify(SWITCH_FAILED_MESSAGE);
      return;
    }
    navigate(TRAINERS_PATH, { replace: true });
  };
}

function redirectToSignin(navigate: NavigateFunction): () => void {
  return function redirect(): void {
    navigate(SIGNIN_PATH, { replace: true });
  };
}

function noop(): void {
  void 0;
}
