# Jogo

Este documento é a porta de entrada para todas as funcionalidades do jogo, contém uma tabela que funciona como um índice com todas as funcionalidades existentes, uma breve explicação e quando consultar cada uma.

| Fluxo | Descrição | Quando consultar | Documentação |
| --- | --- | --- | --- |
| Autenticação | Todo o processo de autenticação, desde o acesso a conta a criação e visualização dos treinadores. | Quando precisar de alguma informação do processo de autenticação, criação de contas e treinadores. | `docs/game/AUTHENTICATION.md` |
| Tela do Jogo | A tela principal do jogo, onde o usuário passa a maior parte do tempo: rendering do jogo, menus, ações e acompanhamento do que está acontecendo. | Quando precisar de informação sobre a tela principal, o rendering, os menus ou as ações do jogo. | `docs/game/PLAY_SCREEN.md` |
| Seleção de Área de Caça | O modal que o jogador abre para escolher em que área vai caçar, com a lista de áreas e a busca. | Quando precisar de informação sobre a escolha da área de caça, a lista de áreas ou a busca. | `docs/game/HUNT_AREA_SELECT.md` |
| Detalhes da Área de Caça | O drawer com as informações de uma área de caça e o botão de iniciar a caçada. | Quando precisar de informação sobre o drawer de detalhes, as criaturas e os itens de uma área, ou o início da caçada. | `docs/game/HUNT_AREA_DETAILS.md` |
| Caçada | A atividade de caça: o que acontece quando o treinador está em uma área de caça. | Quando precisar de informação sobre a caçada em si, a entrada, a troca e o reinício de área. | `docs/game/HUNT.md` |
