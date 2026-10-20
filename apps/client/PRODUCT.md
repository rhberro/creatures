# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Jogadores fãs de RPGs de coleção de criaturas (na linhagem de Pokémon) que jogam em volta de uma rotina ocupada. Eles abrem o Creatures em momentos curtos, no desktop ou no celular, e esperam que o progresso continue enquanto estão fora: a caçada corre sozinha e segue rendo com o jogo fechado.

## Product Purpose

Creatures é um jogo de RPG top-down em pixel art, jogado no navegador, sobre colecionar e treinar criaturas. Ele existe para entregar progresso contínuo sem exigir presença: a caçada é a atividade principal e acontece sozinha. Sucesso é um loop de caçar, capturar, curar e vender que o jogador acompanha em sessões curtas e que continua rendo offline.

## Positioning

RPG de criaturas idle-first: a caçada roda sem o jogador e continua offline até o fim da sessão offline da conta, com o ritmo ditado por uma economia de stamina fixa de 12 horas. Um jogo vizinho do gênero não copiaria essa promessa sem abandonar a exigência de presença que o define.

## Operating Context

- Aplicação web no navegador (cliente React + Vite), para desktop e celular; no celular o jogo funciona só na horizontal — no modo retrato aparece o overlay "Vire o celular".
- O mundo é renderizado em pixel art num canvas PixiJS; a interface (toolbar, modais, barra de habilidades) é HTML/React sobre o canvas.
- Toda a simulação acontece no servidor (`@creatures/server`), a única fonte da verdade do estado; o cliente envia comandos e exibe o que recebe, nunca decide regra de jogo.
- Comunicação em tempo real por WebSocket nativa, aberta uma vez ao entrar no jogo; o servidor empurra as atualizações de estado.
- Autenticação por Supabase Auth (e-mail/senha e Google), usada direto no cliente; o cliente não valida token algum, apenas repassa ao servidor.
- Rotas: `/signin`, `/signup`, `/forgot-password`, `/reset-password`, `/terms` e `/privacy` são públicas; `/trainers`, `/trainers/new` e `/game` são protegidas.
- A documentação interna é a fonte da verdade do produto: `docs/game/` (regras), `docs/technical/` (arquitetura e stack) e `AGENTS.md` (entrada para agentes).

## Capabilities and Constraints

**Conta e treinadores**

- Até 5 treinadores por conta; a criação exige nome (3 a 15 caracteres, único no jogo ignorando maiúsculas e acentos) e escolha obrigatória de criatura inicial.
- Sessão expira após 7 dias sem atividade; login via Google com merge de conta (descarta a senha anterior e encerra as sessões existentes); limites de tentativas de login e de envio de e-mail de recuperação.
- O nível do treinador sobe apenas por missões e missões diárias — que ainda não existem no alfa/beta.

**Stamina (o ritmo do jogo)**

- Máximo fixo de 12 horas por treinador; nenhum item, habilidade ou situação altera esse valor.
- Consumo de 1 minuto de stamina por minuto de caçada, com o jogo aberto ou não; recuperação só fora da caçada (conta gratuita: 1 minuto a cada 2; conta paga: 1 a 1).
- Mínimo de 30 minutos de stamina para iniciar uma caçada.
- Sessão offline (a caçada continua com o jogo fechado): 4 horas na conta gratuita, 8 na paga; ao fim, a caçada é finalizada automaticamente.

**Criaturas**

- Cinco espécies na base, três delas iniciais (cadastradas no banco de dados); a criatura inicial nasce com todos os PVs em 50%.
- Cinco atributos (Vida, Ataque Físico, Ataque Mágico, Defesa Física, Defesa Mágica) com valores de base por espécie e potencial (PV, 0–100%) gerado no momento da captura; o potencial máximo é a média dos PVs.
- Um elemento por espécie; a efetividade compara o elemento da habilidade com o elemento da espécie (fogo × planta = 1,5× é a única definida).
- Captura: chance por espécie, cinco dispositivos de 1× a 5×, tentativa automática quando a criatura selvagem desmaia; criatura capturada não dropa nada.
- Drops são apenas itens que a criatura carrega (partes do corpo); criatura não dropa gold coin.

**Economia**

