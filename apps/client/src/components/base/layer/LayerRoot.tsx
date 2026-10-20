import {
  Box,
  Dialog as ChakraDialog,
  Portal,
  useSlotRecipe,
  type SystemStyleObject,
} from '@chakra-ui/react';
import type { ReactElement, ReactNode } from 'react';

import { IconButton } from '~/components/base/button/IconButton';
import { IconClose } from '~/components/base/icon';
import { Overlay } from '~/components/base/overlay/Overlay';
import { layerRecipe, type LayerWeight } from '~/theme/recipes/layer';

import type { LayerRootProps } from './layer.types';

const CLOSE_ICON_SIZE = '16px';
const CLOSE_OFFSET = '-16px';
const CLOSE_SIZE = '32px';

/**
 * A camada: a raiz de todo dialogo, modal e drawer.
 *
 * O comportamento vem do `Dialog` do Chakra — *focus trap*, `aria-modal`,
 * rotulo acessivel, restauracao do foco no gatilho, scroll lock, portal e
 * inercia do fundo. Nao se reimplementa nada disso.
 *
 * O que e nosso e o **peso**: tamanho, alinhamento e como a camada fecha. O
 * peso vive na receita `layer`, e nao em tres copies do mesmo componente.
 */
export function LayerRoot(props: LayerRootProps): ReactElement {
  const {
    children,
    closable = false,
    contained = false,
    height,
    isOpen,
    label,
    onClose,
    weight,
    width,
  } = props;
  const recipe = useSlotRecipe({ recipe: layerRecipe });
  const styles = recipe({ weight });
  const layer = describeLayer(contained, weight, onClose);
  const maxHeight = contained ? '100%' : 'calc(100dvh - 64px)';

  return (
    <ChakraDialog.Root
      closeOnEscape
      closeOnInteractOutside={layer.closeOnOutside}
      modal={layer.isModalLayer}
      onOpenChange={layer.openChange}
      open={isOpen}
    >
      <Portal disabled={contained}>
        <Overlay contained={contained} />
        <ChakraDialog.Positioner
          css={styles.positioner}
          height={layer.size}
          inset={layer.inset}
          position={layer.position}
          width={layer.size}
        >
          <LayerContent
            closable={closable}
            height={height}
            onClose={onClose}
            label={label}
            maxHeight={maxHeight}
            styles={styles.root}
            width={width}
          >
            {children}
          </LayerContent>
        </ChakraDialog.Positioner>
      </Portal>
    </ChakraDialog.Root>
  );
}

type LayerDescription = {
  closeOnOutside: boolean;
  inset: string | undefined;
  isModalLayer: boolean;
  openChange: (details: { open: boolean }) => void;
  position: string;
  size: string | undefined;
};

function describeLayer(
  contained: boolean,
  weight: LayerWeight,
  onClose: () => void,
): LayerDescription {
  return {
    closeOnOutside: weight === 'drawer' && !contained,
    inset: contained ? '0' : undefined,
    isModalLayer: !contained,
    openChange: buildOpenChange(onClose),
    position: contained ? 'absolute' : 'fixed',
    size: contained ? '100%' : undefined,
  };
}

type LayerContentProps = {
  children: ReactNode;
  closable: boolean;
  height: string | undefined;
  label: string | undefined;
  maxHeight: string;
  onClose: () => void;
  styles: SystemStyleObject;
  width: string | undefined;
};

function LayerContent(props: LayerContentProps): ReactElement {
  const { children, closable, height, label, maxHeight, onClose, styles, width } = props;
  const closeButton = closable ? <LayerCloseButton onClose={onClose} /> : null;
  return (
    <ChakraDialog.Content
      aria-label={label}
      css={styles}
      height={height}
      maxHeight={maxHeight}
      width={width}
    >
      <Box
        borderRadius="inherit"
        display="flex"
        flex="1"
        flexDirection="column"
        minH="0"
        overflow="hidden"
      >
        {children}
      </Box>
      {closeButton}
    </ChakraDialog.Content>
  );
}

function LayerCloseButton(props: { onClose: () => void }): ReactElement {
  const { onClose } = props;
  return (
    <Box position="absolute" right={CLOSE_OFFSET} top={CLOSE_OFFSET}>
      <IconButton label="Fechar" onClick={onClose} radius="full" size={CLOSE_SIZE} tone="neutral">
        <IconClose size={CLOSE_ICON_SIZE} />
      </IconButton>
    </Box>
  );
}

function buildOpenChange(onClose: () => void): (details: { open: boolean }) => void {
  return function handleOpenChange(details: { open: boolean }): void {
    if (!details.open) {
      onClose();
    }
  };
}
