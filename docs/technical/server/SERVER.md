# Servidor

Este documento é a porta de entrada da documentação técnica do servidor. Ele indica onde está cada detalhe.

> O servidor vive em `apps/server`. Ele é **a única fonte de verdade do jogo**: toda a simulação acontece aqui, conforme descrito na [Arquitetura](../ARCHITECTURE.md).

## Documentações

| Documentação | Descrição | Quando consultar | Onde consultar |
| --- | --- | --- | --- |
| Stack | As tecnologias escolhidas para o servidor, com as decisões e os motivos por trás de cada uma. | Antes de escrever código do servidor, ao adicionar uma dependência, ou diante de dúvida sobre qual biblioteca usar e por quê. | `docs/technical/server/STACK.md` |
| API de Treinadores | API HTTP para criar, listar, editar e deletar treinadores, e a rota de merge Google. Cobre o roteador próprio, middleware de auth, contratos e testes. | Quando for criar, alterar ou depurar endpoints de trainer ou o roteador HTTP do servidor. | `docs/technical/server/TRAINERS.md` |
