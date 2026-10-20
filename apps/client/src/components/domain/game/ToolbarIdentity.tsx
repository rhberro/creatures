import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { IconTeam } from '~/components/base/icon';
import { Text } from '~/components/base/text/Text';

const AVATAR_SIZE = '36px';

type ToolbarIdentityProps = {
  level: number;
  name: string;
};

export function ToolbarIdentity(props: ToolbarIdentityProps): ReactElement {
  const { level, name } = props;
  const levelLabel = `Nível ${level}`;
  return (
    <Box alignItems="center" display="flex" gap="3">
      <Box
        alignItems="center"
        bg="bg.raised"
        borderRadius="full"
        boxShadow="sm"
        color="fg.muted"
        display="flex"
        height={AVATAR_SIZE}
        justifyContent="center"
        width={AVATAR_SIZE}
      >
        <IconTeam />
      </Box>
      <Box>
        <Text color="fg" variant="label">
          {name}
        </Text>
        <Text color="fg.subtle" variant="meta">
          {levelLabel}
        </Text>
      </Box>
    </Box>
  );
}
