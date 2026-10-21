import type { Creature } from '@creatures/contracts/creature';
import { type ChangeEvent, useCallback, useMemo, useState } from 'react';

import { readCreatureName } from '~/entities/team';

export type StorageState = {
  /** The captured creatures the search shows, in the order of the capture. */
  captured: Creature[];
  handleSearchChange(event: ChangeEvent<HTMLInputElement>): void;
  isSearching: boolean;
  /** The creature the player clicked, the one whose slot is marked. */
  selectedId: string | null;
  /** Selects a creature of the grid. */
  select(creatureId: string): void;
  search: string;
};

/**
 * The search and the selection of the storage.
 *
 * The search filters the captured creatures by the name of the species, and it
 * ignores accents and case: "brasa" finds "Brasa", and the player does not
 * depend on typing the accent right.
 *
 * The selection is the creature the player clicked: the slot stays marked
 * while the cursor goes away, because the mark is the choice and not the
 * hover of the popup.
 */
export function useStorage(creatures: Creature[]): StorageState {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSearchChange = useCallback(function handleSearchChange(
    event: ChangeEvent<HTMLInputElement>,
  ): void {
    setSearch(event.target.value);
  }, []);

  const select = useCallback(function selectCreature(creatureId: string): void {
    setSelectedId(creatureId);
  }, []);

  const term = normalize(search);
  const captured = useMemo(
    function filterCaptured(): Creature[] {
      if (term === '') {
        return creatures;
      }
      return creatures.filter(function matches(creature: Creature): boolean {
        return normalize(readCreatureName(creature)).includes(term);
      });
    },
    [creatures, term],
  );

  return {
    captured,
    handleSearchChange,
    isSearching: term !== '',
    search,
    select,
    selectedId,
  };
}

/** The name without accents and in lower case, so "brasa" finds "Brasa". */
function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replaceAll(/[\u0300-\u036F]/gu, '')
    .trim()
    .toLowerCase();
}
