import { defineSlotRecipe } from '@chakra-ui/react';

import { DIVIDER_BOTTOM, DIVIDER_TOP } from '~/shared/theme/divider';

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
    close: {
      position: 'absolute',
      right: '-16px',
      top: '-16px',
      zIndex: '1',
    },
    footer: {
      ...DIVIDER_TOP,
      alignItems: 'center',
      display: 'flex',
      flexShrink: '0',
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
      flexShrink: '0',
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
  slots: ['root', 'positioner', 'title', 'body', 'footer', 'close'],
  variants: {
    weight: {
      // Confirmacao: titulo a esquerda, largura curta, sem botao no canto.
      dialog: {
        title: { fontSize: 'lg', textAlign: 'start' },
      },
      // Lateral: encostada na borda, so a borda esquerda a separa. A lateral
      // ocupa a altura inteira do positioner e o cabecalho e o rodape ficam
      // fixos enquanto o corpo rola. O botao de fechar mora dentro da area
      // visivel, porque a lateral nao tem folga ao redor como o modal.
      drawer: {
        close: { right: '2', top: '2' },
        positioner: { alignItems: 'stretch', justifyContent: 'flex-end', padding: '0' },
        // A margem do `Content` do Chakra e `auto` no `Dialog` — ela centraliza
        // a camada no positioner e vence o `justify-content: flex-end`. Zerando
        // a margem inteira, a lateral encosta na borda direita, com ou sem a
        // receita do `Dialog` por baixo.
        root: {
          borderRadius: '0',
          borderWidth: '0 0 0 1px',
          height: '100%',
          margin: '0',
          maxW: '100%',
        },
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
