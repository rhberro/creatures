import { createElement, useEffect } from 'react';
import type { NavigateFunction } from 'react-router-dom';

import type { AlertInput } from '~/shared/ui/alert';
import { Text } from '~/shared/ui/text';

const TRAINERS_PATH = '/trainers';
const MAX_TRAINERS = 5;
const ALERT_DURATION_MS = 6000;
const LIMIT_MESSAGE = 'Você atingiu o limite de 5 treinadores.';

/**
 * O jogador que ja tem o maximo de treinadores nao fica na tela de criacao.
 *
 * A tela e um beco sem saida para quem nao pode criar: o aviso aparece e o
 * jogador volta para a lista.
 */
export function useTrainerLimitRedirect(
  isLoading: boolean,
  count: number,
  navigate: NavigateFunction,
  show: (input: AlertInput) => string,
): void {
  const isLimitReached = !isLoading && count >= MAX_TRAINERS;
  useEffect(buildLimitEffect(isLimitReached, navigate, show), [isLimitReached]);
}

function buildLimitEffect(
  isLimitReached: boolean,
  navigate: NavigateFunction,
  show: (input: AlertInput) => string,
): () => void {
  return function redirectAtLimit(): void {
    if (!isLimitReached) {
      return;
    }
    show({
      content: createElement(Text, null, LIMIT_MESSAGE),
      duration: ALERT_DURATION_MS,
      icon: null,
    });
    navigate(TRAINERS_PATH, { replace: true });
  };
}
