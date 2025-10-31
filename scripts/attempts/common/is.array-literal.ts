import ts from 'typescript';

export const isArrayLiteral = (initializer: ts.Expression) => {
  return ts.isArrayLiteralExpression(initializer);
};
