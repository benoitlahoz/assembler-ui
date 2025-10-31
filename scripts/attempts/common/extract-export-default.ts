import * as ts from 'typescript';

/**
 * Finds the export default object literal in a TypeScript AST node.
 * @param node The AST node to search
 * @returns The ObjectLiteralExpression of the export default, or undefined if not found
 */
export const findExportDefaultObject = (node: ts.Node): ts.ObjectLiteralExpression | undefined => {
  if (ts.isExportAssignment(node)) {
    if (ts.isObjectLiteralExpression(node.expression)) {
      return node.expression;
    }
  }
  let found: ts.ObjectLiteralExpression | undefined;
  ts.forEachChild(node, (child) => {
    if (!found) found = findExportDefaultObject(child);
  });
  return found;
};
