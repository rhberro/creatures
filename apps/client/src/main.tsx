import { ChakraProvider } from '@chakra-ui/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from '~/App';
import { getAuthStore } from '~/auth/store/authClient';
import { AlertsProvider } from '~/components/base/alert/AlertsProvider';
import { AlertsViewport } from '~/components/base/alert/AlertsViewport';
import { InterfaceScale } from '~/scale/InterfaceScale';
import { system } from '~/theme/system';

const rootEl = document.querySelector('#root');

if (!rootEl) {
  throw new Error('Root element #root not found');
}

getAuthStore();

createRoot(rootEl).render(
  <StrictMode>
    <ChakraProvider value={system}>
      <InterfaceScale />
      <AlertsProvider>
        <AlertsViewport />
        <App />
      </AlertsProvider>
    </ChakraProvider>
  </StrictMode>,
);
