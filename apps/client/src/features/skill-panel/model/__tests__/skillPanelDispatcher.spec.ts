import { expect, test } from 'bun:test';

import {
  dispatchCommand,
  whenCommandsSettled,
} from '~/features/skill-panel/model/skillPanelDispatcher';

/**
 * The commands go out one at a time: the second one leaves only after the
 * first one lands, so the server applies them in the order of the clicks.
 */
function sendsTheCommandsOneAtATime(): Promise<void> {
  const order: string[] = [];
  let release: () => void = noop;
  const gate = new Promise<void>(function build(resolve: () => void): void {
    release = resolve;
  });
  dispatchCommand(function first(): Promise<void> {
    order.push('first');
    return gate.then(function afterTheGate(): void {
      order.push('first landed');
    });
  });
  dispatchCommand(function second(): Promise<void> {
    order.push('second');
    return Promise.resolve();
  });
  return tick()
    .then(function checkTheStart(): void {
      expect(order).toEqual(['first']);
      release();
    })
    .then(function waitForTheCommands(): Promise<void> {
      return whenCommandsSettled();
    })
    .then(function checkTheOrder(): void {
      expect(order).toEqual(['first', 'first landed', 'second']);
    });
}

test('the commands go out one at a time, in the order of the clicks', sendsTheCommandsOneAtATime);

function noop(): void {
  void 0;
}

/**
 * The moment after the queue of the microtasks.
 */
function tick(): Promise<void> {
  return new Promise<void>(function wait(resolve: () => void): void {
    setTimeout(resolve, 0);
  });
}
