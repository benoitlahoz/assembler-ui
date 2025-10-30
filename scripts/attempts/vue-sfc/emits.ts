import ts from 'typescript';
import { conditionally } from '@assemblerjs/core';

function isExportAssignmentObject(node: ts.Node) {
  return ts.isExportAssignment(node) && ts.isObjectLiteralExpression(node.expression);
}

function isEmitsProperty(prop: ts.ObjectLiteralElementLike) {
  // Ajout debug temporaire
  if (ts.isPropertyAssignment(prop)) {
    const name = prop.name;
    let key = '';
    if (ts.isIdentifier(name)) key = name.text;
    else if (ts.isStringLiteral(name)) key = name.text;
    if (key === 'emits') {
      // eslint-disable-next-line no-console
      console.log('EMITS PROPERTY DETECTED:', key);
      return true;
    }
  }
  return false;
}

function isArrayLiteral(initializer: ts.Expression) {
  return ts.isArrayLiteralExpression(initializer);
}

function isStringLiteral(el: ts.Expression) {
  return ts.isStringLiteral(el);
}

function hasLeadingComment(ranges: ts.CommentRange[] | undefined) {
  return !!ranges && ranges.length > 0;
}

function isSeparatedByBlankLines(
  scriptContent: string,
  lastRange: ts.CommentRange,
  el: ts.Expression
) {
  const between = scriptContent.slice(lastRange.end, el.pos);
  return /^([ \t]*\r?\n)*$/.test(between);
}

function isJSDocComment(cmt: string) {
  return cmt.startsWith('/**');
}

function isLineComment(cmt: string) {
  return cmt.startsWith('//');
}

function extractCommentDescription(
  scriptContent: string,
  lastRange: ts.CommentRange,
  el: ts.Expression
): string {
  if (!lastRange || !isSeparatedByBlankLines(scriptContent, lastRange, el)) return '';
  const cmt = scriptContent.slice(lastRange.pos, lastRange.end).trim();
  let description = '';
  conditionally({
    if: () => isJSDocComment(cmt),
    then: () => {
      description = cmt
        .replace(/^\/\*\*|\*\/$/g, '')
        .replace(/^[*\s]+/gm, '')
        .trim();
    },
  });
  conditionally({
    if: () => isLineComment(cmt),
    then: () => {
      description = cmt.replace(/^\/\//, '').trim();
    },
  });
  return description;
}

function handleArrayEmits(
  initializer: ts.Expression,
  scriptContent: string,
  emits: Array<{ name: string; description: string }>
) {
  if (!isArrayLiteral(initializer)) return;
  if (ts.isArrayLiteralExpression(initializer)) {
    // On récupère les commentaires JSDoc associés à chaque élément
    const elements = initializer.elements;
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      if (typeof element !== 'undefined' && ts.isStringLiteral(element)) {
        // Cherche un commentaire JSDoc juste avant l'élément
        let description = '';
        const jsDoc = ts.getJSDocCommentsAndTags?.(element) ?? [];
        if (jsDoc.length > 0) {
          // Prend le dernier commentaire JSDoc trouvé
          const last = jsDoc[jsDoc.length - 1];
          if (last && 'comment' in last && typeof (last as any).comment === 'string') {
            description = (last as any).comment.trim();
          } else if (last && 'text' in last && typeof (last as any).text === 'string') {
            description = (last as any).text.trim();
          }
        } else {
          // Fallback : cherche un commentaire juste avant dans le code source
          const pos = element.getFullStart();
          const before = scriptContent.slice(Math.max(0, pos - 120), pos);
          const match = before.match(/\*\*([\s\S]*?)\*\//);
          if (match && match[1]) {
            description = match[1].replace(/^[*\s]+/gm, '').trim();
          }
        }
        emits.push({ name: element.text, description });
      }
    }
  }
}

function handleObjectEmits(
  initializer: ts.Expression,
  scriptContent: string,
  emits: Array<{ name: string; description: string }>
) {
  if (!ts.isObjectLiteralExpression(initializer)) return;
  for (const e of initializer.properties) {
    if (ts.isPropertyAssignment(e) && ts.isIdentifier(e.name)) {
      const name = e.name.text;
      let description = '';
      const ranges = ts.getLeadingCommentRanges(scriptContent, e.pos) || [];
      conditionally({
        if: () => hasLeadingComment(ranges),
        then: () => {
          const lastRange = ranges[ranges.length - 1];
          if (lastRange) {
            description = extractCommentDescription(
              scriptContent,
              lastRange,
              e.name as ts.Identifier
            );
          }
        },
      });
      emits.push({ name, description });
    }
  }
}

const visitExportDefaultEmits = (
  node: ts.Node,
  scriptContent: string,
  emits: Array<{ name: string; description: string }>
) => {
  // Si c'est un export default { ... }, on traite l'objet exporté et on ne descend pas dans ce même objet
  if (ts.isExportAssignment(node) && ts.isObjectLiteralExpression(node.expression)) {
    extractEmitsFromObjectLiteral(node.expression, scriptContent, emits);
    // On ne descend pas dans node.expression pour éviter le doublon
    ts.forEachChild(node, (child) => {
      if (child !== node.expression) {
        visitExportDefaultEmits(child, scriptContent, emits);
      }
    });
    return;
  }
  // Sinon, on traite les objets littéraux (pour fallback ou patterns alternatifs)
  if (ts.isObjectLiteralExpression(node)) {
    extractEmitsFromObjectLiteral(node, scriptContent, emits);
  }
  ts.forEachChild(node, (child) => visitExportDefaultEmits(child, scriptContent, emits));
};

function extractEmitsFromObjectLiteral(
  obj: ts.ObjectLiteralExpression,
  scriptContent: string,
  emits: Array<{ name: string; description: string }>
) {
  for (const prop of obj.properties) {
    if (isEmitsProperty(prop)) {
      const initializer = (prop as ts.PropertyAssignment).initializer;
      handleArrayEmits(initializer, scriptContent, emits);
      handleObjectEmits(initializer, scriptContent, emits);
    }
  }
}

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
  visitExportDefaultEmits(sourceFile, scriptContent, emits);
  return emits;
};
