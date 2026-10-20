import type { RouteObject } from 'react-router-dom';
import { createBrowserRouter } from 'react-router-dom';

import { DesignSystemPage } from '~/pages/design/DesignSystemPage';
import { ForgotPasswordPage } from '~/pages/ForgotPasswordPage';
import { NewTrainerPage } from '~/pages/NewTrainerPage';
import { PlayScreenPage } from '~/pages/play/PlayScreenPage';
import { PrivacyPage } from '~/pages/PrivacyPage';
import { ResetPasswordPage } from '~/pages/ResetPasswordPage';
import { SignInPage } from '~/pages/SignInPage';
import { SignUpPage } from '~/pages/SignUpPage';
import { TermsPage } from '~/pages/TermsPage';
import { TrainersPage } from '~/pages/TrainersPage';
import {
  notFoundLoader,
  redirectIfAuthenticatedLoader,
  redirectIfAuthenticatedOrRecoveringLoader,
  requireAuthLoader,
  resetPasswordLoader,
} from '~/router/loaders';
import { ProtectedShell } from '~/router/ProtectedShell';

const ROUTES: RouteObject[] = [
  { Component: SignInPage, loader: redirectIfAuthenticatedOrRecoveringLoader, path: '/signin' },
  { Component: SignUpPage, loader: redirectIfAuthenticatedOrRecoveringLoader, path: '/signup' },
  {
    Component: ForgotPasswordPage,
    loader: redirectIfAuthenticatedLoader,
    path: '/forgot-password',
  },
  { Component: ResetPasswordPage, loader: resetPasswordLoader, path: '/reset-password' },
  { Component: TermsPage, path: '/terms' },
  { Component: PrivacyPage, path: '/privacy' },
  { Component: DesignSystemPage, path: '/design-system' },
  {
    Component: ProtectedShell,
    children: [
      { Component: TrainersPage, path: '/trainers' },
      { Component: NewTrainerPage, path: '/trainers/new' },
      { Component: PlayScreenPage, path: '/game' },
    ],
    loader: requireAuthLoader,
  },
  { loader: notFoundLoader, path: '*' },
];

export const router = createBrowserRouter(ROUTES);
