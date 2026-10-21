import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { StoreCoins } from '~/features/store/ui/StoreCoins';
import { Text } from '~/shared/ui/text';

const TOTAL_LABEL = 'Total';

export type StoreTotalProps = {
  /** The value of the action of the tab, in gold coins. */
  value: number;
};

/**
 * The total of the action of the tab.
 *
 * The label says what the number is: the total of the quantity the player
 * chose, and not the price of one unit of the item.
 */
export function StoreTotal(props: StoreTotalProps): ReactElement {
  const { value } = props;
  return (
    <Box alignItems="center" display="flex" gap="2">
      <Text color="fg.muted" variant="meta">
        {TOTAL_LABEL}
      </Text>
      <StoreCoins value={value} />
    </Box>
  );
}
