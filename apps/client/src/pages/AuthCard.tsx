import { Box, Heading } from '@chakra-ui/react';
import type { ReactElement, ReactNode } from 'react';

export function AuthCard(props: AuthCardProps): ReactElement {
  const { children, title } = props;
  return (
    <Box
      bg="bg.panel"
      borderColor="border.default"
      borderRadius="md"
      borderWidth="1px"
      maxW="md"
      p={6}
      w="full"
    >
      <Box mb={6} textAlign="center">
        <Heading size="md">{title}</Heading>
      </Box>
      {children}
    </Box>
  );
}

export type AuthCardProps = {
  children: ReactNode;
  title: string;
};
