import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { IconCoin, IconGem } from '~/components/base/icon';
import { Text } from '~/components/base/text/Text';

import type { CurrencyLabel } from './toolbar.types';

const BADGE_HEIGHT = '44px';

type CurrencyBadgeProps = {
  amount: number;
  label: CurrencyLabel;
};

export function CurrencyBadge(props: CurrencyBadgeProps): ReactElement {
  const { amount, label } = props;
  const amountText = formatAmount(amount);
  const currencyIcon = label === 'gold' ? <IconCoin /> : <IconGem />;
  const iconColor = label === 'gold' ? 'currency.gold' : 'currency.diamond';
  return (
    <Box
      alignItems="center"
      bg="bg.raised"
      borderRadius="sm"
      boxShadow="sm"
      display="flex"
      gap="2"
      height={BADGE_HEIGHT}
      paddingInline="3"
    >
      <Box color={iconColor} display="flex">
        {currencyIcon}
      </Box>
      <Text color="fg" variant="numeric">
        {amountText}
      </Text>
    </Box>
  );
}

function formatAmount(amount: number): string {
  return amount.toLocaleString('pt-BR');
}
