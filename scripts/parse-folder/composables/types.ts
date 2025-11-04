import * as ts from 'typescript';

/**
 * Extract types, interfaces, and enums from a composable file
 */
export const extractComposableTypes = (
  content: string,
  filePath: string
): Array<{ name: string; type: string }> => {
  const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);
  const types: Array<{ name: string; type: string }> = [];

  const visit = (node: ts.Node) => {
    if (ts.isInterfaceDeclaration(node)) {
      types.push({ name: node.name.text, type: 'interface' });
    }
    if (ts.isTypeAliasDeclaration(node)) {
      types.push({ name: node.name.text, type: 'type' });
    }
    if (ts.isEnumDeclaration(node)) {
      types.push({ name: node.name.text, type: 'enum' });
    }
    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return types;
};
