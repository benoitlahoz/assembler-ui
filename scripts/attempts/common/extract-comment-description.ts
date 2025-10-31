import * as ts from 'typescript';

export const extractCommentDescription = (
  scriptContent: string,
  lastRange: ts.CommentRange,
  el: ts.Expression
): string => {
  if (!lastRange) return '';
  // Create a fake SourceFile to use the TypeScript API
  const fakeSource = ts.createSourceFile('temp.ts', scriptContent, ts.ScriptTarget.Latest, true);
  // Look for the JSDoc comment covering the lastRange.pos position
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
  // Fallback: if nothing found, try to parse the comment text as before
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
};
