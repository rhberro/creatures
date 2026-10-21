import { expect, test } from 'bun:test';

import { parseClientMessage } from '~/ws/gameSocket';

function parsesPing(): void {
  const parsed = parseClientMessage(JSON.stringify({ sentAt: 123, type: 'ping' }));
  expect(parsed).toEqual({ sentAt: 123, type: 'ping' });
}

function parsesSelectTrainer(): void {
  const parsed = parseClientMessage(
    JSON.stringify({ trainerId: '3f2504e0-4f89-41d3-9a0c-0305e82c3301', type: 'select_trainer' }),
  );
  expect(parsed).toEqual({
    trainerId: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
    type: 'select_trainer',
  });
}

function rejectsUnknownMessage(): void {
  expect(parseClientMessage(JSON.stringify({ type: 'nope' }))).toBeNull();
  expect(parseClientMessage(JSON.stringify({ sentAt: 'now', type: 'ping' }))).toBeNull();
  expect(parseClientMessage('not json')).toBeNull();
  expect(parseClientMessage(JSON.stringify({ trainerId: 7, type: 'select_trainer' }))).toBeNull();
  // An id that is not a uuid would make the database query itself fail, so it
  // never reaches the repository.
  expect(
    parseClientMessage(JSON.stringify({ trainerId: 'trainer-1', type: 'select_trainer' })),
  ).toBeNull();
}

test('parseClientMessage reads a ping', parsesPing);
test('parseClientMessage reads a select_trainer', parsesSelectTrainer);
test('parseClientMessage rejects unknown messages', rejectsUnknownMessage);
