export const commentRegex = /^\/\*\*([\s\S]*?)\*\//;

export function matchCommentBlock(str: string): RegExpMatchArray | null {
  return str.match(commentRegex);
}

export function testCommentBlock(str: string): boolean {
  return commentRegex.test(str);
}
