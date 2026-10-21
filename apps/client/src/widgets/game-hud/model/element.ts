import type { Element } from '@creatures/contracts/species';

export type ElementPresentation = {
  color: string;
  label: string;
};

/**
 * The name of the element, in the language of the interface.
 *
 * The label is what carries the element. The color of the theme only
 * reinforces it, because a color alone is not information.
 */
export const ELEMENT_LABELS: Record<Element, string> = {
  fire: 'Fogo',
  neutral: 'Neutro',
  plant: 'Planta',
  water: 'Água',
};

/**
 * The color of the element.
 *
 * The theme has an `element` namespace with one token per element, and the
 * color of the theme only reinforces the element: the label is what carries
 * the information, because a color alone is not information.
 */
export const ELEMENT_COLORS: Record<Element, string> = {
  fire: 'element.fire',
  neutral: 'element.neutral',
  plant: 'element.plant',
  water: 'element.water',
};

/**
 * The presentation of an element.
 *
 * An element the interface does not know has no presentation: the interface
 * says nothing about it instead of saying that it is neutral.
 */
export function readElementPresentation(
  element: Element | null | undefined,
): ElementPresentation | null {
  if (element === null || element === undefined || !(element in ELEMENT_LABELS)) {
    return null;
  }
  return { color: ELEMENT_COLORS[element], label: ELEMENT_LABELS[element] };
}
