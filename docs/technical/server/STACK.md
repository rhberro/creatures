# Stack do Servidor

Este documento lista as tecnologias escolhidas para o servidor, o motivo de cada escolha e o que elas obrigam a fazer.

> O servidor vive em `apps/server`. Ele é **a única fonte de verdade do jogo**: toda a simulação acontece aqui, conforme descrito na [Arquitetura](../ARCHITECTURE.md). O cliente recebe o estado e o exibe, mas não altera nada.

## Stack

| Tecnologia | Papel |
| --- | --- |
| Bun | Runtime, servidor HTTP e servidor WebSocket |
| TypeScript | Tipagem do código, no cliente e no servidor |
| pino | Logs estruturados |
| Supabase | Autenticação, banco de dados e validação de token |
| WebSocket | Comunicação com o cliente durante o jogo |

## Bun

O Bun é o runtime do servidor, o gerenciador de pacotes e o runner de testes do projeto.

> Não se usa `npm`, `yarn` nem `pnpm`. Um único gerenciador de pacotes em todo o projeto, com um lockfile só.

O mesmo runner de testes cobre o cliente e o servidor, o que faz o teste de uma regra de negócio não exigir configuração separada da aplicação onde ela vive.

## TypeScript

Todo o código é TypeScript, no cliente e no servidor.

> Escolha feita uma única vez para o projeto inteiro. Não há JavaScript sem tipagem, nem em configuração de build.

A tipagem é especialmente importante no servidor, porque é onde vive a simulação. As regras do jogo são funções puras que recebem um estado e devolvem um novo estado, e os tipos são o que garantem que o estado do servidor continue coerente ao longo de uma partida.

## pino

Os logs do servidor são feitos com o pino, em formato estruturado.

> Escolhido porque log em JSON é pesquisável e agregável, e um log de texto livre exige parser para ser útil. Em servidor, sem isso, diagnosticar um erro em produção vira trabalho manual.

> Não se usa `console.log` em código de servidor. A exceção é depuração local rápida, que é removida antes do commit.

## Supabase

O servidor usa o Supabase para três coisas: validar o token do jogador, ler e escrever no banco de dados, e detectar sessão revogada.

> Escolhido porque o mesmo projeto já cuida da autenticação no cliente, e ter um único lugar para identidade, banco e sessão evita a parte mais cara de manter dois sistemas: a consistência entre eles.

### Validação de Token

O servidor trabalha com o **access token do próprio Supabase**. Não existe token emitido pelo servidor, e o servidor não assina nada.

> O token chega do cliente e é validado aqui. Isso mantém uma única fonte de verdade sobre quem é o jogador: o Supabase Auth.

O `@supabase/supabase-js` roda no servidor e é ele que faz a validação, usando as chaves do próprio projeto.

> Usar o SDK do Supabase para falar com o servidor da aplicação própria não funciona, e essa confusão é fácil de ter. O SDK conversa com os serviços do Supabase — banco, autenticação, storage, realtime. Ele não é um mecanismo de autenticar requisições em uma aplicação própria.

**A validação tem duas formas, e o servidor usa as duas em momentos diferentes.**

- **Na abertura do canal**, o servidor chama `getUser()`, que consulta o Auth server e devolve o registro canônico do usuário.
- **Nas mensagens seguintes**, o servidor valida localmente com `getClaims()`, que confere assinatura e expiração sem nenhuma chamada de rede.

> A distinção importa porque o token continua válido mesmo depois que a sessão por trás dele é encerrada. O fluxo de [Autenticação](../../game/AUTHENTICATION.md) exige que encerrar sessão em um lugar invalide o acesso em todos os outros — o merge da conta Google e a redefinição de senha fazem isso. Só o `getUser()` detecta a revogação, e é por isso que ele é chamado na abertura do canal. Uma validação só no início é o suficiente: enquanto a partida dura, nenhuma regra do jogo encerra a sessão do jogador.

Quando o token deixa de ser válido durante a partida, o servidor encerra o canal.

