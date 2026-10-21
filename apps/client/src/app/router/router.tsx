import type { ComponentType } from 'react';
import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { createBrowserRouter } from 'react-router-dom';

import { DesignSystemPage } from '~/pages/design-system';

import {
  notFoundLoader,
  postAuthLoader,
  redirectIfAuthenticatedLoader,
  redirectIfAuthenticatedOrRecoveringLoader,
  requireAuthLoader,
  resetPasswordLoader,
} from './loaders';
import { ProtectedShell } from './ProtectedShell';

type PageComponent = ComponentType;
type PageModule = Record<string, unknown>;

const ROUTES: RouteObject[] = [
  {
    Component: lazyPage(loadSignInPage, 'SignInPage'),
    loader: redirectIfAuthenticatedOrRecoveringLoader,
    path: '/signin',
  },
  {
    Component: lazyPage(loadSignUpPage, 'SignUpPage'),
    loader: redirectIfAuthenticatedOrRecoveringLoader,
    path: '/signup',
  },
  {
    Component: lazyPage(loadForgotPasswordPage, 'ForgotPasswordPage'),
    loader: redirectIfAuthenticatedLoader,
    path: '/forgot-password',
  },
  {
    Component: lazyPage(loadResetPasswordPage, 'ResetPasswordPage'),
    loader: resetPasswordLoader,
    path: '/reset-password',
  },
  { Component: lazyPage(loadTermsPage, 'TermsPage'), path: '/terms' },
  { Component: lazyPage(loadPrivacyPage, 'PrivacyPage'), path: '/privacy' },
  // Onde o jogador cai depois de uma autenticação que veio de fora: o OAuth e
  // o link de confirmação de e-mail. A rota só decide o destino, então nunca
  // desenha: o loader sempre redireciona.
  { Component: null, loader: postAuthLoader, path: '/post-auth' },
  // A galeria fica no bundle inicial: ela e a tela com todos os componentes do
  // Chakra ao mesmo tempo, e montar tudo isso em um commit separado faz o
  // React avisar que o `flushSync` do Ark UI caiu dentro de um ciclo de vida.
  { Component: DesignSystemPage, path: '/design-system' },
  {
    Component: ProtectedShell,
    children: [
      { Component: lazyPage(loadTrainersPage, 'TrainersPage'), path: '/trainers' },
      { Component: lazyPage(loadNewTrainerPage, 'NewTrainerPage'), path: '/trainers/new' },
      { Component: lazyPage(loadPlayScreenPage, 'PlayScreenPage'), path: '/game' },
    ],
    loader: requireAuthLoader,
  },
  // A rota que nao existe nunca desenha: o loader redireciona antes.
  { Component: null, loader: notFoundLoader, path: '*' },
];

export const router = createBrowserRouter(ROUTES);

/**
 * A pagina que so e baixada quando a rota e pedida.
 *
 * Quem abre o jogo nao paga pela tela de criacao de treinador, nem pela
 * tela do jogo, antes de chegar nelas.
 *
 * O `lazy` e o do React, e nao o do roteador: o roteador so descobre a pagina
 * depois que ela entra, e essa espera acontece no meio do commit. Com o
 * `lazy` do React, quem espera e a propria tela, e a tela de carregamento
 * cobre a espera.
 */
function lazyPage<TModule extends PageModule>(
  load: () => Promise<TModule>,
  name: keyof TModule & string,
): PageComponent {
  return lazy(function loadLazyPage(): Promise<{ default: PageComponent }> {
    return load().then(function pickComponent(module: TModule): { default: PageComponent } {
      return { default: module[name] as PageComponent };
    });
  });
}

function loadSignInPage(): Promise<PageModule> {
  return import('~/pages/sign-in');
}

function loadSignUpPage(): Promise<PageModule> {
  return import('~/pages/sign-up');
}

function loadForgotPasswordPage(): Promise<PageModule> {
  return import('~/pages/forgot-password');
}

function loadResetPasswordPage(): Promise<PageModule> {
  return import('~/pages/reset-password');
}

function loadTermsPage(): Promise<PageModule> {
  return import('~/pages/terms');
}

function loadPrivacyPage(): Promise<PageModule> {
  return import('~/pages/privacy');
}

function loadTrainersPage(): Promise<PageModule> {
  return import('~/pages/trainers');
}

function loadNewTrainerPage(): Promise<PageModule> {
  return import('~/pages/new-trainer');
}

function loadPlayScreenPage(): Promise<PageModule> {
  return import('~/pages/play');
}
