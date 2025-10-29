import * as ts from 'typescript';
import { conditionally } from '@assemblerjs/core';

export const isWithDefaultsObject = conditionally({
  if: (args: ts.NodeArray<ts.Expression>) =>
    args.length === 2 &&
    args[0] !== undefined &&
    args[1] !== undefined &&
    ts.isCallExpression(args[0]) &&
    ts.isIdentifier(args[0].expression) &&
    args[0].expression.escapedText === 'defineProps' &&
    ts.isObjectLiteralExpression(args[1]),
  then: (args: ts.NodeArray<ts.Expression>) => args[1] as ts.ObjectLiteralExpression,
  else: () => undefined,
});
