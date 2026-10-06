# Jogo

Documentação central do design e das regras do jogo. Toda decisão de produto ou gameplay deve partir daqui — antes de implementar qualquer mecânica, verifique se ela já está descrita e, se não estiver, registre-a antes de codar.

## Índice

| Documento                                        | Propósito                                                                               |
| ------------------------------------------------ | --------------------------------------------------------------------------------------- |
| `@docs/game/README.md`                           | Visão geral do jogo: lore, papéis (Criatura/Treinador), relação PvE/PvP. Leia primeiro. |
| `@docs/game/creatures/CREATURE.md`               | Como funciona o papel de Criatura e o que está disponível para quem joga como Criatura. |
| `@docs/game/creatures/TRAINING_AS_A_CREATURE.md` | Como Criaturas treinam (caça como treino).                                              |
| `@docs/game/trainers/TRAINER.md`                 | Como funciona o papel de Treinador, time e atributos.                                   |
| `@docs/game/trainers/TRAINING_AS_A_TRAINER.md`   | Academia, biblioteca, treino online/offline e os quatro atributos.                      |
| `@docs/game/mechanics/README.md`                 | Índice das mecânicas transversais (elementos, batalha, etc.).                           |
| `@docs/game/mechanics/ELEMENTS.md`               | Os seis elementos, vantagens e fraquezas.                                               |

## Quando consultar

- Antes de implementar qualquer mecânica, habilidade ou regra de jogo.
- Antes de responder o usuário sobre regras, balanceamento ou fluxo de gameplay.
- Ao revisar código que toca entidades de jogo (criaturas, treinadores, batalhas, elementos).
- Ao tomar decisões de produto que afetam o que o jogador vê ou faz.
