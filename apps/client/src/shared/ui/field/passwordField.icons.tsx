import type { ReactElement } from 'react';

import { Icon } from '~/shared/ui/icon';

type FieldIconProps = {
  size?: string;
};

/**
 * Os ícones do botão de visibilidade da senha.
 *
 * Vivem no campo porque só o campo de senha os usa: o olho aberto diz que a
 * senha está escondida e o clique mostra, o olho fechado diz o contrário.
 */
export function EyeIcon(props: FieldIconProps): ReactElement {
  const { size } = props;
  return (
    <Icon size={size}>
      <path d="M2.5 12C5 7.5 8.5 5.5 12 5.5S19 7.5 21.5 12C19 16.5 15.5 18.5 12 18.5S5 16.5 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </Icon>
  );
}

export function EyeOffIcon(props: FieldIconProps): ReactElement {
  const { size } = props;
  return (
    <Icon size={size}>
      <path d="M2.5 12C5 7.5 8.5 5.5 12 5.5S19 7.5 21.5 12C19 16.5 15.5 18.5 12 18.5S5 16.5 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
      <path d="M4 4l16 16" />
    </Icon>
  );
}
