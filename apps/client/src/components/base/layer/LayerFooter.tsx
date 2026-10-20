import { Dialog as ChakraDialog, useSlotRecipe } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { layerRecipe, type LayerWeight } from '~/theme/recipes/layer';

import type { LayerPartProps } from './layer.types';

/**
 * O rodape da camada: onde ficam as acoes.
 */
export function LayerFooter(props: LayerFooterProps): ReactElement {
  const { children, weight } = props;
  const recipe = useSlotRecipe({ recipe: layerRecipe });
  const styles = recipe({ weight });
  return <ChakraDialog.Footer css={styles.footer}>{children}</ChakraDialog.Footer>;
}

export type LayerFooterProps = LayerPartProps & {
  weight: LayerWeight;
};
