import fs from 'fs';
import path from 'path';

/**
 * Extracts the first @ajs-category value from any file in a folder (prefers index.ts).
 * @param {string} folderPath - Path to the folder to search.
 * @returns {string | undefined} - The category if found, otherwise undefined
 */
export const extractAjsCategoryFromFolder = (folderPath: string): string | undefined => {
  const files = fs.readdirSync(folderPath).filter((f) => f.endsWith('.ts') || f.endsWith('.vue'));
  // Prioritize index.ts
  const sortedFiles = [
    ...files.filter((f) => f === 'index.ts'),
    ...files.filter((f) => f !== 'index.ts'),
  ];
  for (const file of sortedFiles) {
    const filePath = path.join(folderPath, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const match = content.match(/@ajs-category\s+([\w-]+)/);
    if (match) {
      return match[1];
    }
  }
  return undefined;
};
