import type { TeamView } from '~/entities/team';

export type StorageModalProps = {
  contained?: boolean;
  /**
   * Whether the trainer is hunting.
   *
   * The hunt closes the team: the actions that change it are disabled while
   * it lasts, and the reading of the storage goes on.
   */
  isHunting?: boolean;
  isOpen: boolean;
  onClose: () => void;
  /** The player state the modal shows; when it is absent, the modal reads it. */
  snapshot?: TeamView;
};
