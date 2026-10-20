/**
 * Escala de raio do design system.
 *
 * Todos os `borderRadius` do Chakra (`xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`)
 * e os raios semânticos (`radii.l1`, `radii.l2`, `radii.l3`) saem daqui.
 *
 * A escala é concêntrica e curta de propósito: a interface é densa e geométrica,
 * e o raio existe para suavizar a borda, não para arredondar a forma.
 * `full` é para o que égeometricamente redondo — avatar, circular, pastilha.
 */
export const radii = {
  '2xl': { value: '10px' },
  '3xl': { value: '14px' },
  full: { value: '9999px' },
  lg: { value: '6px' },
  md: { value: '4px' },
  sm: { value: '3px' },
  xl: { value: '8px' },
  xs: { value: '2px' },
};
