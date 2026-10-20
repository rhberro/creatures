export type ToolbarProps = {
  diamonds: number;
  gold: number;
  onOpenBackpack: () => void;
  onOpenSettings: () => void;
  onOpenStorage: () => void;
  onShowAlert: () => void;
  onSignOut: () => void;
  trainerLevel: number;
  trainerName: string;
};

export type CurrencyLabel = 'diamond' | 'gold';
