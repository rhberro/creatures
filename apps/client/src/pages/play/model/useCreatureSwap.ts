import { useState } from 'react';

import { createApiDeps } from '~/shared/api/client';
import { requestSwapCreature } from '~/shared/api/endpoints/skill';
import type { SkillCommandResult } from '~/shared/api/endpoints/skill';
import type { TrainerClientErrorCode } from '~/shared/api/http';
import { getAccessToken } from '~/shared/auth';

import { useSwapCooldown } from './useSwapCooldown';

/** The time the server waits between two manual swaps. */
export const SWAP_COOLDOWN_MS = 5000;

const SWAP_COOLDOWN_MESSAGE = 'A troca de criatura está em recarga. Aguarde alguns segundos.';
const SWAP_FAILURE_MESSAGE = 'Não foi possível trocar a criatura.';

export type CreatureSwapOptions = {
  /** Called when the server refuses the swap. */
  onFailed: (message: string) => void;
  /** Called after a swap the server accepted. */
  onSwapped: () => void;
};

export type CreatureSwapView = {
  /** The time left of the cooldown of the swap. */
  cooldownRemainingMs: number;
  /** The whole time of the cooldown of the swap. */
  cooldownTotalMs: number;
  isSwapping: boolean;
  swapCreature: (creatureId: string) => void;
};

/**
 * The manual swap of the active creature.
 *
 * The server is the authority: it refuses the swap that comes too early, and
 * the client shows the cooldown instead of arguing with it. The countdown is
 * what the player sees while the tabs wait.
 */
export function useCreatureSwap(options: CreatureSwapOptions): CreatureSwapView {
  const { onFailed, onSwapped } = options;
  const [isSwapping, setSwapping] = useState<boolean>(false);
  const cooldown = useSwapCooldown(SWAP_COOLDOWN_MS);

  function swapCreature(creatureId: string): void {
    if (isSwapping) {
      return;
    }
    setSwapping(true);
    requestSwapCreature(createApiDeps(getAccessToken), creatureId).then(
      function handleSwap(result: SkillCommandResult): void {
        setSwapping(false);
        if (!result.ok) {
          cooldown.start();
          onFailed(readSwapMessage(result.code));
          return;
        }
        cooldown.start();
        onSwapped();
      },
      function handleFailure(): void {
        setSwapping(false);
        onFailed(SWAP_FAILURE_MESSAGE);
      },
    );
  }

  return {
    cooldownRemainingMs: cooldown.remainingMs,
    cooldownTotalMs: cooldown.totalMs,
    isSwapping,
    swapCreature,
  };
}

/**
 * The message of a swap the server refused.
 *
 * The swap that comes too early is not an error: it is the cooldown, and the
 * countdown says so.
 */
function readSwapMessage(code: TrainerClientErrorCode): string {
  if (code === 'swap_cooldown') {
    return SWAP_COOLDOWN_MESSAGE;
  }
  if (code === 'creature_not_found') {
    return 'A criatura não foi encontrada.';
  }
  if (code === 'invalid_team_command') {
    return 'Esta criatura não pode entrar em campo agora.';
  }
  return SWAP_FAILURE_MESSAGE;
}
