import { expect, test } from 'bun:test';

import { newTrainerSchema } from '~/entities/trainer/model/trainer.schema';

const STARTER_ID = '11111111-1111-4111-8111-111111111111';
const VALID_NAME = 'Rafael';

test('a criatura inicial que falta aponta para o campo dela', checkMissingStarter);
test('o nome e aparado antes de ser conferido', checkTrimmedName);
test('o nome curto e recusado com a mensagem do campo', checkShortName);

function checkMissingStarter(): void {
  const result = newTrainerSchema.safeParse({
    gender: 'male',
    name: VALID_NAME,
    starterSpeciesId: '',
  });
  expect(result.success).toBe(false);
  const [issue] = result.error?.issues ?? [];
  expect(issue?.path).toEqual(['starterSpeciesId']);
  expect(issue?.message).toBe('Escolha uma criatura inicial.');
}

function checkTrimmedName(): void {
  const result = newTrainerSchema.safeParse({
    gender: 'female',
    name: `  ${VALID_NAME}  `,
    starterSpeciesId: STARTER_ID,
  });
  expect(result.success).toBe(true);
  expect(result.data?.name).toBe(VALID_NAME);
}

function checkShortName(): void {
  const result = newTrainerSchema.safeParse({
    gender: 'male',
    name: 'ab',
    starterSpeciesId: STARTER_ID,
  });
  expect(result.success).toBe(false);
  expect(result.error?.issues[0]?.message).toBe('O nome deve ter entre 3 e 15 caracteres.');
}