- Gold coin: ganho vendendo loot na loja da cidade (única fonte), gasto em poções e dispositivos.
- Diamante: moeda premium obtida por doação em dinheiro real; único uso atual é 30 diamantes por 30 dias de conta paga. O valor de referência é algo em torno de R$20 por 50 diamantes — ainda não definido.

**Time, cidade e caçada**

- Time de até 5 criaturas; remanejamento livre só na cidade; durante a caçada o time está fechado, exceto criaturas capturadas, que entram em slots vagos.
- Troca manual com 5 segundos de espera; entrada automática da próxima criatura apta quando a ativa desmaia.
- Cidade: única área segura, único lugar com movimento livre (clique, WASD, setas) e com outros jogadores visíveis; local de cura gratuito e instantâneo; loja de NPC com abas Comprar/Vender.
- Caçada: entrada só pela cidade, pelo modal de áreas (botão de play), com contagem de 5 segundos e tela de carregamento; fim automático por stamina zero, sessão offline esgotada ou time sem criaturas aptas; finalização manual pelo analisador de caçada.
- Uma conta só pode estar conectada com um treinador por vez.

**Escopo das fases alfa e beta (provisório, a rever antes da abertura ao público)**

- Sem confirmação de e-mail no cadastro; cadastro com e-mail já existente redireciona ao signin, revelando que o e-mail está cadastrado.
- Termos de serviço e política de privacidade são placeholders e precisam estar escritos e publicados, em conformidade com a LGPD, antes da abertura ao público.
- Botões da toolbar além de Mochila, Armazenamento e Configurações são placeholders; a interação entre jogadores na cidade não existe; o painel de estatísticas de batalha não existe.

**Pendências de produto (ainda não decididas)**

- Fórmulas de nível, de experiência e dos atributos atuais (constantes d e k); tabela completa de efetividade entre elementos; catálogo de habilidades; curvas e chances de drop; espécies iniciais exatas.
- Itens do treinador (catálogo e obtenção); onde e como é feita a doação que gera diamantes; valor final do diamante; se a conta paga se renova sozinha.
- Missões e missões diárias; o que o jogador pode fazer com os outros jogadores na cidade; o que acontece com os itens obtidos ao finalizar a caçada; o que é renderizado no canvas durante a caçada.

## Brand Commitments

- Nome do produto: **Creatures** (wordmark CREATURES).
- Todo o texto do jogo é escrito em português do Brasil.
- O servidor é a única fonte da verdade do estado do jogo; o cliente nunca altera estado por conta própria.
- Plataforma web: desktop e celular, com o celular restrito à horizontal; não existe app nativo.
- Escopo honesto para a fase: placeholders explícitos em vez de conteúdo inventado (termos, missões, interação social).

## Evidence on Hand

- Documentação interna completa: regras em `docs/game/`, arquitetura e stack em `docs/technical/`, design system em `docs/technical/client/DESIGN_SYSTEM.md`.
- Mockups ilustrativos de estrutura em `docs/assets/` (signin, signup, lista de treinadores, tela do jogo, caçada, loja, mochila, armazenamento, analisador) — conferem disposição, não design final.
- Cliente implementado em `apps/client`, com galeria viva do design system na rota pública `/design-system`.
- Ausências que trabalho futuro não pode inventar: depoimentos, usuários reais, dados de uso, benchmarks, números de público e preços finais.

## Product Principles

1. **Progresso sem presença.** A caçada continua offline e a stamina dita o ritmo; o jogo respeita quem joga em momentos curtos.
2. **O servidor decide, o cliente mostra.** Nenhuma regra de jogo vive no cliente.
3. **Criatura é o centro.** Indivíduos com potencial próprio, captura com risco real e drops que fazem sentido para o que a criatura é.
4. **Cidade é a base segura.** Cura gratuita, loja e convivência; a caçada é o risco, a cidade é o descanso.
5. **Escopo honesto para a fase.** Alfa/beta mantém placeholders explícitos em vez de inventar conteúdo.

## Accessibility & Inclusion

- Cor nunca é a única informação: vida, stamina e elemento vêm sempre acompanhados de ícone ou rótulo (cerca de 8% dos homens têm alguma deficiência de visão de cores).
- Alvo de toque mínimo de 44px, e 48px para as ações importantes.
- Foco visível por outline externo; movimento reduzido é respeitado; texto renderizado sem suavização forçada.
- O celular funciona apenas na horizontal; o modo retrato é coberto por um overlay explicativo, sem depender de cor.
