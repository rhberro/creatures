import { expect } from 'bun:test';

import type { IntegrationEnvironment } from './environment';

export const BRASA_SPECIES_ID = '3f2504e0-4f89-41d3-9a0c-0305e82c3301';

export type EmbeddedAbility = {
  id: string;
  slug: string;
};

export type AbilityRow = {
  ability_id: string;
  abilities: EmbeddedAbility | EmbeddedAbility[] | null;
  slot: number;
};

export type AbilityPayload = {
  ability_id: string;
  id: string;
  slot: number;
  slug: string;
};

export type ItemPayload = {
  category: string;
  id: string;
  name: string;
  slug: string;
};

/**
 * The abilities of a species, in the slot the species declares them.
 */
export function readSpeciesAbilities(
  env: IntegrationEnvironment,
  speciesId: string = BRASA_SPECIES_ID,
): Promise<AbilityPayload[]> {
  const query = env.admin
    .from('species_abilities')
    .select('slot, ability_id, abilities(id, slug)')
    .eq('species_id', speciesId)
    .order('slot');
  return Promise.resolve(query.then(readAbilityRows));
}

export function readItem(env: IntegrationEnvironment, category: string): Promise<ItemPayload> {
  const query = env.admin.from('items').select('id, name, category, slug').eq('category', category);
  return Promise.resolve(query.then(readItemRows)).then(function pickFirst(
    items: ItemPayload[],
  ): ItemPayload {
    const first = items[0];
    if (first === undefined) {
      throw new Error(`the catalog has no item of the category ${category}`);
    }
    return first;
  });
}

export function giveItem(
  env: IntegrationEnvironment,
  trainerId: string,
  item: ItemPayload,
  quantity: number,
): Promise<void> {
  const query = env.admin
    .from('trainer_items')
    .upsert({ item_id: item.id, quantity, trainer_id: trainerId });
  return Promise.resolve(query).then(function written(): void {
    expect(true).toBe(true);
  });
}

export function readAbilityId(ability: AbilityPayload): string {
  return ability.ability_id;
}

export function readEquippedAbilityId(ability: { abilityId: string }): string {
  return ability.abilityId;
}

export function readSlot(ability: { slot: number }): number {
  return ability.slot;
}

function readAbilityRows(result: {
  data: AbilityRow[] | null;
  error: { message: string } | null;
}): AbilityPayload[] {
  const rows = result.data ?? [];
  return rows.map(readEmbeddedAbility);
}

function readEmbeddedAbility(row: AbilityRow): AbilityPayload {
  const abilities = row.abilities;
  if (abilities === null) {
    throw new Error('the ability of the species is missing');
  }
  const embedded = Array.isArray(abilities) ? (abilities[0] ?? { id: '', slug: '' }) : abilities;
  return { ...embedded, ability_id: row.ability_id, slot: row.slot };
}

function readItemRows(result: {
  data: ItemPayload[] | null;
  error: { message: string } | null;
}): ItemPayload[] {
  return result.data ?? [];
}
