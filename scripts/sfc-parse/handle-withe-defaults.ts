import * as ts from 'typescript';
import { conditionally } from '@assemblerjs/core';
import type { PropInfo } from './types';

export const handleWithDefaults = (
  node: ts.Node,
  props: PropInfo[],
  defaultsMap: Record<string, string>,
  sourceFile: ts.SourceFile
) =>
  conditionally({
    if: (n: ts.Node) =>
      Boolean(
        ts.isVariableStatement(n) &&
          n.declarationList.declarations.length &&
          ts.isCallExpression(n.declarationList.declarations[0].initializer!) &&
          ts.isIdentifier(n.declarationList.declarations[0].initializer!.expression) &&
          n.declarationList.declarations[0].initializer!.expression.escapedText === 'withDefaults'
      ),
    then: (n: ts.Node) => {
      const decl = (n as ts.VariableStatement).declarationList.declarations[0];
      const initializer = decl.initializer as ts.CallExpression;
      const args = initializer.arguments;
      if (
        args.length === 2 &&
        ts.isCallExpression(args[0]) &&
        ts.isIdentifier(args[0].expression) &&
        args[0].expression.escapedText === 'defineProps'
      ) {
        const call = args[0];
        if (call.typeArguments && call.typeArguments.length > 0) {
          const typeArg = call.typeArguments[0];
          if (ts.isTypeLiteralNode(typeArg)) {
            typeArg.members.forEach((member) => {
              if (ts.isPropertySignature(member) && member.type && member.name) {
                const name = ts.isIdentifier(member.name)
                  ? member.name.escapedText.toString()
                  : ts.isStringLiteral(member.name)
                    ? member.name.text
                    : undefined;
                if (name) {
                  props.push({
                    name,
                    type: member.type.getText(sourceFile),
                    default: defaultsMap[name] ?? '-',
                  });
                }
              }
            });
          }
        }
      }
    },
  })(node);
