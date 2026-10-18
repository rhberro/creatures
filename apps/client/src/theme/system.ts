import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

import { gameSemanticTokens } from './tokens';

const semanticTokens = { colors: gameSemanticTokens };
const theme = { semanticTokens };
const configInput = { theme };
const config = defineConfig(configInput);

export const system = createSystem(defaultConfig, config);
