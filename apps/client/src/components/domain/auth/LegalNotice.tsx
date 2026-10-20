import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { Link } from '~/components/base/link/Link';
import { Text } from '~/components/base/text/Text';

const TERMS_PATH = '/terms';
const PRIVACY_PATH = '/privacy';

type LegalNoticeProps = {
  action: string;
};

export function LegalNotice(props: LegalNoticeProps): ReactElement {
  const { action } = props;
  return (
    <Box textAlign="center">
      <Text color="fg.subtle" variant="body">
        {action}, você concorda com os <Link to={TERMS_PATH}>Termos de Serviço</Link> e a{' '}
        <Link to={PRIVACY_PATH}>Política de Privacidade</Link> do Creatures.
      </Text>
    </Box>
  );
}
