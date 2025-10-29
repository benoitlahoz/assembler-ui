import * as ts from 'typescript';
import { readFileSync } from 'node:fs';
import { parse } from '@vue/compiler-sfc';
import { handleWithDefaults } from './sfc-parse/handle-withe-defaults';
import { handleDefineProps } from './sfc-parse/handle-define-props';
import { handleExportDefaultProps } from './sfc-parse/handle-export-default-props';
import { visit } from './sfc-parse/visit';
import { checkHasDefault } from './sfc-parse/check-has-default';
import { isWithDefaultsObject } from './sfc-parse/is-with-defaults-object';
import { findWithDefaults } from './sfc-parse/find-with-defaults';
import type { PropInfo } from './sfc-parse/types';

export const extractVueProps = (filePath: string) => {
  const source = readFileSync(filePath, 'utf-8');
  const { descriptor } = parse(source);
  const script = descriptor.scriptSetup || descriptor.script;
  if (!script) return [];
  const sourceFile = ts.createSourceFile(
    filePath,
    script.content,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
  const defaultsMap = findWithDefaults(sourceFile);
  const props: PropInfo[] = [];
  visit(sourceFile, props, defaultsMap, sourceFile);
  return props;
};

console.log(JSON.stringify(extractVueProps('registry/new-york/components/knob/Knob.vue'), null, 2));
