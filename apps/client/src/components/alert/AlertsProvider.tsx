import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type MutableRefObject,
  type ReactElement,
  type ReactNode,
  type SetStateAction,
} from 'react';

import {
  AlertsContext,
  type AlertInput,
  type AlertItem,
  type AlertStack,
} from '~/components/alert/AlertStack';

const TICK_MS = 100;
const TICK_DEPS: ReadonlyArray<unknown> = [];
const NO_REMAINING = 0;

export function AlertsProvider(props: AlertsProviderProps): ReactElement {
  const { children } = props;
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const intervalsRef = useRef<IntervalMap>(new Map());

  useEffect(setupTick(setAlerts, intervalsRef), TICK_DEPS);

  const show = buildShow(setAlerts);
  const dismiss = buildDismiss(intervalsRef, setAlerts);
  const value: AlertStack = { alerts, dismiss, show };

  return <AlertsContext.Provider value={value}>{children}</AlertsContext.Provider>;
}

export type AlertsProviderProps = {
  children: ReactNode;
};

type IntervalMap = Map<string, ReturnType<typeof setInterval>>;

function appendItem(item: AlertItem): (prev: AlertItem[]) => AlertItem[] {
  return function append(prev: AlertItem[]): AlertItem[] {
    return [...prev, item];
  };
}

function removeItem(id: string): (prev: AlertItem[]) => AlertItem[] {
  return function remove(prev: AlertItem[]): AlertItem[] {
    return filterOutById(prev, id);
  };
}

function filterOutById(items: AlertItem[], id: string): AlertItem[] {
  const next: AlertItem[] = [];
  for (const item of items) {
    if (item.id !== id) {
      next.push(item);
    }
  }
  return next;
}

function tickAlerts(
  intervalsRef: MutableRefObject<IntervalMap>,
): (prev: AlertItem[]) => AlertItem[] {
  return function tick(prev: AlertItem[]): AlertItem[] {
    const intervals = intervalsRef.current;
    const next: AlertItem[] = [];
    for (const alert of prev) {
      const remaining = alert.remaining - TICK_MS;
      if (remaining <= NO_REMAINING) {
        const intervalId = intervals.get(alert.id);
        if (intervalId !== null) {
          clearInterval(intervalId);
          intervals.delete(alert.id);
        }
      } else {
        next.push(buildAlertWithRemaining(alert, remaining));
      }
    }
    return next;
  };
}

function buildAlertWithRemaining(alert: AlertItem, remaining: number): AlertItem {
  return {
    content: alert.content,
    duration: alert.duration,
    icon: alert.icon,
    id: alert.id,
    remaining,
  };
}

function buildShow(
  setAlerts: Dispatch<SetStateAction<AlertItem[]>>,
): (input: AlertInput) => string {
  return function show(input: AlertInput): string {
    const id = generateId();
    const item: AlertItem = {
      content: input.content,
      duration: input.duration,
      icon: input.icon,
      id,
      remaining: input.duration,
    };
    applyAppend(setAlerts, item);
    return id;
  };
}

function buildDismiss(
  intervalsRef: MutableRefObject<IntervalMap>,
  setAlerts: Dispatch<SetStateAction<AlertItem[]>>,
): (id: string) => void {
  return function dismiss(id: string): void {
    const intervals = intervalsRef.current;
    const intervalId = intervals.get(id);
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervals.delete(id);
    }
    applyRemove(setAlerts, id);
  };
}

function applyAppend(setAlerts: Dispatch<SetStateAction<AlertItem[]>>, item: AlertItem): void {
  setAlerts(appendItem(item));
}

function applyRemove(setAlerts: Dispatch<SetStateAction<AlertItem[]>>, id: string): void {
  setAlerts(removeItem(id));
}

function setupTick(
  setAlerts: Dispatch<SetStateAction<AlertItem[]>>,
  intervalsRef: MutableRefObject<IntervalMap>,
): () => void {
  function tick(): void {
    const updater = tickAlerts(intervalsRef);
    setAlerts(updater);
  }
  const intervalId = setInterval(tick, TICK_MS);
  return function teardown(): void {
    clearInterval(intervalId);
    const intervals = intervalsRef.current;
    for (const id of intervals.keys()) {
      const existing = intervals.get(id);
      if (existing !== null) {
        clearInterval(existing);
      }
    }
    intervals.clear();
  };
}

function generateId(): string {
  return `alert-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
