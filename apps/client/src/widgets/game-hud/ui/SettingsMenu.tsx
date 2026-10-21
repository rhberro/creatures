import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { Button, IconButton } from '~/shared/ui/button';
import { IconGear, IconLogout, IconTeam } from '~/shared/ui/icon';
import { Popup } from '~/shared/ui/popup';
import { Text } from '~/shared/ui/text';

const TITLE = 'Configurações';

type SettingsMenuProps = {
  onSignOut: () => void;
  onSwitchTrainer: () => void;
};

/**
 * The settings menu of the game.
 *
 * The trigger is the last button of the toolbar, and the menu holds the two
 * actions of the session: switching the trainer and signing out. Switching the
 * trainer only disconnects the trainer from the service, and the session of
 * the account stays alive.
 */
export function SettingsMenu(props: SettingsMenuProps): ReactElement {
  const { onSignOut, onSwitchTrainer } = props;
  return (
    <Popup
      content={<SettingsMenuContent onSignOut={onSignOut} onSwitchTrainer={onSwitchTrainer} />}
    >
      <Box display="inline-flex">
        <IconButton label={TITLE} onClick={noop} tone="neutral">
          <IconGear size="20px" />
        </IconButton>
      </Box>
    </Popup>
  );
}

type SettingsMenuContentProps = {
  onSignOut: () => void;
  onSwitchTrainer: () => void;
};

function SettingsMenuContent(props: SettingsMenuContentProps): ReactElement {
  const { onSignOut, onSwitchTrainer } = props;
  return (
    <Box display="flex" flexDirection="column" gap="1" minW="180px">
      <Text color="fg.muted" variant="label">
        {TITLE}
      </Text>
      <SettingsMenuItem
        icon={<IconTeam size="16px" />}
        label="Trocar treinador"
        onClick={onSwitchTrainer}
      />
      <SettingsMenuItem
        icon={<IconLogout size="16px" />}
        label="Sair da conta"
        onClick={onSignOut}
        tone="danger"
      />
    </Box>
  );
}

type SettingsMenuItemProps = {
  icon: ReactElement;
  label: string;
  onClick: () => void;
  tone?: 'danger' | 'ghost';
};

function SettingsMenuItem(props: SettingsMenuItemProps): ReactElement {
  const { icon, label, onClick, tone = 'ghost' } = props;
  return (
    <Button justifyContent="flex-start" tone={tone} width="full" onClick={onClick}>
      <Box alignItems="center" display="flex" gap="2">
        {icon}
        <Text variant="label">{label}</Text>
      </Box>
    </Button>
  );
}

/**
 * The trigger does not open the menu by itself: the icon button of the system
 * does not forward the mouse events that the popup uses, so the wrapper around
 * it is the trigger, and the click of the button is the click of the popup.
 */
function noop(): void {
  void 0;
}
