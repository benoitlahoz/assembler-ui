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
        if (
          ts.isPropertyAssignment(prop) &&
          ts.isIdentifier(prop.name) &&
          (prop.name.text === 'provide' || prop.name.text === 'provides')
        ) {
          if (ts.isObjectLiteralExpression(prop.initializer)) {
            for (const e of prop.initializer.properties) {
              if (ts.isPropertyAssignment(e) && ts.isIdentifier(e.name)) {
                const key = e.name.text;
                let value = e.initializer ? e.initializer.getText() : '';
                let type: string | undefined = undefined;
                let desc = '';
                if (/^['\"].*['\"]$/.test(value)) type = 'string';
                else if (/^\d+(\.\d+)?$/.test(value)) type = 'number';
                else if (/^(true|false)$/.test(value)) type = 'boolean';
                else if (value === '[]') type = 'any[]';
                else if (value === '{}') type = 'Record<string, any>';
                else type = 'any';
                // Cherche le commentaire immédiatement au-dessus (JSDoc ou //), ignore si ligne vide ou code entre les deux
                let description = '';
                const ranges = ts.getLeadingCommentRanges(scriptContent, e.pos) || [];
                if (ranges.length > 0) {
                  const lastRange = ranges[ranges.length - 1];
                  if (lastRange) {
                    const between = scriptContent.slice(lastRange.end, e.pos);
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
