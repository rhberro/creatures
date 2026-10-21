import { expect, test } from 'bun:test';

import { buildInternalError, mapTeamOperationError, mapTrainerWriteError } from '~/db/errors';

function mapsUniqueViolationToNameTaken(): void {
  const mapped = mapTrainerWriteError({
    code: '23505',
    message: 'duplicate key value violates unique constraint "trainers_normalized_name_key"',
  });
  expect(mapped.status).toBe(409);
  expect(mapped.code).toBe('name_taken');
}

function mapsMaxTrainersReached(): void {
  const mapped = mapTrainerWriteError({ code: 'P0001', message: 'max_trainers_reached' });
  expect(mapped.status).toBe(409);
  expect(mapped.code).toBe('max_trainers_reached');
}

function mapsStarterUnavailable(): void {
  const mapped = mapTrainerWriteError({ code: 'P0001', message: 'starter_unavailable' });
  expect(mapped.status).toBe(400);
  expect(mapped.code).toBe('starter_unavailable');
}

function mapsUnknownErrorToInternal(): void {
  const mapped = mapTrainerWriteError({ code: '42P01', message: 'relation does not exist' });
  expect(mapped.status).toBe(500);
  expect(mapped.code).toBe('internal_error');
  expect(mapped.message).not.toContain('relation');
}

function buildsInternalErrorWithoutStack(): void {
  const mapped = buildInternalError();
  expect(mapped.status).toBe(500);
  expect(mapped.code).toBe('internal_error');
  expect(mapped.message).toBe('Erro interno do servidor.');
}

function mapsCreatureNotFound(): void {
  const mapped = mapTeamOperationError({ code: 'P0001', message: 'creature_not_found' });
  expect(mapped.status).toBe(404);
  expect(mapped.code).toBe('creature_not_found');
}

function mapsInvalidTeamCommand(): void {
  const mapped = mapTeamOperationError({ code: 'P0001', message: 'invalid_team_command' });
  expect(mapped.status).toBe(400);
  expect(mapped.code).toBe('invalid_team_command');
}

function mapsTeamFull(): void {
  const mapped = mapTeamOperationError({ code: 'P0001', message: 'team_full' });
  expect(mapped.status).toBe(409);
  expect(mapped.code).toBe('team_full');
}

function mapsUnknownTeamErrorToInternal(): void {
  const mapped = mapTeamOperationError({ code: '42P01', message: 'relation does not exist' });
  expect(mapped.status).toBe(500);
  expect(mapped.code).toBe('internal_error');
}

test('mapTrainerWriteError maps 23505 to 409 name_taken', mapsUniqueViolationToNameTaken);
test('mapTrainerWriteError maps P0001 max_trainers_reached to 409', mapsMaxTrainersReached);
test('mapTrainerWriteError maps P0001 starter_unavailable to 400', mapsStarterUnavailable);
test('mapTrainerWriteError maps an unknown error to 500', mapsUnknownErrorToInternal);
test('buildInternalError hides the implementation details', buildsInternalErrorWithoutStack);
test('mapTeamOperationError maps creature_not_found to 404', mapsCreatureNotFound);
test('mapTeamOperationError maps invalid_team_command to 400', mapsInvalidTeamCommand);
test('mapTeamOperationError maps team_full to 409', mapsTeamFull);
test('mapTeamOperationError maps an unknown error to 500', mapsUnknownTeamErrorToInternal);
