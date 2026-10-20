import { useRecipe, type SystemStyleObject } from '@chakra-ui/react';

import { selectionRingRecipe, type SelectionRingSize } from './selectionRing';

/**
 * Os estilos do anel de selecao, prontos para o `_before`.
 *
 * Uso: `<Box _before={isSelected ? ring : undefined} />`.
 */
export function useSelectionRing(size: SelectionRingSize = 'md'): SystemStyleObject {
  const recipe = useRecipe({ recipe: selectionRingRecipe });
  return recipe({ size });
}
