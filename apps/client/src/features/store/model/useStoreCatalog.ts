import type { StoreBagItem, StoreCatalog, StoreItem } from '@creatures/contracts/store';
import { type Dispatch, type SetStateAction, useCallback, useEffect, useState } from 'react';

import { readStoreErrorMessage } from '~/features/store/model/storeMessages';
import { createApiDeps } from '~/shared/api';
// The endpoint is imported by its own path until the barrel of the shared API
// publishes it. The barrel line is the one reported in the reconciliation.
import {
  requestStoreBuy,
  requestStoreCatalog,
  requestStoreSell,
} from '~/shared/api/endpoints/store';
import type {
  StoreCatalogResult,
  StoreCommandResult,
  StoreOutcome,
} from '~/shared/api/endpoints/store';
import { getAccessToken } from '~/shared/auth';

export type StoreCatalogView = {
  /** The items of the backpack, grouped. */
  bag: StoreBagItem[];
  /** Buys the selected item. */
  buy: (itemId: string, quantity: number, onDone: (outcome: StoreOutcome) => void) => void;
  /** The items the store sells. */
  catalog: StoreItem[];
  /** The message of the last refusal of the server. */
  error: string | null;
  /** The gold the trainer has. */
  gold: number;
  /** The command is running: the button waits for the server. */
  isBusy: boolean;
  /** The catalog is loading. */
  isLoading: boolean;
  /** Sells a quantity of an item of the backpack. */
  sell: (itemId: string, quantity: number, onDone: (outcome: StoreOutcome) => void) => void;
};

type StoreWallet = {
  bag: StoreBagItem[];
  error: string | null;
  gold: number;
};

const EMPTY_WALLET: StoreWallet = { bag: [], error: null, gold: 0 };

/**
 * The catalog of the store and the wallet of the trainer.
 *
 * The server is the source of all of them: the modal reads the catalog when
 * it opens, and every command answers with the new wallet and the new
 * backpack.
 */
export function useStoreCatalog(isOpen: boolean, snapshot: StoreCatalog | null): StoreCatalogView {
  const [catalog, setCatalog] = useState<StoreItem[]>([]);
  const [wallet, setWallet] = useState<StoreWallet>(EMPTY_WALLET);
  const [isBusy, setIsBusy] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(loadWhenOpen, [isOpen, snapshot]);

  function loadWhenOpen(): void {
    if (!isOpen) {
      return;
    }
    if (snapshot !== null) {
      applySnapshot(snapshot, setCatalog, setWallet);
      return;
    }
    setIsLoading(true);
    requestStoreCatalog(createApiDeps(getAccessToken)).then(function withCatalog(
      result: StoreCatalogResult,
    ): void {
      applyCatalog(result, setCatalog, setWallet, setIsLoading);
    });
  }

  const buy = useStoreCommand(requestStoreBuy, setIsBusy, setWallet);
  const sell = useStoreCommand(requestStoreSell, setIsBusy, setWallet);

  return {
    bag: wallet.bag,
    buy,
    catalog,
    error: wallet.error,
    gold: wallet.gold,
    isBusy,
    isLoading,
    sell,
  };
}

type StoreCommand = (
  deps: ReturnType<typeof createApiDeps>,
  itemId: string,
  quantity: number,
) => Promise<StoreCommandResult>;

/**
 * A command of the store: the buy and the sale share the same shape.
 */
function useStoreCommand(
  command: StoreCommand,
  setIsBusy: (isBusy: boolean) => void,
  setWallet: Dispatch<SetStateAction<StoreWallet>>,
): (itemId: string, quantity: number, onDone: (outcome: StoreOutcome) => void) => void {
  return useCallback(
    function runCommand(
      itemId: string,
      quantity: number,
      onDone: (outcome: StoreOutcome) => void,
    ): void {
      setIsBusy(true);
      command(createApiDeps(getAccessToken), itemId, quantity).then(function withOutcome(
        result: StoreCommandResult,
      ): void {
        setIsBusy(false);
        applyOutcome(setWallet, result, onDone);
      });
    },
    [command, setIsBusy, setWallet],
  );
}

function applySnapshot(
  catalog: StoreCatalog,
  setCatalog: (items: StoreItem[]) => void,
  setWallet: (wallet: StoreWallet) => void,
): void {
  setCatalog(catalog.items);
  setWallet({ bag: catalog.bag, error: null, gold: catalog.gold });
}

/**
 * The catalog that arrives: the store shows what it sells and what the
 * trainer owns.
 */
function applyCatalog(
  result: StoreCatalogResult,
  setCatalog: (items: StoreItem[]) => void,
  setWallet: (wallet: StoreWallet) => void,
  setIsLoading: (isLoading: boolean) => void,
): void {
  setIsLoading(false);
  if (!result.ok) {
    // The catalog that does not load leaves the store empty: the player sees a
    // store with nothing in it, and no action that fails silently.
    setCatalog([]);
    setWallet(EMPTY_WALLET);
    return;
  }
  applySnapshot(result.catalog, setCatalog, setWallet);
}

/**
 * The answer of a command: the new wallet and the new backpack, or the reason
 * of the refusal.
 */
function applyOutcome(
  setWallet: Dispatch<SetStateAction<StoreWallet>>,
  result: StoreCommandResult,
  onDone: (outcome: StoreOutcome) => void,
): void {
  if (!result.ok) {
    readRefusal(setWallet, result.code);
    return;
  }
  setWallet({ bag: result.outcome.bag, error: null, gold: result.outcome.gold });
  onDone(result.outcome);
}

/**
 * The refusal of the server.
 *
 * The wallet stays as it is: the catalog, the backpack and the gold are still
 * true, and the player adjusts the quantity and tries again. Only the reason
 * of the refusal is new.
 */
function readRefusal(
  setWallet: Dispatch<SetStateAction<StoreWallet>>,
  code: Parameters<typeof readStoreErrorMessage>[0],
): void {
  setWallet(function withError(wallet: StoreWallet): StoreWallet {
    return { ...wallet, error: readStoreErrorMessage(code) };
  });
}
