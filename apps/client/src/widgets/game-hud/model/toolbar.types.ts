export type ToolbarProps = {
  diamonds: number;
  gold: number;
  onOpenBackpack: () => void;
  onOpenStorage: () => void;
  onSignOut: () => void;
  trainerLevel: number;
  trainerName: string;
};

export type CurrencyLabel = 'diamond' | 'gold';
