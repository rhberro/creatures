export type ScaleInputs = {
  max: number;
  min: number;
  reference: number;
  viewportWidth: number;
};

export function computeScale(inputs: ScaleInputs): number {
  const { max, min, reference, viewportWidth } = inputs;
  if (reference <= 0) {
    return min;
  }
  const raw = viewportWidth / reference;
  if (raw < min) {
    return min;
  }
  if (raw > max) {
    return max;
  }
  return raw;
}
