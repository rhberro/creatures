# Agentes

Este documento é a porta de entrada para todas as instruções dos agentes que trabalham neste projeto. Tudo o que está aqui obrigatoriamente deve ser seguido pelos agentes, sem exceções.

## Documentações

A tabela a seguir lista todas as documentações disponíveis para consulta pelos agentes. Se estiver com dúvidas e não souber qual documento consultar, consulte todos os documentos um a um.

| Documentação  | Descrição                                                                                                               | Quando consultar                                                                                                                                                           | Onde consultar          |
| ------------- | ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| Coding Styles | Convenções de código do projeto: padrões de estilo, nomenclatura, organização e boas práticas que o código deve seguir. | Sempre que for escrever, alterar ou revisar código, antes de criar novos arquivos ou módulos, e diante de qualquer dúvida sobre como algo deve ser escrito ou estruturado. | `docs/CODING_STYLES.md` |
| Game Design   | Fonte de verdade sobre como o jogo funciona no nível de produto: regras, entidades, mecânicas e opções disponíveis.     | Sempre que a tarefa envolver comportamento, regras ou conteúdo do jogo, ou quando houver dúvida sobre alguma mecânica ou regra.                                            | `docs/GAME.md`          |

## Context7

Sempre que você precisar consultar uma documentação, independente de qual seja o tipo de documentação, você obrigatoriamente deve usar o MCP do Context7 — mesmo que seja uma documentação já conhecida por você, a menos que a informação já tenha sido consultada anteriormente utilizando o MCP do Context7 — seus dados de treinamento podem não refletir a documentação mais recente. Prefira sempre consultar o MCP do Context7 do que qualquer outra forma de consulta, como por exemplo, usar a busca na web.

Esta regra vale somente para documentações externas. As documentações internas do projeto estão na tabela acima.

## Aplicações

A tabela a seguir lista as aplicações disponíveis no projeto, onde encontrar a documentação correspondente e quando consultar cada uma delas.

| Aplicação | Descrição                                                        | Quando consultar                                             | Documentação            |
| --------- | ---------------------------------------------------------------- | ------------------------------------------------------------ | ----------------------- |
| Cliente   | A aplicação web que o jogador utiliza para interagir com o jogo. | Quando precisar de informações sobre a interface do usuário. | `apps/client/README.md` |
| Servidor  | O servidor que gerencia as conexões e a lógica do jogo.          | Quando precisar de informações sobre o servidor.             | `apps/server/README.md` |

## Comandos

O gerenciador de pacotes é o `bun`, não use `npm`, `yarn` ou `pnpm`.

### Instalar Dependências

Para instalar as dependências do projeto, execute o seguinte comando:

```
bun install
```

### Inicialização

Para iniciar ambas as aplicações (cliente e servidor), execute o seguinte comando:

```
bun run dev
```

## Pós-edição

Depois de usar `write` ou `edit` em arquivo de código (.js/.jsx/.ts/.tsx/.mjs/.cjs), rode `bun run format`, `bun run lint:fix` e por fim `bun run lint` nos arquivos alterados antes de declarar a tarefa pronta. Se ainda houver erro de lint, conserte. Não pule essa etapa mesmo que o pre-commit hook vá rodar no commit — o objetivo é evitar ciclos de retorno.

## Respostas

Ao final de cada execução, você obrigatoriamente deve informar o que foi utilizado, no formato abaixo. Liste apenas os itens que realmente foram usados e omita as categorias vazias.

```
O que eu utilizei durante a execução:

- Documentações
  - <caminho do documento interno>
- MCPs
  - <nome do MCP>
- Skills
  - <nome da skill>
```

Não liste operações básicas de leitura e edição de arquivos nem comandos de terminal comuns. Se você não usou nenhum MCP, skill nem documentação, responda apenas: "Execução sem ferramentas."
