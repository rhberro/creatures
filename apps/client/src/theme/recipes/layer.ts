import { defineSlotRecipe } from '@chakra-ui/react';

import { DIVIDER_BOTTOM, DIVIDER_TOP } from '~/theme/divider';

/**
 * A camada: a anatomia de todo dialogo, modal e drawer.
 *
 * Dialog, Modal e Drawer sao o mesmo componente Ark UI com pesos diferentes.
 * A anatomia e a mesma — cabeca, corpo, rodape — e o que muda e o peso:
 * tamanho, alinhamento do titulo e como a camada se fecha.
 *
 * Por isso a anatomia vive em uma receita e os tres componentes publicos
 * sao wrappers finos que escolhem o peso.
 */
export const layerRecipe = defineSlotRecipe({
  base: {
    body: {
      flex: '1',
      minH: '0',
      overflowY: 'auto',
      padding: '4',
    },
    footer: {
      ...DIVIDER_TOP,
      alignItems: 'center',
      display: 'flex',
      gap: '2',
      paddingBlock: '3',
      paddingInline: '4',
    },
    positioner: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4',
    },
    root: {
      bg: 'bg.panel',
      borderColor: 'border',
      borderRadius: 'lg',
      borderWidth: '1px',
      boxShadow: 'overlay',
      display: 'flex',
      flexDirection: 'column',
      marginBlock: '0',
      maxW: 'calc(100% - 32px)',
      position: 'relative',
    },
    title: {
      ...DIVIDER_BOTTOM,
      color: 'fg',
      fontFamily: 'display',
      fontWeight: '700',
      letterSpacing: '0.04em',
      lineHeight: '1.15',
      paddingBlock: '3',
      paddingInline: '4',
      textTransform: 'uppercase',
    },
  },
  defaultVariants: { weight: 'modal' },
  slots: ['root', 'positioner', 'title', 'body', 'footer'],
  variants: {
    weight: {
      // Confirmacao: titulo a esquerda, largura curta, sem botao no canto.
      dialog: {
        title: { fontSize: 'lg', textAlign: 'start' },
      },
      // Lateral: encostada na borda, so a borda esquerda a separa.
      drawer: {
        positioner: { alignItems: 'stretch', justifyContent: 'flex-end', padding: '0' },
        root: { borderRadius: '0', borderWidth: '0 0 0 1px' },
        title: { fontSize: 'xl', textAlign: 'center' },
      },
      // Tela com conteudo interno: titulo centralizado, corpo rolando.
      modal: {
        title: { fontSize: '2xl', textAlign: 'center' },
      },
    },
  },
});

export type LayerWeight = 'dialog' | 'drawer' | 'modal';
