export type RailItem = {
  href: string;
  label: string;
};

export type RailSubGroup = {
  items: RailItem[];
  label: string;
};

export type RailGroup = {
  group: string;
  items: RailItem[];
  subGroups: RailSubGroup[];
};

/**
 * Os alvos de ancora das telas. Vivem num lugar so para o rail e a secao
 * nunca apontarem para ids diferentes.
 */
export const SCREEN_ANCHORS = {
  analiseDaCacada: 'analise-da-cacada',
  armazenamento: 'armazenamento',
  carregando: 'carregando',
  criarConta: 'criar-conta',
  criarTreinador: 'criar-treinador',
  detalheDaCriatura: 'detalhe-da-criatura',
  detalheDoItem: 'detalhe-do-item',
  detalhesDoLocal: 'detalhes-do-local',
  entrar: 'entrar',
  locaisDeCaca: 'locais-de-caca',
  loja: 'loja',
  mochila: 'mochila',
  mochilaVazia: 'mochila-vazia',
  novaSenha: 'nova-senha',
  painelConsumiveis: 'painel-consumiveis',
  painelDispositivos: 'painel-dispositivos',
  painelHabilidades: 'painel-habilidades',
  privacidade: 'privacidade',
  reconectar: 'reconectar',
  recuperarSenha: 'recuperar-senha',
  telaDoJogo: 'tela-do-jogo',
  termos: 'termos',
  treinadores: 'treinadores',
  treinadoresVazios: 'treinadores-vazios',
} as const;

export const RAIL_GROUPS: RailGroup[] = [
  {
    group: 'Fundação',
    items: [
      { href: '#cores', label: 'Cores' },
      { href: '#tipografia', label: 'Tipografia' },
    ],
    subGroups: [],
  },
  {
    group: 'Componentes',
    items: [
      { href: '#superficies', label: 'Superfícies' },
      { href: '#componentes', label: 'Componentes' },
      { href: '#icones', label: 'Ícones' },
      { href: '#estados', label: 'Estados' },
    ],
    subGroups: [],
  },
  {
    group: 'Telas do app',
    items: [],
    subGroups: [
      {
        items: [
          { href: `#${SCREEN_ANCHORS.telaDoJogo}`, label: 'Tela do jogo' },
          { href: `#${SCREEN_ANCHORS.loja}`, label: 'Loja' },
        ],
        label: 'Jogo',
      },
      {
        items: [
          { href: `#${SCREEN_ANCHORS.entrar}`, label: 'Entrar' },
          { href: `#${SCREEN_ANCHORS.criarConta}`, label: 'Criar conta' },
          { href: `#${SCREEN_ANCHORS.recuperarSenha}`, label: 'Recuperar senha' },
          { href: `#${SCREEN_ANCHORS.novaSenha}`, label: 'Nova senha' },
          { href: `#${SCREEN_ANCHORS.termos}`, label: 'Termos de serviço' },
          { href: `#${SCREEN_ANCHORS.privacidade}`, label: 'Privacidade' },
        ],
        label: 'Autenticação',
      },
      {
        items: [
          { href: `#${SCREEN_ANCHORS.treinadores}`, label: 'Lista de treinadores' },
          { href: `#${SCREEN_ANCHORS.criarTreinador}`, label: 'Criar treinador' },
        ],
        label: 'Treinadores',
      },
      {
        items: [
          { href: `#${SCREEN_ANCHORS.mochila}`, label: 'Mochila' },
          { href: `#${SCREEN_ANCHORS.armazenamento}`, label: 'Armazenamento' },
        ],
        label: 'Cidade',
      },
      {
        items: [
          { href: `#${SCREEN_ANCHORS.locaisDeCaca}`, label: 'Locais de caça' },
          { href: `#${SCREEN_ANCHORS.detalhesDoLocal}`, label: 'Detalhes do local' },
          { href: `#${SCREEN_ANCHORS.analiseDaCacada}`, label: 'Análise da caçada' },
        ],
        label: 'Caçada',
      },
      {
        items: [
          { href: `#${SCREEN_ANCHORS.painelHabilidades}`, label: 'Habilidades' },
          { href: `#${SCREEN_ANCHORS.painelConsumiveis}`, label: 'Consumíveis' },
          { href: `#${SCREEN_ANCHORS.painelDispositivos}`, label: 'Dispositivos' },
        ],
        label: 'Painéis de habilidade',
      },
      {
        items: [
          { href: `#${SCREEN_ANCHORS.reconectar}`, label: 'Conexão perdida' },
          { href: `#${SCREEN_ANCHORS.carregando}`, label: 'Carregando' },
          { href: `#${SCREEN_ANCHORS.mochilaVazia}`, label: 'Mochila vazia' },
          { href: `#${SCREEN_ANCHORS.treinadoresVazios}`, label: 'Treinadores vazios' },
          { href: `#${SCREEN_ANCHORS.detalheDaCriatura}`, label: 'Detalhe da criatura' },
          { href: `#${SCREEN_ANCHORS.detalheDoItem}`, label: 'Detalhe do item' },
        ],
        label: 'Estados do sistema',
      },
    ],
  },
];
