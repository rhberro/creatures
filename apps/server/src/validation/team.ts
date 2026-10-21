import type { TrainerErrorCode } from '@creatures/contracts/trainer';

import { isUuid } from '~/validation/trainer';

const INVALID_TEAM_COMMAND = 'invalid_team_command';

export type AddTeamMemberCommand = {
  creatureId: string;
};

export type TeamOrderCommand = {
  order: string[];
};

export type SwapTeamCommand = {
  creatureId: string;
};

export type TeamCommandValidation<T> =
  | { ok: true; value: T }
  | { code: TrainerErrorCode; message: string; ok: false };

export function validateAddTeamMember(body: unknown): TeamCommandValidation<AddTeamMemberCommand> {
  if (!isRecord(body)) {
    return invalidCommand();
  }
  const creatureId = body.creatureId;
  if (typeof creatureId !== 'string' || !isUuid(creatureId)) {
    return invalidCommand();
  }
  return { ok: true, value: { creatureId } };
}

/**
 * The order is the list of the creatures of the team, in the wanted order.
 * A repeated id is refused here: the same creature cannot take two slots.
 */
export function validateTeamOrder(body: unknown): TeamCommandValidation<TeamOrderCommand> {
  if (!isRecord(body)) {
    return invalidCommand();
  }
  const order = body.order;
  if (!Array.isArray(order)) {
    return invalidCommand();
  }
  const ids: string[] = [];
  const seen: Set<string> = new Set();
  for (const entry of order) {
    if (typeof entry !== 'string' || !isUuid(entry) || seen.has(entry)) {
      return invalidCommand();
    }
    seen.add(entry);
    ids.push(entry);
  }
  return { ok: true, value: { order: ids } };
}

/**
 * The manual swap names the creature that takes the place of the one in the
 * field.
 */
export function validateSwapCreature(body: unknown): TeamCommandValidation<SwapTeamCommand> {
  if (!isRecord(body)) {
    return invalidCommand();
  }
  const creatureId = body.creatureId;
  if (typeof creatureId !== 'string' || !isUuid(creatureId)) {
    return invalidCommand();
  }
  return { ok: true, value: { creatureId } };
}

function invalidCommand(): TeamCommandValidation<never> {
  return {
    code: INVALID_TEAM_COMMAND,
    message: 'Comando de time inválido.',
    ok: false,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
