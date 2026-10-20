import type { Trainer } from '@creatures/contracts/trainer';
import type { ReactElement } from 'react';
import { useState } from 'react';
import type { NavigateFunction } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '~/auth/useAuth';
import { BrandLayout } from '~/components/domain/brand/BrandLayout';
import { TrainerDeleteDialog } from '~/components/domain/trainer/TrainerDeleteDialog';
import { TrainersPanel } from '~/components/domain/trainer/TrainersPanel';
import { PageError } from '~/pages/TrainerCard';
import type { DeleteTrainerResult, TrainerClientErrorCode } from '~/trainers/trainersClient';
import { useTrainers } from '~/trainers/useTrainers';

const SIGNIN_PATH = '/signin';
const GAME_PATH = '/game';
const NEW_TRAINER_PATH = '/trainers/new';

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
    <BrandLayout>
      <TrainersCard
        error={error}
        handlers={handlers}
        isDeleting={isDeleting}
        isDeleteOpen={isDeleteOpen}
        isLoading={isLoading}
        pendingDeleteId={pendingDeleteId}
        selectedId={selectedId}
        trainers={trainers}
      />
    </BrandLayout>
  );
}

function TrainersCard(props: TrainersCardProps): ReactElement {
  const {
    error,
    handlers,
    isDeleting,
    isDeleteOpen,
    isLoading,
    pendingDeleteId,
    selectedId,
    trainers,
  } = props;
  const pendingTrainerName = findTrainerName(trainers, pendingDeleteId);

  const errorMessage = error === null ? null : <PageError code={error} />;

  return (
    <>
      <TrainersPanel
        error={errorMessage}
        isLoading={isLoading}
        selectedId={selectedId}
        trainers={trainers}
        onCreate={handlers.handleCreate}
        onDelete={handlers.handleRequestDelete}
        onEnter={handlers.handleEnter}
        onSelect={handlers.handleSelect}
        onSignOut={handlers.handleSignOut}
      />
      <TrainerDeleteSection
        isDeleting={isDeleting}
        isOpen={isDeleteOpen}
        trainerName={pendingTrainerName}
        onCancel={handlers.handleCancelDelete}
        onConfirm={handlers.handleConfirmDelete}
      />
    </>
  );
}

type TrainerDeleteSectionProps = {
  isDeleting: boolean;
  isOpen: boolean;
  trainerName: string;
  onCancel: () => void;
  onConfirm: () => void;
};

function TrainerDeleteSection(props: TrainerDeleteSectionProps): ReactElement {
  const { isDeleting, isOpen, trainerName, onCancel, onConfirm } = props;
  return (
    <TrainerDeleteDialog
      isDeleting={isDeleting}
      isOpen={isOpen}
      trainerName={trainerName}
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
}

type TrainersCardProps = {
  error: TrainerClientErrorCode | null;
  handlers: PageHandlers;
  isDeleting: boolean;
  isDeleteOpen: boolean;
  isLoading: boolean;
  pendingDeleteId: string | null;
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

function findTrainerName(trainers: Trainer[], pendingDeleteId: string | null): string {
  if (pendingDeleteId === null) {
    return '';
  }
  const trainer = trainers.find(matchesId(pendingDeleteId));
  return trainer?.name ?? '';
}

function matchesId(id: string): (trainer: Trainer) => boolean {
  return function matches(trainer: Trainer): boolean {
    return trainer.id === id;
  };
}
