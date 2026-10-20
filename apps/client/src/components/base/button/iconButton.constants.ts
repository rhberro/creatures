import type { IconButtonTone } from './iconButton.types';

export type IconButtonToneColors = {
  background: string;
  borderColor: string;
  borderWidth: string;
  boxShadow: string;
  color: string;
  hoverBackground: string;
  hoverColor: string;
};

/**
 * As cores do botão de ícone, por tom.
 *
 * Todas apontam para tokens semânticos: as de papel (`bg.raised`,
 * `fg.muted`) e as de paleta (`arcane.strong`, `blood.borderMuted`). Nenhum
 * passo cru de escala entra em componente.
 */
export const ICON_BUTTON_TONE: Record<IconButtonTone, IconButtonToneColors> = {
  danger: {
    background: 'bg.raised',
    borderColor: 'blood.borderMuted',
    borderWidth: '1px',
    boxShadow: 'sm',
    color: 'blood.emphasized',
    hoverBackground: 'blood.muted',
    hoverColor: 'blood.textSoft',
  },
  dangerGhost: {
    background: 'transparent',
    borderColor: 'transparent',
    borderWidth: '0',
    boxShadow: 'none',
    color: 'fg.subtle',
    hoverBackground: 'blood.muted',
    hoverColor: 'blood.textSoft',
  },
  ghost: {
    background: 'transparent',
    borderColor: 'transparent',
    borderWidth: '0',
    boxShadow: 'none',
    color: 'fg.subtle',
    hoverBackground: 'bg.emphasized',
    hoverColor: 'fg',
  },
  neutral: {
    background: 'bg.raised',
    borderColor: 'transparent',
    borderWidth: '0',
    boxShadow: 'sm',
    color: 'fg.muted',
    hoverBackground: 'bg.emphasized',
    hoverColor: 'fg',
  },
  primary: {
    background: 'arcane.strong',
    borderColor: 'arcane.border',
    borderWidth: '1px',
    boxShadow: 'sm',
    color: 'arcane.contrast',
    hoverBackground: 'arcane.strongHover',
    hoverColor: 'arcane.contrast',
  },
  secondary: {
    background: 'bg.panel',
    borderColor: 'border.emphasized',
    borderWidth: '1px',
    boxShadow: 'sm',
    color: 'fg.muted',
    hoverBackground: 'bg.raised',
    hoverColor: 'fg',
  },
};
