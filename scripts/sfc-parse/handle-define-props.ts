import * as ts from 'typescript';
import { conditionally } from '@assemblerjs/core';
import type { PropInfo } from './types';

export const handleDefineProps = (node: ts.Node, props: PropInfo[], sourceFile: ts.SourceFile) =>
  conditionally({
    if: (n: ts.Node) =>
      Boolean(
        ts.isVariableStatement(n) &&
          n.declarationList.declarations.length &&
          ts.isCallExpression(n.declarationList.declarations[0].initializer!) &&
          ts.isIdentifier(n.declarationList.declarations[0].initializer!.expression) &&
          n.declarationList.declarations[0].initializer!.expression.escapedText === 'defineProps'
      ),
    then: (n: ts.Node) => {
      const decl = (n as ts.VariableStatement).declarationList.declarations[0];
      const initializer = decl.initializer as ts.CallExpression;
      if (initializer.typeArguments && initializer.typeArguments.length > 0) {
        const typeArg = initializer.typeArguments[0];
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
                  default: '-',
                });
              }
            }
          });
        }
      }
    },
  })(node);
