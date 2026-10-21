import { Box, Spinner } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { Text } from '~/shared/ui/text';
import type { TextVariant } from '~/shared/ui/text';

const SPINNER_SIZE = 'md';

export type LoadingIndicatorProps = {
  /** The sentence under the spinner. */
  message?: string;
  /** The voice of the message. Defaults to the voice of a body text. */
  messageVariant?: TextVariant;
  /** The title above the spinner. */
  title?: string;
  /** The voice of the title. Defaults to the voice of a name. */
  titleVariant?: TextVariant;
};

/**
 * The loader: a spinner with a centered message.
 *
 * The same mark everywhere something is loading — the screen between routes,
 * the body of a panel that waits for its data. The panel version keeps the
 * area of the panel, so the footer with the search does not move.
 */
export function LoadingIndicator(props: LoadingIndicatorProps): ReactElement {
  const { message, messageVariant = 'body', title, titleVariant = 'name' } = props;
  const heading = title === undefined ? null : <LoadingTitle text={title} variant={titleVariant} />;
  const sentence =
    message === undefined ? null : <LoadingMessage text={message} variant={messageVariant} />;
  return (
    <Box alignItems="center" display="flex" flexDirection="column" gap="4">
      {heading}
      <Spinner color="accent.arcane" size={SPINNER_SIZE} />
      {sentence}
    </Box>
  );
}

type LoadingTitleProps = {
  text: string;
  variant: TextVariant;
};

function LoadingTitle(props: LoadingTitleProps): ReactElement {
  const { text, variant } = props;
  return (
    <Text color="fg" textAlign="center" variant={variant}>
      {text}
    </Text>
  );
}

type LoadingMessageProps = {
  text: string;
  variant: TextVariant;
};

function LoadingMessage(props: LoadingMessageProps): ReactElement {
  const { text, variant } = props;
  return (
    <Text color="fg.muted" maxW="40ch" textAlign="center" variant={variant}>
      {text}
    </Text>
  );
}
