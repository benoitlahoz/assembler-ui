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
          if (ts.isObjectLiteralExpression(prop.initializer)) {
            for (const e of prop.initializer.properties) {
              if (ts.isPropertyAssignment(e) && ts.isIdentifier(e.name)) {
                const name = e.name.text;
                let type: string | undefined = undefined;
                let description = '';
                const ranges = ts.getLeadingCommentRanges(scriptContent, e.pos) || [];
                if (ranges.length > 0) {
                  const lastRange = ranges[ranges.length - 1];
                  if (lastRange) {
                    const between = scriptContent.slice(lastRange.end, e.pos);
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
        // Extraction des méthodes exposées (méthodes)
        if (
          ts.isPropertyAssignment(prop) &&
          ts.isIdentifier(prop.name) &&
          prop.name.text === 'methods' &&
          ts.isObjectLiteralExpression(prop.initializer)
        ) {
          for (const m of prop.initializer.properties) {
            if (ts.isMethodDeclaration(m) && ts.isIdentifier(m.name)) {
              const name = m.name.text;
              let type: string | undefined = undefined;
              let description = '';
              const ranges = ts.getLeadingCommentRanges(scriptContent, m.pos) || [];
              if (ranges.length > 0) {
                const lastRange = ranges[ranges.length - 1];
                if (lastRange) {
                  const between = scriptContent.slice(lastRange.end, m.pos);
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
              const params = m.parameters
                .map((p: ts.ParameterDeclaration) => {
                  const paramName = p.name.getText();
                  const paramType = p.type ? `: ${p.type.getText()}` : '';
                  return paramName + paramType;
                })
                .join(', ');
              let returnType = 'any';
              if (m.type) {
                returnType = m.type.getText();
              }
              type = `(${params}) => ${returnType}`;
              exposes.push({ name, description, type });
            } else if (ts.isPropertyAssignment(m) && ts.isIdentifier(m.name)) {
              // Cas function property: foo: function() {...}
              const name = m.name.text;
              let type: string | undefined = undefined;
              let description = '';
              const ranges = ts.getLeadingCommentRanges(scriptContent, m.pos) || [];
              if (ranges.length > 0) {
                const lastRange = ranges[ranges.length - 1];
                if (lastRange) {
                  const between = scriptContent.slice(lastRange.end, m.pos);
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
              if (ts.isFunctionLike(m.initializer)) {
                const params = m.initializer.parameters
                  .map((p: ts.ParameterDeclaration) => {
                    const paramName = p.name.getText();
                    const paramType = p.type ? `: ${p.type.getText()}` : '';
                    return paramName + paramType;
                  })
                  .join(', ');
                let returnType = 'any';
                if (m.initializer.type) {
                  returnType = m.initializer.type.getText();
                }
                type = `(${params}) => ${returnType}`;
              }
              exposes.push({ name, description, type });
            }
          }
        }
        // Extraction des computed exposés
        if (
          ts.isPropertyAssignment(prop) &&
          ts.isIdentifier(prop.name) &&
          prop.name.text === 'computed' &&
          ts.isObjectLiteralExpression(prop.initializer)
        ) {
          for (const c of prop.initializer.properties) {
            if (ts.isMethodDeclaration(c) && ts.isIdentifier(c.name)) {
              const name = c.name.text;
              let type: string | undefined = undefined;
              let description = '';
              const ranges = ts.getLeadingCommentRanges(scriptContent, c.pos) || [];
              if (ranges.length > 0) {
                const lastRange = ranges[ranges.length - 1];
                if (lastRange) {
                  const between = scriptContent.slice(lastRange.end, c.pos);
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
              const params = c.parameters
                .map((p: ts.ParameterDeclaration) => {
                  const paramName = p.name.getText();
                  const paramType = p.type ? `: ${p.type.getText()}` : '';
                  return paramName + paramType;
                })
                .join(', ');
              let returnType = 'any';
              if (c.type) {
                returnType = c.type.getText();
              }
              type = `(${params}) => ${returnType}`;
              exposes.push({ name, description, type });
            } else if (ts.isPropertyAssignment(c) && ts.isIdentifier(c.name)) {
              // Cas function property: foo: function() {...}
              const name = c.name.text;
              let type: string | undefined = undefined;
              let description = '';
              const ranges = ts.getLeadingCommentRanges(scriptContent, c.pos) || [];
              if (ranges.length > 0) {
                const lastRange = ranges[ranges.length - 1];
                if (lastRange) {
                  const between = scriptContent.slice(lastRange.end, c.pos);
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
              if (ts.isFunctionLike(c.initializer)) {
                const params = c.initializer.parameters
                  .map((p: ts.ParameterDeclaration) => {
                    const paramName = p.name.getText();
                    const paramType = p.type ? `: ${p.type.getText()}` : '';
                    return paramName + paramType;
                  })
                  .join(', ');
                let returnType = 'any';
                if (c.initializer.type) {
                  returnType = c.initializer.type.getText();
                }
                type = `(${params}) => ${returnType}`;
              }
              exposes.push({ name, description, type });
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
