import { Box } from '@chakra-ui/react';
import type { ReactElement, ReactNode } from 'react';

import { FormShell } from '~/shared/ui/form';

import { Wordmark } from './Wordmark';

type BrandPageProps = {
  children: ReactNode;
  footer?: ReactNode;
  title: string;
};

export function BrandPage(props: BrandPageProps): ReactElement {
  const { children, footer, title } = props;
  return (
    <Box
      alignItems="center"
      as="main"
      bg="bg"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      minH="100dvh"
      p={6}
    >
      <Wordmark />
      <FormShell footer={footer} title={title}>
        {children}
      </FormShell>
    </Box>
  );
}
