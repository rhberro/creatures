import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { IconChevronRight } from '~/components/base/icon';
import { Text } from '~/components/base/text/Text';

const PLAY_WIDTH = '340px';
const PLAY_HEIGHT = '104px';
const PLAY_BOTTOM = '128px';
const CHEVRON_SIZE = '34px';

type PlayButtonProps = {
  onClick: () => void;
};

export function PlayButton(props: PlayButtonProps): ReactElement {
  const { onClick } = props;
  return (
    <Box
      alignItems="center"
      bg="bg.panel"
      borderColor="border"
      borderBottomRightRadius="lg"
      borderRadius="0"
      borderTopRightRadius="lg"
      borderWidth="1px"
      borderLeftWidth="0"
      boxShadow="raised"
      color="arcane.50"
      cursor="pointer"
      display="flex"
      gap="4"
      height={PLAY_HEIGHT}
      left="0"
      paddingInline="6"
      position="absolute"
      bottom={PLAY_BOTTOM}
      transitionProperty="background-color"
      transitionDuration="150ms"
      transitionTimingFunction="ease-out"
      width={PLAY_WIDTH}
      onClick={onClick}
    >
      <Box color="gold.400" display="flex" flexShrink="0">
        <IconChevronRight size={CHEVRON_SIZE} />
      </Box>
      <Box>
        <Text color="gold.400" variant="label">
          Caçar
        </Text>
        <Text color="arcane.50" variant="display">
          Explorar
        </Text>
      </Box>
    </Box>
  );
}
