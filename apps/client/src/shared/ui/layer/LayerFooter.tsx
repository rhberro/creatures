import { Dialog as ChakraDialog, Drawer as ChakraDrawer, useSlotRecipe } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { layerRecipe, type LayerWeight } from '~/shared/theme';

import type { LayerPartProps } from './layer.types';

/**
 * O rodape da camada: onde ficam as acoes.
 *
 * O `Footer` vem do namespace do peso — `Drawer` na lateral, `Dialog` nas demais.
 */
export function LayerFooter(props: LayerFooterProps): ReactElement {
  const { children, weight } = props;
  const recipe = useSlotRecipe({ recipe: layerRecipe });
  const styles = recipe({ weight });
  if (weight === 'drawer') {
    return <ChakraDrawer.Footer css={styles.footer}>{children}</ChakraDrawer.Footer>;
  }
  return <ChakraDialog.Footer css={styles.footer}>{children}</ChakraDialog.Footer>;
}

export type LayerFooterProps = LayerPartProps & {
  weight: LayerWeight;
};
