import { Dialog } from '@chakra-ui/react';
import type { ReactElement } from 'react';

type OverlayProps = {
  contained?: boolean;
};

export function Overlay(props: OverlayProps): ReactElement {
  const { contained = false } = props;
  const position = contained ? 'absolute' : 'fixed';
  return <Dialog.Backdrop bg="bg.overlay" position={position} />;
}
