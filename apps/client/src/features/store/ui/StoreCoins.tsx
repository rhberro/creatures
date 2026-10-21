import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { IconCoin } from '~/shared/ui/icon';
import { Text } from '~/shared/ui/text';

/**
 * The value of an item, in gold coins.
 *
 * The coin is the icon of the currency, and the number is the value: the
 * color never comes alone.
 */
export function StoreCoins(props: { value: number }): ReactElement {
  const { value } = props;
  return (
    <Box alignItems="center" display="flex" gap="2">
      <Box color="currency.gold" display="flex">
        <IconCoin />
      </Box>
      <Text color="currency.gold" variant="numeric">
        {value}
      </Text>
    </Box>
  );
}
