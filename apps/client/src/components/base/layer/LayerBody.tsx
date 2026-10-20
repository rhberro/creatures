import { Dialog as ChakraDialog, useSlotRecipe } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { layerRecipe, type LayerWeight } from '~/theme/recipes/layer';

import type { LayerPartProps } from './layer.types';

/**
 * O corpo da camada: a area que rola quando o conteudo nao cabe.
 */
export function LayerBody(props: LayerBodyProps): ReactElement {
  const { children, weight } = props;
  const recipe = useSlotRecipe({ recipe: layerRecipe });
  const styles = recipe({ weight });
  return <ChakraDialog.Body css={styles.body}>{children}</ChakraDialog.Body>;
}

export type LayerBodyProps = LayerPartProps & {
  weight: LayerWeight;
};
