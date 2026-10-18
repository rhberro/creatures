import {
  cloneElement,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type Dispatch,
  type MutableRefObject,
  type ReactElement,
  type ReactNode,
  type RefObject,
  type SetStateAction,
} from 'react';

type PopupProps = {
  children: ReactElement;
  content: ReactNode;
};

const EMPTY_DEPS: ReadonlyArray<unknown> = [];
const POPUP_CONTENT_STYLE: CSSProperties = {
  position: 'absolute',
  zIndex: 1000,
};

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

  useEffect(detectHoverCapability(setHasHover, hasHoverRef), EMPTY_DEPS);
  useEffect(refreshRef(isPinnedRef, isPinned));
  useEffect(refreshRef(isHoveredRef, isHovered));
  useEffect(subscribeOutside(triggerRef, contentRef, isPinnedRef, setIsPinned), EMPTY_DEPS);

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

function subscribeOutside(
  triggerRef: RefObject<HTMLElement | null>,
  contentRef: RefObject<HTMLDivElement | null>,
  isPinnedRef: RefObject<boolean>,
  setPinned: Dispatch<SetStateAction<boolean>>,
): () => void {
  function handle(event: MouseEvent | TouchEvent): void {
    if (!isPinnedRef.current) {
      return;
    }
    const target = event.target;
    if (!(target instanceof Node)) {
      return;
    }
    if (triggerRef.current && triggerRef.current.contains(target)) {
      return;
    }
    if (contentRef.current && contentRef.current.contains(target)) {
      return;
    }
    setPinned(false);
  }
  document.addEventListener('mousedown', handle);
  document.addEventListener('touchstart', handle);
  return function teardown(): void {
    document.removeEventListener('mousedown', handle);
    document.removeEventListener('touchstart', handle);
  };
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
