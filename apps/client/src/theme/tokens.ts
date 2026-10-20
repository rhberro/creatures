type ScaleStep = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950;

type ScaleValue = { value: string };

type Scale = Record<ScaleStep, ScaleValue>;

const SCALE_STEPS: readonly ScaleStep[] = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

function createScale(colors: readonly string[]): Scale {
  if (colors.length !== SCALE_STEPS.length) {
    throw new Error(`Escala de cor precisa de ${SCALE_STEPS.length} valores`);
  }
  const scale = {} as Scale;
  for (const [index, step] of SCALE_STEPS.entries()) {
    scale[step] = { value: colors[index] };
  }
  return scale;
}

export const base = createScale([
  '#F0F3F6',
  '#D6DEE5',
  '#ADB9C5',
  '#8090A0',
  '#5A6A7B',
  '#3F4E5D',
  '#303E4B',
  '#26313C',
  '#1C242C',
  '#131A20',
  '#0A0E12',
]);

export const arcane = createScale([
  '#F5F2FD',
  '#E9E3FB',
  '#D3C7F6',
  '#B8A4EF',
  '#9A7BE0',
  '#7D5BC6',
  '#6447A0',
  '#4F3879',
  '#402E5E',
  '#36274B',
  '#1D1330',
]);

export const frost = createScale([
  '#E7F9FC',
  '#C5F0F8',
  '#8FE0F1',
  '#55C9E1',
  '#2AAFC9',
  '#168DA8',
  '#157287',
  '#165B6C',
  '#184C5B',
  '#1A424F',
  '#04252E',
]);

export const gold = createScale([
  '#FBF7EE',
  '#F5EBD3',
  '#EBD9B0',
  '#DEC287',
  '#CBA45E',
  '#B0863F',
  '#8E6A31',
  '#725429',
  '#5E4626',
  '#503B23',
  '#2C1F10',
]);

export const blood = createScale([
  '#FBEFEE',
  '#F6D9D6',
  '#EAB3AE',
  '#DA8680',
  '#C45C55',
  '#A8433C',
  '#86332E',
  '#6C2B28',
  '#592624',
  '#4C2321',
  '#290F0E',
]);

export const ember = createScale([
  '#FDF2EC',
  '#F9DFD0',
  '#F2BFA2',
  '#E89A70',
  '#DB7448',
  '#C25A2E',
  '#9D4524',
  '#7C381F',
  '#65301E',
  '#552A1C',
  '#2B1109',
]);

export const verdant = createScale([
  '#F5F9EA',
  '#E9F0CB',
  '#D4E1A4',
  '#BACD7C',
  '#9CB45A',
  '#7D9440',
  '#62752F',
  '#4E5C28',
  '#404C25',
  '#374223',
  '#1B210C',
]);

export { radii } from './radius';

export const colors = {
  arcane,
  base,
  black: { value: '#0A0E12' },
  blood,
  ember,
  frost,
  gold,
  verdant,
  white: { value: '#F0F3F6' },
};

export const fonts = {
  body: { value: "'Barlow', system-ui, sans-serif" },
  display: { value: "'Cinzel', 'Barlow Semi Condensed', Georgia, serif" },
  heading: { value: "'Barlow Semi Condensed', 'Barlow', system-ui, sans-serif" },
  mono: { value: "'JetBrains Mono', ui-monospace, monospace" },
};

export const shadows = {
  focus: { value: '0 0 0 1px rgba(255, 255, 255, 0.14), 0 0 0 3px rgba(154, 123, 224, 0.45)' },
  inner: { value: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)' },
  lg: {
    value:
      '0 0 0 1px rgba(255, 255, 255, 0.1), 0 4px 10px -4px rgba(0, 0, 0, 0.55), 0 20px 48px -12px rgba(0, 0, 0, 0.65)',
  },
  md: {
    value:
      '0 0 0 1px rgba(255, 255, 255, 0.09), 0 2px 6px -2px rgba(0, 0, 0, 0.55), 0 10px 28px -8px rgba(0, 0, 0, 0.6)',
  },
  overlay: {
    value:
      '0 0 0 1px rgba(255, 255, 255, 0.12), 0 12px 28px -10px rgba(0, 0, 0, 0.6), 0 40px 90px -24px rgba(0, 0, 0, 0.72), inset 0 1px 0 0 rgba(255, 255, 255, 0.06)',
  },
  raised: {
    value:
      '0 0 0 1px rgba(255, 255, 255, 0.09), 0 2px 6px -2px rgba(0, 0, 0, 0.55), 0 10px 28px -8px rgba(0, 0, 0, 0.6), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
  },
  recessed: {
    value:
      'inset 0 1px 2px 0 rgba(0, 0, 0, 0.55), inset 0 0 0 1px rgba(255, 255, 255, 0.05), inset 0 -1px 0 0 rgba(255, 255, 255, 0.03)',
  },
  sm: { value: '0 0 0 1px rgba(255, 255, 255, 0.08), 0 1px 2px -1px rgba(0, 0, 0, 0.5)' },
  xl: {
    value:
      '0 0 0 1px rgba(255, 255, 255, 0.12), 0 8px 20px -8px rgba(0, 0, 0, 0.6), 0 36px 80px -20px rgba(0, 0, 0, 0.7)',
  },
  xs: { value: '0 0 0 1px rgba(255, 255, 255, 0.06)' },
};
