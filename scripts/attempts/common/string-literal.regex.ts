export const stringLiteralRegex = /^['\"].*['\"]$/;
export function testStringLiteral(str: string): boolean {
  return stringLiteralRegex.test(str);
}
