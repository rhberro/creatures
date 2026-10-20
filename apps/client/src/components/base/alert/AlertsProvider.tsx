import {
  useEffect,
  useState,
  type Dispatch,
  type ReactElement,
  type ReactNode,
  type SetStateAction,
} from 'react';

import { NO_REMAINING, TICK_MS } from './alert.constants';
import { AlertsContext } from './alert.context';
import type { AlertInput, AlertItem, AlertStackValue } from './alert.types';

const TICK_DEPS: ReadonlyArray<unknown> = [];

export function AlertsProvider(props: AlertsProviderProps): ReactElement {
  const { children } = props;
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  useEffect(startTicking(setAlerts), TICK_DEPS);

  const show = buildShow(setAlerts);
  const dismiss = buildDismiss(setAlerts);
  const value: AlertStackValue = { alerts, dismiss, show };

  return <AlertsContext.Provider value={value}>{children}</AlertsContext.Provider>;
}

export type AlertsProviderProps = {
  children: ReactNode;
};

function startTicking(setAlerts: Dispatch<SetStateAction<AlertItem[]>>): () => void {
  return function start(): () => void {
    const intervalId = setInterval(tickAlerts(setAlerts), TICK_MS);
    return function teardown(): void {
      clearInterval(intervalId);
    };
  };
}

function tickAlerts(setAlerts: Dispatch<SetStateAction<AlertItem[]>>): () => void {
  return function tick(): void {
    setAlerts(expireAlerts);
  };
}

function expireAlerts(previous: AlertItem[]): AlertItem[] {
  const next: AlertItem[] = [];
  for (const alert of previous) {
    if (alert.isLeaving === true) {
      next.push(alert);
      continue;
    }
    const remaining = alert.remaining - TICK_MS;
    if (remaining > NO_REMAINING) {
      next.push({ ...alert, remaining });
      continue;
    }
    next.push({ ...alert, isLeaving: true, remaining: 0 });
  }
  return next;
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
    setAlerts(appendItem(item));
    return id;
  };
}

function buildDismiss(setAlerts: Dispatch<SetStateAction<AlertItem[]>>): (id: string) => void {
  return function dismiss(id: string): void {
    setAlerts(removeItem(id));
  };
}

function appendItem(item: AlertItem): (previous: AlertItem[]) => AlertItem[] {
  return function append(previous: AlertItem[]): AlertItem[] {
    return [...previous, item];
  };
}

function removeItem(id: string): (previous: AlertItem[]) => AlertItem[] {
  return function remove(previous: AlertItem[]): AlertItem[] {
    return previous.filter(keepOtherThan(id));
  };
}

function keepOtherThan(id: string): (alert: AlertItem) => boolean {
  return function keep(alert: AlertItem): boolean {
    return alert.id !== id;
  };
}

function generateId(): string {
  return `alert-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
