import type { ReactNode } from 'react';

export type PressableProps = {
  children: ReactNode;
  disabled?: boolean;
  onPress: () => void;
};
