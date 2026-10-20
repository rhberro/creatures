export type Ability = {
  description: string;
  disabled?: boolean;
  element: string;
  equipped?: boolean;
  name: string;
  note: string;
  tone: string;
};

export const ABILITIES: Ability[] = [
  {
    description: 'Avança e causa dano no primeiro inimigo encontrado.',
    element: 'ember',
    name: 'Brasa',
    note: 'Recarga 4s',
    tone: 'ember.400',
  },
  {
    description: 'Cospe uma coluna de fogo no ponto apontado.',
    element: 'ember',
    name: 'Ígnea',
    note: 'Recarga 7s',
    tone: 'ember.400',
  },
  {
    description: 'Golpe curto com dano físico.',
    disabled: true,
    element: 'base',
    name: 'Garra',
    note: 'Nível mínimo de 30 não alcançado',
    tone: 'base.300',
  },
  {
    description: 'Investida que atravessa a linha.',
    element: 'base',
    equipped: true,
    name: 'Investida',
    note: 'Equipado no slot 3',
    tone: 'base.300',
  },
];

export const CONSUMABLES: Ability[] = [
  {
    description: 'Restaura 80 pontos de vida.',
    element: 'hunt',
    name: 'Poção de Cura Forte',
    note: 'Na mochila: 12',
    tone: 'verdant.400',
  },
  {
    description: 'Restaura 40 pontos de vida.',
    element: 'hunt',
    name: 'Poção de Cura',
    note: 'Na mochila: 93',
    tone: 'verdant.400',
  },
  {
    description: 'Restaura 15 pontos de vida.',
    disabled: true,
    element: 'hunt',
    name: 'Poção Fraca',
    note: 'Na mochila: 0',
    tone: 'verdant.400',
  },
];

export const DEVICES: Ability[] = [
  {
    description: 'Chance de captura dobrada.',
    element: 'ice',
    name: 'Prisma de Captura',
    note: 'Na mochila: 3',
    tone: 'frost.400',
  },
  {
    description: 'Captura comum de criatura selvagem.',
    disabled: true,
    element: 'ice',
    name: 'Cristal Bruto',
    note: 'Na mochila: 0',
    tone: 'frost.400',
  },
  {
    description: 'Prisma de captura comum.',
    element: 'ice',
    equipped: true,
    name: 'Prisma Simples',
    note: 'Equipado no slot 7',
    tone: 'frost.400',
  },
];
