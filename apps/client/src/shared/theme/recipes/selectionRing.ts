import { defineRecipe } from '@chakra-ui/react';

/**
 * O anel de selecao.
 *
 * Cruza camadas: o `Slot` (base), o `TrainerCard` e o `StarterCard`
 * (dominio) e os cards da galeria marcam a selecao do mesmo jeito. Por isso
 * ele vive no tema, e nao em um componente.
 *
 * A selecao e a **borda do proprio elemento**, desenhada por um
 * pseudo-elemento por cima do conteudo: e o que sobrevive a um card com
 * imagem por baixo.
 */
export const selectionRingRecipe = defineRecipe({
  base: {
    borderColor: '{colors.state.selected}',
    borderRadius: 'sm',
    borderWidth: '2px',
    content: '""',
    inset: '0',
    pointerEvents: 'none',
    position: 'absolute',
  },
  defaultVariants: { size: 'md' },
  variants: {
    size: {
      md: { borderWidth: '2px' },
      sm: { borderWidth: '1px' },
    },
  },
});

export type SelectionRingSize = 'md' | 'sm';
