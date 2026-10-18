import { Box, Button, Text } from '@chakra-ui/react';
import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';

const SIGNIN_PATH = '/signin';

export function SignUpActions(props: SignUpActionsProps): ReactElement {
  const { isSubmitting, onGoogleClick } = props;
  return (
    <>
      <Button
        colorPalette="gray"
        disabled={isSubmitting}
        loading={isSubmitting}
        type="submit"
        variant="solid"
        w="full"
      >
        Criar Conta
      </Button>
      <Button
        asChild
        colorPalette="gray"
        disabled={isSubmitting}
        type="button"
        variant="surface"
        w="full"
      >
        <Link to={SIGNIN_PATH}>Entrar</Link>
      </Button>
      <Box alignItems="center" display="flex" gap={3} my={1}>
        <Box bg="border.default" flex="1" h="1px" />
        <Text color="fg.muted" fontSize="sm">
          ou
        </Text>
        <Box bg="border.default" flex="1" h="1px" />
      </Box>
      <Button
        colorPalette="gray"
        disabled={isSubmitting}
        onClick={onGoogleClick}
        type="button"
        variant="outline"
        w="full"
      >
        Registrar com Google
      </Button>
    </>
  );
}

export type SignUpActionsProps = {
  isSubmitting: boolean;
  onGoogleClick: () => void;
};
