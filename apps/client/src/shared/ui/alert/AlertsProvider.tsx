import type { ReactElement, ReactNode } from 'react';

import { AlertsContext } from './alert.context';
import type { AlertInput, AlertStackValue } from './alert.types';
import { alertToaster } from './alertToaster';

export type AlertsProviderProps = {
  children: ReactNode;
};

/**
 * O portal dos avisos.
 *
 * A fila mora no `Toaster` do Chakra; o provider so expoe a API de mostrar e
 * dispensar aviso, para o resto do app nao saber da existencia da fila.
 */
export function AlertsProvider(props: AlertsProviderProps): ReactElement {
  const { children } = props;
  return <AlertsContext.Provider value={ALERTS}>{children}</AlertsContext.Provider>;
}

const ALERTS: AlertStackValue = {
  dismiss: dismissAlert,
  show: showAlert,
};

function showAlert(input: AlertInput): string {
  return alertToaster.create({
    duration: input.duration,
    id: generateId(),
    meta: { icon: input.icon, tone: input.tone },
    title: input.content,
  });
}

function dismissAlert(id: string): void {
  alertToaster.dismiss(id);
}

function generateId(): string {
  return `alert-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
