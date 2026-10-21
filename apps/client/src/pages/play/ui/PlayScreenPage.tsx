import { Box } from '@chakra-ui/react';
import { type ReactElement, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { BackpackModal } from '~/features/backpack';
import { StorageModal } from '~/features/storage';
import { StoreModal } from '~/features/store';
import { usePlayOverlays } from '~/pages/play/model/usePlayOverlays';
import { useAuth } from '~/shared/auth';
import type { AlertInput } from '~/shared/ui/alert';
import { useAlerts } from '~/shared/ui/alert';
import { IconBadge } from '~/shared/ui/badge';
import { Text } from '~/shared/ui/text';
import {
  ACTIVE_CREATURE_ID,
  PlayButton,
  ShopButton,
  SkillBar,
  TEAM_SLOTS,
  TeamStrip,
  Toolbar,
} from '~/widgets/game-hud';

import { CanvasPlaceholder } from './CanvasPlaceholder';

const ALERT_DURATION = 4000;
const DEMO_ICON = 'i';
const SIGNIN_PATH = '/signin';
const TRAINER_LEVEL = 1;
const TRAINER_NAME = 'Jogador';
const GOLD_AMOUNT = 1500;
const DIAMOND_AMOUNT = 1829201;

export function PlayScreenPage(): ReactElement {
  return <PlayScreenBody />;
}

function PlayScreenBody(): ReactElement {
  const { show } = useAlerts();
  const auth = useAuth();
  const navigate = useNavigate();
  const [activeCreatureId, setActiveCreatureId] = useState<string>(ACTIVE_CREATURE_ID);
  const overlays = usePlayOverlays();

  function handleSelectCreature(id: string): void {
    setActiveCreatureId(id);
  }

  const toolbarHandlers = buildToolbarHandlers(
    show,
    overlays.onOpenBackpack,
    auth.signOut,
    navigate,
  );
  const overlayHandlers = buildOverlayHandlers(show);

  return (
    <Box display="flex" flexDirection="column" h="100dvh" w="full">
      <Toolbar
        diamonds={DIAMOND_AMOUNT}
        gold={GOLD_AMOUNT}
        trainerLevel={TRAINER_LEVEL}
        trainerName={TRAINER_NAME}
        onOpenBackpack={toolbarHandlers.onOpenBackpack}
        onOpenStorage={overlays.onOpenStorage}
        onSignOut={toolbarHandlers.onSignOut}
      />
      <Box display="flex" flex="1" position="relative">
        <CanvasPlaceholder />
        <TeamStrip activeId={activeCreatureId} slots={TEAM_SLOTS} onSelect={handleSelectCreature} />
        <PlayButton onClick={overlayHandlers.onStartHunt} />
        <ShopButton onClick={overlays.onOpenStore} />
        <SkillBar />
      </Box>
      <BackpackModal isOpen={overlays.isBackpackOpen} onClose={overlays.onCloseBackpack} />
      <StorageModal isOpen={overlays.isStorageOpen} onClose={overlays.onCloseStorage} />
      <StoreModal isOpen={overlays.isStoreOpen} onClose={overlays.onCloseStore} />
    </Box>
  );
}

function buildToolbarHandlers(
  show: (input: AlertInput) => string,
  openBackpack: () => void,
  signOut: () => Promise<void>,
  navigate: ReturnType<typeof useNavigate>,
): ToolbarHandlers {
  return {
    onCloseBackpack: noop,
    onOpenBackpack: openBackpack,
    onOpenStorage: handleNotify(show, 'Armazenamento em breve.'),
    onSignOut: handleSignOut(signOut, navigate),
  };
}

function buildOverlayHandlers(show: (input: AlertInput) => string): OverlayHandlers {
  return {
    onOpenShop: handleNotify(show, 'Loja em breve.'),
    onStartHunt: handleNotify(show, 'Caçada em breve.'),
  };
}

function handleNotify(show: (input: AlertInput) => string, message: string): () => void {
  return function notify(): void {
    show(buildAlert(message));
  };
}

function handleSignOut(
  signOut: () => Promise<void>,
  navigate: ReturnType<typeof useNavigate>,
): () => void {
  return function signOutAndRedirect(): void {
    signOut().then(redirectToSignin(navigate), noop);
  };
}

function redirectToSignin(navigate: ReturnType<typeof useNavigate>): () => void {
  return function redirect(): void {
    navigate(SIGNIN_PATH, { replace: true });
  };
}

function noop(): void {
  void 0;
}

function buildAlert(message: string): AlertInput {
  return {
    content: <DemoAlertMessage message={message} />,
    duration: ALERT_DURATION,
    icon: <DemoAlertIcon />,
  };
}

function DemoAlertMessage(props: DemoAlertMessageProps): ReactElement {
  const { message } = props;
  return <Text color="fg">{message}</Text>;
}

function DemoAlertIcon(): ReactElement {
  return <IconBadge>{DEMO_ICON}</IconBadge>;
}

type ToolbarHandlers = {
  onCloseBackpack: () => void;
  onOpenBackpack: () => void;
  onOpenStorage: () => void;
  onSignOut: () => void;
};

type OverlayHandlers = {
  onOpenShop: () => void;
  onStartHunt: () => void;
};

type DemoAlertMessageProps = {
  message: string;
};
