import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { Text } from '~/components/base/text/Text';
import { PlayButton } from '~/components/domain/game/PlayButton';
import { ShopButton } from '~/components/domain/game/ShopButton';
import { SkillBar } from '~/components/domain/game/SkillBar';
import { StoreModal } from '~/components/domain/game/StoreModal';
import { TeamStrip } from '~/components/domain/game/TeamStrip';
import { Toolbar } from '~/components/domain/game/Toolbar';
import { ACTIVE_CREATURE_ID, TEAM_SLOTS } from '~/pages/play/data';

import { CanvasArea } from './play/GameCanvas';

export function PlayScreenPreview(): ReactElement {
  return (
    <Box marginBlockEnd="16">
      <PlayScreenHeader />
      <Box
        bg="bg"
        border="1px solid"
        borderColor="border.emphasized"
        display="flex"
        flexDirection="column"
        height="560px"
        overflow="hidden"
        position="relative"
      >
        <Toolbar
          diamonds={240}
          gold={12480}
          trainerLevel={1}
          trainerName="Jogador"
          onOpenBackpack={noop}
          onOpenStorage={noop}
          onSignOut={noop}
        />
        <Box display="flex" flex="1" position="relative">
          <CanvasArea />
          <TeamStrip activeId={ACTIVE_CREATURE_ID} slots={TEAM_SLOTS} onSelect={noop} />
          <PlayButton onClick={noop} />
          <ShopButton onClick={noop} />
          <SkillBar />
        </Box>
      </Box>
      <StoreModalPreview />
    </Box>
  );
}

function StoreModalPreview(): ReactElement {
  return (
    <Box marginBlockStart="12">
      <Box id="loja" marginBlockEnd="4" scrollMarginTop="80px">
        <Text color="fg" variant="title">
          Loja
        </Text>
        <Text color="fg.muted" marginBlockStart="2" maxW="70ch" variant="body">
          O modal sobre a tela, com as abas Comprar e Vender, a grade de slots com espaços vazios, o
          estado selecionado e o rodapé com quantidade, total e a ação.
        </Text>
      </Box>
      <Box
        bg="bg.sunken"
        border="1px solid"
        borderColor="border.emphasized"
        height="660px"
        overflow="hidden"
        padding="20px"
        position="relative"
        width="760px"
      >
        <StoreModal contained isOpen onClose={noop} />
      </Box>
    </Box>
  );
}

function PlayScreenHeader(): ReactElement {
  return (
    <Box id="tela-do-jogo" marginBlockEnd="4" scrollMarginTop="80px">
      <Text color="fg" variant="title">
        Tela do jogo
      </Text>
      <Text color="fg.muted" marginBlockStart="2" maxW="70ch" variant="body">
        A toolbar, as linguetas do time, a barra de habilidades e os botões de cidade, com a mesma
        linguagem das referências. O canvas é o espaço do PixiJS.
      </Text>
    </Box>
  );
}

function noop(): void {
  void 0;
}
