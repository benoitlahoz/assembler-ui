import ts from 'typescript';

export const isSeparatedByBlankLines = (
  scriptContent: string,
  lastRange: ts.CommentRange,
  el: ts.Expression
): boolean => {
  // Returns true if only blank lines are found between the comment and the element
  const between = scriptContent.slice(lastRange.end, el.pos);
  return /^([ \t]*\r?\n)*$/.test(between);
};
