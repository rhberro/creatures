import { useEffect, useRef, type RefObject } from 'react';

import type { OverlayDismissProps } from './overlay.types';

const ESCAPE_DEPS: ReadonlyArray<unknown> = [];
const OUTSIDE_DEPS: ReadonlyArray<unknown> = [];

export function useOverlay(props: OverlayDismissProps): void {
  const { contentRef, dismissOnOutside, interactive, onClose } = props;
  const onCloseRef = useRef<() => void>(onClose);
  const dismissRef = useRef<boolean>(dismissOnOutside);
  const interactiveRef = useRef<boolean>(interactive);
  const contentRefRef = useRef<RefObject<HTMLElement | null>>(contentRef);

  useEffect(refreshRef(onCloseRef, onClose));
  useEffect(refreshRef(dismissRef, dismissOnOutside));
  useEffect(refreshRef(interactiveRef, interactive));
  useEffect(refreshRef(contentRefRef, contentRef));

  useEffect(subscribeEscape(onCloseRef, interactiveRef), ESCAPE_DEPS);
  useEffect(subscribeOutside(contentRefRef, onCloseRef, dismissRef, interactiveRef), OUTSIDE_DEPS);
}

function refreshRef<T>(ref: RefObject<T>, value: T): () => void {
  return function update(): void {
    ref.current = value;
  };
}

function subscribeEscape(
  onCloseRef: RefObject<() => void>,
  interactiveRef: RefObject<boolean>,
): () => void {
  function handle(event: KeyboardEvent): void {
    if (!interactiveRef.current) {
      return;
    }
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
  dismissRef: RefObject<boolean>,
  interactiveRef: RefObject<boolean>,
): () => void {
  function handle(event: MouseEvent | TouchEvent): void {
    if (!interactiveRef.current || !dismissRef.current) {
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
