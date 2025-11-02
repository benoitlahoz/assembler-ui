import ts from 'typescript';

/**
 * Extrait les variantes (et leurs valeurs) d'un appel à cva dans un fichier TypeScript.
 * @param fileContent Le contenu du fichier à analyser
 * @param absPath Le chemin absolu du fichier (pour le parseur TS)
 * @returns Un objet { [variantName]: string[] }
 */
export function extractCvaVariants(
  fileContent: string,
  absPath: string
): Record<string, Record<string, string[]>> {
  const sourceFile = ts.createSourceFile(
    absPath,
    fileContent,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  );

  // Associe le nom du type principal (ex: ButtonVariants) à l'objet de variantes extrait du cva correspondant
  // 1. On collecte les déclarations de cva (ex: const buttonVariants = cva(...))
  // 2. On collecte les types VariantProps<typeof buttonVariants> (ex: export type ButtonVariants = VariantProps<typeof buttonVariants>;)
  // 3. On fait la correspondance entre le type et la variable cva

  // 1. Collecte des cva
  const cvaVars: Record<string, ts.CallExpression> = {};
  function visitCvaVars(node: ts.Node) {
    if (
      ts.isVariableDeclaration(node) &&
      node.initializer &&
      ts.isCallExpression(node.initializer) &&
      node.initializer.expression.getText() === 'cva'
    ) {
      const varName = node.name.getText();
      cvaVars[varName] = node.initializer;
    }
    ts.forEachChild(node, visitCvaVars);
  }
  visitCvaVars(sourceFile);

  // 2. Collecte des types VariantProps<typeof ...>
  const typeToCvaVar: Record<string, string> = {};
  function visitTypeAliases(node: ts.Node) {
    if (
      ts.isTypeAliasDeclaration(node) &&
      node.type &&
      ts.isTypeReferenceNode(node.type) &&
      node.type.typeName.getText() === 'VariantProps' &&
      node.type.typeArguments &&
      node.type.typeArguments.length === 1
    ) {
      const typeName = node.name.getText();
      const typeArg = node.type.typeArguments[0];
      if (typeArg && ts.isTypeQueryNode(typeArg) && ts.isIdentifier(typeArg.exprName)) {
        const cvaVarName = typeArg.exprName.text;
        typeToCvaVar[typeName] = cvaVarName;
      }
    }
    ts.forEachChild(node, visitTypeAliases);
  }
  visitTypeAliases(sourceFile);

  // 3. Pour chaque type principal, extraire les variantes du cva associé
  const result: Record<string, Record<string, string[]>> = {};
  for (const [typeName, cvaVarName] of Object.entries(typeToCvaVar)) {
    const cvaCall = cvaVars[cvaVarName];
    if (!cvaCall || cvaCall.arguments.length < 2) continue;
    const configArg = cvaCall.arguments[1];
    if (configArg && ts.isObjectLiteralExpression(configArg)) {
      for (const prop of configArg.properties) {
        if (
          ts.isPropertyAssignment(prop) &&
          ts.isIdentifier(prop.name) &&
          prop.name.text === 'variants' &&
          ts.isObjectLiteralExpression(prop.initializer)
        ) {
          const variantsObj = prop.initializer as ts.ObjectLiteralExpression;
          const variantProps = variantsObj.properties;
          const variants: Record<string, string[]> = {};
          for (const variantProp of variantProps) {
            if (
              ts.isPropertyAssignment(variantProp) &&
              ts.isIdentifier(variantProp.name) &&
              ts.isObjectLiteralExpression(variantProp.initializer)
            ) {
              const variantName = variantProp.name.text;
              const values: string[] = [];
              for (const valProp of variantProp.initializer.properties ?? []) {
                if (ts.isPropertyAssignment(valProp) && ts.isIdentifier(valProp.name)) {
                  values.push(valProp.name.text);
                }
              }
              variants[variantName] = values;
            }
          }
          result[typeName] = variants;
        }
      }
    }
  }
  return result;
}

// Exemple d'utilisation :
// const fs = require('fs');
// const content = fs.readFileSync('index.ts', 'utf8');
// console.log(extractCvaVariants(content, 'index.ts'));
