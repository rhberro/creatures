import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { Text } from '~/components/base/text/Text';

import { BackpackModalPreview } from './screens/BackpackModal';
import { CreateTrainerScreen } from './screens/CreateTrainerScreen';
import { CreatureDetail } from './screens/CreatureDetail';
import { EmptyBackpack } from './screens/EmptyBackpack';
import { EmptyTrainers } from './screens/EmptyTrainers';
import { ForgotPasswordScreen } from './screens/ForgotPasswordScreen';
import { HuntAnalyzer } from './screens/HuntAnalyzer';
import { HuntAreaDetails } from './screens/huntArea/HuntAreaDetails';
import { HuntAreaSelect } from './screens/huntArea/HuntAreaSelect';
import { ItemDetailPopup } from './screens/ItemDetailPopup';
import { LoadingScreen } from './screens/LoadingScreen';
import { PrivacyScreen } from './screens/PrivacyScreen';
import { ReconnectScreen } from './screens/ReconnectScreen';
import { ResetPasswordScreen } from './screens/ResetPasswordScreen';
import { SignInScreen } from './screens/SignInScreen';
import { SignUpScreen } from './screens/SignUpScreen';
import { ConsumableSelectionPanel } from './screens/skillPanel/ConsumableSelectionPanel';
import { DeviceSelectionPanel } from './screens/skillPanel/DeviceSelectionPanel';
import { SkillSelectionPanel } from './screens/skillPanel/SkillSelectionPanel';
import { StorageModalPreview } from './screens/StorageModal';
import { TermsScreen } from './screens/TermsScreen';
import { TrainersList } from './screens/TrainersList';
import { SectionHeader } from './SectionHeader';

export function ScreensSection(): ReactElement {
  return (
    <Box marginBlockEnd="16">
      <SectionHeader
        description="Cada superfície do jogo, montada com os mesmos componentes. É aqui que a consistência aparece: os modais compartilham título, corpo, rodapé e a mesma anatomia de slot."
        id="telas"
        title="Telas"
      />
      <AuthGroup />
      <TrainerGroup />
      <CityGroup />
      <HuntGroup />
      <SkillPanelsGroup />
      <StateGroup />
    </Box>
  );
}

type GroupProps = {
  title: string;
};

function GroupTitle(props: GroupProps): ReactElement {
  const { title } = props;
  return (
    <Text color="fg" marginBlockEnd="3" variant="section">
      {title}
    </Text>
  );
}

function AuthGroup(): ReactElement {
  return (
    <Box marginBlockEnd="10">
      <GroupTitle title="Autenticação" />
      <Box display="flex" flexWrap="wrap" gap="5">
        <SignInScreen />
        <SignUpScreen />
        <ForgotPasswordScreen />
        <ResetPasswordScreen />
        <TermsScreen />
        <PrivacyScreen />
      </Box>
    </Box>
  );
}

function TrainerGroup(): ReactElement {
  return (
    <Box marginBlockEnd="10">
      <GroupTitle title="Treinadores" />
      <Box display="flex" flexWrap="wrap" gap="5">
        <Box width="420px">
          <TrainersList />
        </Box>
        <CreateTrainerScreen />
      </Box>
    </Box>
  );
}

function CityGroup(): ReactElement {
  return (
    <Box marginBlockEnd="10">
      <GroupTitle title="Cidade" />
      <Box display="flex" flexWrap="wrap" gap="5">
        <Box width="520px">
          <BackpackModalPreview />
        </Box>
        <Box width="520px">
          <StorageModalPreview />
        </Box>
      </Box>
    </Box>
  );
}

function SkillPanelsGroup(): ReactElement {
  return (
    <Box marginBlockEnd="10">
      <GroupTitle title="Seleção na barra de habilidades" />
      <Box display="flex" flexWrap="wrap" gap="5">
        <SkillSelectionPanel />
        <ConsumableSelectionPanel />
        <DeviceSelectionPanel />
      </Box>
    </Box>
  );
}

function StateGroup(): ReactElement {
  return (
    <Box marginBlockEnd="10">
      <GroupTitle title="Estados do sistema" />
      <Box display="flex" flexWrap="wrap" gap="5">
        <ReconnectScreen />
        <LoadingScreen />
        <Box width="420px">
          <EmptyBackpack />
        </Box>
        <Box width="380px">
          <EmptyTrainers />
        </Box>
        <CreatureDetail />
        <ItemDetailPopup />
      </Box>
    </Box>
  );
}

function HuntGroup(): ReactElement {
  return (
    <Box marginBlockEnd="10">
      <GroupTitle title="Caçada" />
      <Box display="flex" flexWrap="wrap" gap="5" marginBlockEnd="5">
        <Box height="760px" overflow="hidden" padding="20px" position="relative" width="1020px">
          <HuntAreaSelect />
        </Box>
        <Box height="760px" overflow="hidden" padding="20px" position="relative" width="420px">
          <HuntAreaDetails />
        </Box>
        <HuntAnalyzer />
      </Box>
    </Box>
  );
}
