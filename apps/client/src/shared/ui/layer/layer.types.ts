import type { ReactNode } from 'react';

import type { LayerWeight } from '~/shared/theme';

export type LayerRootProps = {
  children: ReactNode;
  closable?: boolean;
  contained?: boolean;
  height?: string;
  isOpen: boolean;
  /**
   * O nome acessível da camada. So e preciso quando a camada nao tem
   * cabecalho — sem ele, o leitor de tela anuncia um dialogo sem nome.
   */
  label?: string;
  onClose: () => void;
  weight: LayerWeight;
  width?: string;
};

export type LayerPartProps = {
  children: ReactNode;
};
