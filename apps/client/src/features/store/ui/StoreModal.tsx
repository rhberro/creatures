import { Box } from '@chakra-ui/react';
import type { StoreCatalog } from '@creatures/contracts/store';
import type { ReactElement } from 'react';

import type { StoreTab, StoreView } from '~/features/store/model/store.types';
import { useStore } from '~/features/store/model/useStore';
import { StoreBuyFooter } from '~/features/store/ui/StoreBuyFooter';
import { StoreBuyPanel } from '~/features/store/ui/StoreBuyPanel';
import { StoreSellFooter } from '~/features/store/ui/StoreSellFooter';
import { StoreSellPanel } from '~/features/store/ui/StoreSellPanel';
import { DIVIDER_BOTTOM } from '~/shared/theme';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '~/shared/ui/modal';
import { PopupGroup } from '~/shared/ui/popup';
import { Tab, TabBar, TabPanel, Tabs } from '~/shared/ui/tab';
import { Text } from '~/shared/ui/text';

const TITLE = 'Loja';
const BUY_LABEL = 'Comprar';
const SELL_LABEL = 'Vender';
const STORE_WIDTH = '720px';
const STORE_HEIGHT = '620px';
const BUY_TAB = 'buy';
const SELL_TAB = 'sell';

export type StoreModalProps = {
  contained?: boolean;
  isOpen: boolean;
  onClose: () => void;
  /** The catalog of samples, when the store is shown outside the game. */
  snapshot?: StoreCatalog | null;
};

/**
 * The store of the city.
 *
 * The modal has two tabs: the buy, which is the one that opens, and the sell.
 * The modal does not pause the game: the simulation keeps running with it
 * open.
 */
export function StoreModal(props: StoreModalProps): ReactElement {
  const { contained = false, isOpen, onClose, snapshot = null } = props;
  const store = useStore(isOpen, onClose, snapshot);
  const tabs = buildTabs(store);
  const footer = buildFooter(store);
  return (
    <Modal
      contained={contained}
      height={STORE_HEIGHT}
      isOpen={isOpen}
      onClose={store.close}
      width={STORE_WIDTH}
    >
      {tabs}
      <ModalFooter>{footer}</ModalFooter>
    </Modal>
  );
}

/**
 * The tabs of the modal, with the panel of the one that is active.
 */
function buildTabs(store: StoreView): ReactElement {
  const tabChange = buildTabChange(store.setTab);
  const error = buildErrorMessage(store.error);
  const buyPanel = (
    <TabPanel value={BUY_TAB}>
      <StoreBuyPanel store={store} />
    </TabPanel>
  );
  const sellPanel = (
    <TabPanel value={SELL_TAB}>
      <StoreSellPanel store={store} />
    </TabPanel>
  );
  return (
    <Tabs onValueChange={tabChange} value={store.tab}>
      <ModalHeader>{TITLE}</ModalHeader>
      <Box css={DIVIDER_BOTTOM} paddingBlock="2" paddingInline="4">
        <TabBar>
          <Tab value={BUY_TAB}>{BUY_LABEL}</Tab>
          <Tab value={SELL_TAB}>{SELL_LABEL}</Tab>
        </TabBar>
      </Box>
      <ModalBody>
        <PopupGroup>
          {error}
          {buyPanel}
          {sellPanel}
        </PopupGroup>
      </ModalBody>
    </Tabs>
  );
}

/**
 * The footer of the tab the modal is showing.
 */
function buildFooter(store: StoreView): ReactElement {
  if (store.tab === 'sell') {
    return <StoreSellFooter store={store} />;
  }
  return <StoreBuyFooter store={store} />;
}

/**
 * The message of the last refusal of the server.
 */
function buildErrorMessage(message: string | null): ReactElement | null {
  if (message === null) {
    return null;
  }
  return (
    <Text color="fg.error" marginBlockEnd="3" variant="meta">
      {message}
    </Text>
  );
}

/**
 * The change of the tab: the modal resets itself when the tab changes.
 */
function buildTabChange(setTab: (tab: StoreTab) => void): (value: string) => void {
  return function changeTab(value: string): void {
    setTab(value === SELL_TAB ? 'sell' : 'buy');
  };
}
