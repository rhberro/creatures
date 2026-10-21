import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { BrandPage } from '~/shared/ui/brand';
import { Link } from '~/shared/ui/link';
import { Text } from '~/shared/ui/text';

export function Placeholder(props: PlaceholderProps): ReactElement {
  const { backTo, title } = props;
  return (
    <BrandPage title={title}>
      <Text color="fg.muted" textAlign="center">
        Em breve.
      </Text>
      <Box marginBlockStart="4">
        <Link to={backTo} tone="secondary" width="full">
          Voltar
        </Link>
      </Box>
    </BrandPage>
  );
}

export type PlaceholderProps = {
  backTo: string;
  title: string;
};
