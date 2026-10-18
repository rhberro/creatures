# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

O jogador é um treinador que coleciona criaturas e entra em caçadas em um jogo de browser. Na fase atual o usuário primário é um grupo pequeno e fechado de testadores de alfa e beta: eles entram no jogo para validar o laço de caça — stamina, caçada, captura, drops, cura e loja — e não uma audiência pública. O mesmo jogador usa o produto no desktop e no celular, com uma interface só.

## Product Purpose

O Creatures é um jogo de caça e coleção de criaturas que roda no browser. O jogador é um treinador com até 5 criaturas no time e 12 horas de stamina, e a rotina dele é escolher uma área de caça, deixar a batalha acontecer — inclusive com o jogo fechado — e depois voltar para resolver a vida na cidade: cura, loja e venda de loot.

O sucesso nesta fase é o laço funcionar de ponta a ponta para os testadores de alfa e beta: caçar, capturar, dropar, vender e repetir sem quebrar. Como as missões ainda não existem, batalhas não dão experiência ao treinador, então a progressão medida hoje é a das criaturas e a economia de gold coins.

## Positioning

A stamina é de 12 horas e é imutável para todo treinador, e a caçada continua com o jogo fechado — 4 horas seguidas na conta gratuita, 8 na conta paga. O produto é uma caçada em tempo real que não exige atenção contínua: o jogador monta o time, escolhe a área, e a sessão corre sozinha até acabar. O servidor é a única fonte de verdade do estado; o cliente apenas exibe o que recebe.

## Operating Context

- Uma interface só para desktop e celular: o conteúdo é o mesmo em qualquer tamanho de tela, e o que muda é a escala dos elementos dentro de limites definidos.
- Sessões de caçada longas e offline: é normal o jogador fechar o jogo e voltar depois.
- O estado do jogo chega por WebSocket, empurrado pelo servidor; o cliente nunca pergunta o estado em intervalo de tempo.
- Convenções de interface já definidas e compartilhadas por todas as superfícies: popup no hover no desktop e por clique no celular; modais e drawers de tamanho fixo; barra de rolagem sempre visível; progresso de cooldown por sombra que desce sobre o ícone; alerta com barra de tempo no canto superior direito; fechamento por camada — painel simples fecha clicando fora, modal composto só por ESC ou botão, drawer por ESC e dropshadow.
- Jogo top-down em pixel art, com o mundo renderizado em canvas PixiJS separado dos elementos de interface em React; escala de render sempre inteira.
- O idioma do produto hoje é português (pt-BR): telas, mensagens e documentação.

## Capabilities and Constraints

- Rotas: `signin`, `signup`, `forgot-password`, `reset-password`, `terms` e `privacy` são públicas; `trainers`, `trainers/new` e `game` são protegidas e exigem sessão.
- Autenticação por Supabase Auth, com e-mail/senha e Google. O cliente não valida token algum: apenas repassa o access token ao servidor. O merge da conta Google com conta existente e o limite de tentativas de login são implementados no cliente.
- Sessão expira em 7 dias sem atividade; signin bloqueia após 5 tentativas falhas em 15 minutos; recuperação de senha tem limite de 1 envio por minuto e 5 por hora.
- Stamina: máximo de 12 horas para todo treinador, sem item ou construção de personagem que altere esse valor. Iniciar uma caçada exige no mínimo 30 minutos. Conta gratuita recupera 1 minuto a cada 2; conta paga, 1 a cada 1. A stamina é do treinador, não da conta; o tipo de conta é da conta.
- Moedas: gold coin, ganha vendendo loot e gasta em NPCs e comércios; diamante, moeda premium obtida por doação em dinheiro real — no alfa e no beta o único uso é 30 diamantes por 30 dias de conta paga.
- Criaturas: 5 espécies na base, 3 delas opções de criatura inicial; a escolhida nasce com todos os PVs em 50%; PVs são aleatórios na captura; a chance de captura é da espécie e é multiplicada pelo dispositivo (5 dispositivos, o melhor 5×); criatura capturada não dropa nada.
- Time fechado durante a caçada, com exceção da captura, que entra no próximo slot vago; entrada automática da primeira criatura apta quando a ativa desmaia; troca manual bloqueada por 5 segundos.
- Cidade: área segura com local de cura, lojas e venda de loot; armazenamento e mochila podem ser consultados de qualquer lugar, caçando ou não.
- Stack já decidida e em parte instalada: TypeScript, Vite, React 19, React Router, Chakra UI 3, PixiJS 8, Zustand, Supabase Auth, WebSocket nativo; Bun como runtime, gerenciador de pacotes e runner de testes. React Router e Zustand estão escolhidos mas ainda não instalados.
- Na alfa e no beta a diretriz é customizar o mínimo possível do Chakra: a customização sai por token semântico no sistema de temas, nunca alterando o estilo do componente, porque a interface ainda vai mudar muito.
- Alfa e beta são deliberadamente simples: sem confirmação de e-mail no cadastro; termos de serviço e política de privacidade são placeholders.