> A renovação é responsabilidade do cliente, que acompanha a validade do token e reenvia o novo pelo mesmo canal. O servidor não renova nada: apenas recusa o token velho e fecha a conexão, e o cliente reage com a tela de [conexão perdida](../../game/PLAY_SCREEN.md#estados-da-tela).

### Banco de Dados

O estado do jogo é lido e escrito no Postgres do Supabase, pelo mesmo SDK.

> O servidor usa a chave de serviço, que tem permissão total, e nunca a expõe ao cliente. O cliente só fala com o Supabase Auth.

Uma conta pode ter um treinador conectado por vez. Quando uma segunda conexão chega para o mesmo jogador, a anterior é derrubada.

> O [fluxo de autenticação](../../game/AUTHENTICATION.md) e a [tela do jogo](../../game/PLAY_SCREEN.md) exigem que a sessão anterior seja derrubada ao entrar com o mesmo treinador em outra aba ou dispositivo. Isso é controle do servidor, porque o servidor é quem sabe quem está conectado.

## WebSocket

O servidor atende WebSocket com a API nativa do Bun, sem biblioteca intermediária.

> Escolhido porque o Bun já traz servidor WebSocket embutido, com upgrade de conexão e envio e recebimento de mensagens no mesmo `Bun.serve` que serve o HTTP. Adicionar uma biblioteca seria trocar algo que já existe por algo que ainda precisaria ser configurado.

O canal é aberto uma vez, quando o jogador entra no jogo, e fica aberto até a saída. O servidor empurra as atualizações de estado e recebe apenas comandos.

> A WebSocket foi escolhida porque o servidor precisa iniciar a comunicação: ele avisa que uma criatura desmaiou, que um cooldown terminou ou que um treino terminou, e nada disso acontece em resposta a uma pergunta do cliente.

O estado de um jogador fica no processo que atendeu a conexão dele.

> Isso é o que torna a regra da conexão única simples de cumprir: o servidor mantém o registro de quem está conectado, e uma nova conexão para o mesmo jogador encontra e fecha a anterior. A origem dessa regra está na [tela do jogo](../../game/PLAY_SCREEN.md).

O servidor distingue o que é comando, que vem do cliente, do que é atualização de estado, que ele mesmo produz.

> Comandos nunca alteram o estado diretamente: são validados e aplicados pelas mesmas regras que avançam a simulação. É isso que garante que o cliente não consiga sair do que as [regras do jogo](../../game/GAME.md) permitem.

## Simulação

A simulação é executada por um ciclo do servidor, que avança o estado do jogo com o passar do tempo.

> O servidor é a única fonte de verdade porque é o único que sabe o tempo do jogo. O cliente não tem relógio próprio para nada que afete o estado, e nenhum temporizador do cliente tem autoridade sobre nada.

Quando o jogador fecha o jogo, a simulação do treinador continua, se a atividade permitir.

> Essa é a razão do servidor manter o estado em memória e persistir no banco: uma atividade que pode continuar sem o jogador precisa continuar rodando sem conexão nenhuma. O que isso exige do ciclo de simulação ainda não foi definido.

Os tipos das mensagens trocadas entre cliente e servidor são compartilhados pelos dois lados.

> Os tipos do protocolo são a documentação do contrato entre as aplicações e ficam num lugar acessível por ambas. O que cada mensagem significa para o jogo está em [Game Design](../../game/GAME.md).

## Testes

O servidor usa o runner de testes do Bun, o mesmo do cliente.

> As regras do jogo são funções puras, sem estado global e sem dependência de rede, o que as torna testáveis sem subir servidor nem banco. Essa é a razão de a simulação ser descrita assim, e não como uma consequência que convenha depois.

## Pendências

Os pontos abaixo dizem respeito à stack e ainda estão em aberto:

- `@supabase/supabase-js` está escolhido mas ainda não instalado.

Decisões que afetam a estrutura do servidor e ainda não foram tomadas:

- Como o estado em memória é persistido, e com que frequência.
- Como o servidor se comporta com mais de uma instância, já que o estado de um jogador fica no processo dele.
- Como a cidade agrupa os jogadores em instâncias, e como a presença de outros jogadores aparece para quem está em outro processo.
- Qual a frequência do ciclo de simulação.
- O formato do protocolo de mensagens, que ainda não foi escrito.
