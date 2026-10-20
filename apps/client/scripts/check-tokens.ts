/**
 * O guarda dos tokens.
 *
 * O Chakra aceita qualquer string em uma prop de cor: `bg="coin"` compila,
 * passa no typecheck e vira `background: coin` — CSS invalido, que o
 * navegador descarta em silencio. O resultado e um elemento sem cor, sem erro
 * e sem aviso.
 *
 * Este script fecha essa porta: ele resolve cada valor de cor pelo mesmo
 * dicionario de tokens que a interface usa e aponta o que nao existe.
 *
 * Ele roda no `typecheck` e no `build`.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

import ts from 'typescript';

import { system } from '~/theme/system';

const SOURCE_DIR = 'src';
const BASE_DIR = 'src/components/base';

/**
 * As props que recebem cor. O valor delas precisa existir no tema.
 */
const COLOR_PROPS = [
  'accentColor',
  'background',
  'bg',
  'bgColor',
  'borderColor',
  'borderBottomColor',
  'borderLeftColor',
  'borderRightColor',
  'borderTopColor',
  'boxShadow',
  'caretColor',
  'columnRuleColor',
  'color',
  'fill',
  'focusRingColor',
  'outlineColor',
  'stroke',
  'textDecorationColor',
  'textShadow',
];

const ALLOWED_RAW_VALUES = ['currentcolor', 'inherit', 'none', 'revert', 'unset'];

const RAW_SCALE_PATTERN = /^[a-z]+\.[0-9]{2,3}$/u;

type Finding = {
  file: string;
  line: number;
  message: string;
};

function main(): void {
  const files = collectFiles(SOURCE_DIR);
  const findings: Finding[] = [];

  for (const file of files) {
    findings.push(...inspectFile(file));
  }

  report(findings);
}

function collectFiles(directory: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(directory)) {
    const fullPath = path.join(directory, entry);
    if (statSync(fullPath).isDirectory()) {
      files.push(...collectFiles(fullPath));
      continue;
    }
    if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  return files;
}

function inspectFile(file: string): Finding[] {
  const source = readFileSync(file, 'utf8');
  const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const findings: Finding[] = [];

  visit(tree, buildAttributeVisitor(tree, file, findings));

  return findings;
}

function visit(node: ts.Node, callback: (node: ts.Node) => void): void {
  callback(node);
  ts.forEachChild(node, buildChildVisitor(callback));
}

function buildChildVisitor(callback: (node: ts.Node) => void): (child: ts.Node) => void {
  return function visitChild(child: ts.Node): void {
    visit(child, callback);
  };
}

function buildAttributeVisitor(
  tree: ts.SourceFile,
  file: string,
  findings: Finding[],
): (node: ts.Node) => void {
  return function inspectAttribute(node: ts.Node): void {
    if (!ts.isJsxAttribute(node) || !node.initializer) {
      return;
    }
    const name = node.name.getText(tree);
    if (!COLOR_PROPS.includes(name)) {
      return;
    }
    if (!ts.isStringLiteral(node.initializer)) {
      return;
    }
    const value = node.initializer.text;
    const problem = checkValue(file, name, value);
    if (problem) {
      findings.push({
        file,
        line: tree.getLineAndCharacterOfPosition(node.getStart()).line + 1,
        message: problem,
      });
    }
  };
}

/**
 * Resolve o valor pelo mesmo dicionario de tokens que a interface usa.
 */
function checkValue(file: string, prop: string, value: string): string | null {
  const normalized = value.trim().toLowerCase();
  if (normalized === '') {
    return null;
  }
  if (ALLOWED_RAW_VALUES.includes(normalized)) {
    return null;
  }
  if (normalized.startsWith('var(')) {
    return null;
  }
  if (isRawColor(normalized)) {
    return `cor crua ("${value}"): use um token do tema`;
  }

  if (!resolvesToToken(prop, value)) {
    return `token inexistente ("${value}")`;
  }

  if (file.startsWith(BASE_DIR) && RAW_SCALE_PATTERN.test(normalized)) {
    return `passo cru de escala ("${value}"): use um token semantico`;
  }

  return null;
}

function resolvesToToken(prop: string, value: string): boolean {
  const resolved = system.css({ [prop]: value } as Record<string, string>);
  return Object.values(resolved).some(isChakraVar);
}

function isChakraVar(entry: unknown): boolean {
  return typeof entry === 'string' && entry.startsWith('var(--chakra-');
}

function isRawColor(value: string): boolean {
  if (value.startsWith('#')) {
    return true;
  }
  if (value.startsWith('rgb') || value.startsWith('hsl') || value.startsWith('oklch')) {
    return true;
  }
  return false;
}

function report(findings: Finding[]): void {
  if (findings.length === 0) {
    write('Tokens: tudo certo.\n');
    return;
  }

  for (const finding of findings) {
    writeError(
      `${path.relative(process.cwd(), finding.file)}:${finding.line} - ${finding.message}\n`,
    );
  }
  writeError(`\n${findings.length} problema(s) de token.\n`);
  throw new Error('Token invalido');
}

function write(message: string): void {
  process.stdout.write(message);
}

function writeError(message: string): void {
  process.stderr.write(message);
}

main();
