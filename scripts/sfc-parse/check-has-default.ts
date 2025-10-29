import * as ts from 'typescript';
import { conditionally } from '@assemblerjs/core';
import { isWithDefaultsObject } from './is-with-defaults-object';

export const checkHasDefault = conditionally({
  if: ({ node }: { node: ts.Node; sourceFile: ts.SourceFile }) => {
    if (!ts.isVariableStatement(node)) return false;
    const decls = node.declarationList.declarations;
    if (!decls.length) return false;
    const decl = decls[0];
    if (!decl) return false;
    if (!decl.initializer || !ts.isCallExpression(decl.initializer)) return false;
    const callExpr = decl.initializer;
    if (!ts.isIdentifier(callExpr.expression)) return false;
    return callExpr.expression.escapedText === 'withDefaults';
  },
  then: ({ node, sourceFile }: { node: ts.Node; sourceFile: ts.SourceFile }) => {
    let defaultsMap: Record<string, string> = {};
    const decls = (node as ts.VariableStatement).declarationList.declarations;
    if (!decls.length) return {};
    const decl = decls[0];
    if (!decl) return {};
    if (!decl.initializer || !ts.isCallExpression(decl.initializer)) return {};
    const initializer = decl.initializer;
    const args = initializer.arguments;

    const defaultsObj = isWithDefaultsObject(args);
    if (defaultsObj) {
      defaultsMap = defaultsObj.properties
        .filter(ts.isPropertyAssignment)
        .map((p: ts.PropertyAssignment): [string, string] | undefined => {
          const key: string | undefined = ts.isIdentifier(p.name)
            ? p.name.escapedText.toString()
            : ts.isStringLiteral(p.name)
              ? p.name.text
              : undefined;
          return key ? [key, p.initializer.getText(sourceFile)] : undefined;
        })
        .filter((x: [string, string] | undefined): x is [string, string] => Boolean(x))
        .reduce(
          (acc: Record<string, string>, [key, val]: [string, string]) => {
            acc[key] = val;
            return acc;
          },
          {} as Record<string, string>
        );
    }
    return defaultsMap;
  },
});
