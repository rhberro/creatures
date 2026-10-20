/**
 * Anel de foco do sistema.
 *
 * O Chakra v3 usa `focusVisibleRing="outside"` por padrao: um contorno de 2px
 * **fora** do elemento, com a cor do token `focusRing` da paleta. O contorno
 * interno (borda) sumia em dois casos reais: no botao primario, cuja cor de
 * foco era a mesma do fundo, e nos cards, cujo conteudo ficava por cima do
 * anel.
 *
 * A cor e um passo claro do acento. Sobre o fundo escuro do sistema ela
 * contrasta, e sobre o fundo violeta do botao primario tambem.
 */
export const FOCUS_RING = {
  outline: '2px solid',
  outlineColor: '{colors.arcane.300}',
  outlineOffset: '2px',
};
