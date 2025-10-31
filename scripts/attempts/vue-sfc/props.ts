import ts from 'typescript';
import { extractCommentDescription } from '../common/extract-comment-description';
import { extractSlotsFromTemplate } from '../vue-common/slots-template';

/**
 * Extracts props from the export default object of a classic SFC
 * @param scriptContent content of the <script> block
 * @param absPath absolute path of the file (for TS)
 */

// Extraction des props ET des slots (pour Options API)
export const extractProps = (scriptContent: string, absPath: string, templateContent?: string) => {
  // Log d'entrée pour différencier l'appel
  const stack = new Error().stack || '';

  const props: Array<{ name: string; type: string; default?: any; description: string }> = [];
  const sourceFile = ts.createSourceFile(
    absPath,
    scriptContent,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  );
  // Recherche export default { ... } n'importe où dans l'AST
  function findExportDefaultObject(node: ts.Node): ts.ObjectLiteralExpression | undefined {
    if (ts.isExportAssignment(node)) {
      if (ts.isObjectLiteralExpression(node.expression)) {
        return node.expression;
      }
    }
    let found: ts.ObjectLiteralExpression | undefined;
    ts.forEachChild(node, (child) => {
      if (!found) found = findExportDefaultObject(child);
    });
    return found;
  }
  const obj = findExportDefaultObject(sourceFile);
  if (!obj) return props;
  for (const prop of obj.properties) {
    if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name) && prop.name.text === 'props') {
      // props: { ... } or props: []
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
                    // If it's a literal, use the real JS value
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
                      // fallback: source code
                      defaultValue = opt.initializer.getText();
                    }
                  }
                }
              }
            } else if (ts.isIdentifier(p.initializer)) {
              // props: { foo: String }
              type = p.initializer.getText();
            }
            // Recherche le commentaire JSDoc le plus proche au-dessus de la propriété
            let desc = '';
            const ranges = ts.getLeadingCommentRanges(scriptContent, p.pos) || [];
            // 1. Cherche un commentaire juste avant (lignes vides ou commentaires autorisés)
            for (let i = ranges.length - 1; i >= 0; i--) {
              const lastRange = ranges[i];
              if (lastRange) {
                const between = scriptContent.slice(lastRange.end, p.pos);
                if (/^([ \t]*\r?\n|[ \t]*\/\/.*\r?\n|[ \t]*\/\*.*?\*\/\r?\n)*$/.test(between)) {
                  desc = extractCommentDescription(scriptContent, lastRange, p.initializer);
                  if (desc) break;
                }
              }
            }
            // 2. Fallback : si aucune description trouvée, prend le premier commentaire JSDoc au-dessus
            if (!desc) {
              for (let i = ranges.length - 1; i >= 0; i--) {
                const lastRange = ranges[i];
                if (lastRange) {
                  const cmt = scriptContent.slice(lastRange.pos, lastRange.end).trim();
                  if (cmt.startsWith('/**')) {
                    desc = extractCommentDescription(scriptContent, lastRange, p.initializer);
                    if (desc) break;
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
  // Extraction avancée des slots (inspirée de vue-sfc-setup/slots.ts)
  const slotsMap: Record<string, { name: string; description: string; params?: string }> = {};
  // (1) Extraction template
  if (templateContent) {
    const templateSlots = extractSlotsFromTemplate(templateContent);
    for (const slot of templateSlots) {
      slotsMap[slot.name] = {
        name: slot.name,
        description: slot.description || '',
        params: slot.params || '-',
      };
    }
  }
  // (2) Extraction future : AST (defineSlots, etc.) — pour compatibilité, non utilisé ici
  // (3) Retourne la liste structurée
  const slots = Object.values(slotsMap);
  return { props, slots };
};
