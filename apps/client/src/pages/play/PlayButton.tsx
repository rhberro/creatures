import { Button } from '@chakra-ui/react';
import type { ReactElement } from 'react';

export function PlayButton(props: PlayButtonProps): ReactElement {
  const { onClick } = props;
  return (
    <Button
      colorPalette="gray"
      left="4"
      position="absolute"
      size="lg"
      variant="solid"
      onClick={onClick}
    >
      Play
    </Button>
  );
}

export type PlayButtonProps = {
  onClick: () => void;
};
