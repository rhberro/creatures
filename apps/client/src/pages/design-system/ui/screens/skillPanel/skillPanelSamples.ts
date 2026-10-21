import type { PanelCardEntry } from '~/features/skill-panel';

/**
 * The sample data of the panels of the skill bar.
 *
 * The gallery draws the real components with data of a trainer that does not
 * exist: the game screen never reads this file.
 */
export const SAMPLE_ABILITIES: PanelCardEntry[] = [
  {
    description: null,
    disabled: false,
    id: 'ability-brasa',
    kind: 'ability',
    name: 'Brasa',
    note: 'Recarga 4s',
    selected: false,
  },
  {
    description: null,
    disabled: false,
    id: 'ability-ignea',
    kind: 'ability',
    name: 'Ígnea',
    note: 'Recarga 7s',
    selected: false,
  },
  {
    description: null,
    disabled: true,
    id: 'ability-garra',
    kind: 'ability',
    name: 'Garra',
    note: 'Nível mínimo de 30 não alcançado',
    selected: false,
  },
  {
    description: null,
    disabled: false,
    id: 'ability-investida',
    kind: 'ability',
    name: 'Investida',
    note: 'Recarga 5s',
    selected: true,
  },
];

export const SAMPLE_CONSUMABLES: PanelCardEntry[] = [
  {
    description: 'Restaura mais vida que a poção comum.',
    disabled: false,
    id: '1b2c3d4e-5f6a-4b7c-8d9e-0f1a2b3c4d5e',
    kind: 'consumable',
    name: 'Poção de Cura Forte',
    note: 'Na mochila: 12',
    selected: false,
  },
  {
    description: 'Restaura a vida de uma criatura.',
    disabled: false,
    id: '0a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d',
    kind: 'consumable',
    name: 'Poção de Cura',
    note: 'Na mochila: 93',
    selected: true,
  },
  {
    description: 'Restaura pouca vida, mas sai barato.',
    disabled: true,
    id: '2c3d4e5f-6a7b-4c8d-9e0f-1a2b3c4d5e6f',
    kind: 'consumable',
    name: 'Poção Fraca',
    note: 'Na mochila: 0',
    selected: false,
  },
];

export const SAMPLE_DEVICES: PanelCardEntry[] = [
  {
    description: 'Dispositivo de captura de multiplicador alto.',
    disabled: false,
    id: '3d4e5f6a-7b8c-4d9e-8f0a-2b3c4d5e6f7a',
    kind: 'device',
    name: 'Prisma de Captura',
    note: 'Na mochila: 3',
    selected: false,
  },
  {
    description: 'Dispositivo de captura bruto, de multiplicador máximo.',
    disabled: true,
    id: '5f6a7b8c-9d0e-4f1a-8b2c-4d5e6f7a8b9c',
    kind: 'device',
    name: 'Cristal Bruto',
    note: 'Na mochila: 0',
    selected: false,
  },
  {
    description: 'Dispositivo de captura mais simples, multiplicador 1x.',
    disabled: false,
    id: '4e5f6a7b-8c9d-4e0f-9a1b-3c4d5e6f7a8b',
    kind: 'device',
    name: 'Prisma Simples',
    note: 'Na mochila: 2',
    selected: true,
  },
];
