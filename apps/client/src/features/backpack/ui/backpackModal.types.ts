import type { TeamView } from '~/entities/team';

export type BackpackModalProps = {
  contained?: boolean;
  isOpen: boolean;
  onClose: () => void;
  /** The player state the modal shows; when it is absent, the modal reads it. */
  snapshot?: TeamView;
};
