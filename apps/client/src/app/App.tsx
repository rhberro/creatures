import type { ReactElement } from 'react';
import { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';

import { router } from '~/app/router';
import { LoadingScreen } from '~/shared/ui/loading';

export function App(): ReactElement {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}
