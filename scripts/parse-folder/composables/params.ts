import * as ts from 'typescript';

/**
 * Extract parameters from a composable function
 */
export const extractParams = (
  content: string,
  filePath: string
): Array<{ name: string; type: string; default?: any; description: string }> => {
  const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);
  const params: Array<{ name: string; type: string; default?: any; description: string }> = [];

  const visit = (node: ts.Node) => {
    // Recherche des fonctions exportées (export function useFoo(...))
    if (ts.isFunctionDeclaration(node) && node.name) {
      const functionName = node.name.text;
      if (functionName.startsWith('use')) {
        extractFunctionParams(node, params, sourceFile);
      }
    }

    // Recherche des arrow functions exportées (export const useFoo = (...) => ...)
    if (ts.isVariableStatement(node)) {
      const declaration = node.declarationList.declarations[0];
      if (declaration && ts.isVariableDeclaration(declaration)) {
        const name = declaration.name.getText(sourceFile);
        if (name.startsWith('use') && declaration.initializer) {
          if (ts.isArrowFunction(declaration.initializer)) {
            extractArrowFunctionParams(declaration.initializer, params, sourceFile);
          }
        }
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return params;
};

const extractFunctionParams = (
  node: ts.FunctionDeclaration,
  params: Array<any>,
  sourceFile: ts.SourceFile
) => {
  node.parameters.forEach((param) => {
    const paramName = param.name.getText(sourceFile);
    const paramType = param.type ? param.type.getText(sourceFile) : 'any';
    const paramDefault = param.initializer ? param.initializer.getText(sourceFile) : undefined;

    // Extract JSDoc comment for this parameter
    const jsDocTags = ts.getJSDocParameterTags(param);
    let description = '';
    if (jsDocTags && jsDocTags.length > 0) {
      const tag = jsDocTags[0];
      if (tag && tag.comment) {
        description =
          typeof tag.comment === 'string' ? tag.comment : tag.comment.map((c) => c.text).join('');
      }
    }

    params.push({
      name: paramName,
      type: paramType,
      ...(paramDefault ? { default: paramDefault } : {}),
      description,
    });
  });
};

const extractArrowFunctionParams = (
  node: ts.ArrowFunction,
  params: Array<any>,
  sourceFile: ts.SourceFile
) => {
  node.parameters.forEach((param) => {
    const paramName = param.name.getText(sourceFile);
    const paramType = param.type ? param.type.getText(sourceFile) : 'any';
    const paramDefault = param.initializer ? param.initializer.getText(sourceFile) : undefined;

    params.push({
      name: paramName,
      type: paramType,
      ...(paramDefault ? { default: paramDefault } : {}),
      description: '',
    });
  });
};
