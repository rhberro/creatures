import { Box, Text } from '@chakra-ui/react';
import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';

const TERMS_PATH = '/terms';
const PRIVACY_PATH = '/privacy';

export function SignUpFooter(): ReactElement {
  return (
    <Box mt={6} textAlign="center">
      <Text color="fg.muted" fontSize="sm">
        Ao continuar, você concorda com os <Link to={TERMS_PATH}>Termos de Serviço</Link> e a{' '}
        <Link to={PRIVACY_PATH}>Política de Privacidade</Link> do Creatures.
      </Text>
    </Box>
  );
}
