import * as ts from 'typescript';
import { checkHasDefault } from './check-has-default';

export const findWithDefaults = (node: ts.Node): Record<string, string> => {
  let defaultsMap: Record<string, string> = {};
  const walk = (n: ts.Node) => {
    const result = checkHasDefault({ node: n, sourceFile: node.getSourceFile() });
    if (result && typeof result === 'object') {
      defaultsMap = { ...defaultsMap, ...result };
    }
    ts.forEachChild(n, walk);
  };
  walk(node);
  return defaultsMap;
};
