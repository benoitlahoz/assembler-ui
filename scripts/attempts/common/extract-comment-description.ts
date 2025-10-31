import * as ts from 'typescript';

export function extractCommentDescription(
  scriptContent: string,
  lastRange: ts.CommentRange,
  el: ts.Expression
): string {
  if (!lastRange) return '';
  // On crée un faux SourceFile pour utiliser l'API TypeScript
  const fakeSource = ts.createSourceFile('temp.ts', scriptContent, ts.ScriptTarget.Latest, true);
  // On cherche le commentaire JSDoc qui couvre la position lastRange.pos
  let found = '';
  const jsdocNodes = ts.getJSDocCommentsAndTags ? ts.getJSDocCommentsAndTags(el) : [];
  if (jsdocNodes && jsdocNodes.length > 0) {
    for (const node of jsdocNodes) {
      if ('comment' in node && typeof node.comment === 'string') {
        found = node.comment.trim();
        break;
      }
    }
  }
  // Fallback : si rien trouvé, on tente de parser le texte du commentaire comme avant
  if (!found) {
    const cmt = scriptContent.slice(lastRange.pos, lastRange.end).trim();
    if (cmt.startsWith('/**')) {
      found = cmt
        .replace(/^\/\*\*|\*\/$/g, '')
        .split(/\r?\n/)
        .map((line: string) => line.replace(/^\s*\* ?/, ''))
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
    } else if (cmt.startsWith('//')) {
      found = cmt.replace(/^\/\//, '').trim();
    }
  }
  return found;
}
