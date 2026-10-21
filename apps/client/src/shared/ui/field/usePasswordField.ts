import { useState } from 'react';

import { HIDE_PASSWORD_LABEL, SHOW_PASSWORD_LABEL } from './passwordField.constants';

export type PasswordFieldState = {
  buttonLabel: string;
  inputType: 'password' | 'text';
  isVisible: boolean;
  toggleVisibility: () => void;
};

/**
 * O estado da visibilidade da senha.
 *
 * A senha fica escondida por padrão; o botão do campo é quem troca o tipo do
 * input entre `password` e `text`. O rótulo do botão acompanha o estado,
 * para que o leitor de tela anuncie o que o próximo clique vai fazer.
 */
export function usePasswordField(): PasswordFieldState {
  const [isVisible, setIsVisible] = useState(false);

  function toggleVisibility(): void {
    setIsVisible(!isVisible);
  }

  return {
    buttonLabel: isVisible ? HIDE_PASSWORD_LABEL : SHOW_PASSWORD_LABEL,
    inputType: isVisible ? 'text' : 'password',
    isVisible,
    toggleVisibility,
  };
}
