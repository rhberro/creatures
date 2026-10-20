import { Box } from '@chakra-ui/react';
import { useState, type ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '~/auth/useAuth';
import type { AlertInput } from '~/components/base/alert/alert.types';
import { useAlerts } from '~/components/base/alert/useAlerts';
import { IconBadge } from '~/components/base/badge/IconBadge';
import { Text } from '~/components/base/text/Text';
import { BackpackModal } from '~/components/domain/game/BackpackModal';
import { PlayButton } from '~/components/domain/game/PlayButton';
import { ShopButton } from '~/components/domain/game/ShopButton';
import { SkillBar } from '~/components/domain/game/SkillBar';
import { StorageModal } from '~/components/domain/game/StorageModal';
import { StoreModal } from '~/components/domain/game/StoreModal';
import { TeamStrip } from '~/components/domain/game/TeamStrip';
import { Toolbar } from '~/components/domain/game/Toolbar';
import { CanvasPlaceholder } from '~/pages/play/CanvasPlaceholder';
import { ACTIVE_CREATURE_ID, TEAM_SLOTS } from '~/pages/play/data';
import { usePlayOverlays } from '~/pages/play/usePlayOverlays';

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
        onOpenSettings={toolbarHandlers.onOpenSettings}
        onOpenStorage={overlays.onOpenStorage}
        onShowAlert={toolbarHandlers.onShowAlert}
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
    onOpenSettings: handleNotify(show, 'Configurações em breve.'),
    onOpenStorage: handleNotify(show, 'Armazenamento em breve.'),
    onShowAlert: handleNotify(show, 'Notificação de exemplo.'),
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
  onOpenSettings: () => void;
  onOpenStorage: () => void;
  onShowAlert: () => void;
  onSignOut: () => void;
};

type OverlayHandlers = {
  onOpenShop: () => void;
  onStartHunt: () => void;
};

type DemoAlertMessageProps = {
  message: string;
};
