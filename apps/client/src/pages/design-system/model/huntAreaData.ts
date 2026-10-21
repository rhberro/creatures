export type AreaEntry = {
  name: string;
  tone: string;
};

export type Area = {
  creatures: AreaEntry[];
  items: AreaEntry[];
  minimum: string;
  name: string;
  recommended: string;
  tone: string;
};

export const AREAS: Area[] = [
  {
    creatures: [
      { name: 'Brasinha', tone: 'ember.400' },
      { name: 'Musguinho', tone: 'verdant.400' },
      { name: 'Pipoca', tone: 'gold.400' },
      { name: 'Casulo', tone: 'base.300' },
    ],
    items: [
      { name: 'Poção de Cura', tone: 'verdant.400' },
      { name: 'Fibra', tone: 'gold.400' },
      { name: 'Cinza', tone: 'base.300' },
    ],
    minimum: '1',
    name: 'Campina Cinzenta',
    recommended: '3',
    tone: 'ember.400',
  },
  {
    creatures: [
      { name: 'Voador', tone: 'frost.400' },
      { name: 'Pinguim', tone: 'frost.300' },
      { name: 'Gelo-Fino', tone: 'arcane.400' },
      { name: 'Névora', tone: 'base.300' },
    ],
    items: [
      { name: 'Gelo Eterno', tone: 'frost.400' },
      { name: 'Pena', tone: 'base.300' },
      { name: 'Poção de Cura', tone: 'verdant.400' },
    ],
    minimum: '5',
    name: 'Lago Congelado',
    recommended: '7',
    tone: 'frost.400',
  },
  {
    creatures: [
      { name: 'Brotinho', tone: 'verdant.400' },
      { name: 'Espinho', tone: 'verdant.300' },
      { name: 'Raiz-Forte', tone: 'gold.400' },
      { name: 'Mariposa', tone: 'arcane.400' },
      { name: 'Lagarta', tone: 'base.300' },
    ],
    items: [
      { name: 'Seiva', tone: 'verdant.400' },
      { name: 'Folha Seca', tone: 'gold.400' },
      { name: 'Pólen', tone: 'arcane.400' },
    ],
    minimum: '9',
    name: 'Bosque Urrante',
    recommended: '11',
    tone: 'verdant.400',
  },
  {
    creatures: [
      { name: 'Pedrinha', tone: 'base.300' },
      { name: 'Golem', tone: 'base.400' },
      { name: 'Areia Viva', tone: 'gold.400' },
    ],
    items: [
      { name: 'Pedra', tone: 'base.300' },
      { name: 'Areia', tone: 'gold.400' },
    ],
    minimum: '14',
    name: 'Ruínas de Pedra',
    recommended: '15',
    tone: 'base.300',
  },
  {
    creatures: [
      { name: 'Fagulha', tone: 'ember.400' },
      { name: 'Cinzas', tone: 'base.400' },
      { name: 'Brasa', tone: 'ember.300' },
      { name: 'Escama', tone: 'blood.400' },
    ],
    items: [
      { name: 'Fogo Raso', tone: 'ember.400' },
      { name: 'Couro', tone: 'blood.400' },
      { name: 'Poção de Cura', tone: 'verdant.400' },
    ],
    minimum: '18',
    name: 'Rajada Morta',
    recommended: '20',
    tone: 'blood.400',
  },
  {
    creatures: [
      { name: 'Orvalho', tone: 'arcane.400' },
      { name: 'Vagalume', tone: 'frost.400' },
      { name: 'Sussurro', tone: 'verdant.300' },
      { name: 'Sombra', tone: 'base.400' },
      { name: 'Eco', tone: 'arcane.300' },
      { name: 'Bruma', tone: 'base.300' },
    ],
    items: [
      { name: 'Cristal Fino', tone: 'arcane.400' },
      { name: 'Pó de Lua', tone: 'frost.400' },
      { name: 'Éter', tone: 'arcane.300' },
    ],
    minimum: '23',
    name: 'Vale do Sussurro',
    recommended: '25',
    tone: 'arcane.400',
  },
  {
    creatures: [
      { name: 'Cinzeiro', tone: 'base.400' },
      { name: 'Ferrugem', tone: 'blood.300' },
      { name: 'Torrão', tone: 'gold.400' },
    ],
    items: [
      { name: 'Sucata', tone: 'base.400' },
      { name: 'Ferro', tone: 'base.300' },
    ],
    minimum: '28',
    name: 'Eclusa de Ferro',
    recommended: '30',
    tone: 'base.400',
  },
  {
    creatures: [
      { name: 'Vigília', tone: 'arcane.300' },
      { name: 'Ceifa', tone: 'blood.400' },
      { name: 'Mímico', tone: 'frost.400' },
      { name: 'Véu', tone: 'base.300' },
    ],
    items: [
      { name: 'Fragmento', tone: 'arcane.300' },
      { name: 'Relíquia', tone: 'gold.400' },
      { name: 'Cinza Sagrada', tone: 'blood.400' },
    ],
    minimum: '34',
    name: 'Cripta Silente',
    recommended: '36',
    tone: 'arcane.300',
  },
];

export const AREA_PAGE_COUNT = 9;
