import { useEffect } from 'react';

import {
  INTERFACE_BASE_FONT_SIZE,
  INTERFACE_MAX_SCALE,
  INTERFACE_MIN_SCALE,
  INTERFACE_REFERENCE_WIDTH,
} from './constants';
import { computeScale, type ScaleInputs } from './scale';

function applyScale(): void {
  const inputs: ScaleInputs = {
    max: INTERFACE_MAX_SCALE,
    min: INTERFACE_MIN_SCALE,
    reference: INTERFACE_REFERENCE_WIDTH,
    viewportWidth: window.innerWidth,
  };
  const scale = computeScale(inputs);
  const size = INTERFACE_BASE_FONT_SIZE * scale;
  document.documentElement.style.fontSize = `${size}px`;
}

function teardownResize(): void {
  window.removeEventListener('resize', applyScale);
}

function mount(): () => void {
  applyScale();
  window.addEventListener('resize', applyScale);
  return teardownResize;
}

export function InterfaceScale(): null {
  useEffect(mount, []);
  return null;
}
