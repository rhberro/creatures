import { Toaster } from '@chakra-ui/react';
import type { ReactElement, ReactNode } from 'react';

import { AlertToast } from '~/components/base/alert/AlertToast';
import { alertToaster } from '~/components/base/alert/alertToaster';

type ToastPayload = {
  duration?: number;
  id?: string;
  meta?: { icon?: ReactNode; tone?: string };
  title?: ReactNode;
};

/**
 * A regiao onde os avisos aparecem.
 *
 * E o `Toaster` do Chakra: `role="region"` com `aria-live="polite"`, para o
 * leitor de tela anunciar o aviso quando ele entra.
 */
export function AlertsViewport(): ReactElement {
  const inset = buildInset();
  return (
    <Toaster insetInline={inset} toaster={alertToaster}>
      {renderToast}
    </Toaster>
  );
}

function buildInset(): { mdDown: string } {
  return { mdDown: '4' };
}

function renderToast(toast: ToastPayload): ReactElement {
  return <AlertToast toast={toast} />;
}
