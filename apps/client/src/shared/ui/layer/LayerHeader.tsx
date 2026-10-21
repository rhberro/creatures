import { Dialog as ChakraDialog, Drawer as ChakraDrawer, useSlotRecipe } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { layerRecipe, type LayerWeight } from '~/shared/theme';

import type { LayerPartProps } from './layer.types';

/**
 * O cabecalho da camada: o `Dialog.Title` do Chakra.
 *
 * E o `Title` que da o rotulo acessivel da camada (`aria-labelledby`). Na
 * lateral, o `Title` vem do `Drawer` — o namespace do peso, porque o contexto
 * de estilos e o da raiz.
 */
export function LayerHeader(props: LayerHeaderProps): ReactElement {
  const { children, weight } = props;
  const recipe = useSlotRecipe({ recipe: layerRecipe });
  const styles = recipe({ weight });
  if (weight === 'drawer') {
    return <ChakraDrawer.Title css={styles.title}>{children}</ChakraDrawer.Title>;
  }
  return <ChakraDialog.Title css={styles.title}>{children}</ChakraDialog.Title>;
}

export type LayerHeaderProps = LayerPartProps & {
  weight: LayerWeight;
};
