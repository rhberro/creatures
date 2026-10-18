import { Box, Text } from '@chakra-ui/react';
import { useState, type ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '~/auth/useAuth';
import { useAlerts, type AlertInput } from '~/components/alert/AlertStack';
import { BackpackModal } from '~/pages/play/BackpackModal';
import { CanvasPlaceholder } from '~/pages/play/CanvasPlaceholder';
import { PlayButton } from '~/pages/play/PlayButton';
import { ShopButton } from '~/pages/play/ShopButton';
import { SkillBar } from '~/pages/play/SkillBar';
import { TeamStrip } from '~/pages/play/TeamStrip';
import { Toolbar } from '~/pages/play/Toolbar';

const ALERT_DURATION = 4000;
const DEMO_ICON = 'i';
const SIGNIN_PATH = '/signin';

export function PlayScreenPage(): ReactElement {
  return <PlayScreenBody />;
}

function PlayScreenBody(): ReactElement {
  const { show } = useAlerts();
  const auth = useAuth();
  const navigate = useNavigate();
  const [isBackpackOpen, setBackpackOpen] = useState<boolean>(false);

  const toolbarHandlers = buildToolbarHandlers(
    show,
    setBackpackOpen,
    isBackpackOpen,
    auth.signOut,
    navigate,
  );
  const overlayHandlers = buildOverlayHandlers(show);

  return (
    <Box display="flex" flexDirection="column" h="100dvh" w="full">
      <Toolbar
        onOpenBackpack={toolbarHandlers.onOpenBackpack}
        onOpenSettings={toolbarHandlers.onOpenSettings}
        onOpenStorage={toolbarHandlers.onOpenStorage}
        onShowAlert={toolbarHandlers.onShowAlert}
        onSignOut={toolbarHandlers.onSignOut}
      />
      <Box flex="1" position="relative">
        <CanvasPlaceholder />
        <TeamStrip />
        <PlayButton onClick={overlayHandlers.onStartHunt} />
        <ShopButton onClick={overlayHandlers.onOpenShop} />
        <SkillBar />
      </Box>
      <BackpackModal isOpen={isBackpackOpen} onClose={toolbarHandlers.onCloseBackpack} />
    </Box>
  );
}

function buildToolbarHandlers(
  show: (input: AlertInput) => string,
  setBackpackOpen: (value: boolean) => void,
  isBackpackOpen: boolean,
  signOut: () => Promise<void>,
  navigate: ReturnType<typeof useNavigate>,
): ToolbarHandlers {
  return {
    onCloseBackpack: handleCloseBackpack(setBackpackOpen),
    onOpenBackpack: handleOpenBackpack(setBackpackOpen, isBackpackOpen),
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

function handleCloseBackpack(setBackpackOpen: (value: boolean) => void): () => void {
  return function closeBackpack(): void {
    setBackpackOpen(false);
    void 0;
  };
}

function handleOpenBackpack(
  setBackpackOpen: (value: boolean) => void,
  isBackpackOpen: boolean,
): () => void {
  return function openBackpack(): void {
    setBackpackOpen(!isBackpackOpen);
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
  return (
    <Box
      alignItems="center"
      bg="bg.muted"
      borderRadius="full"
      color="fg.muted"
      display="flex"
      h="6"
      justifyContent="center"
      w="6"
    >
      {DEMO_ICON}
    </Box>
  );
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
