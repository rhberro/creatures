import { Dialog as ChakraDialog, useSlotRecipe } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { layerRecipe, type LayerWeight } from '~/theme/recipes/layer';

import type { LayerPartProps } from './layer.types';

/**
 * O cabecalho da camada: o `Dialog.Title` do Chakra.
 *
 * E o `Title` que da o rotulo acessivel da camada (`aria-labelledby`).
 */
export function LayerHeader(props: LayerHeaderProps): ReactElement {
  const { children, weight } = props;
  const recipe = useSlotRecipe({ recipe: layerRecipe });
  const styles = recipe({ weight });
  return <ChakraDialog.Title css={styles.title}>{children}</ChakraDialog.Title>;
}

export type LayerHeaderProps = LayerPartProps & {
  weight: LayerWeight;
};
