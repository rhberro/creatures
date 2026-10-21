/**
 * The loadout of the creatures of the test account.
 *
 * Every creature is born with the abilities of its species in the slots of the
 * skill bar, and the creatures of the test account are no exception: without
 * it the account would show a creature with an empty bar.
 */
import type { AdminClient, SeedContext } from './seedTestAccountStore';

type AbilityRow = {
  ability_id: string;
  slot: number;
};

type AbilitySlotRow = {
  ability_id: string;
  creature_id: string;
  slot: number;
};

export function equipSpeciesAbilities(ctx: SeedContext): Promise<SeedContext> {
  return equipCreature(ctx, ctx.creatureIds, 0);
}

function equipCreature(
  ctx: SeedContext,
  creatureIds: string[],
  index: number,
): Promise<SeedContext> {
  const creatureId = creatureIds[index];
  if (creatureId === undefined) {
    return Promise.resolve(ctx);
  }
  return readCreatureSpecies(ctx.admin, creatureId).then(function withSpecies(
    speciesId: string,
  ): Promise<SeedContext> {
    return readSpeciesAbilities(ctx.admin, speciesId).then(function withAbilities(
      abilities: AbilityRow[],
    ): Promise<SeedContext> {
      if (abilities.length === 0) {
        return equipCreature(ctx, creatureIds, index + 1);
      }
      const rows = abilities.map(function toSlot(ability: AbilityRow): AbilitySlotRow {
        return { ability_id: ability.ability_id, creature_id: creatureId, slot: ability.slot };
      });
      const query = ctx.admin.from('creature_ability_slots').upsert(rows);
      return Promise.resolve(query).then(function written(): Promise<SeedContext> {
        return equipCreature(ctx, creatureIds, index + 1);
      });
    });
  });
}

function readCreatureSpecies(admin: AdminClient, creatureId: string): Promise<string> {
  const query = admin.from('creatures').select('species_id').eq('id', creatureId).single();
  return Promise.resolve(query).then(function readSpecies(result: {
    data: { species_id: string } | null;
    error: { message: string } | null;
  }): string {
    if (result.error !== null || result.data === null) {
      throw new Error(
        `Falha ao ler a espécie da criatura: ${result.error?.message ?? 'sem dados'}`,
      );
    }
    return result.data.species_id;
  });
}

function readSpeciesAbilities(admin: AdminClient, speciesId: string): Promise<AbilityRow[]> {
  const query = admin
    .from('species_abilities')
    .select('slot, ability_id')
    .eq('species_id', speciesId)
    .order('slot');
  return Promise.resolve(query).then(function readRows(result: {
    data: AbilityRow[] | null;
    error: { message: string } | null;
  }): AbilityRow[] {
    if (result.error !== null) {
      throw new Error(`Falha ao ler as habilidades da espécie: ${result.error.message}`);
    }
    return result.data ?? [];
  });
}
