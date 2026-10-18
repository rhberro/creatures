# API de Treinadores

Este documento descreve a API HTTP que o servidor expõe para criar, listar, editar e deletar treinadores, e a rota de merge da conta Google. Cobre a forma do roteador HTTP, o middleware de autenticação, os contratos de request/response e os testes.

> O que o jogo decide sobre treinadores (regras, validações, fluxo) está em [Autenticação do Jogo](../../game/AUTHENTICATION.md#tela-de-criar-treinador) e em [Game Design](../../game/GAME.md). Este documento descreve apenas a **arquitetura técnica** da API.

## Índice

| Tópico | Descrição |
| --- | --- |
| [Princípios](#princípios) | As regras que governam a API. |
| [Roteador HTTP](#roteador-http) | A camada fina entre o `Bun.serve` e os handlers. |
| [Middleware de Autenticação](#middleware-de-autenticação) | Como o token do Supabase é validado em cada request. |
| [Rotas](#rotas) | Os contratos de cada endpoint. |
| [Regras de Negócio](#regras-de-negócio) | O que o servidor valida e por quê. |
| [Erros](#erros) | Formato padrão das respostas de falha. |
| [Sessão do Treinador](#sessão-do-treinador) | Como o servidor sabe qual trainer o cliente tem aberto. |
| [Testes](#testes) | O que está coberto e como. |
| [Pendências](#pendências) | Limitações conhecidas. |

## Princípios

1. **O servidor é a única fonte de verdade.** Validação de nome único, limite de 5 trainers, merge de conta e deleção em cascata são decisões do servidor. O cliente só valida formato para feedback rápido.
2. **HTTP antes do WebSocket.** Trainer é setup de conta, não estado de jogo. CRUD de trainer usa request/response. O WebSocket fica focado em jogo rodando.
3. **Mesmo processo que o WebSocket.** O servidor HTTP e o WebSocket rodam no mesmo `Bun.serve`. Isso preserva a regra de "uma conta, uma conexão ativa" e a validação única de token na abertura do canal.
4. **Sem framework.** O roteador é escrito pelo projeto, em ~80 linhas. Cobre o que o Creatures precisa hoje e aceita middleware e validação como extensões. Adicionar Hono agora seria bazuca para 4 rotas.
5. **Token Supabase no header.** O cliente envia o access token do Supabase no header `Authorization: Bearer`. O servidor valida com `getUser()` (com rede) na **abertura de sessão** e com `getClaims()` (local) nas chamadas seguintes.
6. **Respostas JSON.** Toda resposta é `application/json`. Erros seguem o formato descrito em [Erros](#erros).
7. **Tipos compartilhados, schemas locais.** O pacote `apps/shared/contracts/` exporta **tipos puros de TypeScript** (sem Zod, sem runtime) — tipos de input/output, enums, códigos de erro. Cada lado (cliente, servidor) escreve seus próprios schemas Zod usando `satisfies z.ZodType<T>` contra o tipo compartilhado. Cliente valida formulários para feedback rápido; servidor valida no boundary da API. Ver [Contratos Compartilhados](#contratos-compartilhados).

## Roteador HTTP

Um arquivo, `apps/server/src/router.ts`, exporta:

```
type RouteHandler = (
  req: Request,
  params: Record<string, string>,
  ctx: RequestContext,
) => Promise<Response>;

type Route = {
  method: string;
  pattern: RegExp;
  paramNames: string[];
  handler: RouteHandler;
};

type Middleware = (
  req: Request,
  ctx: RequestContext,
) => Promise<Response | null>;
```

### API

```
function defineRoute(method: string, path: string, handler: RouteHandler): Route;

function composeMiddleware(
  middlewares: Middleware[],
  handler: RouteHandler,
): RouteHandler;

function buildHttpHandler(routes: Route[]): RouteHandler;
```

### Comportamento

- `defineRoute('/api/trainers/:id', handler)` compila `:id` em RegExp e extrai `paramNames` na ordem.
- `composeMiddleware` executa middlewares em ordem; o primeiro que retornar `Response` interrompe a cadeia.
- `buildHttpHandler` recebe a lista de rotas, faz match por método + pathname, extrai params do match, e chama `handler(req, params, ctx)`.
- Se nenhum rota casar, retorna `404` com `{ error: 'not_found' }`.
- Se o método não casar mas o path casar, retorna `405` com `{ error: 'method_not_allowed' }`.

### Middlewares globais

Aplicados em todas as rotas, exceto `/health`:

1. **Logging** — gera `requestId` (uuid), mede duração, loga método/path/status/duração. Usa `pino`.
2. **CORS** — permite origem do cliente dev (`http://localhost:5173`) e o que vier de `process.env.CLIENT_ORIGIN` em produção.
3. **Auth** — extrai `Authorization: Bearer <token>`, valida com `getClaims()` (rápido, local), anexa `userId` ao `ctx`. Se falhar, retorna `401`.

### `RequestContext`

```
type RequestContext = {
  requestId: string;
  userId: string | null;
};
```

`userId` é `null` apenas em rotas explicitamente públicas (não há nenhuma hoje; todas exigem auth). Quando o middleware de auth passar, `userId` é o `id` do usuário Supabase.

## Middleware de Autenticação

O servidor tem `supabase` server-side (chave de serviço) e `supabase` user-side (chave anon). O middleware usa o **server-side** com o token do cliente.

### Fluxo

```
1. Extrai "Bearer <token>" do header Authorization.
2. Se ausente → 401 { error: 'unauthenticated' }.
3. Chama supabaseServer.auth.getClaims(token) — valida assinatura e expiração localmente.
4. Se claims inválidas → 401.
5. Anexa claims.sub (userId) ao ctx.
6. Chama next().
```

### Por que `getClaims()` e não `getUser()`

`getUser()` consulta o Auth server (com rede). É usado **na abertura do canal WebSocket** porque precisa detectar sessão revogada (`STACK.md:57-66`). Nas chamadas REST subsequentes, `getClaims()` é suficiente e mais rápido — basta verificar assinatura e expiração.

**Limitação conhecida**: um token revogado (logout de outra aba) ainda passa no `getClaims()` até expirar. Para as rotas de trainer, isso é aceitável: a operação é idempotente dentro do horizonte de validade do token (~1h). Para o WebSocket, o `getUser()` na abertura já cobre.

### Renovação de token

O cliente (`docs/technical/client/AUTH.md` — pendência de fluxo de refresh) acompanha a validade do token e renova antes de expirar. O servidor não renova nada.

## Rotas

Todas as rotas exigem `Authorization: Bearer <token>` válido.

### `POST /api/trainers`

Cria um treinador para a conta autenticada.

**Request**

```
{
  "name": string,           // 3-15 chars, letras/números/espaço/traço/underscore
  "gender": "male" | "female",
  "starterCreatureId": string  // id da criatura inicial escolhida
}
```

**Response 201**

```
{
  "id": string,
  "name": string,
  "gender": "male" | "female",
  "starterCreatureId": string,
  "createdAt": string  // ISO 8601
}
```

**Erros**

| Status | code | Quando |
|---|---|---|
| 400 | `invalid_name` | Formato do nome inválido |
| 400 | `invalid_gender` | `gender` não é `male` ou `female` |
| 400 | `invalid_starter` | `starterCreatureId` não é uma criatura inicial |
| 409 | `name_taken` | Nome já existe (case/acento-insensitive) |
| 409 | `max_trainers_reached` | Conta já tem 5 trainers |
| 401 | `unauthenticated` | Token ausente ou inválido |

### `GET /api/trainers`

Lista os trainers da conta autenticada.

**Response 200**

```
{
  "trainers": [
    {
      "id": string,
      "name": string,
      "gender": "male" | "female",
      "level": number,
      "starterCreatureId": string,
      "createdAt": string
    }
  ]
}
```

**Erros**

| Status | code |
|---|---|
| 401 | `unauthenticated` |

A lista é sempre ordenada por `createdAt ASC` (mais antigo primeiro), com no máximo 5 entradas.

### `DELETE /api/trainers/:id`

Deleta o trainer e tudo ligado a ele (criaturas, itens, inventário, quests).

**Response 204** — sem body.

**Erros**

| Status | code | Quando |
|---|---|---|
| 404 | `trainer_not_found` | Trainer não existe ou não pertence à conta |
| 401 | `unauthenticated` | |

A deleção é **transacional**: ou apaga tudo (trainer, criaturas, itens, etc.) ou não apaga nada.

### `PATCH /api/trainers/:id`

Edita campos editáveis do trainer. Hoje apenas `name` e `gender`. Reservado para evolução futura (avatar customizado etc.).

**Request**

```
{
  "name"?: string,
  "gender"?: "male" | "female"
}
```

**Response 200** — trainer atualizado.

**Erros**

| Status | code | Quando |
|---|---|---|
| 400 | `invalid_name` | Formato do nome inválido |
| 400 | `invalid_gender` | |
| 409 | `name_taken` | Nome já existe |
| 404 | `trainer_not_found` | |
| 401 | `unauthenticated` | |

### `POST /api/auth/google-merge`

Executa o merge da conta Google com conta de e-mail+senha, conforme `docs/game/AUTHENTICATION.md:68-71`.

**Quando é chamado**: depois que o usuário entra via Google e o cliente detecta que existe conta de e-mail+senha com o mesmo e-mail verificado.

**Request**

```
{
  "email": string
}
```

**Comportamento do servidor**

1. Verifica que o usuário autenticado é uma conta Google (não tem senha).
2. Verifica que existe conta de e-mail+senha com `email = req.body.email`.
3. Verifica que o e-mail está verificado (claim `email_verified = true` no token Google — Supabase já faz isso se `detectSessionInUrl` foi usado).
4. **Descarta** a senha da conta de e-mail+senha.
5. **Encerra todas as sessões** dessa conta via `supabaseServer.auth.admin.signOut(...)` ou `admin.updateUserById(...)`.
6. Mantém o usuário logado na sessão Google atual.

**Response 200**

```
{
  "merged": true,
  "userId": string
}
```

**Erros**

| Status | code | Quando |
|---|---|---|
| 400 | `invalid_email` | |
| 409 | `not_google_account` | Usuário atual não entrou via Google |
| 409 | `email_unverified` | E-mail Google não verificado |
| 409 | `no_password_account` | Não existe conta de e-mail+senha com esse e-mail |
| 401 | `unauthenticated` | |

> Esta rota **não** recebe o `email` do body em uma versão futura — o servidor lê do `userId` autenticado e do claim de e-mail do token Google. A versão inicial aceita `email` no body para simplificar a primeira iteração, mas o `@fixer` que implementar isso deve sinalizar isso como dívida.

## Regras de Negócio

### Validação de nome

Regras aplicadas pelo servidor (espelham o `docs/game/AUTHENTICATION.md`):

- 3 a 15 caracteres após `trim()`.
- Apenas letras (com ou sem acento), números, espaços, traços e underscores.
- Sem espaços consecutivos. Sem espaço no início ou no fim (já removidos pelo `trim()`).
- Comparação de unicidade é case-insensitive e accent-insensitive.

A normalização accent-insensitive usa `String.prototype.normalize('NFD').replace(/[\u0300-\u036f]/g, '')`. O servidor compara a versão normalizada.

### Limite de 5 trainers

Verificado em `POST /api/trainers`. Se a conta já tem 5, retorna `409 max_trainers_reached`.

### Unicidade de nome

Verificado em `POST` e `PATCH`. Query no banco usa a forma normalizada (sem acento, lowercase). Se já existe trainer com esse nome normalizado, retorna `409 name_taken`.

### Deleção em cascata

`DELETE /api/trainers/:id` apaga o trainer e todas as linhas referenciadas (criaturas, itens, inventário, quests). Feito em transação. Se qualquer parte falhar, nada é apagado.

### Merge Google

Veja `POST /api/auth/google-merge` acima. A regra de descartar a senha é crítica: se a conta pré-existente tinha senha, ela some. O usuário que quiser continuar usando e-mail+senha precisa redefinir via fluxo de recovery (`docs/game/AUTHENTICATION.md`).

## Erros

Toda resposta de erro tem o formato:

```
{
  "error": string,        // código machine-readable
  "message": string,      // mensagem human-readable, exibida ao usuário
  "details"?: object      // opcional, dados extras (e.g. campo que falhou)
}
```

O servidor nunca retorna stack trace, mensagem de SQL crua, ou qualquer informação de implementação. A mensagem é genérica o suficiente para ser mostrada ao usuário sem revelar detalhes internos.

## Sessão do Treinador

> Decisão de produto confirmada: a sessão do trainer é **server-side, opaca para o cliente**.

O servidor mantém um mapa `userId → trainerId ativo` em memória. Quando o cliente faz uma operação de jogo (futuro WebSocket) ou precisa identificar qual trainer está aberto, **não** manda `trainerId` no payload — o servidor sabe.

### Como o trainer ativo é definido

- Quando o cliente entra em `/game` (futuro), envia um comando `select_trainer(trainerId)` pelo WebSocket. O servidor registra `userId → trainerId` no mapa.
- Quando o cliente sai (logout, fecha janela, navega para `/trainers`), o servidor limpa a entrada.
- Quando o cliente volta para `/trainers` e escolhe outro trainer, o servidor atualiza.

### Por que não em localStorage

- Cliente não pode mudar para outro trainer sem o servidor saber.
- Se o cliente forjar `trainerId`, o servidor aceita (e o cliente "logado" como outro trainer). Com sessão server-side, isso é impossível.
- `STACK.md:74-76` já estabelece "uma conta pode ter um treinador conectado por vez" como regra do servidor — manter o estado no servidor é coerente com essa regra.

### Implicação para a API REST

As rotas de trainer (`POST /api/trainers`, `GET /api/trainers`, `PATCH`, `DELETE`) **não** operam sobre um trainer ativo — operam sobre qualquer trainer da conta. A "sessão de trainer" só importa no WebSocket.

## Contratos Compartilhados

Os tipos de input e output desta API vivem em `apps/shared/contracts/`, um pacote sem runtime que tanto o cliente quanto o servidor importam. Os **schemas** de validação (Zod) ficam em cada lado.

### O que vive no pacote compartilhado

```
apps/shared/contracts/
  trainer.ts
  auth.ts          # AuthErrorCode, AuthResult, AuthUser, AuthSession
  trainer.ts       # NewTrainerInput, Trainer, Gender, TrainerErrorCode
  package.json     # name: "@creatures/contracts"
```

Conteúdo típico de `apps/shared/contracts/trainer.ts`:

```
export type Gender = 'male' | 'female';

export type NewTrainerInput = {
  name: string;
  gender: Gender;
  starterCreatureId: string;
};

export type Trainer = {
  id: string;
  name: string;
  gender: Gender;
  level: number;
  starterCreatureId: string;
  createdAt: string;
};

export type TrainerErrorCode =
  | 'invalid_name'
  | 'invalid_gender'
  | 'invalid_starter'
  | 'name_taken'
  | 'max_trainers_reached'
  | 'trainer_not_found'
  | 'unauthenticated';
```

Nenhum Zod, nenhuma dependência de runtime. Apenas tipos puros de TypeScript.

### O que NÃO vive no pacote compartilhado

- Schemas Zod. Cada lado escreve o seu.
- Mensagens de erro user-facing. Cliente quer português (pt-BR); servidor quer algo neutro e estável.
- Lógica de validação. Validação é por ambiente — cliente valida input de formulário, servidor valida body da API.

### Como cada lado consome os tipos

**Cliente** (`apps/client/src/validation/trainer.ts`):

```
import { z } from 'zod';
import type { Gender, NewTrainerInput } from '@creatures/contracts/trainer';

export const newTrainerSchema = z.object({
  name: z.string().min(3).max(15).regex(/^[\p{L}\p{N} _-]+$/u),
  gender: z.enum(['male', 'female']) satisfies z.ZodType<Gender>,
  starterCreatureId: z.string().uuid(),
}) satisfies z.ZodType<NewTrainerInput>;
```

O `satisfies z.ZodType<NewTrainerInput>` garante que o schema satisfaz o tipo compartilhado em tempo de compilação. Se alguém mudar `NewTrainerInput` em `contracts/` sem atualizar o schema, o typecheck falha.

**Servidor** (`apps/server/src/validation/trainer.ts`):

```
import { z } from 'zod';
import type { Gender, NewTrainerInput } from '@creatures/contracts/trainer';

export const newTrainerRequestSchema = z.object({
  name: z.string().min(3).max(15).regex(/^[\p{L}\p{N} _-]+$/u),
  gender: z.enum(['male', 'female']) satisfies z.ZodType<Gender>,
  starterCreatureId: z.string().uuid(),
}) satisfies z.ZodType<NewTrainerInput>;
```

O schema do servidor pode divergir do cliente (validação extra, normalização diferente, mensagens distintas), mas o **tipo de entrada é o mesmo**. Quando o cliente envia um body, o servidor sabe que o shape bate com `NewTrainerInput` antes mesmo de validar.

### Migração dos tipos atuais

Os tipos `AuthErrorCode`, `AuthResult`, `AuthUser`, `AuthSession` que hoje vivem em `apps/client/src/auth/store/types.ts` devem ser **movidos** para `apps/shared/contracts/auth.ts`. O arquivo `store/types.ts` passa a re-exportar de `@creatures/contracts/auth`, preservando os imports atuais sem quebrá-los.

A migração é:
1. Criar `apps/shared/contracts/auth.ts` com os tipos movidos de `store/types.ts`.
2. Criar `apps/shared/contracts/package.json` com `name: "@creatures/contracts"`.
3. Adicionar `@creatures/contracts` ao `apps/client/package.json` como workspace dependency.
4. Em `apps/client/src/auth/store/types.ts`, substituir os tipos por `export type { ... } from '@creatures/contracts/auth';`.
5. Rodar typecheck e testes — nada deve quebrar.

## Testes

Cobertura obrigatória da suíte `apps/server/src/__tests__/trainers.spec.ts`:

- `POST /api/trainers` com dados válidos retorna 201 e o trainer criado.
- `POST /api/trainers` sem `Authorization` retorna 401.
- `POST /api/trainers` com nome inválido (muito curto, caracteres proibidos) retorna 400.
- `POST /api/trainers` quando a conta já tem 5 retorna 409 `max_trainers_reached`.
- `POST /api/trainers` com nome já existente retorna 409 `name_taken`. Cobre variações de caixa e acento.
- `GET /api/trainers` retorna os trainers da conta em ordem de criação.
- `GET /api/trainers` filtra por conta — trainer de outra conta não aparece.
- `DELETE /api/trainers/:id` remove o trainer e seus dependentes em transação.
- `DELETE /api/trainers/:id` de trainer de outra conta retorna 404.
- `PATCH /api/trainers/:id` atualiza campos válidos.
- `PATCH /api/trainers/:id` com nome tomado retorna 409.
- `POST /api/auth/google-merge` para conta não-Google retorna 409.
- `POST /api/auth/google-merge` para e-mail não verificado retorna 409.
- `POST /api/auth/google-merge` para e-mail sem conta de senha retorna 409.
- `POST /api/auth/google-merge` com sucesso descarta a senha e mantém a sessão.

Adicional sobre o uso de Zod:
- Schema do servidor rejeita body sem `name` (400 `invalid_name`).
- Schema do servidor rejeita `gender` diferente de `'male' | 'female'` (400 `invalid_gender`).
- Schema do servidor rejeita `starterCreatureId` não-uuid (400 `invalid_starter`).
- Schema do servidor aceita exatamente o que o `satisfies z.ZodType<NewTrainerInput>` permite.

Mocks:

- `supabase.auth.getClaims()` é mockado para retornar um usuário controlado.
- `supabase.auth.admin.*` é mockado para o merge.
- Acesso ao banco: o teste usa um schema isolado (transactions por teste) ou um mock do client de banco. A definir quando o storage do cliente entra.

## Pendências

- **Schema do banco** — as tabelas `trainers`, `creatures`, `items`, `inventories`, `quests` ainda não existem no banco. Esta doc descreve a API HTTP; o schema entra em uma rodada futura.
- **Servidor `supabaseServer`** — a inicialização do client de servidor (com chave de serviço) e o padrão de injeção para testes ainda não estão escritos.
- **`/api/auth/google-merge` recebendo `email` no body** — versão inicial. A versão final lê do token.
- **Rate limit** — as rotas de trainer não têm rate limit próprio. O Supabase impõe limites nas chamadas de auth; para trainer, confiamos no cliente não abusar (alpha/beta). Migrar para limitação dedicada antes da abertura ao público.
- **Logging estruturado por rota** — o middleware de logging existe, mas o conteúdo (`requestId` propagado, body hasheado, etc.) ainda não foi definido.
- **`@supabase/supabase-js` no servidor** — pendência #1 do `STACK.md`. Precisa ser instalado junto com a primeira rota que precisa validar token.
- **Pacote `@creatures/contracts` criado** — a estrutura proposta em [Contratos Compartilhados](#contratos-compartilhados) ainda não existe no repositório. Tipos compartilhados entram junto com a primeira rota que precisa deles.