import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { Button } from '~/shared/ui/button';

const QUANTITY_STEPS: readonly number[] = [10, 100, 1000];

export type StoreQuantityStepsProps = {
  /** Adds a step to the quantity of the field. */
  onStep(step: number): void;
};

/**
 * The buttons of the sum of the quantity.
 *
 * The step adds to what the field already holds, and it stops at the limit of
 * the quantity.
 */
export function StoreQuantitySteps(props: StoreQuantityStepsProps): ReactElement {
  const { onStep } = props;
  const buttons = QUANTITY_STEPS.map(renderStepButton(onStep));
  return (
    <Box display="flex" gap="2">
      {buttons}
    </Box>
  );
}

function renderStepButton(onStep: (step: number) => void): (value: number) => ReactElement {
  return function renderButton(value: number): ReactElement {
    const onClick = buildStepClick(onStep, value);
    const label = `+${value}`;
    return (
      <Button key={value} onClick={onClick} size="sm" tone="secondary">
        {label}
      </Button>
    );
  };
}

/**
 * The click on a step of the sum: the step adds to what the field already
 * holds.
 */
function buildStepClick(onStep: (step: number) => void, value: number): () => void {
  return function addStep(): void {
    onStep(value);
  };
}
