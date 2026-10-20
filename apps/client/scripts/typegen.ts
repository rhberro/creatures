/**
 * Gera os tipos do tema.
 *
 * O `@chakra-ui/cli` escreve os tipos gerados no pacote instalado do
 * Chakra — e de la que o TypeScript do app le os tokens, as variantes das
 * receitas e as paletas. Como o `bun` instala o pacote por link, o caminho
 * real e resolvido em tempo de execucao.
 */
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);

const PACKAGE_NAME = '@chakra-ui/react';
const SOURCE = './src/theme/system.ts';
const TSCONFIG = './tsconfig.json';

function main(): void {
  const packageDir = path.dirname(require.resolve(`${PACKAGE_NAME}/package.json`));
  const outDir = path.join(packageDir, 'dist/types/styled-system/generated');
  const binary = path.join('node_modules', '.bin', 'chakra');

  const result = spawnSync(
    binary,
    ['typegen', SOURCE, '--outdir', outDir, '--tsconfig', TSCONFIG],
    { stdio: 'inherit' },
  );

  if (result.status !== 0) {
    throw new Error('typegen falhou');
  }
}

main();
