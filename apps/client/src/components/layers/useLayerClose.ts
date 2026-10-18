import { useEffect, useRef, type RefObject } from 'react';

import type { LayerMode } from '~/components/layers/types';

const ESCAPE_DEPS: ReadonlyArray<unknown> = [];
const OUTSIDE_DEPS: ReadonlyArray<unknown> = [];

export function useLayerClose(props: UseLayerCloseProps): void {
  const { contentRef, mode, onClose } = props;
  const onCloseRef = useRef<() => void>(onClose);
  const modeRef = useRef<LayerMode>(mode);
  const contentRefRef = useRef<RefObject<HTMLElement | null>>(contentRef);

  useEffect(refreshRef(onCloseRef, onClose));
  useEffect(refreshRef(modeRef, mode));
  useEffect(refreshRef(contentRefRef, contentRef));

  useEffect(subscribeEscape(onCloseRef), ESCAPE_DEPS);
  useEffect(subscribeOutside(contentRefRef, onCloseRef, modeRef), OUTSIDE_DEPS);
}

export type UseLayerCloseProps = {
  contentRef: RefObject<HTMLElement | null>;
  mode: LayerMode;
  onClose: () => void;
};

function refreshRef<T>(ref: RefObject<T>, value: T): () => void {
  return function update(): void {
    ref.current = value;
  };
}

function subscribeEscape(onCloseRef: RefObject<() => void>): () => void {
  function handle(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      onCloseRef.current();
    }
  }
  document.addEventListener('keydown', handle);
  return function teardown(): void {
    document.removeEventListener('keydown', handle);
  };
}

function subscribeOutside(
  contentRefRef: RefObject<RefObject<HTMLElement | null>>,
  onCloseRef: RefObject<() => void>,
  modeRef: RefObject<LayerMode>,
): () => void {
  function handle(event: MouseEvent | TouchEvent): void {
    if (modeRef.current === 'composed') {
      return;
    }
    const target = event.target;
    if (!(target instanceof Node)) {
      return;
    }
    const ref = contentRefRef.current;
    if (ref && ref.current && ref.current.contains(target)) {
      return;
    }
    event.preventDefault();
    onCloseRef.current();
  }
  document.addEventListener('mousedown', handle);
  document.addEventListener('touchstart', handle);
  return function teardown(): void {
    document.removeEventListener('mousedown', handle);
    document.removeEventListener('touchstart', handle);
  };
}