Fatos ainda em aberto, que não devem ser inventados por trabalho futuro:

- As fórmulas de nível da criatura, de experiência e dos atributos atuais, incluindo as constantes `d` e `k`.
- A tabela de efetividade entre elementos — fogo contra planta em 1,5× é o único caso definido.
- O catálogo de habilidades: quais existem, elementos, cooldowns e dano.
- As curvas de nível e de experiência e os números de chance de drop de cada espécie.
- Se o dispositivo de captura é consumido em toda tentativa ou só na captura bem-sucedida.
- O que são os itens do treinador: como são obtidos, quais existem e o que cada um faz.
- Onde e como o jogador faz a doação que gera diamantes, e o valor final do diamante.
- Se a conta paga se renova sozinha ou o jogador precisa recomprar.
- Os valores de tamanho mínimo e máximo da escala da interface, e a cor de destaque dos elementos ativos.

## Brand Commitments

Nada é vinculante ainda. O nome "Creatures" é provisório, e o pt-BR é o estado atual do produto, não uma marca estabelecida. Os documentos de design de jogo são deliberadamente genéricos e nunca nomeiam franquias do gênero; se isso é uma restrição de IP consciente ou apenas escolha de escrita, não foi confirmado — trabalho futuro não deve assumir nenhuma das duas coisas.

## Evidence on Hand

- Documentação de design de jogo completa em `docs/game/`: autenticação, treinador, criaturas, cidade, loja, mochila, armazenamento, barra de habilidades, caçada, analisador de caçada, detalhes e seleção de área, e tela do jogo.
- Mockups de tela em `docs/assets/` (signin, signup, trainers_list, play_screen, hunt_*, storage, backpack, store_*, skill_bar_*). São ilustrativos: mostram a disposição geral e servem para conferir estrutura, não cores, tipografia ou espaçamento final.
- Stack e decisões técnicas documentadas em `docs/technical/` (arquitetura, stack do cliente e do servidor).

Ausências que trabalho futuro não deve preencher por conta própria: não existem no repositório logo, tipografia de marca, paleta definida nem arte final de criaturas; não há depoimentos, dados de uso, clientes ou benchmarks; os únicos números de preço são o diamante provisório e a regra dos 30 diamantes por 30 dias; e o conteúdo de termos de serviço e política de privacidade é placeholder.

## Product Principles

1. O cliente mostra, o servidor decide: nenhuma regra de gameplay vive na interface.
2. O jogador não precisa estar presente: caçada e recuperação de stamina correm sozinhas, e a interface nunca exige atenção contínua.
3. Uma interface só, para desktop e celular; muda a escala dos elementos, não a versão da tela.
4. Customização mínima do design system na alfa e no beta: a customização vive em token semântico, não no componente.
5. O que é cálculo do jogo — nível, experiência, atributos — não é guardado nem decidido no cliente; fórmula indefinida permanece indefinida.
