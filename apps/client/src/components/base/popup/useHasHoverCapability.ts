import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';

const EMPTY_DEPS: ReadonlyArray<unknown> = [];

/**
 * O dispositivo tem ponteiro fino?
 *
 * Em ponteiro fino (mouse) o popup abre no hover. No toque, nao: hover nao
 * existe, e o popup abre pelo clique.
 */
export function useHasHoverCapability(): boolean {
  const [hasHover, setHasHover] = useState<boolean>(false);

  useEffect(detectHoverCapability(setHasHover), EMPTY_DEPS);

  return hasHover;
}

function detectHoverCapability(setHasHover: Dispatch<SetStateAction<boolean>>): () => void {
  return function detect(): void {
    if (typeof window === 'undefined') {
      return;
    }
    setHasHover(window.matchMedia('(hover: hover)').matches);
  };
}
