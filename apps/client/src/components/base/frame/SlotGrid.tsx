import { Box } from '@chakra-ui/react';
import {
  isValidElement,
  useEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';

import { Slot } from '~/components/base/frame/Slot';

const SLOT_SIZE = 56;
const SLOT_GAP = 4;
const EMPTY_DEPS: ReadonlyArray<unknown> = [];

type SlotGridProps = {
  children: ReactNode;
};

/**
 * A grade de slots.
 *
 * A grade **preenche o painel**: as colunas se ajustam a largura e a ultima
 * linha e completada com slots vazios. Uma grade com numero fixo de colunas
 * deixa o resto do painel vazio — e o painel vazio e o que faz a interface
 * parecer quebrada.
 *
 * A grade **nao cria linha nova**: tres itens fazem uma linha, nao tres
 * linhas de onze. O scroll so aparece quando o conteudo realmente nao cabe.
 *
 * O slot e a unica forma de mostrar item, criatura ou habilidade: nada de
 * circulo, nada de quadrado solto.
 */
export function SlotGrid(props: SlotGridProps): ReactElement {
  const { children } = props;
  const gridRef = useRef<HTMLDivElement | null>(null);
  const [columns, setColumns] = useState<number>(0);
  const template = buildTemplate();
  const empty = buildEmptySlots(columns, countChildren(children));

  useEffect(observeColumns, EMPTY_DEPS);

  function observeColumns(): () => void {
    const element = gridRef.current;
    if (!element || typeof ResizeObserver === 'undefined') {
      return noop;
    }
    const observer = new ResizeObserver(handleResize);
    observer.observe(element);
    return function teardown(): void {
      observer.disconnect();
    };
  }

  function handleResize(entries: ResizeObserverEntry[]): void {
    const entry = entries[0];
    if (!entry) {
      return;
    }
    // A largura do conteudo: e a mesma que o auto-fill usa para as colunas.
    setColumns(computeColumns(entry.contentRect.width));
  }

  return (
    <Box display="grid" gap="1" gridTemplateColumns={template} justifyContent="start" ref={gridRef}>
      {children}
      {empty}
    </Box>
  );
}

function buildTemplate(): string {
  return `repeat(auto-fill, ${SLOT_SIZE}px)`;
}

function computeColumns(width: number): number {
  return Math.max(1, Math.floor((width + SLOT_GAP) / (SLOT_SIZE + SLOT_GAP)));
}

function countChildren(children: ReactNode): number {
  if (Array.isArray(children)) {
    return children.length;
  }
  if (isValidElement(children)) {
    return 1;
  }
  return 0;
}

/**
 * Os slots vazios que faltam para a ultima linha fechar.
 *
 * Nao ha linha nova: se o conteudo cabe em uma linha, a grade tem uma linha.
 */
function buildEmptySlots(columns: number, filled: number): ReactElement[] {
  if (columns === 0) {
    return [];
  }
  const slots: ReactElement[] = [];
  const total = (columns - (filled % columns)) % columns;
  for (let index = 0; index < total; index += 1) {
    slots.push(buildEmptySlot(index));
  }
  return slots;
}

function buildEmptySlot(index: number): ReactElement {
  const key = `empty-${index}`;
  return <Slot empty key={key} />;
}

function noop(): void {
  void 0;
}
