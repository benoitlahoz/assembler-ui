import * as ts from 'typescript';
import { conditionally } from '@assemblerjs/core';
import { isWithDefaultsObject } from './is-with-defaults-object';

export const checkHasDefault = conditionally({
  if: ({ node }: { node: ts.Node; sourceFile: ts.SourceFile }) => {
    return !!(
      ts.isVariableStatement(node) &&
      node.declarationList.declarations.length &&
      ts.isCallExpression(node.declarationList.declarations[0].initializer!) &&
      ts.isIdentifier(node.declarationList.declarations[0].initializer!.expression) &&
      node.declarationList.declarations[0].initializer!.expression.escapedText === 'withDefaults'
    );
  },
  then: ({ node, sourceFile }: { node: ts.Node; sourceFile: ts.SourceFile }) => {
    let defaultsMap: Record<string, string> = {};
    const decl = (node as ts.VariableStatement).declarationList.declarations[0];
    const initializer = decl.initializer as ts.CallExpression;
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
