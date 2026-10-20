import { Box } from '@chakra-ui/react';
import type { ReactElement, ReactNode } from 'react';

import { Frame } from '~/components/base/frame/Frame';
import { FrameFooter } from '~/components/base/frame/FrameFooter';
import { Text } from '~/components/base/text/Text';

const SHELL_WIDTH = '360px';

type AuthShellProps = {
  children: ReactNode;
  footer?: ReactNode;
  title: string;
};

export function AuthShell(props: AuthShellProps): ReactElement {
  const { children, footer, title } = props;
  const shellFooter = footer ? <FrameFooter>{footer}</FrameFooter> : null;
  return (
    <Box maxW="full" width={SHELL_WIDTH}>
      <Frame tone="overlay">
        <AuthHeader title={title} />
        <Box display="flex" flexDirection="column" gap="4" padding="5">
          {children}
        </Box>
        {shellFooter}
      </Frame>
    </Box>
  );
}

type AuthHeaderProps = {
  title: string;
};

function AuthHeader(props: AuthHeaderProps): ReactElement {
  const { title } = props;
  return (
    <Box borderBottom="1px solid" borderColor="border" padding="3" textAlign="center">
      <Text as="h2" color="fg" variant="section">
        {title}
      </Text>
    </Box>
  );
}
