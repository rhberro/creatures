import {
  cloneElement,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type MutableRefObject,
  type ReactElement,
  type ReactNode,
  type RefObject,
  type SetStateAction,
} from 'react';

import { POPUP_CONTENT_STYLE } from './popup.constants';
import type { PopupProps } from './popup.types';

const EMPTY_DEPS: ReadonlyArray<unknown> = [];

export function Popup(props: PopupProps): ReactElement {
  const { children, content } = props;
  const [isPinned, setIsPinned] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [hasHover, setHasHover] = useState<boolean>(false);
  const triggerRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const isPinnedRef = useRef<boolean>(false);
  const isHoveredRef = useRef<boolean>(false);
  const hasHoverRef = useRef<boolean>(false);
  const subscribeRef = useRef<(() => void) | null>(null);

  useEffect(detectHoverCapability(setHasHover, hasHoverRef), EMPTY_DEPS);
  useEffect(refreshRef(isPinnedRef, isPinned));
  useEffect(refreshRef(isHoveredRef, isHovered));
  if (subscribeRef.current === null) {
    subscribeRef.current = buildSubscribe(triggerRef, contentRef, isPinnedRef, setIsPinned);
  }

  useEffect(subscribeRef.current, EMPTY_DEPS);

  const isVisible = computeVisible(hasHover, isPinned, isHovered);

  const TRIGGER_PROPS = {
    onClick: buildSetPinnedTrue(setIsPinned),
    onMouseEnter: buildSetHoveredTrue(setIsHovered),
    onMouseLeave: buildSetHoveredFalse(setIsHovered),
    ref: triggerRef,
  };

  const triggerNode = cloneElement(children, TRIGGER_PROPS);
  const contentNode = renderContent(content, isVisible, contentRef);

  return (
    <>
      {triggerNode}
      {contentNode}
    </>
  );
}

function refreshRef<T>(ref: MutableRefObject<T>, value: T): () => void {
  return function update(): void {
    ref.current = value;
  };
}

function detectHoverCapability(
  setHasHover: Dispatch<SetStateAction<boolean>>,
  hasHoverRef: MutableRefObject<boolean>,
): () => void {
  return function detect(): void {
    if (typeof window === 'undefined') {
      return;
    }
    const matches = window.matchMedia('(hover: hover)').matches;
    hasHoverRef.current = matches;
    setHasHover(matches);
  };
}

function computeVisible(hasHover: boolean, isPinned: boolean, isHovered: boolean): boolean {
  if (hasHover) {
    return isHovered || isPinned;
  }
  return isPinned;
}

function buildSetPinnedTrue(setPinned: Dispatch<SetStateAction<boolean>>): () => void {
  return function onClick(): void {
    setPinned(true);
  };
}

function buildSetHoveredTrue(setHovered: Dispatch<SetStateAction<boolean>>): () => void {
  return function onMouseEnter(): void {
    setHovered(true);
  };
}

function buildSetHoveredFalse(setHovered: Dispatch<SetStateAction<boolean>>): () => void {
  return function onMouseLeave(): void {
    setHovered(false);
  };
}

type OutsideState = {
  content: HTMLDivElement | null;
  isPinned: boolean;
  setPinned: Dispatch<SetStateAction<boolean>>;
  trigger: HTMLElement | null;
};

type StateReader = () => OutsideState;

// O mesmo cuidado do overlay: a inscrição precisa acontecer dentro do efeito.
// Feito no render, cada re-render deixa um listener a mais no document, e só o
// primeiro teardown remove um deles — os órfãos continuam fechando o popup.
function buildSubscribe(
  triggerRef: RefObject<HTMLElement | null>,
  contentRef: RefObject<HTMLDivElement | null>,
  isPinnedRef: RefObject<boolean>,
  setPinned: Dispatch<SetStateAction<boolean>>,
): () => void {
  return function subscribe(): () => void {
    const readState = buildStateReader(triggerRef, contentRef, isPinnedRef, setPinned);

    function onPointer(event: MouseEvent | TouchEvent): void {
      handleOutside(readState(), event);
    }

    document.addEventListener('mousedown', onPointer);
    document.addEventListener('touchstart', onPointer);
    return function teardown(): void {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('touchstart', onPointer);
    };
  };
}

function buildStateReader(
  triggerRef: RefObject<HTMLElement | null>,
  contentRef: RefObject<HTMLDivElement | null>,
  isPinnedRef: RefObject<boolean>,
  setPinned: Dispatch<SetStateAction<boolean>>,
): StateReader {
  return function readState(): OutsideState {
    return {
      content: contentRef.current,
      isPinned: isPinnedRef.current,
      setPinned,
      trigger: triggerRef.current,
    };
  };
}

function handleOutside(state: OutsideState, event: MouseEvent | TouchEvent): void {
  if (!state.isPinned) {
    return;
  }
  const target = event.target;
  if (!(target instanceof Node)) {
    return;
  }
  if (state.trigger && state.trigger.contains(target)) {
    return;
  }
  if (state.content && state.content.contains(target)) {
    return;
  }
  state.setPinned(false);
}

function renderContent(
  content: ReactNode,
  visible: boolean,
  ref: RefObject<HTMLDivElement | null>,
): ReactNode {
  if (!visible) {
    return null;
  }
  return (
    <div ref={ref} style={POPUP_CONTENT_STYLE}>
      {content}
    </div>
  );
}
