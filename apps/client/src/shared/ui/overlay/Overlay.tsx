import { Dialog, Drawer } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import type { LayerWeight } from '~/shared/theme';

type OverlayProps = {
  contained?: boolean;
  weight: LayerWeight;
};

/**
 * A cortina da camada.
 *
 * O `Backdrop` vem do namespace do peso — `Drawer` na lateral, `Dialog` nas
 * demais — porque o contexto de estilos e o da raiz.
 */
export function Overlay(props: OverlayProps): ReactElement {
  const { contained = false, weight } = props;
  const position = contained ? 'absolute' : 'fixed';
  if (weight === 'drawer') {
    return <Drawer.Backdrop bg="bg.overlay" position={position} />;
  }
  return <Dialog.Backdrop bg="bg.overlay" position={position} />;
}
