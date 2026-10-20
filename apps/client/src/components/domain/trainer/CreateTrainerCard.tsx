import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { Text } from '~/components/base/text/Text';

type CreateTrainerCardProps = {
  onCreate: () => void;
};

export function CreateTrainerCard(props: CreateTrainerCardProps): ReactElement {
  const { onCreate } = props;
  return (
    <Box
      alignItems="center"
      bg="bg.panel"
      borderColor="border"
      borderRadius="sm"
      borderStyle="dashed"
      borderWidth="1px"
      color="fg.muted"
      cursor="pointer"
      display="flex"
      gap="3"
      p="2"
      transitionProperty="background-color, color"
      transitionDuration="150ms"
      transitionTimingFunction="ease-out"
      onClick={onCreate}
    >
      <Box
        alignItems="center"
        borderRadius="full"
        display="flex"
        flexShrink="0"
        height="36px"
        justifyContent="center"
        width="36px"
      >
        <Text color="fg.subtle" variant="bodyLarge">
          +
        </Text>
      </Box>
      <Text variant="label">Criar treinador</Text>
    </Box>
  );
}
