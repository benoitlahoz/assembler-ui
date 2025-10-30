import ts from 'typescript';

/**
 * Extrait les exposes depuis l'objet export default d'un SFC classique (clé expose ou exposes)
 * @param scriptContent contenu du bloc <script>
 * @param absPath chemin absolu du fichier (pour TS)
 */

export const extractExposes = (scriptContent: string, absPath: string) => {
  const exposes: Array<{ name: string; description: string; type?: string }> = [];
  const sourceFile = ts.createSourceFile(
    absPath,
    scriptContent,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  );
  // 1. Extraction via export default (Options API)
  function visitExportDefault(node: ts.Node) {
    if (ts.isExportAssignment(node) && ts.isObjectLiteralExpression(node.expression)) {
      const obj = node.expression;
      for (const prop of obj.properties) {
        // Extraction expose/exposes (rare, mais supporté)
        if (
          ts.isPropertyAssignment(prop) &&
          ts.isIdentifier(prop.name) &&
          (prop.name.text === 'expose' || prop.name.text === 'exposes')
        ) {
          // Cas expose: ['foo', 'bar'] avec commentaires
          if (ts.isArrayLiteralExpression(prop.initializer)) {
            for (const element of prop.initializer.elements) {
              if (ts.isStringLiteral(element)) {
                // Cherche le commentaire juste au-dessus dans le code source
                let description = '';
                const ranges = ts.getLeadingCommentRanges(scriptContent, element.pos) || [];
                let descParts: string[] = [];
                for (let i = ranges.length - 1; i >= 0; i--) {
                  const range = ranges[i];
                  if (!range) continue;
                  const between = scriptContent.slice(range.end, element.pos);
                  if (/^([ \t]*\r?\n)*$/.test(between)) {
                    const cmt = scriptContent.slice(range.pos, range.end).trim();
                    if (cmt.startsWith('/**')) {
                      descParts.unshift(
                        cmt
                          .replace(/^\/\*\*|\*\/$/g, '')
                          .replace(/^[*\s]+/gm, '')
                          .trim()
                      );
                    } else if (cmt.startsWith('//')) {
                      descParts.unshift(cmt.replace(/^\/\//, '').trim());
                    } else if (cmt.startsWith('/*')) {
                      descParts.unshift(
                        cmt
                          .replace(/^\/\*|\*\/$/g, '')
                          .replace(/^[*\s]+/gm, '')
                          .trim()
                      );
                    }
                  } else {
                    break;
                  }
                }
                description = descParts.join('\n').trim();
                exposes.push({ name: element.text, description, type: undefined });
              }
            }
          }
          // Cas expose: { foo: ..., bar: ... }
          else if (ts.isObjectLiteralExpression(prop.initializer)) {
            for (const e of prop.initializer.properties) {
              if (ts.isPropertyAssignment(e) && ts.isIdentifier(e.name)) {
                const name = e.name.text;
                let type: string | undefined = undefined;
                let description = '';
                // Récupère tous les commentaires (ligne et multilignes) juste au-dessus
                const ranges = ts.getLeadingCommentRanges(scriptContent, e.pos) || [];
                let descParts: string[] = [];
                for (let i = ranges.length - 1; i >= 0; i--) {
                  const range = ranges[i];
                  if (!range) continue;
                  const between = scriptContent.slice(range.end, e.pos);
                  if (/^([ \t]*\r?\n)*$/.test(between)) {
                    const cmt = scriptContent.slice(range.pos, range.end).trim();
                    if (cmt.startsWith('/**')) {
                      descParts.unshift(
                        cmt
                          .replace(/^\/\*\*|\*\/$/g, '')
                          .replace(/^[*\s]+/gm, '')
                          .trim()
                      );
                    } else if (cmt.startsWith('//')) {
                      descParts.unshift(cmt.replace(/^\/\//, '').trim());
                    } else if (cmt.startsWith('/*')) {
                      descParts.unshift(
                        cmt
                          .replace(/^\/\*|\*\/$/g, '')
                          .replace(/^[*\s]+/gm, '')
                          .trim()
                      );
                    }
                  } else {
                    break;
                  }
                }
                description = descParts.join('\n').trim();
                // Déduit le type si possible
                if (ts.isFunctionLike(e.initializer)) {
                  const params = e.initializer.parameters
                    .map((p: ts.ParameterDeclaration) => {
                      const paramName = p.name.getText();
                      const paramType = p.type ? `: ${p.type.getText()}` : '';
                      return paramName + paramType;
                    })
                    .join(', ');
                  let returnType = 'any';
                  if (e.initializer.type) {
                    returnType = e.initializer.type.getText();
                  }
                  type = `(${params}) => ${returnType}`;
                }
                exposes.push({ name, description, type });
              }
            }
          }
        }
      }
    }
    ts.forEachChild(node, visitExportDefault);
  }
  // 2. Extraction via defineExpose({ ... }) dans le code (Composition API)
  function visitDefineExpose(node: ts.Node) {
    if (
      ts.isCallExpression(node) &&
      node.expression.getText() === 'defineExpose' &&
      node.arguments.length > 0
    ) {
      const arg0 = node.arguments[0];
      if (arg0 && ts.isObjectLiteralExpression(arg0)) {
        for (const prop of arg0.properties) {
          if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
            const name = prop.name.text;
            let type: string | undefined = undefined;
            let description = '';
            const ranges = ts.getLeadingCommentRanges(scriptContent, prop.pos) || [];
            if (ranges.length > 0) {
              const lastRange = ranges[ranges.length - 1];
              if (lastRange) {
                const between = scriptContent.slice(lastRange.end, prop.pos);
                if (/^([ \t]*\r?\n)*$/.test(between)) {
                  const cmt = scriptContent.slice(lastRange.pos, lastRange.end).trim();
                  if (cmt.startsWith('/**')) {
                    description = cmt
                      .replace(/^\/\*\*|\*\/$/g, '')
                      .replace(/^[*\s]+/gm, '')
                      .trim();
                  } else if (cmt.startsWith('//')) {
                    description = cmt.replace(/^\/\//, '').trim();
                  }
                }
              }
            }
            // Déduit le type si possible
            if (ts.isFunctionLike(prop.initializer)) {
              const params = prop.initializer.parameters
                .map((p: ts.ParameterDeclaration) => {
                  const paramName = p.name.getText();
                  const paramType = p.type ? `: ${p.type.getText()}` : '';
                  return paramName + paramType;
                })
                .join(', ');
              let returnType = 'any';
              if (prop.initializer.type) {
                returnType = prop.initializer.type.getText();
              }
              type = `(${params}) => ${returnType}`;
            }
            exposes.push({ name, description, type });
          }
        }
      }
    }
    ts.forEachChild(node, visitDefineExpose);
  }
  visitExportDefault(sourceFile);
  visitDefineExpose(sourceFile);
  return exposes;
};
