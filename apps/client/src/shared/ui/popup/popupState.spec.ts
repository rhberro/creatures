import { expect, test } from 'bun:test';

import {
  CLOSED_POPUP_STATE,
  reducePopupState,
  type PopupEvent,
  type PopupState,
} from './popupState';

const FIRST = 'first';
const SECOND = 'second';

test('o hover abre o popup', checkHoverOpens);
test('o hover de outro popup fecha o que estava aberto', checkHoverSwitches);
test('o popup fixado pelo clique sobrevive ao cursor sair', checkPinSurvivesTheLeave);
test('o popup fixado pelo clique segura o grupo', checkPinOwnsTheGroup);
test('o clique em outro popup fecha o primeiro e abre o segundo', checkClickSwitches);
test('o clique no popup aberto, sem o cursor sobre ele, fecha o popup', checkClickClosesOnTouch);
test('o clique fora fecha o popup aberto', checkDismissCloses);
test('o popup que nao esta aberto nao muda com o pedido de fechar', checkDismissIgnoresTheOther);

function reduce(state: PopupState, event: PopupEvent): PopupState {
  return reducePopupState(state, event);
}

function checkHoverOpens(): void {
  const state = reduce(CLOSED_POPUP_STATE, { id: FIRST, type: 'enter' });
  expect(state.openId).toBe(FIRST);
  expect(state.pinnedId).toBe(null);
}

function checkHoverSwitches(): void {
  const hovered = reduce(CLOSED_POPUP_STATE, { id: FIRST, type: 'enter' });
  const switched = reduce(hovered, { id: SECOND, type: 'enter' });
  expect(switched.openId).toBe(SECOND);
}

function checkPinSurvivesTheLeave(): void {
  const hovered = reduce(CLOSED_POPUP_STATE, { id: FIRST, type: 'enter' });
  const pinned = reduce(hovered, { id: FIRST, type: 'click' });
  const left = reduce(pinned, { id: FIRST, type: 'leave' });
  expect(left.openId).toBe(FIRST);
  expect(left.pinnedId).toBe(FIRST);
}

function checkPinOwnsTheGroup(): void {
  const pinned = reduce(CLOSED_POPUP_STATE, { id: FIRST, type: 'click' });
  const hovered = reduce(pinned, { id: SECOND, type: 'enter' });
  expect(hovered.openId).toBe(FIRST);
}

function checkClickSwitches(): void {
  const pinned = reduce(CLOSED_POPUP_STATE, { id: FIRST, type: 'click' });
  const switched = reduce(pinned, { id: SECOND, type: 'click' });
  expect(switched.openId).toBe(SECOND);
  expect(switched.pinnedId).toBe(SECOND);
}

function checkClickClosesOnTouch(): void {
  const pinned = reduce(CLOSED_POPUP_STATE, { id: FIRST, type: 'click' });
  const closed = reduce(pinned, { id: FIRST, type: 'click' });
  expect(closed.openId).toBe(null);
  expect(closed.pinnedId).toBe(null);
}

function checkDismissCloses(): void {
  const hovered = reduce(CLOSED_POPUP_STATE, { id: FIRST, type: 'enter' });
  const dismissed = reduce(hovered, { id: FIRST, type: 'dismiss' });
  expect(dismissed.openId).toBe(null);
}

function checkDismissIgnoresTheOther(): void {
  const hovered = reduce(CLOSED_POPUP_STATE, { id: FIRST, type: 'enter' });
  const dismissed = reduce(hovered, { id: SECOND, type: 'dismiss' });
  expect(dismissed.openId).toBe(FIRST);
}
