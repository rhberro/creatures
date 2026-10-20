import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

import { gameTokens, paletteTokens, radiusTokens, surfaceTokens } from './semanticTokens';
import { textStyles } from './textStyles';
import { colors, fonts, radii, shadows } from './tokens';

const scrollbar = {
  '&::-webkit-scrollbar': {
    height: '8px',
    width: '8px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: '{colors.base.700}',
    borderRadius: '2px',
  },
  '&::-webkit-scrollbar-thumb:hover': {
    background: '{colors.base.600}',
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent',
  },
};

const globalCss = {
  '#root': {
    boxShadow: 'inset 0 0 180px 0 rgba(0, 0, 0, 0.4)',
  },
  '::selection': {
    background: '{colors.gold.500}',
    color: '{colors.base.950}',
  },
  '@keyframes alert-enter': {
    from: { opacity: '0', transform: 'translateX(24px)' },
    to: { opacity: '1', transform: 'translateX(0)' },
  },
  '@keyframes alert-exit': {
    from: { opacity: '1', transform: 'translateX(0)' },
    to: { opacity: '0', transform: 'translateX(24px)' },
  },
  '@media (prefers-reduced-motion: reduce)': {
    '*, *::before, *::after': {
      animationDuration: '0.01ms !important',
      animationIterationCount: '1 !important',
      scrollBehavior: 'auto !important',
      transitionDuration: '0.01ms !important',
    },
  },
  body: {
    fontFamily: 'body',
    textRendering: 'auto',
    ...scrollbar,
  },
  'html, body, #root': {
    background: '{colors.base.950}',
    color: '{colors.base.50}',
    colorScheme: 'dark',
    minHeight: '100%',
  },
};

const config = defineConfig({
  globalCss,
  theme: {
    semanticTokens: {
      colors: {
        ...surfaceTokens,
        ...gameTokens,
        ...paletteTokens,
      },
      radii: radiusTokens,
    },
    textStyles,
    tokens: {
      colors,
      fonts,
      radii,
      shadows,
    },
  },
});

export const system = createSystem(defaultConfig, config);
