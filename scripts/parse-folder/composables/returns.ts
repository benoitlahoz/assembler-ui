import * as ts from 'typescript';

/**
 * Extract return type from a composable function
 */
export const extractReturns = (
  content: string,
  filePath: string
): {
  type: string;
  description: string;
  properties?: Array<{ name: string; type?: string; description: string }>;
} => {
  const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);
  let returnInfo: {
    type: string;
    description: string;
    properties?: Array<{ name: string; type?: string; description: string }>;
  } = { type: 'void', description: '' };

  const visit = (node: ts.Node) => {
    // Recherche des fonctions exportées (export function useFoo(...))
    if (ts.isFunctionDeclaration(node) && node.name) {
      const functionName = node.name.text;
      if (functionName.startsWith('use')) {
        if (node.type) {
          returnInfo.type = node.type.getText(sourceFile);
        } else {
          // Si pas de type annoté explicitement, essayer d'inférer depuis le return statement
          const { type, properties } = inferReturnTypeFromBody(node, sourceFile);
          returnInfo.type = type;
          if (properties && properties.length > 0) {
            returnInfo.properties = properties;
          }
        }

        // Extract JSDoc @returns tag
        const jsDocTags = ts.getJSDocTags(node);
        for (const tag of jsDocTags) {
          if (tag.tagName.text === 'returns' || tag.tagName.text === 'return') {
            if (tag.comment) {
              returnInfo.description =
                typeof tag.comment === 'string'
                  ? tag.comment
                  : tag.comment.map((c) => c.text).join('');
            }
          }
        }

        // Si pas de description dans JSDoc, extraire depuis le commentaire avant le return
        if (!returnInfo.description) {
          returnInfo.description = extractReturnDescription(node, sourceFile);
        }
      }
    }

    // Recherche des arrow functions exportées (export const useFoo = (...) => ...)
    if (ts.isVariableStatement(node)) {
      const declaration = node.declarationList.declarations[0];
      if (declaration && ts.isVariableDeclaration(declaration)) {
        const name = declaration.name.getText(sourceFile);
        if (name.startsWith('use') && declaration.initializer) {
          if (ts.isArrowFunction(declaration.initializer)) {
            if (declaration.initializer.type) {
              returnInfo.type = declaration.initializer.type.getText(sourceFile);
            } else {
              // Essayer d'inférer depuis le body
              const { type, properties } = inferReturnTypeFromArrowFunction(
                declaration.initializer,
                sourceFile
              );
              returnInfo.type = type;
              if (properties && properties.length > 0) {
                returnInfo.properties = properties;
              }
            }

            // Extraire la description depuis le commentaire avant le return
            if (!returnInfo.description) {
              returnInfo.description = extractReturnDescription(
                declaration.initializer,
                sourceFile
              );
            }
          }
        }
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return returnInfo;
};

/**
 * Extract property description from leading comments
 */
const extractPropertyDescription = (
  prop: ts.ObjectLiteralElementLike,
  sourceFile: ts.SourceFile
): string => {
  const fullText = sourceFile.getFullText();
  const propPos = prop.getFullStart();
  const propStart = prop.getStart(sourceFile);
  const leadingText = fullText.substring(propPos, propStart);

  // Extraire le dernier commentaire multi-ligne ou single-line
  const multiLineMatch = leadingText.match(/\/\*\*?([\s\S]*?)\*\//g);
  const singleLineMatches = leadingText.match(/\/\/\s*(.+)/g);

  if (multiLineMatch && multiLineMatch.length > 0) {
    const lastComment = multiLineMatch[multiLineMatch.length - 1];
    if (lastComment) {
      const content = lastComment.replace(/\/\*\*?|\*\//g, '').trim();
      return content
        .split('\n')
        .map((line) => line.replace(/^\s*\*\s?/, '').trim())
        .filter((line) => line.length > 0)
        .join(' ');
    }
  } else if (singleLineMatches && singleLineMatches.length > 0) {
    const lastComment = singleLineMatches[singleLineMatches.length - 1];
    if (lastComment) {
      return lastComment.replace(/^\/\/\s*/, '').trim();
    }
  }

  return '';
};

/**
 * Infer type from a variable declaration or function in the composable body
 */
const inferTypeFromBody = (
  name: string,
  functionNode: ts.FunctionDeclaration | ts.ArrowFunction,
  sourceFile: ts.SourceFile
): string | undefined => {
  let inferredType: string | undefined;

  const visitNode = (node: ts.Node) => {
    // Chercher les déclarations de variables (const screenStream = ref(...))
    if (ts.isVariableStatement(node)) {
      const declaration = node.declarationList.declarations[0];
      if (declaration && ts.isVariableDeclaration(declaration)) {
        const varName = declaration.name.getText(sourceFile);

        if (varName === name && declaration.initializer) {
          // Si c'est un appel de fonction (ref, computed, etc.)
          if (ts.isCallExpression(declaration.initializer)) {
            const callExpr = declaration.initializer;
            const funcName = callExpr.expression.getText(sourceFile);

            // Extraire le type générique si présent
            if (callExpr.typeArguments && callExpr.typeArguments.length > 0) {
              const firstTypeArg = callExpr.typeArguments[0];
              if (firstTypeArg) {
                inferredType = firstTypeArg.getText(sourceFile);

                // Ajouter le wrapper approprié
                if (funcName === 'ref') {
                  inferredType = `Ref<${inferredType}>`;
                } else if (funcName === 'computed') {
                  inferredType = `ComputedRef<${inferredType}>`;
                } else if (funcName === 'reactive') {
                  inferredType = `UnwrapNestedRefs<${inferredType}>`;
                }
              }
            } else {
              // Pas de type générique explicite
              if (funcName === 'computed') {
                // Pour computed sans type générique, on peut essayer d'inférer depuis la fonction callback
                // Pour l'instant, on utilise un type générique
                inferredType = 'ComputedRef<any>';
              } else if (funcName === 'ref') {
                inferredType = 'Ref<any>';
              } else if (funcName === 'reactive') {
                inferredType = 'UnwrapNestedRefs<any>';
              }
            }
          }
        }
      }
    }

    // Chercher les déclarations de fonctions (const startScreenShare: Type = ...)
    if (ts.isVariableStatement(node)) {
      const declaration = node.declarationList.declarations[0];
      if (declaration && ts.isVariableDeclaration(declaration)) {
        const varName = declaration.name.getText(sourceFile);

        if (varName === name && declaration.type) {
          inferredType = declaration.type.getText(sourceFile);
        }
      }
    }

    ts.forEachChild(node, visitNode);
  };

  if (ts.isFunctionDeclaration(functionNode) && functionNode.body) {
    visitNode(functionNode.body);
  } else if (ts.isArrowFunction(functionNode) && ts.isBlock(functionNode.body)) {
    visitNode(functionNode.body);
  }

  return inferredType;
};

/**
 * Try to infer return type from function body by looking at return statements
 */
const inferReturnTypeFromBody = (
  node: ts.FunctionDeclaration,
  sourceFile: ts.SourceFile
): { type: string; properties?: Array<{ name: string; type?: string; description: string }> } => {
  if (!node.body) return { type: 'void' };

  let returnType = 'void';
  let properties: Array<{ name: string; type?: string; description: string }> = [];

  const visitBody = (bodyNode: ts.Node) => {
    if (ts.isReturnStatement(bodyNode) && bodyNode.expression) {
      // Si c'est un objet littéral, construire le type à partir des clés
      if (ts.isObjectLiteralExpression(bodyNode.expression)) {
        const extractedProperties: Array<{ name: string; type?: string; description: string }> = [];

        bodyNode.expression.properties.forEach((prop) => {
          if (ts.isPropertyAssignment(prop) || ts.isShorthandPropertyAssignment(prop)) {
            const name = prop.name.getText(sourceFile);
            const description = extractPropertyDescription(prop, sourceFile);

            // Inférer le type depuis le corps de la fonction
            const type = inferTypeFromBody(name, node, sourceFile);

            extractedProperties.push({ name, type, description });
          }
        });

        properties = extractedProperties;

        if (properties.length > 0) {
          returnType = `{ ${properties.map((p) => p.name).join(', ')} }`;
        }
      } else {
        // Sinon, prendre le texte de l'expression
        returnType = bodyNode.expression.getText(sourceFile);
      }
    }
    ts.forEachChild(bodyNode, visitBody);
  };

  visitBody(node.body);
  return { type: returnType, properties: properties.length > 0 ? properties : undefined };
};

/**
 * Extract description from leading comments of a return statement
 */
const extractReturnDescription = (
  node: ts.FunctionDeclaration | ts.ArrowFunction,
  sourceFile: ts.SourceFile
): string => {
  let description = '';

  const visitBody = (bodyNode: ts.Node) => {
    if (ts.isReturnStatement(bodyNode)) {
      // Récupérer les commentaires avant le return statement
      const fullText = sourceFile.getFullText();
      const nodePos = bodyNode.getFullStart();
      const nodeStart = bodyNode.getStart(sourceFile);
      const leadingText = fullText.substring(nodePos, nodeStart);

      // Extraire le dernier commentaire multi-ligne ou single-line
      const multiLineMatch = leadingText.match(/\/\*\*?([\s\S]*?)\*\//g);
      const singleLineMatches = leadingText.match(/\/\/\s*(.+)/g);

      if (multiLineMatch && multiLineMatch.length > 0) {
        // Prendre le dernier commentaire multi-ligne
        const lastComment = multiLineMatch[multiLineMatch.length - 1];
        if (lastComment) {
          const content = lastComment.replace(/\/\*\*?|\*\//g, '').trim();
          // Nettoyer les * au début de chaque ligne
          description = content
            .split('\n')
            .map((line) => line.replace(/^\s*\*\s?/, '').trim())
            .filter((line) => line.length > 0)
            .join(' ');
        }
      } else if (singleLineMatches && singleLineMatches.length > 0) {
        // Prendre le dernier commentaire single-line
        const lastComment = singleLineMatches[singleLineMatches.length - 1];
        if (lastComment) {
          description = lastComment.replace(/^\/\/\s*/, '').trim();
        }
      }
    }
    ts.forEachChild(bodyNode, visitBody);
  };

  if (ts.isFunctionDeclaration(node) && node.body) {
    visitBody(node.body);
  } else if (ts.isArrowFunction(node) && ts.isBlock(node.body)) {
    visitBody(node.body);
  }

  return description;
};

/**
 * Try to infer return type from arrow function body
 */
const inferReturnTypeFromArrowFunction = (
  node: ts.ArrowFunction,
  sourceFile: ts.SourceFile
): { type: string; properties?: Array<{ name: string; type?: string; description: string }> } => {
  // Si c'est une expression directe (pas de block)
  if (!ts.isBlock(node.body)) {
    if (ts.isObjectLiteralExpression(node.body)) {
      const extractedProperties: Array<{ name: string; type?: string; description: string }> = [];

      node.body.properties.forEach((prop) => {
        if (ts.isPropertyAssignment(prop) || ts.isShorthandPropertyAssignment(prop)) {
          const name = prop.name.getText(sourceFile);
          const description = extractPropertyDescription(prop, sourceFile);

          // Inférer le type depuis le corps de la fonction
          const type = inferTypeFromBody(name, node, sourceFile);

          extractedProperties.push({ name, type, description });
        }
      });

      if (extractedProperties.length > 0) {
        return {
          type: `{ ${extractedProperties.map((p) => p.name).join(', ')} }`,
          properties: extractedProperties,
        };
      }
    }
    return { type: node.body.getText(sourceFile) };
  }

  // Si c'est un block, chercher le return statement
  let returnType = 'void';
  let properties: Array<{ name: string; type?: string; description: string }> = [];

  const visitBody = (bodyNode: ts.Node) => {
    if (ts.isReturnStatement(bodyNode) && bodyNode.expression) {
      if (ts.isObjectLiteralExpression(bodyNode.expression)) {
        const extractedProperties: Array<{ name: string; type?: string; description: string }> = [];

        bodyNode.expression.properties.forEach((prop) => {
          if (ts.isPropertyAssignment(prop) || ts.isShorthandPropertyAssignment(prop)) {
            const name = prop.name.getText(sourceFile);
            const description = extractPropertyDescription(prop, sourceFile);

            // Inférer le type depuis le corps de la fonction
            const type = inferTypeFromBody(name, node, sourceFile);

            extractedProperties.push({ name, type, description });
          }
        });

        properties = extractedProperties;

        if (properties.length > 0) {
          returnType = `{ ${properties.map((p) => p.name).join(', ')} }`;
        }
      } else {
        returnType = bodyNode.expression.getText(sourceFile);
      }
    }
    ts.forEachChild(bodyNode, visitBody);
  };

  visitBody(node.body);
  return { type: returnType, properties: properties.length > 0 ? properties : undefined };
};
