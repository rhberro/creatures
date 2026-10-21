import { createToaster } from '@chakra-ui/react';

/**
 * A fila de avisos.
 *
 * E o `Toaster` do Chakra (Ark UI): a regiao com `aria-live="polite"`, a
 * pausa quando a aba perde o foco, o empilhamento e a animacao de entrada e
 * saida. Nao se reimplementa aviso em React puro — aviso malfeito e aviso
 * que o leitor de tela nao anuncia.
 */
export const alertToaster = createToaster({
  gap: 8,
  max: 4,
  placement: 'top-end',
});
