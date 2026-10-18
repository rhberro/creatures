import { Box, Text } from '@chakra-ui/react';
import type { ReactElement } from 'react';

const ALERT_ICON_LABEL = 'i';
const SUCCESS_ICON_LABEL = '✓';
const SUCCESS_MESSAGE = 'Senha redefinida com sucesso. Faça login para continuar.';
const FORGOT_ALERT_MESSAGE =
  'Se o e-mail existir em nossa base de dados, enviamos um link de recuperação.';

export function SuccessMessage(): ReactElement {
  return <Text color="fg">{SUCCESS_MESSAGE}</Text>;
}

export function SuccessIcon(): ReactElement {
  return (
    <Box
      alignItems="center"
      bg="bg.muted"
      borderRadius="full"
      color="fg.muted"
      display="flex"
      h="6"
      justifyContent="center"
      w="6"
    >
      {SUCCESS_ICON_LABEL}
    </Box>
  );
}

export function ForgotAlertMessage(): ReactElement {
  return <Text color="fg">{FORGOT_ALERT_MESSAGE}</Text>;
}

export function ForgotAlertIcon(): ReactElement {
  return (
    <Box
      alignItems="center"
      bg="bg.muted"
      borderRadius="full"
      color="fg.muted"
      display="flex"
      h="6"
      justifyContent="center"
      w="6"
    >
      {ALERT_ICON_LABEL}
    </Box>
  );
}
