import { Box, Button, Heading, Spinner, Stack } from '@chakra-ui/react';
import type { Trainer } from '@creatures/contracts/trainer';
import type { ReactElement } from 'react';
import { useState } from 'react';
import type { NavigateFunction } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '~/auth/useAuth';
import { AuthCard } from '~/pages/AuthCard';
import { CreateTrainerCard, PageError, TrainerList } from '~/pages/TrainerCard';
import { TrainerDeleteDialog } from '~/pages/TrainerDeleteDialog';
import type { DeleteTrainerResult, TrainerClientErrorCode } from '~/trainers/trainersClient';
import { useTrainers } from '~/trainers/useTrainers';

const SIGNIN_PATH = '/signin';
const GAME_PATH = '/game';
const NEW_TRAINER_PATH = '/trainers/new';
const MAX_TRAINERS = 5;
const ENTER_LABEL = 'Entrar';
const SIGN_OUT_LABEL = 'Sair da conta';

export function TrainersPage(): ReactElement {
  const auth = useAuth();
  const navigate = useNavigate();
  const { trainers, isLoading, error, remove } = useTrainers();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const handlers = buildPageHandlers({
    navigate,
    pendingDeleteId,
    remove,
    selectedId,
    setIsDeleting,
    setPendingDeleteId,
    setSelectedId,
    signOut: auth.signOut,
  });
  const isDeleteOpen = pendingDeleteId !== null;

  return (
    <Box
      alignItems="center"
      as="main"
      bg="bg"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      minH="100dvh"
      p={6}
    >
      <Box mb={8}>
        <Heading color="fg" size="3xl">
          Creatures
        </Heading>
      </Box>
      <AuthCard title="Treinadores">
        <TrainersCard
          error={error}
          handlers={handlers}
          isDeleting={isDeleting}
          isDeleteOpen={isDeleteOpen}
          isLoading={isLoading}
          selectedId={selectedId}
          trainers={trainers}
        />
      </AuthCard>
    </Box>
  );
}

function TrainersCard(props: TrainersCardProps): ReactElement {
  const { error, handlers, isDeleting, isDeleteOpen, isLoading, selectedId, trainers } = props;
  const isEnterDisabled = selectedId === null || isLoading;
  const content = isLoading ? (
    <Spinner alignSelf="center" color="fg.muted" />
  ) : (
    <TrainerList
      selectedId={selectedId}
      trainers={trainers}
      onDelete={handlers.handleRequestDelete}
      onSelect={handlers.handleSelect}
    />
  );
  const createCard =
    trainers.length < MAX_TRAINERS ? <CreateTrainerCard onCreate={handlers.handleCreate} /> : null;
  const errorMessage = error === null ? null : <PageError code={error} />;

  return (
    <Stack align="stretch" gap={4}>
      {content}
      {createCard}
      {errorMessage}
      <Button
        colorPalette="blue"
        disabled={isEnterDisabled}
        variant="solid"
        w="full"
        onClick={handlers.handleEnter}
      >
        {ENTER_LABEL}
      </Button>
      <Button colorPalette="gray" variant="solid" w="full" onClick={handlers.handleSignOut}>
        {SIGN_OUT_LABEL}
      </Button>
      <TrainerDeleteDialog
        isDeleting={isDeleting}
        isOpen={isDeleteOpen}
        onCancel={handlers.handleCancelDelete}
        onConfirm={handlers.handleConfirmDelete}
      />
    </Stack>
  );
}

type TrainersCardProps = {
  error: TrainerClientErrorCode | null;
  handlers: PageHandlers;
  isDeleting: boolean;
  isDeleteOpen: boolean;
  isLoading: boolean;
  selectedId: string | null;
  trainers: Trainer[];
};

type PageHandlers = {
  handleCancelDelete: () => void;
  handleConfirmDelete: () => void;
  handleCreate: () => void;
  handleEnter: () => void;
  handleRequestDelete: (id: string) => void;
  handleSelect: (id: string) => void;
  handleSignOut: () => void;
};

type PageHandlerDeps = {
  navigate: NavigateFunction;
  pendingDeleteId: string | null;
  remove: (id: string) => Promise<DeleteTrainerResult>;
  selectedId: string | null;
  setPendingDeleteId: (id: string | null) => void;
  setSelectedId: (updater: (current: string | null) => string | null) => void;
  setIsDeleting: (value: boolean) => void;
  signOut: () => Promise<void>;
};

function buildPageHandlers(deps: PageHandlerDeps): PageHandlers {
  return {
    handleCancelDelete: buildCancelDeleteHandler(deps.setPendingDeleteId),
    handleConfirmDelete: buildConfirmDeleteHandler(deps),
    handleCreate: buildNavigateHandler(deps.navigate, NEW_TRAINER_PATH),
    // Enter only navigates; the active-trainer session over WebSocket lands in a follow-up PR.
    handleEnter: buildNavigateHandler(deps.navigate, GAME_PATH),
    handleRequestDelete: buildRequestDeleteHandler(deps.setPendingDeleteId),
    handleSelect: buildSelectHandler(deps.setSelectedId),
    handleSignOut: buildSignOutHandler(deps.navigate, deps.signOut),
  };
}

function buildNavigateHandler(navigate: NavigateFunction, path: string): () => void {
  return function handleNavigate(): void {
    navigate(path);
  };
}

function buildRequestDeleteHandler(setPendingDeleteId: (id: string) => void): (id: string) => void {
  return function handleRequestDelete(id: string): void {
    setPendingDeleteId(id);
  };
}

function buildCancelDeleteHandler(setPendingDeleteId: (id: string | null) => void): () => void {
  return function handleCancelDelete(): void {
    setPendingDeleteId(null);
  };
}

function buildConfirmDeleteHandler(deps: PageHandlerDeps): () => void {
  return function handleConfirmDelete(): void {
    const id = deps.pendingDeleteId;
    if (id === null) {
      return;
    }
    deps.setIsDeleting(true);
    deps.remove(id).then(buildDeleteSettler(deps), buildDeleteSettler(deps));
  };
}

function buildDeleteSettler(deps: PageHandlerDeps): (result: DeleteTrainerResult) => void {
  return function settleDelete(): void {
    const id = deps.pendingDeleteId;
    deps.setIsDeleting(false);
    deps.setPendingDeleteId(null);
    deps.setSelectedId(buildSelectionClearer(id));
  };
}

function buildSelectHandler(
  setSelectedId: (updater: (current: string | null) => string | null) => void,
): (id: string) => void {
  return function handleSelect(id: string): void {
    setSelectedId(buildSelectionToggler(id));
  };
}

function buildSelectionToggler(id: string): (current: string | null) => string | null {
  return function toggle(current: string | null): string | null {
    return current === id ? null : id;
  };
}

function buildSelectionClearer(id: string | null): (current: string | null) => string | null {
  return function clear(current: string | null): string | null {
    return current === id ? null : current;
  };
}

function buildSignOutHandler(navigate: NavigateFunction, signOut: () => Promise<void>): () => void {
  return function handleSignOut(): void {
    signOut().then(buildSigninRedirect(navigate), noop);
  };
}

function buildSigninRedirect(navigate: NavigateFunction): () => void {
  return function redirect(): void {
    navigate(SIGNIN_PATH, { replace: true });
  };
}

function noop(): void {
  void 0;
}
