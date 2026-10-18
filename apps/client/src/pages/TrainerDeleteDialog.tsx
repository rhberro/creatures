import { Button, Dialog, Portal } from '@chakra-ui/react';
import type { DialogOpenChangeDetails } from '@chakra-ui/react';
import type { ReactElement } from 'react';

const TITLE = 'Excluir treinador';
const CONFIRM_MESSAGE =
  'Excluir este treinador? Itens, criaturas e todo o progresso serão perdidos permanentemente.';
const CANCEL_LABEL = 'Cancelar';
const CONFIRM_LABEL = 'Excluir';

export function TrainerDeleteDialog(props: TrainerDeleteDialogProps): ReactElement {
  const { isDeleting, isOpen, onCancel, onConfirm } = props;
  const handleOpenChange = buildOpenChangeHandler(onCancel);
  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>{TITLE}</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Dialog.Description>{CONFIRM_MESSAGE}</Dialog.Description>
            </Dialog.Body>
            <Dialog.Footer>
              <Button colorPalette="gray" variant="outline" onClick={onCancel}>
                {CANCEL_LABEL}
              </Button>
              <Button colorPalette="red" loading={isDeleting} onClick={onConfirm}>
                {CONFIRM_LABEL}
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

export type TrainerDeleteDialogProps = {
  isDeleting: boolean;
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

function buildOpenChangeHandler(onCancel: () => void): (details: DialogOpenChangeDetails) => void {
  return function handleOpenChange(details: DialogOpenChangeDetails): void {
    if (!details.open) {
      onCancel();
    }
  };
}
