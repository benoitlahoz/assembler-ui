import ts from 'typescript';

/**
 * Extrait les emits depuis l'objet export default d'un SFC classique
 * @param scriptContent contenu du bloc <script>
 * @param absPath chemin absolu du fichier (pour TS)
 */
export const extractEmits = (scriptContent: string, absPath: string) => {
  const emits: Array<{ name: string; description: string }> = [];
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
          prop.name.text === 'emits'
        ) {
          // emits: ['foo', 'bar'] ou emits: { foo: ... }
          if (ts.isArrayLiteralExpression(prop.initializer)) {
            for (const el of prop.initializer.elements) {
              if (ts.isStringLiteral(el)) {
                // Cherche le commentaire immédiatement au-dessus (JSDoc ou //), ignore si ligne vide ou code entre les deux
                let description = '';
                const ranges = ts.getLeadingCommentRanges(scriptContent, el.pos) || [];
                if (ranges.length > 0) {
                  const lastRange = ranges[ranges.length - 1];
                  if (lastRange) {
                    const between = scriptContent.slice(lastRange.end, el.pos);
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
                emits.push({ name: el.text, description });
              }
            }
          } else if (ts.isObjectLiteralExpression(prop.initializer)) {
            for (const e of prop.initializer.properties) {
              if (ts.isPropertyAssignment(e) && ts.isIdentifier(e.name)) {
                const name = e.name.text;
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
                emits.push({ name, description });
              }
            }
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return emits;
};
