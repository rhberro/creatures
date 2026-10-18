import { Box, Text } from '@chakra-ui/react';
import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';

export function SignInFooter(): ReactElement {
  return (
    <Box mt={6} textAlign="center">
      <Text color="fg.muted" fontSize="sm">
        Ao continuar, você concorda com os <Link to="/terms">Termos de Serviço</Link> e a{' '}
        <Link to="/privacy">Política de Privacidade</Link> do Creatures.
      </Text>
    </Box>
  );
}
