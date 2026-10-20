import { defineSemanticTokens } from '@chakra-ui/react';

type ScaleStep = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950;

/**
 * Papéis de uma paleta.
 *
 * Cada papel é um passo da escala, com o mesmo nome em todas as paletas. É
 * isso que permite ao Chakra resolver `colorPalette="arcane"` sem o
 * componente conhecer o número do passo, e o que permite trocar a escala
 * inteira sem tocar em nenhum componente.
 */
type PaletteSteps = {
  border: ScaleStep;
  borderMuted: ScaleStep;
  contrast: ScaleStep;
  emphasized: ScaleStep;
  fg: ScaleStep;
  muted: ScaleStep;
  solid: ScaleStep;
  solidHover: ScaleStep;
  strong: ScaleStep;
  strongHover: ScaleStep;
  subtle: ScaleStep;
  textSoft: ScaleStep;
};

type Palette = Record<string, { value: string }>;

const STANDARD_STEPS: PaletteSteps = {
  border: 300,
  borderMuted: 700,
  contrast: 50,
  emphasized: 400,
  fg: 300,
  muted: 900,
  solid: 500,
  // Um passo mais claro que o solido: e o hover do botao primario.
  solidHover: 400,
  strong: 600,
  strongHover: 500,
  subtle: 950,
  textSoft: 200,
};

/**
 * A paleta neutra e a escala `base`, mas com pesos proprios: ela nao tem um
 * "solido" saturado, ela e o cinza da interface.
 */
const NEUTRAL_STEPS: PaletteSteps = {
  border: 700,
  borderMuted: 800,
  contrast: 50,
  emphasized: 600,
  fg: 300,
  muted: 700,
  solid: 700,
  solidHover: 600,
  strong: 700,
  strongHover: 600,
  subtle: 800,
  textSoft: 200,
};

/**
 * O anel de foco e o mesmo em toda a interface: um passo claro de `arcane`,
 * que contrasta com o fundo escuro do sistema e tambem com o fundo violeta do
 * botao primario. Sem isto, cada paleta traria a sua propria cor de foco e o
 * sistema teria varios anéis.
 */
const FOCUS_RING = '{colors.arcane.300}';

function createPalette(source: string, steps: PaletteSteps): Palette {
  function reference(step: ScaleStep): string {
    return `{colors.${source}.${step}}`;
  }

  return {
    border: { value: reference(steps.border) },
    borderMuted: { value: reference(steps.borderMuted) },
    contrast: { value: reference(steps.contrast) },
    emphasized: { value: reference(steps.emphasized) },
    fg: { value: reference(steps.fg) },
    focusRing: { value: FOCUS_RING },
    muted: { value: reference(steps.muted) },
    solid: { value: reference(steps.solid) },
    solidHover: { value: reference(steps.solidHover) },
    strong: { value: reference(steps.strong) },
    strongHover: { value: reference(steps.strongHover) },
    subtle: { value: reference(steps.subtle) },
    textSoft: { value: reference(steps.textSoft) },
  };
}

function createAliasPalette(source: string): Palette {
  return createPalette(source, STANDARD_STEPS);
}

export const radiusTokens = {
  l1: { value: '{radii.xs}' },
  l2: { value: '{radii.md}' },
  l3: { value: '{radii.lg}' },
};

