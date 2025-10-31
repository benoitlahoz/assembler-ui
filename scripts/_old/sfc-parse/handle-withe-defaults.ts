import * as ts from 'typescript';
import { conditionally } from '@assemblerjs/core';
import type { PropInfo } from '../types';

const isWithDefaultsVariableStatement = (n: ts.Node): boolean => {
  if (!ts.isVariableStatement(n)) return false;
  const decls = n.declarationList.declarations;
  if (!decls.length) return false;
  const decl = decls[0];
  if (!decl) return false;
  if (!decl.initializer || !ts.isCallExpression(decl.initializer)) return false;
  const callExpr = decl.initializer;
  if (!ts.isIdentifier(callExpr.expression)) return false;
  return callExpr.expression.escapedText === 'withDefaults';
};

const getWithDefaultsCall = (n: ts.Node): ts.CallExpression | undefined => {
  if (!ts.isVariableStatement(n)) return undefined;
  const decls = n.declarationList.declarations;
  if (!decls.length) return undefined;
  const decl = decls[0];
  if (!decl) return undefined;
  if (!decl.initializer || !ts.isCallExpression(decl.initializer)) return undefined;
  return decl.initializer;
};

const isDefinePropsCall = (arg: ts.Expression | undefined): arg is ts.CallExpression => {
  return (
    !!arg &&
    ts.isCallExpression(arg) &&
    ts.isIdentifier(arg.expression) &&
    arg.expression.escapedText === 'defineProps'
  );
};

const handleTypeLiteralProps = (
  call: ts.CallExpression,
  props: PropInfo[],
  defaultsMap: Record<string, string>,
  sourceFile: ts.SourceFile
) => {
  if (!call.typeArguments || call.typeArguments.length === 0) return;
  const typeArg = call.typeArguments[0];
  if (!typeArg || !ts.isTypeLiteralNode(typeArg)) return;
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
};

export const handleWithDefaults = (
  node: ts.Node,
  props: PropInfo[],
  defaultsMap: Record<string, string>,
  sourceFile: ts.SourceFile
) =>
  conditionally({
    if: isWithDefaultsVariableStatement,
    then: (n: ts.Node) => {
      const callExpr = getWithDefaultsCall(n);
      if (!callExpr) return;
      const args = callExpr.arguments;
      if (args.length === 2 && isDefinePropsCall(args[0])) {
        const call = args[0];
        handleTypeLiteralProps(call, props, defaultsMap, sourceFile);
      }
    },
  })(node);
