# Autenticação do Cliente

Este documento descreve a arquitetura de autenticação no cliente: como a sessão é representada, como o roteamento protegido funciona, como os fluxos do [fluxo de autenticação do jogo](../../game/AUTHENTICATION.md) são implementados e por que esta arquitetura existe nesta forma.

> A autenticação do **produto** (regras, telas, mensagens, comportamentos) está em [Autenticação](../../game/AUTHENTICATION.md). Este documento descreve apenas a **arquitetura técnica** do módulo no cliente.

## Índice

| Tópico | Descrição |
| --- | --- |
| [Princípios](#princípios) | As regras que governam todo o módulo de autenticação. |
| [Máquina de Estados](#máquina-de-estados) | Os estados possíveis da sessão e as transições entre eles. |
| [Single Source of Truth](#single-source-of-truth) | Por que `onAuthStateChange` é o único caminho para atualizar a sessão. |
| [AuthAdapter](#authadapter) | A camada fina entre a store e o Supabase Auth. |
| [Roteamento Protegido](#roteamento-protegido) | Como `createBrowserRouter` + `loader` substituem `<RequireAuth>`. |
| [Fluxos](#fluxos) | Como signin, signup, OAuth, recovery e signout são executados. |
| [Testes](#testes) | O que está coberto e como. |
| [Pendências](#pendências) | Limitações conhecidas. |

## Princípios

1. **Uma única fonte da verdade.** A sessão do usuário mora em uma store Zustand. Nenhum outro lugar do cliente lê `supabase.auth.getSession()` nem mantém uma cópia paralela da sessão.
2. **`onAuthStateChange` é o único caminho.** A store nunca chama `getSession()` para hidratar. O evento `INITIAL_SESSION` do listener cobre isso. Isso elimina a corrida entre `getSession()` e o primeiro `onAuthStateChange`, que era parte do loop original.
3. **Identidade, não referência.** A comparação de sessão é por `user.id` (e `access_token` quando relevante), nunca por referência de objeto `Session`. Supabase cria um objeto `Session` novo a cada evento, mesmo quando nada mudou.
4. **Roteamento por loader, não por componente de guard.** As rotas protegidas usam `loader` + `throw redirect()`. O componente da rota nunca é renderizado sem sessão válida. Isso evita o padrão que dispara o [bug conhecido do `react-router-dom@7.18.4`](https://github.com/remix-run/react-router/issues/15501) (freeze ao clicar múltiplos `<Link>` em sequência rápida com guard aninhado).
5. **Sem retry automático.** Erros de rede não geram retentativa. O usuário decide quando tentar de novo.
6. **Handlers estáveis.** As funções expostas pela store (`signIn`, `signOut`, etc.) têm identidade estável entre renders. Páginas que dependem delas não re-renderizam sem motivo.
7. **`StrictMode` ligado.** O módulo é escrito de forma compatível com a dupla renderização do `StrictMode` em desenvolvimento. Reativar `<StrictMode>` é parte desta arquitetura.

## Máquina de Estados

A sessão tem **quatro estados** finitos, com transições determinísticas.

Estados:

| Estado | Significado | `user` |
| --- | --- | --- |
| `INITIALIZING` | Antes do primeiro `INITIAL_SESSION` do listener. Mostra spinner. | `null` |
| `UNAUTHENTICATED` | Sem sessão. Páginas públicas são acessíveis. | `null` |
| `AUTHENTICATED` | Sessão válida. Rotas protegidas acessíveis. | `User` |
| `RECOVERING` | Sessão de recuperação de senha (`PASSWORD_RECOVERY`). Permite apenas `/reset-password`. | `User` |

Eventos que causam transição:

| Evento Supabase | Transição |
| --- | --- |
| `INITIAL_SESSION` sem `user` | `INITIALIZING` → `UNAUTHENTICATED` |
| `INITIAL_SESSION` com `user` | `INITIALIZING` → `AUTHENTICATED` |
| `SIGNED_IN` | `*` → `AUTHENTICATED` |
| `SIGNED_OUT` | `*` → `UNAUTHENTICATED` |
| `TOKEN_REFRESHED` | `AUTHENTICATED` → `AUTHENTICATED` (mesmo `user.id`) |
| `USER_UPDATED` | `AUTHENTICATED` → `AUTHENTICATED` (mesmo `user.id`) |
| `PASSWORD_RECOVERY` | `*` → `RECOVERING` |

Eventos que não mudam o estado não disparam re-render. Comparação por `user.id` evita o churn de identidade que a comparação por referência causava.

## Single Source of Truth

### Por que `getSession()` é proibido no caminho de hidratação

O `GoTrueClient` do `@supabase/supabase-js` emite `INITIAL_SESSION` automaticamente ao assinar `onAuthStateChange`, com a sessão já carregada do `localStorage`. Chamar `supabase.auth.getSession()` em paralelo:

1. Não traz informação nova — a sessão lida do storage é a mesma.
2. Abre uma janela de corrida entre dois caminhos de hidratação.
3. Em cenários como o callback OAuth, dispara `INITIAL_SESSION` (sessão nula, hash ainda sendo processado) seguido de `SIGNED_IN` (sessão presente). A store que ouve os dois fica em estado intermediário que, combinado com `<Navigate>` no render, produzia o loop.

A store se hidrata **somente** esperando o primeiro `INITIAL_SESSION` do listener.

### Por que identidade, não referência

A cada emissão do listener, Supabase constrói um novo objeto `Session`. Comparar por `===` nunca bate. Comparar por `user.id` (e, quando relevante, `access_token`) bate quando realmente não há mudança e ignora quando há.

A store calcula a próxima identidade antes de chamar `set`:

```
nextIdentity = newSession?.user.id ?? null
currentIdentity = getState().user?.id ?? null
if (nextIdentity === currentIdentity && event !== 'PASSWORD_RECOVERY') {
  // Não há mudança observável. Não chama set. Não notifica listeners.
}
```

## AuthAdapter

A store depende apenas de uma interface fina. O Supabase é uma implementação. Isso:

- Isola o resto do código de `@supabase/supabase-js`.
- Permite testar a store com mock adapter.
- Abre porta para troca futura de provedor sem refactor do código de UI.

### Interface

```
interface AuthAdapter {
  subscribe(handler: (event: AuthEvent, session: Session | null) => void): () => void
  signInWithPassword(input: { email: string; password: string }): Promise<AuthAdapterResult>
  signUp(input: { email: string; password: string }): Promise<AuthAdapterResult>
  signInWithOAuth(input: { provider: 'google'; redirectTo: string }): Promise<AuthAdapterResult>
  signOut(): Promise<void>
  resetPasswordForEmail(input: { email: string; redirectTo: string }): Promise<AuthAdapterResult>
  updateUser(input: { password: string }): Promise<AuthAdapterResult>
}
```

`AuthAdapterResult` é `{ ok: true; redirectUrl?: string } | { ok: false; code: AuthErrorCode }`. Os códigos de erro são definidos pela store, não pelo Supabase — a tradução acontece dentro do `SupabaseAuthAdapter`.

### Implementação

`SupabaseAuthAdapter` é o único arquivo que importa `@supabase/supabase-js`. Ele:

- Constrói o `SupabaseClient` na primeira chamada.
- Assina `onAuthStateChange` e traduz os eventos (`INITIAL_SESSION`, `SIGNED_IN`, etc.) para a forma da store.
- Encapsula `signInWithPassword`, `signUp`, etc. e traduz `AuthError` para `AuthErrorCode` usando o mapper de erros.

O `supabase` global que existia em `apps/client/src/supabase/client.ts` continua sendo a fábrica do cliente, mas é importado apenas por `SupabaseAuthAdapter`.

## Roteamento Protegido

A proteção das rotas sai do componente `<RequireAuth>` e vai para o `loader` de cada rota protegida.

### `createBrowserRouter` substitui `<Routes>`

```
const router = createBrowserRouter([
  { path: '/signin', Component: SignInPage },
  { path: '/signup', Component: SignUpPage },
  { path: '/forgot-password', Component: ForgotPasswordPage },
  { path: '/terms', Component: TermsPage },
  { path: '/privacy', Component: PrivacyPage },
  { path: '/reset-password', Component: ResetPasswordPage, loader: resetPasswordLoader },
  {
    Component: ProtectedShell,
    loader: requireAuthLoader,
    children: [
      { path: '/trainers', Component: TrainersPage },
      { path: '/trainers/new', Component: NewTrainerPage },
      { path: '/game', Component: PlayScreenPage },
    ],
  },
  { path: '*', loader: () => redirect('/signin') },
]);
```

### `requireAuthLoader`

Lê o estado atual da store. Se for `AUTHENTICATED`, retorna `null`. Caso contrário, lança `redirect('/signin')` com `replace`.

A leitura é **síncrona** (Zustand expõe `getState()`), sem chamada de rede. O loader não chama `getSession()` do Supabase.

### `resetPasswordLoader`

Lê o estado da store. Aceita `RECOVERING` ou `AUTHENTICATED` (caso o usuário já tenha sessão e queira redefinir). Para outros estados, lança `redirect('/signin')`.

### Por que isso resolve o loop original

O loop original tinha três ingredientes:

1. `<RequireAuth>` retornando `<Navigate>` durante o render.
2. `AuthProvider` realocando `value` a cada render (memo de função).
3. Bug do `react-router-dom@7.18.4` com `<Navigate>` + `<Link>` em padrão aninhado.

A nova arquitetura:

1. Substitui `<Navigate>` por `loader` + `throw redirect()` — sem `<Navigate>` no DOM.
2. Zustand expõe estado estável; mudanças não causam re-render de quem não consome o que mudou.
3. Não há guard aninhado; as rotas protegidas são filhas diretas de `ProtectedShell`, e `ProtectedShell` é apenas um wrapper de layout, sem lógica de redirect.

## Fluxos

### Signin (`POST /signin`)

```
1. Usuário submete formulário.
2. Página chama auth.signIn({ email, password }).
3. Store chama adapter.signInWithPassword.
4. Adapter traduz AuthError → AuthErrorCode em falha.
5. Store NÃO muda de estado em falha (status permanece o atual).
6. Em sucesso, adapter retorna ok. onAuthStateChange do Supabase dispara SIGNED_IN.
7. Store move para AUTHENTICATED.
8. Página recebe ok, navega para /trainers.
```

Em falha, a sessão não é alterada. A navegação não acontece. O erro é apresentado no formulário.

### Signup

```
1. Usuário submete formulário.
2. Página chama auth.signUp({ email, password }).
3. Store valida senha (8–64 chars) antes de chamar adapter.
4. Adapter chama supabase.auth.signUp.
5. Se e-mail já existe → adapter retorna { ok: false, code: 'email_already_exists' }.
6. Se sucesso → adapter retorna ok, sessão é criada, onAuthStateChange dispara SIGNED_IN.
7. Store move para AUTHENTICATED.
8. Página navega para /trainers.
```

### OAuth Google

```
1. Usuário clica em "Entrar com Google".
2. Página chama auth.signInWithGoogle().
3. Adapter chama supabase.auth.signInWithOAuth.
4. Adapter retorna { ok: true, redirectUrl: 'https://accounts.google.com/...' }.
5. Página faz globalThis.location.href = redirectUrl.
6. Após login no Google, Supabase redireciona para OAUTH_REDIRECT (/trainers).
7. O cliente carrega /trainers.
8. requireAuthLoader roda. Se status === INITIALIZING, espera o primeiro INITIAL_SESSION.
9. INITIAL_SESSION chega com user. Status → AUTHENTICATED.
10. Loader passa. /trainers renderiza.
```

A store não tem ação para `redirect()`. A página que pediu o OAuth navega por `globalThis.location.href` (full page reload, intencional).

### Recuperação de senha (request)

```
1. Usuário submete e-mail em /forgot-password.
2. Página chama auth.requestPasswordReset(email).
3. Adapter chama supabase.auth.resetPasswordForEmail com redirectTo=/reset-password.
4. Independente de o e-mail existir, adapter retorna ok (não revela).
5. Página exibe alerta "Se o e-mail existir em nossa base de dados, enviamos um link de recuperação."
```

### Recuperação de senha (clicar no link)

```
1. Usuário clica no link do e-mail.
2. Supabase processa o hash e cria uma sessão de recovery.
3. Redireciona para /reset-password.
4. resetPasswordLoader roda. Se status === INITIALIZING, espera INITIAL_SESSION.
5. onAuthStateChange dispara PASSWORD_RECOVERY → store move para RECOVERING.
6. Loader passa. /reset-password renderiza o formulário.
```

O detalhe que importa é o status `RECOVERING` ser distinto de `AUTHENTICATED`. O `resetPasswordLoader` aceita ambos, mas só `RECOVERING` é o caminho esperado via link.

### Reset (submeter nova senha)

```
1. Usuário submete nova senha em /reset-password.
2. Página chama auth.updatePassword(newPassword).
3. Adapter chama supabase.auth.updateUser({ password }).
4. Adapter retorna ok.
5. Página chama auth.signOut().
6. onAuthStateChange dispara SIGNED_OUT → store move para UNAUTHENTICATED.
7. Página exibe alerta "Senha redefinida com sucesso. Faça login para continuar."
8. Página navega para /signin.
```

### Signout

```
1. Usuário clica em "Sair da conta" em /trainers.
2. Página chama auth.signOut().
3. Adapter chama supabase.auth.signOut.
4. onAuthStateChange dispara SIGNED_OUT → store move para UNAUTHENTICATED.
5. Página navega para /signin.
```

## Testes

Cobertos pela suíte `authStore.spec.ts`:

- Inicialização sem sessão persistida. Após subscribe, status = UNAUTHENTICATED.
- Sessão persistida. Adapter emite INITIAL_SESSION com user. Status = AUTHENTICATED.
- Signin sucesso. Adapter retorna ok, SIGNED_IN chega, status = AUTHENTICATED.
- Signin falha. Adapter retorna erro, status não muda.
- Signout. SIGNED_OUT chega, status = UNAUTHENTICATED.
- TOKEN_REFRESHED. Mesmo user.id. Status = AUTHENTICATED. Store não chama set desnecessariamente.
- PASSWORD_RECOVERY. Status = RECOVERING.
- Signin network error. Código = 'network'. Status não muda.
- Throttle de renders. 5 signIn em sequência causam no máximo 1 re-render do consumidor (verificado com seletor de identidade).
- Cleanup do listener. unsubscribe remove o listener do adapter.

Mock adapter implementa a interface `AuthAdapter` e mantém fila de eventos controlada pelos testes.

## Pendências

- **`react-router-dom@7.18.4` e o bug #15501.** Não há fix na linha v7. A arquitetura atual mitiga o padrão que dispara o bug (sem `<Navigate>` em guard, sem `<RequireAuth>` envolvendo layout). Se um padrão diferente reproduzir o freeze, a saída é migrar para v8 — mas isso é decisão de produto, não de auth.
- **Migração de `BrowserRouter` + `Routes` para `createBrowserRouter` + `RouterProvider`.** É parte do escopo desta arquitetura. Após a migração, `<BrowserRouter>` sai do `App.tsx`.
- **Reativar `<StrictMode>`.** Após o refactor, `main.tsx` religa `<StrictMode>`. O comentário que justificava manter desligado deixa de existir.
- **Renomeação de `apps/client/src/supabase/`.** O diretório continua existindo, mas a única exportação passa a ser o factory do cliente, consumido apenas por `SupabaseAuthAdapter`.