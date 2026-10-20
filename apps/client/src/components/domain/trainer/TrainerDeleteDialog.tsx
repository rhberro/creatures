import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { Button } from '~/components/base/button/Button';
import { Dialog } from '~/components/base/dialog/Dialog';
import { DialogBody } from '~/components/base/dialog/DialogBody';
import { DialogFooter } from '~/components/base/dialog/DialogFooter';
import { DialogHeader } from '~/components/base/dialog/DialogHeader';
import { Text } from '~/components/base/text/Text';

const TITLE = 'Deletar treinador?';
const CANCEL_LABEL = 'Cancelar';
const CONFIRM_LABEL = 'Deletar';
const WARNING_TITLE = 'Remoção definitiva';
const WARNING_MESSAGE =
  'Esta ação não pode ser desfeita. O treinador é apagado junto com seus itens, suas criaturas e todo o progresso dele. A conta continua existindo, mas fica sem nenhum treinador.';

type TrainerDeleteDialogProps = {
  contained?: boolean;
  isDeleting?: boolean;
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  trainerName: string;
};

export function TrainerDeleteDialog(props: TrainerDeleteDialogProps): ReactElement | null {
  const { contained = false, isDeleting = false, isOpen, onCancel, onConfirm, trainerName } = props;
  if (!isOpen) {
    return null;
  }
  return (
    <Dialog contained={contained} onClose={onCancel}>
      <DialogHeader>{TITLE}</DialogHeader>
      <DialogBody>
        <Text color="fg.muted" variant="body">
          Deletar o treinador{' '}
          <Text as="span" color="fg" variant="label">
            {trainerName}
          </Text>{' '}
          remove itens, criaturas e todo o progresso dele.
        </Text>
        <Box
          bg="bg.error"
          borderColor="border.error"
          borderRadius="sm"
          borderWidth="1px"
          padding="3"
        >
          <Text color="fg.error" variant="label">
            {WARNING_TITLE}
          </Text>
          <Text color="fg.muted" marginBlockStart="1" variant="meta">
            {WARNING_MESSAGE}
          </Text>
        </Box>
      </DialogBody>
      <DialogFooter>
        <Button tone="secondary" onClick={onCancel}>
          {CANCEL_LABEL}
        </Button>
        <Button tone="danger" loading={isDeleting} onClick={onConfirm}>
          {CONFIRM_LABEL}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
