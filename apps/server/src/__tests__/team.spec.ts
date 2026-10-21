import { expect, test } from 'bun:test';

import { validateAddTeamMember, validateTeamOrder } from '~/validation/team';

const CREATURE_ID = '44444444-4444-4444-8444-444444444444';
const OTHER_CREATURE_ID = '55555555-5555-4555-8555-555555555555';

function acceptsACreatureId(): void {
  const validation = validateAddTeamMember({ creatureId: CREATURE_ID });
  expect(validation.ok).toBe(true);
  if (validation.ok) {
    expect(validation.value.creatureId).toBe(CREATURE_ID);
  }
}

function refusesAMissingBody(): void {
  const validation = validateAddTeamMember(null);
  expect(validation.ok).toBe(false);
  if (!validation.ok) {
    expect(validation.code).toBe('invalid_team_command');
  }
}

function refusesACreatureIdThatIsNotAnIdentifier(): void {
  const validation = validateAddTeamMember({ creatureId: 'not-an-uuid' });
  expect(validation.ok).toBe(false);
}

function acceptsAnOrderOfIdentifiers(): void {
  const validation = validateTeamOrder({ order: [CREATURE_ID, OTHER_CREATURE_ID] });
  expect(validation.ok).toBe(true);
  if (validation.ok) {
    expect(validation.value.order).toEqual([CREATURE_ID, OTHER_CREATURE_ID]);
  }
}

function refusesAnOrderThatIsNotAList(): void {
  const validation = validateTeamOrder({ order: CREATURE_ID });
  expect(validation.ok).toBe(false);
}

function refusesAnOrderWithARepeatedCreature(): void {
  const validation = validateTeamOrder({ order: [CREATURE_ID, CREATURE_ID] });
  expect(validation.ok).toBe(false);
}

function refusesAnOrderWithAnIdentifierThatIsNotAnIdentifier(): void {
  const validation = validateTeamOrder({ order: [CREATURE_ID, 'not-an-uuid'] });
  expect(validation.ok).toBe(false);
}

test('validateAddTeamMember accepts a creature id', acceptsACreatureId);
test('validateAddTeamMember refuses a missing body', refusesAMissingBody);
test(
  'validateAddTeamMember refuses a malformed creature id',
  refusesACreatureIdThatIsNotAnIdentifier,
);
test('validateTeamOrder accepts a list of identifiers', acceptsAnOrderOfIdentifiers);
test('validateTeamOrder refuses a value that is not a list', refusesAnOrderThatIsNotAList);
test('validateTeamOrder refuses a repeated creature', refusesAnOrderWithARepeatedCreature);
test(
  'validateTeamOrder refuses a malformed identifier',
  refusesAnOrderWithAnIdentifierThatIsNotAnIdentifier,
);
