import { Box, Text } from '@chakra-ui/react';
import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';

import { AuthCard } from '~/pages/AuthCard';

export function PlaceholderPage(props: PlaceholderPageProps): ReactElement {
  const { backTo, title } = props;
  return (
    <AuthCard title={title}>
      <Text color="fg.muted" textAlign="center">
        Em breve.
      </Text>
      <Box display="flex" justifyContent="center" mt={4}>
        <Link to={backTo}>Voltar</Link>
      </Box>
    </AuthCard>
  );
}

export type PlaceholderPageProps = {
  backTo: string;
  title: string;
};
