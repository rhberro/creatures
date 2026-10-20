type ScaleStep = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950;

type PaletteSteps = {
  contrast: ScaleStep;
  emphasized: ScaleStep;
  focusRing: ScaleStep;
  fg: ScaleStep;
  muted: ScaleStep;
  solid: ScaleStep;
  solidHover: ScaleStep;
  subtle: ScaleStep;
};

type Palette = Record<string, { value: string }>;

function createPalette(name: string, steps: PaletteSteps): Palette {
  function reference(step: ScaleStep): string {
    return `{colors.${name}.${step}}`;
  }

  return {
    contrast: { value: reference(steps.contrast) },
    emphasized: { value: reference(steps.emphasized) },
    fg: { value: reference(steps.fg) },
    focusRing: { value: reference(steps.focusRing) },
    muted: { value: reference(steps.muted) },
    solid: { value: reference(steps.solid) },
    solidHover: { value: reference(steps.solidHover) },
    subtle: { value: reference(steps.subtle) },
  };
}

const STANDARD_STEPS: PaletteSteps = {
  contrast: 50,
  emphasized: 400,
  fg: 300,
  // Passo claro de propósito: o anel de foco precisa contrastar com o fundo
  // solido da paleta, que usa o passo 500.
  focusRing: 300,
  muted: 900,
  solid: 500,
  // Um passo mais claro que o solido: e o hover do botao primario.
  solidHover: 400,
  subtle: 950,
};

export const neutralPalette = {
  border: { value: '{colors.base.700}' },
  contrast: { value: '{colors.base.50}' },
  emphasized: { value: '{colors.base.600}' },
  fg: { value: '{colors.base.300}' },
  focusRing: { value: '{colors.arcane.300}' },
  muted: { value: '{colors.base.700}' },
  solid: { value: '{colors.base.700}' },
  solidHover: { value: '{colors.base.600}' },
  subtle: { value: '{colors.base.800}' },
};

export const radiusTokens = {
  l1: { value: '{radii.xs}' },
  l2: { value: '{radii.md}' },
  l3: { value: '{radii.lg}' },
};

export const surfaceTokens = {
  bg: {
    DEFAULT: { value: '{colors.base.950}' },
    emphasized: { value: '{colors.base.700}' },
    error: { value: '{colors.blood.900}' },
    info: { value: '{colors.frost.900}' },
    inverted: { value: '{colors.base.50}' },
    muted: { value: '{colors.base.800}' },
    overlay: { value: 'rgba(4, 7, 10, 0.78)' },
    panel: { value: '{colors.base.900}' },
    raised: { value: '{colors.base.800}' },
    selected: { value: '{colors.arcane.950}' },
    subtle: { value: '{colors.base.900}' },
    success: { value: '{colors.frost.900}' },
    sunken: { value: '#070A0D' },
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
  ring: {
    DEFAULT: { value: '{colors.arcane.500}' },
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
    disabled: { value: '{colors.base.600}' },
    selected: { value: '{colors.arcane.400}' },
    selectedMuted: { value: '{colors.arcane.900}' },
  },
};

export const paletteTokens = {
  arcane: createPalette('arcane', STANDARD_STEPS),
  blood: createPalette('blood', STANDARD_STEPS),
  blue: createAliasPalette('arcane', STANDARD_STEPS),
  cyan: createAliasPalette('frost', STANDARD_STEPS),
  danger: createAliasPalette('blood', STANDARD_STEPS),
  ember: createPalette('ember', STANDARD_STEPS),
  focus: createAliasPalette('arcane', STANDARD_STEPS),
  frost: createPalette('frost', STANDARD_STEPS),
  gold: createPalette('gold', STANDARD_STEPS),
  gray: neutralPalette,
  green: createAliasPalette('verdant', STANDARD_STEPS),
  orange: createAliasPalette('ember', STANDARD_STEPS),
  ready: createAliasPalette('frost', STANDARD_STEPS),
  red: createAliasPalette('blood', STANDARD_STEPS),
  teal: createAliasPalette('frost', STANDARD_STEPS),
  verdant: createPalette('verdant', STANDARD_STEPS),
  yellow: createAliasPalette('gold', STANDARD_STEPS),
};

function createAliasPalette(source: string, steps: PaletteSteps): Palette {
  function reference(step: ScaleStep): string {
    return `{colors.${source}.${step}}`;
  }

  return {
    contrast: { value: reference(steps.contrast) },
    emphasized: { value: reference(steps.emphasized) },
    fg: { value: reference(steps.fg) },
    focusRing: { value: reference(steps.focusRing) },
    muted: { value: reference(steps.muted) },
    solid: { value: reference(steps.solid) },
    solidHover: { value: reference(steps.solidHover) },
    subtle: { value: reference(steps.subtle) },
  };
}
