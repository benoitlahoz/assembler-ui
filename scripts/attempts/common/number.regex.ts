export const numberRegex = /^\d+(\.\d+)?$/;
export function testNumber(str: string): boolean {
  return numberRegex.test(str);
}
