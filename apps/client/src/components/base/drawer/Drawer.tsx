import type { ReactElement } from 'react';

import { LayerRoot } from '~/components/base/layer/LayerRoot';

import type { DrawerProps } from './drawer.types';

const DRAWER_WIDTH = '320px';

/**
 * O drawer: a lateral.
 *
 * Encostada na borda direita, com botao de fechar no canto. Fecha pelo ESC e
 * pelo clique no fundo.
 */
export function Drawer(props: DrawerProps): ReactElement {
  const {
    children,
    contained = false,
    height,
    isOpen,
    label,
    onClose,
    width = DRAWER_WIDTH,
  } = props;
  return (
    <LayerRoot
      closable
      contained={contained}
      height={height}
      isOpen={isOpen}
      label={label}
      onClose={onClose}
      weight="drawer"
      width={width}
    >
      {children}
    </LayerRoot>
  );
}
