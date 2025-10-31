import * as ts from 'typescript';
import type { PropInfo } from '../types';
import { handleWithDefaults } from './handle-with-defaults';
import { handleDefineProps } from './handle-define-props';
import { handleExportDefaultProps } from './handle-export-default-props';

export const visit = (
  node: ts.Node,
  props: PropInfo[],
  defaultsMap: Record<string, string>,
  sourceFile: ts.SourceFile
) => {
  handleWithDefaults(node, props, defaultsMap, sourceFile);
  handleDefineProps(node, props, sourceFile);
  handleExportDefaultProps(node, props, sourceFile);
  if (ts.isExpressionStatement(node) && ts.isCallExpression(node.expression)) {
    const expr = node.expression;
    if (
      ts.isIdentifier(expr.expression) &&
      expr.expression.escapedText === 'withDefaults' &&
      expr.arguments.length === 2 &&
      expr.arguments[0] !== undefined &&
      ts.isCallExpression(expr.arguments[0]) &&
      ts.isIdentifier(expr.arguments[0].expression) &&
      expr.arguments[0].expression.escapedText === 'defineProps'
    ) {
      const call = expr.arguments[0];
      if (call.typeArguments && call.typeArguments.length > 0) {
        const typeArg = call.typeArguments[0];
        if (typeArg && ts.isTypeLiteralNode(typeArg)) {
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
  }
  ts.forEachChild(node, (child) => visit(child, props, defaultsMap, sourceFile));
};
