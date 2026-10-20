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

type TrainerDeleteDialogProps = {
  contained?: boolean;
  isDeleting?: boolean;
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  trainerName: string;
};

/**
 * A confirmacao de exclusao.
 *
 * Sem caixa de alerta: a caixa repetia, em tres linhas, o que a descricao
 * ja dizia, e a repeticao pesava mais do que a informacao. O perigo e
 * comunicado pelo que importa — o texto, a frase de irreversibilidade e o
 * botao destrutivo.
 */
export function TrainerDeleteDialog(props: TrainerDeleteDialogProps): ReactElement {
  const { contained = false, isDeleting = false, isOpen, onCancel, onConfirm, trainerName } = props;
  return (
    <Dialog contained={contained} isOpen={isOpen} onClose={onCancel}>
      <DialogHeader>{TITLE}</DialogHeader>
      <DialogBody>
        <Text color="fg.muted" variant="body">
          Atenção, essa ação não pode ser desfeita! Deletar o treinador{' '}
          <Text as="span" color="fg" variant="label">
            {trainerName}
          </Text>{' '}
          remove todo o seu progresso, seus itens e suas criaturas são excluidas de todo o jogo.
        </Text>
      </DialogBody>
      <DialogFooter>
        <Box display="flex" gap="2" justifyContent="flex-end" width="full">
          <Button tone="secondary" onClick={onCancel}>
            {CANCEL_LABEL}
          </Button>
          <Button tone="danger" loading={isDeleting} onClick={onConfirm}>
            {CONFIRM_LABEL}
          </Button>
        </Box>
      </DialogFooter>
    </Dialog>
  );
}
