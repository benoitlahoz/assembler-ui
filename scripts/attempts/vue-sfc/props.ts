import ts from 'typescript';

/**
 * Extrait les props depuis l'objet export default d'un SFC classique
 * @param scriptContent contenu du bloc <script>
 * @param absPath chemin absolu du fichier (pour TS)
 */
export const extractProps = (scriptContent: string, absPath: string) => {
  const props: Array<{ name: string; type: string; default?: any; description: string }> = [];
  const sourceFile = ts.createSourceFile(
    absPath,
    scriptContent,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  );
  function visit(node: ts.Node) {
    // Cherche export default { ... }
    if (ts.isExportAssignment(node) && ts.isObjectLiteralExpression(node.expression)) {
      const obj = node.expression;
      for (const prop of obj.properties) {
        if (
          ts.isPropertyAssignment(prop) &&
          ts.isIdentifier(prop.name) &&
          prop.name.text === 'props'
        ) {
          // props: { ... } ou props: []
          if (ts.isObjectLiteralExpression(prop.initializer)) {
            for (const p of prop.initializer.properties) {
              if (ts.isPropertyAssignment(p) && ts.isIdentifier(p.name)) {
                const name = p.name.text;
                let type = 'any';
                let defaultValue: any = '-';
                let description = '';
                // props: { foo: { type: String, default: ... } }
                if (ts.isObjectLiteralExpression(p.initializer)) {
                  for (const opt of p.initializer.properties) {
                    if (ts.isPropertyAssignment(opt) && ts.isIdentifier(opt.name)) {
                      if (opt.name.text === 'type') {
                        type = opt.initializer.getText();
                      } else if (opt.name.text === 'default') {
                        // Si c'est un littéral, on prend la valeur JS réelle
                        if (ts.isNumericLiteral(opt.initializer)) {
                          defaultValue = Number(opt.initializer.text);
                        } else if (ts.isStringLiteral(opt.initializer)) {
                          defaultValue = opt.initializer.text;
                        } else if (opt.initializer.kind === ts.SyntaxKind.TrueKeyword) {
                          defaultValue = true;
                        } else if (opt.initializer.kind === ts.SyntaxKind.FalseKeyword) {
                          defaultValue = false;
                        } else if (
                          ts.isObjectLiteralExpression(opt.initializer) ||
                          ts.isArrayLiteralExpression(opt.initializer)
                        ) {
                          defaultValue = opt.initializer.getText();
                        } else {
                          // fallback: code source
                          defaultValue = opt.initializer.getText();
                        }
                      }
                    }
                  }
                } else if (ts.isIdentifier(p.initializer)) {
                  // props: { foo: String }
                  type = p.initializer.getText();
                }
                // Cherche le commentaire immédiatement au-dessus (JSDoc ou //), ignore si ligne vide ou code entre les deux
                let desc = '';
                const ranges = ts.getLeadingCommentRanges(scriptContent, p.pos) || [];
                if (ranges.length > 0) {
                  const lastRange = ranges[ranges.length - 1];
                  if (lastRange) {
                    // Vérifie qu'il n'y a que des lignes vides entre le commentaire et la prop
                    const between = scriptContent.slice(lastRange.end, p.pos);
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
                props.push({ name, type, default: defaultValue, description: desc });
              }
            }
          } else if (ts.isArrayLiteralExpression(prop.initializer)) {
            // props: ['foo', 'bar']
            for (const el of prop.initializer.elements) {
              if (ts.isStringLiteral(el)) {
                props.push({ name: el.text, type: 'any', default: '-', description: '' });
              }
            }
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return props;
};
