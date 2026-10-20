import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

type OverlayProps = {
  onClick?: () => void;
};

export function Overlay(props: OverlayProps): ReactElement {
  const { onClick } = props;
  return <Box bg="bg.overlay" inset="0" onClick={onClick} position="absolute" />;
}
