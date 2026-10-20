import { useEffect, useState } from 'react';

const TICK_MS = 100;
const EMPTY_DEPS: ReadonlyArray<unknown> = [];

/**
 * O tempo que resta de um aviso.
 *
 * A barra de tempo e do nosso lado: o `Toast` do Chakra cuida da vida do
 * aviso, nao da barra. O relogio corre em passos de 100ms, o mesmo passo do
 * aviso anterior.
 */
export function useCountdown(duration: number): number {
  const [remaining, setRemaining] = useState<number>(duration);
  const [lastDuration, setLastDuration] = useState<number>(duration);

  if (duration !== lastDuration) {
    setLastDuration(duration);
    setRemaining(duration);
  }

  function step(): void {
    setRemaining(decrement);
  }

  function tickEffect(): () => void {
    const intervalId = setInterval(step, TICK_MS);
    return function teardown(): void {
      clearInterval(intervalId);
    };
  }

  useEffect(tickEffect, EMPTY_DEPS);

  return remaining;
}

function decrement(current: number): number {
  return Math.max(0, current - TICK_MS);
}
