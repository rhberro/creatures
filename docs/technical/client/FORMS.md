# Formulários do Cliente

Este documento é a referência dos formulários do cliente: onde mora o estado de um campo, quando o erro aparece, e o que acontece quando o jogador clica em enviar.

> O formulário é do cliente: ele valida o **formato** da entrada antes de enviá-la. Quem decide se a ação é permitida é o servidor, conforme descrito na [Arquitetura](../ARCHITECTURE.md).

## Índice

| Seção | O que responde |
| --- | --- |
| [Princípios](#princípios) | As três regras que valem para todo formulário. |
| [As peças](#as-peças) | `useZodForm`, `FormField` e o erro do formulário. |
| [A política de validação](#a-política-de-validação) | Quando o erro aparece e o que o jogador vê. |
| [O fluxo do envio](#o-fluxo-do-envio) | O que acontece entre o clique e a resposta. |
| [Como escrever um formulário](#como-escrever-um-formulário) | O passo a passo de um formulário novo. |
| [Os formulários do cliente](#os-formulários-do-cliente) | Onde cada formulário mora. |

## Princípios

**O formulário tem uma fonte de verdade, e ela é o schema.** O valor de um campo, o erro de um campo e o estado do envio saem todos do React Hook Form. Não há `useState` para o valor de um campo, e não há validação escrita à mão dentro de um componente: a regra mora em um schema do Zod.

**O erro é do campo, ou é do formulário — nunca os dois.** O erro que aponta para um campo mora no campo, e sai sozinho quando o valor passa a ser válido. O erro que não pertence a nenhum campo — "e-mail ou senha inválidos" — mora na raiz do formulário, e é esse que sobrevive à revalidação dos campos.

**Quem está esperando não clica duas vezes.** Toda ação que vai para a rede desabilita a interface e mostra o carregamento no botão que a disparou. O `isSubmitting` do RHF cobre o envio do formulário; uma ação que não é o envio — o login com Google, por exemplo — tem o seu próprio estado.

## As peças

Tudo o que um formulário usa está em `~/shared/ui/form`.

### `useZodForm`

Cria o formulário. Ele já vem com o `zodResolver`, o schema e a política de validação do projeto, então ninguém esquece a política:

```tsx
const form = useZodForm(signInSchema, { email: '', password: '' });
```

O segundo argumento são os valores iniciais. Ele é obrigatório: um campo sem valor inicial é um campo sem valor.

### `FormField`

O campo. Ele liga o `useController` ao `TextField` do design system e monta o `Field.Root` do Chakra, que amarra rótulo, controle e mensagem de erro — o `aria-invalid` e o `aria-errormessage` saem preenchidos sozinhos.

O campo com erro tem **a borda de erro** e a mensagem. A borda avisa antes de a mensagem ser lida, e a mensagem diz o que aconteceu.

```tsx
<FormField
  autoComplete="email"
  control={control}
  label="E-mail"
  name="email"
  placeholder="treinador@exemplo.com"
  type="email"
/>
```

**O `control` é explícito, e não vem de um context.** É ele que segura o tipo dos valores do formulário, e é por ele que o nome do campo é verificado na compilação: `name="emial"` não compila. O `control` desce um nível — do formulário para o componente que agrupa os campos — e chega ao `FormField`.

### O erro do formulário

O erro que não pertence a um campo mora em `root.form`, a raiz do estado do RHF:

```tsx
const setFormError = buildFormErrorSetter(form);

setFormError('E-mail ou senha inválidos.');
```

E sai assim:

```tsx
const formError = readFormError(form);

<FormError message={formError} />
```

O `FormError` é o `Text` de erro do formulário inteiro. Ele não usa o `Field.ErrorText` do Chakra, porque aquele componente só existe dentro de um `Field.Root` e estoura o contexto quando é renderizado sozinho.

> O erro da raiz é limpo no próximo envio: o RHF substitui o estado de erro inteiro pelo resultado do schema, e o erro antigo some junto.

## A política de validação

A política é uma só, e ela mora no `useZodForm`:

| Momento | O que acontece |
| --- | --- |
| Digitando, pela primeira vez | Nada. O campo ainda não foi tocado, e ninguém precisa ver "e-mail inválido" no primeiro caractere. |
| Saindo do campo (`blur`) | O campo valida, e o erro aparece embaixo dele. |
| Digitando, depois do primeiro erro | O campo revalida a cada tecla, e o erro some no instante em que o valor fica válido. |
| Depois de enviar | Qualquer mudança revalida na hora. |

O `mode` é `onTouched` e o `reValidateMode` é `onChange`. É o `onTouched` que dá o "erro no blur" e, logo em seguida, o "erro ao digitar".

> A validação por tecla é o schema inteiro rodando a cada tecla. Para os formulários do cliente isso é barato — são dois ou três campos — mas é o motivo de o schema não carregar nada caro.

## O fluxo do envio

O envio tem quatro momentos, e cada um tem uma regra.

**1. O clique.** O `handleSubmit` roda o schema. Se o formulário tem erro, o RHF mostra o erro de cada campo, e **o primeiro campo inválido recebe o foco** — o `FormField` entrega o `ref` do campo ao RHF, e é por isso que isso funciona.

**2. A espera.** Enquanto o pedido está na fila, o `isSubmitting` do RHF é verdadeiro. O botão que envia mostra o carregamento e fica desabilitado, e as outras ações da tela também. Nada mais aceita clique.

**3. A resposta.** O resultado vem no `then` da promessa, e ele decide entre três destinos: redirecionar, mostrar um aviso, ou mostrar o erro do formulário.

**4. O erro do servidor.** Quando o servidor recusa — credencial errada, e-mail já cadastrado, nome indisponível — a mensagem vai para a raiz do formulário. O RHF não sabe a diferença entre "erro de campo" e "erro de formulário": quem sabe é a tela, e é por isso que o erro do servidor é escrito com `setError` e não com o schema.

### A ação que não é o envio

O login com Google não é o envio do formulário: ele é um botão ao lado. Ele tem o seu próprio estado de pendência, e a tela soma os dois para saber se está ocupada:

```tsx
isBusy: form.formState.isSubmitting || isOAuthPending,
```

Com a tela ocupada, o botão que espera mostra o carregamento, e os outros ficam desabilitados.

## Como escrever um formulário

1. **O schema.** A regra do campo, em Zod, no `model/` da fatia que é dona do formulário. O schema do formulário e o schema do pedido para a API são o mesmo.
2. **O hook.** `model/useXForm.ts` cria o formulário com o `useZodForm`, monta o `handleSubmit` e devolve o que a view precisa: o `control`, o erro do formulário, o `isSubmitting` e os handlers.
3. **A view.** `ui/XForm.tsx` monta o `<form>`, os campos e as ações. A view não sabe de schema, e o hook não sabe de JSX.
4. **As ações.** O botão que envia recebe `loading={isSubmitting}` e `disabled={isBusy}`.

```tsx
export function XForm(): ReactElement {
  const form = useXForm();
  return (
    <form noValidate onSubmit={form.handleSubmit}>
      <Stack gap={4}>
        <XFields control={form.control} />
        <FormError message={form.formError} />
        <XActions isBusy={form.isBusy} isSubmitting={form.isSubmitting} />
      </Stack>
    </form>
  );
}
```

O `noValidate` desliga a validação nativa do browser: a validação é a nossa, e a mensagem é a do design system.

## Os formulários do cliente

| Formulário | Schema | Fatia |
| --- | --- | --- |
| Entrar | `signInSchema` | `features/authentication/model/auth.schema.ts` |
| Criar conta | `signUpSchema` | `features/authentication/model/auth.schema.ts` |
| Recuperar senha | `forgotPasswordSchema` | `features/authentication/model/auth.schema.ts` |
| Redefinir senha | `resetPasswordSchema` | `features/authentication/model/auth.schema.ts` |
| Criar treinador | `newTrainerSchema` | `entities/trainer/model/trainer.schema.ts` |

As regras de e-mail, senha e confirmação de senha são as mesmas em todos os formulários de autenticação, e moram em `features/authentication/model/auth.schema.ts`. O que muda de um formulário para outro é o conjunto de campos.

> O formulário de criar treinador tem dois campos que não são texto: o gênero e a criatura inicial. Eles entram no formulário com `setValue` e saem com `useWatch`, e o schema os valida como os outros.

## Pendências

- O schema de cada formulário tem teste, e o `FormField` não. Ele pode ser testado com o RHF, mas falta decidir a ferramenta de teste de componente, que hoje não existe no cliente.
