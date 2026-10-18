type SemanticTokenLeaf = {
  value: string;
};

type GameSemanticTokens = {
  currency: {
    diamond: SemanticTokenLeaf;
    gold: SemanticTokenLeaf;
  };
  state: {
    selected: SemanticTokenLeaf;
  };
  status: {
    hp: SemanticTokenLeaf;
    stamina: SemanticTokenLeaf;
  };
};

const NEUTRAL = '{colors.gray.500}';

export const gameSemanticTokens: GameSemanticTokens = {
  currency: {
    diamond: { value: NEUTRAL },
    gold: { value: NEUTRAL },
  },
  state: {
    selected: { value: NEUTRAL },
  },
  status: {
    hp: { value: NEUTRAL },
    stamina: { value: NEUTRAL },
  },
};
