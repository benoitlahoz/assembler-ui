import ts from 'typescript';

/**
 * Extrait les provides depuis l'objet export default d'un SFC classique (clé provide/provides)
 * @param scriptContent contenu du bloc <script>
 * @param absPath chemin absolu du fichier (pour TS)
 */

export const extractProvides = (scriptContent: string, absPath: string) => {
  const provides: Array<{ key: string; value: string; type?: string; description: string }> = [];
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
        // Propriété provide/provides sous forme objet ou fonction
        if (
          (ts.isPropertyAssignment(prop) &&
            ts.isIdentifier(prop.name) &&
            (prop.name.text === 'provide' || prop.name.text === 'provides')) ||
          (ts.isMethodDeclaration(prop) &&
            ts.isIdentifier(prop.name) &&
            (prop.name.text === 'provide' || prop.name.text === 'provides'))
        ) {
          // Supporte provide: { ... }
          if (ts.isPropertyAssignment(prop) && ts.isObjectLiteralExpression(prop.initializer)) {
            for (const e of prop.initializer.properties) {
              if (ts.isPropertyAssignment(e)) {
                let key = '';
                if (ts.isIdentifier(e.name)) {
                  key = e.name.text;
                } else if (ts.isStringLiteral(e.name)) {
                  key = e.name.text;
                } else if (ts.isComputedPropertyName(e.name)) {
                  key = e.name.expression.getText();
                }
                let value = e.initializer ? e.initializer.getText() : '';
                let type: string | undefined = undefined;
                if (/^['\"].*['\"]$/.test(value)) type = 'string';
                else if (/^\d+(\.\d+)?$/.test(value)) type = 'number';
                else if (/^(true|false)$/.test(value)) type = 'boolean';
                else if (value === '[]') type = 'any[]';
                else if (value === '{}') type = 'Record<string, any>';
                else type = 'any';
                // Récupère tous les commentaires juste au-dessus
                let descParts: string[] = [];
                const ranges = ts.getLeadingCommentRanges(scriptContent, e.pos) || [];
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
                const description = descParts.join('\n').trim();
                provides.push({ key, value, type, description });
              }
            }
          }
          // Supporte provide: () { return { ... } } ou provide() { return { ... } }
          else if (
            (ts.isPropertyAssignment(prop) && ts.isFunctionLike(prop.initializer)) ||
            ts.isMethodDeclaration(prop)
          ) {
            let body = undefined;
            if (ts.isPropertyAssignment(prop) && ts.isFunctionLike(prop.initializer)) {
              body = prop.initializer.body;
            } else if (ts.isMethodDeclaration(prop)) {
              body = prop.body;
            }
            if (body && ts.isBlock(body)) {
              for (const stmt of body.statements) {
                if (
                  ts.isReturnStatement(stmt) &&
                  stmt.expression &&
                  ts.isObjectLiteralExpression(stmt.expression)
                ) {
                  for (const e of stmt.expression.properties) {
                    if (ts.isPropertyAssignment(e)) {
                      let key = '';
                      if (ts.isIdentifier(e.name)) {
                        key = e.name.text;
                      } else if (ts.isStringLiteral(e.name)) {
                        key = e.name.text;
                      } else if (ts.isComputedPropertyName(e.name)) {
                        key = e.name.expression.getText();
                      }
                      let value = e.initializer ? e.initializer.getText() : '';
                      let type: string | undefined = undefined;
                      if (/^['\"].*['\"]$/.test(value)) type = 'string';
                      else if (/^\d+(\.\d+)?$/.test(value)) type = 'number';
                      else if (/^(true|false)$/.test(value)) type = 'boolean';
                      else if (value === '[]') type = 'any[]';
                      else if (value === '{}') type = 'Record<string, any>';
                      else type = 'any';
                      // Récupère tous les commentaires juste au-dessus
                      let descParts: string[] = [];
                      const ranges = ts.getLeadingCommentRanges(scriptContent, e.pos) || [];
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
                      const description = descParts.join('\n').trim();
                      provides.push({ key, value, type, description });
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    ts.forEachChild(node, visitExportDefault);
  }
  // 2. Extraction via appels à provide() dans le code (Composition API)
  function visitProvideCalls(node: ts.Node) {
    if (
      ts.isCallExpression(node) &&
      node.expression.getText() === 'provide' &&
      node.arguments.length > 0
    ) {
      // provide(key, value)
      let key = '';
      let value: string = '';
      let type: string | undefined = undefined;
      let description = '';
      const arg0 = node.arguments[0];
      const arg1 = node.arguments.length > 1 ? node.arguments[1] : undefined;
      if (arg0) {
        if (ts.isStringLiteral(arg0)) {
          key = arg0.text;
          type = 'string';
        } else if (ts.isIdentifier(arg0)) {
          key = arg0.getText();
          type = 'symbol|object|any';
        } else {
          key = arg0.getText();
          type = 'any';
        }
      }
      if (arg1) {
        value = arg1.getText();
      }
      // Cherche le commentaire immédiatement au-dessus (JSDoc ou //), ignore si ligne vide ou code entre les deux
      let desc = '';
      const ranges = ts.getLeadingCommentRanges(scriptContent, node.pos) || [];
      if (ranges.length > 0) {
        const lastRange = ranges[ranges.length - 1];
        if (lastRange) {
          const between = scriptContent.slice(lastRange.end, node.pos);
          if (/^([ \t]*\r?\n)*$/.test(between)) {
            const cmt = scriptContent.slice(lastRange.pos, lastRange.end).trim();
            if (cmt.startsWith('/**')) {
              desc = cmt
                .replace(/^\/\*\*|\*\/$/g, '')
                .replace(/^[*\s]+/gm, '')
                .trim();
            } else if (cmt.startsWith('//')) {
              desc = cmt.replace(/^\/\//, '').trim();
            }
          }
        }
      }
      provides.push({ key, value, type, description: desc });
    }
    ts.forEachChild(node, visitProvideCalls);
  }
  visitExportDefault(sourceFile);
  visitProvideCalls(sourceFile);
  return provides;
};
