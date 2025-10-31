import ts from 'typescript';

export const hasLeadingComment = (ranges: ts.CommentRange[] | undefined) => {
  return !!ranges && ranges.length > 0;
};