export const surfaceTokens = {
  /**
   * As cores de destaque da interface. Um acento e decorativo e estatico: a
   * linha do topo de um painel, a cunha de equipado, a regua da wordmark.
   * Estado de selecao e de foco nao moram aqui — moram em `state` e `focus`.
   */
  accent: {
    arcane: { value: '{colors.arcane.500}' },
    frost: { value: '{colors.frost.500}' },
    gold: { value: '{colors.gold.500}' },
  },
  bg: {
    DEFAULT: { value: '{colors.base.950}' },
    emphasized: { value: '{colors.base.700}' },
    error: { value: '{colors.blood.900}' },
    info: { value: '{colors.frost.900}' },
    inverted: { value: '{colors.base.50}' },
    overlay: { value: '{colors.scrim}' },
    panel: { value: '{colors.base.900}' },
    raised: { value: '{colors.base.800}' },
    selected: { value: '{colors.arcane.950}' },
    success: { value: '{colors.frost.900}' },
    sunken: { value: '{colors.sunken}' },
    // A cortina que cobre o conteudo de um slot em recarga.
    veil: { value: '{colors.base.950}' },
    warning: { value: '{colors.ember.900}' },
  },
  border: {
    DEFAULT: { value: '{colors.base.700}' },
    emphasized: { value: '{colors.base.600}' },
    error: { value: '{colors.blood.600}' },
    info: { value: '{colors.frost.600}' },
    inverted: { value: '{colors.base.300}' },
    muted: { value: '{colors.base.800}' },
    selected: { value: '{colors.arcane.300}' },
    subtle: { value: '{colors.base.900}' },
    success: { value: '{colors.frost.600}' },
    warning: { value: '{colors.ember.600}' },
  },
  fg: {
    DEFAULT: { value: '{colors.base.50}' },
    error: { value: '{colors.blood.400}' },
    info: { value: '{colors.frost.400}' },
    inverted: { value: '{colors.base.950}' },
    muted: { value: '{colors.base.200}' },
    subtle: { value: '{colors.base.300}' },
    success: { value: '{colors.frost.400}' },
    warning: { value: '{colors.ember.400}' },
  },
  /**
   * O anel de foco do sistema. Configurado em um lugar so, e nao replicado
   * em cada componente.
   */
  focus: {
    ring: { value: FOCUS_RING },
  },
};

export const gameTokens = {
  currency: {
    diamond: { value: '{colors.arcane.400}' },
    gold: { value: '{colors.gold.400}' },
  },
  element: {
    fire: { value: '{colors.ember.400}' },
    neutral: { value: '{colors.base.300}' },
    plant: { value: '{colors.verdant.400}' },
  },
  hp: {
    DEFAULT: { value: '{colors.blood.400}' },
    contrast: { value: '{colors.base.50}' },
    muted: { value: '{colors.blood.300}' },
    subtle: { value: '{colors.blood.900}' },
  },
  stamina: {
    DEFAULT: { value: '{colors.arcane.400}' },
    contrast: { value: '{colors.base.950}' },
    muted: { value: '{colors.arcane.300}' },
    subtle: { value: '{colors.arcane.900}' },
  },
  state: {
    active: { value: '{colors.arcane.500}' },
    disabled: { value: '{colors.base.600}' },
    equipped: { value: '{colors.frost.500}' },
    selected: { value: '{colors.arcane.400}' },
    selectedMuted: { value: '{colors.arcane.900}' },
  },
};

export const paletteTokens = {
  arcane: createPalette('arcane', STANDARD_STEPS),
  blood: createPalette('blood', STANDARD_STEPS),
  blue: createAliasPalette('arcane'),
  cyan: createAliasPalette('frost'),
  danger: createAliasPalette('blood'),
  ember: createPalette('ember', STANDARD_STEPS),
  focus: createAliasPalette('arcane'),
  frost: createPalette('frost', STANDARD_STEPS),
  gold: createPalette('gold', STANDARD_STEPS),
  gray: createPalette('base', NEUTRAL_STEPS),
  green: createAliasPalette('verdant'),
  orange: createAliasPalette('ember'),
  ready: createAliasPalette('frost'),
  red: createAliasPalette('blood'),
  teal: createAliasPalette('frost'),
  verdant: createPalette('verdant', STANDARD_STEPS),
  yellow: createAliasPalette('gold'),
};

/**
 * Tokens semanticos.
 *
 * A camada que a interface consome: `bg.panel`, `fg.muted`, `border`,
 * `arcane.strong`. Nenhum componente aponta para a escala crua.
 */
export const semanticTokens = defineSemanticTokens({
  colors: {
    ...surfaceTokens,
    ...gameTokens,
    ...paletteTokens,
  },
  radii: radiusTokens,
});
