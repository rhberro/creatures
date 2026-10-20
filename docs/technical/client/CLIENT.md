# Cliente

Este documento é a porta de entrada da documentação técnica do cliente. Ele indica onde está cada detalhe.

> O cliente vive em `apps/client`. Ele **não decide nada sobre o jogo**. Toda a simulação acontece no servidor, conforme descrito na [Arquitetura](../ARCHITECTURE.md).

## Documentações

| Documentação | Descrição | Quando consultar | Onde consultar |
| --- | --- | --- | --- |
| Stack | As tecnologias escolhidas para o cliente, com as decisões e os motivos por trás de cada uma. | Antes de escrever código do cliente, ao adicionar uma dependência, ou diante de dúvida sobre qual biblioteca usar e por quê. | `docs/technical/client/STACK.md` |
| Design System | Os tokens do design system, a direção visual e as regras de uso da interface. | Antes de criar ou alterar qualquer elemento visual, e diante de dúvida sobre cor, tipografia, espaçamento ou estado. | `docs/technical/client/DESIGN_SYSTEM.md` |
| Autenticação | Arquitetura técnica do módulo de autenticação no cliente: máquina de estados, store, adapter, roteamento protegido e fluxos. | Quando for criar, alterar ou depurar código relacionado a sessão, login, signup, OAuth ou recuperação de senha no cliente. | `docs/technical/client/AUTH.md` |
