import { Box, Link } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { IconCoin } from '~/components/base/icon';
import { Text } from '~/components/base/text/Text';
import { Toolbar } from '~/components/domain/game/Toolbar';
import { DIVIDER_BOTTOM } from '~/theme/divider';

import { ColorFoundations } from './ColorFoundations';
import { ComponentsSection } from './ComponentsSection';
import { IconsSection } from './IconsSection';
import { PlayScreenPreview } from './PlayScreenPreview';
import { ScreensSection } from './ScreensSection';
import { StatesSection } from './StatesSection';
import { SurfacesSection } from './SurfacesSection';
import { TypeFoundations } from './TypeFoundations';

const TOOLBAR_HEIGHT = '56px';

const DIAMOND_AMOUNT = 240;
const GOLD_AMOUNT = 12480;
const TRAINER_LEVEL = 1;
const TRAINER_NAME = 'Jogador';

type RailItem = {
  href: string;
  label: string;
};

type RailGroup = {
  group: string;
  items: RailItem[];
};

const RAIL_GROUPS: RailGroup[] = [
  {
    group: 'Fundação',
    items: [
      { href: '#cores', label: 'Cores' },
      { href: '#tipografia', label: 'Tipografia' },
    ],
  },
  {
    group: 'Componentes',
    items: [
      { href: '#superficies', label: 'Superfícies' },
      { href: '#componentes', label: 'Componentes' },
      { href: '#icones', label: 'Ícones' },
      { href: '#estados', label: 'Estados' },
    ],
  },
  {
    group: 'Telas do app',
    items: [
      { href: '#tela-do-jogo', label: 'Tela do jogo' },
      { href: '#loja', label: 'Loja' },
      { href: '#telas', label: 'Outras telas' },
    ],
  },
];

const RAIL_HOVER = { bg: 'bg.raised', color: 'fg' };

export function DesignSystemPage(): ReactElement {
  return (
    <Box bg="bg" color="fg" minH="100dvh">
      <TopBar />
      <Box alignItems="flex-start" display="flex">
        <SideRail />
        <Box flex="1" marginInline="auto" maxW="1240px" minW="0" padding="10">
          <ColorFoundations />
          <TypeFoundations />
          <SurfacesSection />
          <ComponentsSection />
          <IconsSection />
          <StatesSection />
          <PlayScreenPreview />
          <ScreensSection />
        </Box>
      </Box>
    </Box>
  );
}

function TopBar(): ReactElement {
  return (
    <Box position="sticky" top="0" zIndex="10">
      <Toolbar
        diamonds={DIAMOND_AMOUNT}
        gold={GOLD_AMOUNT}
        trainerLevel={TRAINER_LEVEL}
        trainerName={TRAINER_NAME}
        onOpenBackpack={noop}
        onOpenStorage={noop}
        onSignOut={noop}
      />
    </Box>
  );
}

function SideRail(): ReactElement {
  const groups = RAIL_GROUPS.map(renderRailGroup);
  const railHeight = `calc(100dvh - ${TOOLBAR_HEIGHT})`;
  return (
    <Box
      bg="bg.panel"
      borderRight="1px solid"
      borderColor="border"
      height={railHeight}
      overflowY="auto"
      paddingBlock="6"
      paddingInline="3"
      position="sticky"
      top={TOOLBAR_HEIGHT}
      width="232px"
    >
      <BrandMark />
      {groups}
    </Box>
  );
}

function BrandMark(): ReactElement {
  return (
    <Box
      alignItems="center"
      css={DIVIDER_BOTTOM}
      display="flex"
      gap="3"
      marginBlockEnd="6"
      paddingBlock="3"
      paddingInline="3"
    >
      <Box
        alignItems="center"
        bg="bg.raised"
        borderRadius="sm"
        boxShadow="sm"
        color="currency.gold"
        display="flex"
        height="30px"
        justifyContent="center"
        width="30px"
      >
        <IconCoin />
      </Box>
      <Text color="fg" variant="title">
        Creatures
      </Text>
    </Box>
  );
}

function renderRailGroup(group: RailGroup): ReactElement {
  const items = group.items.map(renderRailItem);
  return (
    <Box key={group.group} marginBlockEnd="6">
      <Text color="fg.subtle" paddingBlockEnd="2" paddingInline="3" variant="meta">
        {group.group}
      </Text>
      {items}
    </Box>
  );
}

function renderRailItem(item: RailItem): ReactElement {
  return (
    <Link
      _hover={RAIL_HOVER}
      color="fg.muted"
      display="block"
      href={item.href}
      key={item.href}
      paddingBlock="1.5"
      paddingInline="3"
      textDecoration="none"
    >
      <Text variant="label">{item.label}</Text>
    </Link>
  );
}

function noop(): void {
  void 0;
}
