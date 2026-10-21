import { Dialog as ChakraDialog, Drawer as ChakraDrawer, useSlotRecipe } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { layerRecipe, type LayerWeight } from '~/shared/theme';

import type { LayerPartProps } from './layer.types';

/**
 * O corpo da camada: a area que rola quando o conteudo nao cabe.
 *
 * O `Body` vem do namespace do peso — `Drawer` na lateral, `Dialog` nas demais.
 */
export function LayerBody(props: LayerBodyProps): ReactElement {
  const { children, weight } = props;
  const recipe = useSlotRecipe({ recipe: layerRecipe });
  const styles = recipe({ weight });
  if (weight === 'drawer') {
    return <ChakraDrawer.Body css={styles.body}>{children}</ChakraDrawer.Body>;
  }
  return <ChakraDialog.Body css={styles.body}>{children}</ChakraDialog.Body>;
}

export type LayerBodyProps = LayerPartProps & {
  weight: LayerWeight;
};
