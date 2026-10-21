import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { LoadingIndicator } from '~/shared/ui/loading';

import { EmptyState } from './EmptyState';
import type { EmptyStateIcon, EmptyStateTone } from './EmptyState';

export type PanelStateVariant = 'empty' | 'error' | 'loading';

export type PanelStateProps = {
  /** The sentence under the title, when the title is not enough. */
  description?: string;
  /** The mark of the state. Defaults to the magnifier of a search that found nothing. */
  icon?: EmptyStateIcon;
  title: string;
  variant: PanelStateVariant;
};

/**
 * The state of a panel: nothing there, still loading, or failed.
 *
 * Every panel of the game answers with the same component, so the player reads
 * the three states the same way everywhere. The empty and the error states
 * are the shared `EmptyState`; the loading state is the shared loader, with
 * the message centered in the area of the panel, so the footer with the
 * search does not move.
 */
export function PanelState(props: PanelStateProps): ReactElement {
  const { description, icon, title, variant } = props;
  if (variant === 'loading') {
    return <LoadingState description={description} title={title} />;
  }
  const mark = resolveIcon(icon, variant);
  const tone = resolveTone(variant);
  return <EmptyState description={description} icon={mark} title={title} tone={tone} />;
}

/**
 * The error state is a failure, not a search that found nothing: it gets the
 * closed mark instead of the magnifier.
 */
function resolveIcon(icon: EmptyStateIcon | undefined, variant: PanelStateVariant): EmptyStateIcon {
  if (icon !== undefined) {
    return icon;
  }
  return variant === 'error' ? 'empty' : 'search';
}

/**
 * The failure speaks with the color of the error of the theme.
 */
function resolveTone(variant: PanelStateVariant): EmptyStateTone {
  return variant === 'error' ? 'error' : 'default';
}

type LoadingStateProps = {
  description?: string;
  title: string;
};

function LoadingState(props: LoadingStateProps): ReactElement {
  const { description, title } = props;
  return (
    <Box
      alignItems="center"
      display="flex"
      flexDirection="column"
      gap="4"
      height="full"
      justifyContent="center"
      padding="8"
      width="full"
    >
      <LoadingIndicator message={description} title={title} />
    </Box>
  );
}
