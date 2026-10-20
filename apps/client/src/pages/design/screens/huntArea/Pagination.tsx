import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { Text } from '~/components/base/text/Text';

const PAGE_BUTTON_SIZE = '36px';

type PaginationProps = {
  current: number;
  total: number;
};

export function Pagination(props: PaginationProps): ReactElement {
  const { current, total } = props;
  const label = `${current} / ${total}`;
  return (
    <Box alignItems="center" display="flex" gap="3">
      <PageButton label="‹" />
      <Text color="fg.muted" variant="numeric" whiteSpace="nowrap">
        {label}
      </Text>
      <PageButton label="›" />
    </Box>
  );
}

type PageButtonProps = {
  label: string;
};

function PageButton(props: PageButtonProps): ReactElement {
  const { label } = props;
  return (
    <Box
      alignItems="center"
      bg="bg.raised"
      borderColor="border"
      borderRadius="full"
      borderWidth="1px"
      color="fg.muted"
      cursor="pointer"
      display="flex"
      height={PAGE_BUTTON_SIZE}
      justifyContent="center"
      width={PAGE_BUTTON_SIZE}
    >
      <Text variant="numeric">{label}</Text>
    </Box>
  );
}
