import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { Link } from '~/components/base/link/Link';
import { Text } from '~/components/base/text/Text';
import { AuthPage } from '~/components/domain/auth/AuthPage';

export function PlaceholderPage(props: PlaceholderPageProps): ReactElement {
  const { backTo, title } = props;
  return (
    <AuthPage title={title}>
      <Text color="fg.muted" textAlign="center">
        Em breve.
      </Text>
      <Box marginBlockStart="4">
        <Link to={backTo} tone="secondary" width="full">
          Voltar
        </Link>
      </Box>
    </AuthPage>
  );
}

export type PlaceholderPageProps = {
  backTo: string;
  title: string;
};
