import { arcane, base, blood, ember, frost, gold, verdant } from './tokens';

export const SCALE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

export type ScaleStep = (typeof SCALE_STEPS)[number];

export type Scale = Record<ScaleStep, { value: string }>;

export type FoundationSwatch = {
  hex: string;
  step: ScaleStep;
};

export type FoundationScale = {
  label: string;
  role: string;
  swatches: FoundationSwatch[];
};

export type TypeSample = {
  label: string;
  style: string;
  specimen: string;
};

const SCALES: ReadonlyArray<{ label: string; role: string; scale: Scale }> = [
  { label: 'Base', role: 'Fundo, texto e bordas', scale: base },
  { label: 'Arcane', role: 'Destaque, seleção e ação principal', scale: arcane },
  { label: 'Frost', role: 'Secundário, diamante e estado disponível', scale: frost },
  { label: 'Gold', role: 'Gold coin, a moeda do jogo', scale: gold },
  { label: 'Blood', role: 'Perigo, dano e vida', scale: blood },
  { label: 'Ember', role: 'Elemento fogo', scale: ember },
  { label: 'Verdant', role: 'Elemento planta', scale: verdant },
];

export const FOUNDATION_SCALES: FoundationScale[] = SCALES.map(toFoundationScale);

export const TYPE_SAMPLES: TypeSample[] = [
  { label: 'Display', specimen: 'Loja da Cidade', style: 'display' },
  { label: 'Title', specimen: 'Áreas de Caçada', style: 'title' },
  { label: 'Name', specimen: 'Cinzarra', style: 'name' },
  { label: 'Section', specimen: 'Consumíveis', style: 'section' },
  { label: 'Label', specimen: 'Iniciar Caçada', style: 'label' },
  { label: 'Meta', specimen: 'Nível 12 · Fogo', style: 'meta' },
  { label: 'Body', specimen: 'Poção de Cura restaurou 40 pontos de vida.', style: 'body' },
  { label: 'Numeric', specimen: '1.482,50', style: 'numeric' },
];

function toFoundationScale(entry: { label: string; role: string; scale: Scale }): FoundationScale {
  const { label, role, scale } = entry;
  const swatches = SCALE_STEPS.map(toSwatch(scale));
  return { label, role, swatches };
}

function toSwatch(scale: Scale) {
  return function buildSwatch(step: ScaleStep): FoundationSwatch {
    return { hex: scale[step].value, step };
  };
}
