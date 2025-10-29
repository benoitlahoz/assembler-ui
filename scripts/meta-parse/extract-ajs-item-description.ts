import { readFileSync } from 'node:fs';

export const extractAjsItemDescription = (filePath: string): string | undefined => {
  const source = readFileSync(filePath, 'utf-8');
  const match = source.match(/@ajs-description\s+([^\n]+)/);
  return match?.[1]?.trim();
};
