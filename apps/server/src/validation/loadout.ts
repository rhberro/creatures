import type { TrainerErrorCode } from '@creatures/contracts/trainer';
import { z } from 'zod';

const INVALID_TEAM_COMMAND = 'invalid_team_command';

/** The four slots of ability belong to the creature in the field. */
export const ABILITY_SLOT_COUNT = 4;
/** The two slots of consumable belong to the trainer. */
export const CONSUMABLE_SLOT_MIN = 4;
export const CONSUMABLE_SLOT_MAX = 5;
/** The slot of the capture device belongs to the trainer. */
export const DEVICE_SLOT = 6;

export type AbilitySlotsCommand = {
  abilityIds: (string | null)[];
};

export type GearSlotCommand = {
  itemId: string;
  triggerHpPercent?: number;
};

export type LoadoutValidation<T> =
  | { ok: true; value: T }
  | { code: TrainerErrorCode; message: string; ok: false };

export const abilitySlotsRequestSchema = z.object({
  abilityIds: z.array(z.string().uuid().or(z.literal(''))).max(ABILITY_SLOT_COUNT),
});

export const gearSlotRequestSchema = z.object({
  itemId: z.string().uuid(),
  triggerHpPercent: z.number().int().min(1).max(100).optional(),
});

export function validateAbilitySlots(body: unknown): LoadoutValidation<AbilitySlotsCommand> {
  const result = abilitySlotsRequestSchema.safeParse(body);
  if (!result.success) {
    return invalidCommand();
  }
  const abilityIds = result.data.abilityIds.map(readSlotAbility);
  if (hasRepeatedAbility(abilityIds)) {
    return invalidCommand();
  }
  return { ok: true, value: { abilityIds } };
}

export function validateGearSlot(body: unknown): LoadoutValidation<GearSlotCommand> {
  const result = gearSlotRequestSchema.safeParse(body);
  if (!result.success) {
    return invalidCommand();
  }
  return { ok: true, value: result.data };
}

/**
 * The slot of the skill bar, read from the path of the request.
 */
export function readGearSlotNumber(value?: string): number | null {
  if (value === undefined) {
    return null;
  }
  const slot = Number(value);
  if (!Number.isInteger(slot)) {
    return null;
  }
  return slot;
}

/**
 * Whether the slot is one of the three slots that belong to the trainer.
 */
export function isTrainerGearSlot(slot: number): boolean {
  return (slot >= CONSUMABLE_SLOT_MIN && slot <= CONSUMABLE_SLOT_MAX) || slot === DEVICE_SLOT;
}

/**
 * The same ability cannot take two slots of the same creature.
 */
function hasRepeatedAbility(abilityIds: (string | null)[]): boolean {
  const seen = new Set<string>();
  for (const abilityId of abilityIds) {
    if (abilityId === null) {
      continue;
    }
    if (seen.has(abilityId)) {
      return true;
    }
    seen.add(abilityId);
  }
  return false;
}

/**
 * The loadout is the list of the slots, and an empty slot is an empty string
 * in the body.
 */
function readSlotAbility(value: string): string | null {
  if (value === '') {
    return null;
  }
  return value;
}

function invalidCommand(): LoadoutValidation<never> {
  return {
    code: INVALID_TEAM_COMMAND,
    message: 'Comando de time inválido.',
    ok: false,
  };
}
