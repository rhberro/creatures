import type { ReactElement } from 'react';

import { TextField } from '~/shared/ui/field';

const USERNAME_HINT = 'creatures';

/**
 * O campo de usuario oculto.
 *
 * Os gerenciadores de senha precisam de um campo de usuario antes do campo de
 * senha para oferecer a conta salva. Sem ele, o jogador digita o e-mail e a
 * senha de novo a cada entrada.
 *
 * O campo fica escondido e sempre preenchido: ele existe para o gerenciador,
 * nao para o jogador.
 */
export function AuthUsernameField(): ReactElement {
  return (
    <TextField
      autoComplete="username"
      display="none"
      name="username"
      readOnly
      value={USERNAME_HINT}
    />
  );
}
