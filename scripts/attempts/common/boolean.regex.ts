export const booleanRegex = /^(true|false)$/;
export function testBoolean(str: string): boolean {
  return booleanRegex.test(str);
}
