import type { SkillSlot } from '@creatures/contracts/skill';

import type { ApiDeps } from '~/shared/api/client';
import { buildHeaders, isSuccessStatus, resolveErrorCode } from '~/shared/api/http';
import type { TrainerClientErrorCode } from '~/shared/api/http';

const CREATURES_PATH = '/api/creatures';
const GEAR_SLOTS_PATH = '/api/gear-slots';
const TEAM_SWAP_PATH = '/api/team/swap';
const UNAUTHENTICATED: TrainerClientErrorCode = 'unauthenticated';

/**
 * The answer of a command of the skill bar.
 *
 * The commands answer with no content: what changed is read from the state of
 * the player, which the client asks for again after the command.
 */
export type SkillCommandResult = { ok: true } | { ok: false; code: TrainerClientErrorCode };

export function requestEquipAbilities(
  deps: ApiDeps,
  creatureId: string,
  abilityIds: string[],
): Promise<SkillCommandResult> {
  return deps.getAccessToken().then(buildEquipAbilitiesRequester(deps, creatureId, abilityIds));
}

export function requestEquipGear(
  deps: ApiDeps,
  slot: SkillSlot,
  itemId: string,
  triggerHpPercent?: number,
): Promise<SkillCommandResult> {
  return deps.getAccessToken().then(buildEquipGearRequester(deps, slot, itemId, triggerHpPercent));
}

export function requestClearGear(deps: ApiDeps, slot: SkillSlot): Promise<SkillCommandResult> {
  return deps.getAccessToken().then(buildClearGearRequester(deps, slot));
}

export function requestSwapCreature(
  deps: ApiDeps,
  creatureId: string,
): Promise<SkillCommandResult> {
  return deps.getAccessToken().then(buildSwapCreatureRequester(deps, creatureId));
}

function buildEquipAbilitiesRequester(
  deps: ApiDeps,
  creatureId: string,
  abilityIds: string[],
): (token: string | null) => Promise<SkillCommandResult> {
  return function equipAbilitiesWithToken(token: string | null): Promise<SkillCommandResult> {
    if (token === null) {
      return Promise.resolve({ code: UNAUTHENTICATED, ok: false });
    }
    const headers = buildHeaders(token);
    const body = JSON.stringify({ abilityIds });
    const init = { body, headers, method: 'PUT' };
    return globalThis
      .fetch(buildAbilitySlotsUrl(deps.baseUrl, creatureId), init)
      .then(readCommandResponse)
      .catch(readCommandNetworkFailure);
  };
}

function buildEquipGearRequester(
  deps: ApiDeps,
  slot: SkillSlot,
  itemId: string,
  triggerHpPercent: number | undefined,
): (token: string | null) => Promise<SkillCommandResult> {
  return function equipGearWithToken(token: string | null): Promise<SkillCommandResult> {
    if (token === null) {
      return Promise.resolve({ code: UNAUTHENTICATED, ok: false });
    }
    const headers = buildHeaders(token);
    const body = buildEquipGearBody(itemId, triggerHpPercent);
    const init = { body, headers, method: 'PUT' };
    return globalThis
      .fetch(buildGearSlotUrl(deps.baseUrl, slot), init)
      .then(readCommandResponse)
      .catch(readCommandNetworkFailure);
  };
}

function buildClearGearRequester(
  deps: ApiDeps,
  slot: SkillSlot,
): (token: string | null) => Promise<SkillCommandResult> {
  return function clearGearWithToken(token: string | null): Promise<SkillCommandResult> {
    if (token === null) {
      return Promise.resolve({ code: UNAUTHENTICATED, ok: false });
    }
    const headers = buildHeaders(token);
    const init = { headers, method: 'DELETE' };
    return globalThis
      .fetch(buildGearSlotUrl(deps.baseUrl, slot), init)
      .then(readCommandResponse)
      .catch(readCommandNetworkFailure);
  };
}

function buildSwapCreatureRequester(
  deps: ApiDeps,
  creatureId: string,
): (token: string | null) => Promise<SkillCommandResult> {
  return function swapCreatureWithToken(token: string | null): Promise<SkillCommandResult> {
    if (token === null) {
      return Promise.resolve({ code: UNAUTHENTICATED, ok: false });
    }
    const headers = buildHeaders(token);
    const body = JSON.stringify({ creatureId });
    const init = { body, headers, method: 'POST' };
    return globalThis
      .fetch(buildSwapCreatureUrl(deps.baseUrl), init)
      .then(readCommandResponse)
      .catch(readCommandNetworkFailure);
  };
}

/**
 * The trigger of the life only travels when there is one: the device slot has
 * no life to watch.
 */
function buildEquipGearBody(itemId: string, triggerHpPercent: number | undefined): string {
  if (triggerHpPercent === undefined) {
    return JSON.stringify({ itemId });
  }
  return JSON.stringify({ itemId, triggerHpPercent });
}

function readCommandResponse(response: Response): Promise<SkillCommandResult> {
  if (isSuccessStatus(response.status)) {
    return Promise.resolve({ ok: true });
  }
  return response
    .json()
    .then(buildCommandResult(response.status), buildUnreadableCommandResult(response.status));
}

function buildCommandResult(status: number): (body: unknown) => SkillCommandResult {
  return function toCommandResult(body: unknown): SkillCommandResult {
    return { code: resolveErrorCode(status, body), ok: false };
  };
}

function buildUnreadableCommandResult(status: number): () => SkillCommandResult {
  return function toUnreadableCommandResult(): SkillCommandResult {
    return { code: resolveErrorCode(status, null), ok: false };
  };
}

function readCommandNetworkFailure(): SkillCommandResult {
  return { code: 'unknown', ok: false };
}

function buildAbilitySlotsUrl(baseUrl: string, creatureId: string): string {
  return `${baseUrl}${CREATURES_PATH}/${creatureId}/ability-slots`;
}

function buildGearSlotUrl(baseUrl: string, slot: SkillSlot): string {
  return `${baseUrl}${GEAR_SLOTS_PATH}/${slot}`;
}

function buildSwapCreatureUrl(baseUrl: string): string {
  return `${baseUrl}${TEAM_SWAP_PATH}`;
}
