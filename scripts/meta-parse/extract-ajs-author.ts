import fs from 'fs';
import path from 'path';

/**
 * Extracts the first author annotated with // @ajs-author from any file in a folder (prefers index.ts).
 * @param {string} folderPath - Path to the folder to search.
 * @returns {string} - The first author found, or an empty string if none found.
 */
export function extractAjsAuthorsFromFolder(folderPath: string): string {
  const files = fs.readdirSync(folderPath).filter((f) => f.endsWith('.ts') || f.endsWith('.vue'));
  // Prioritize index.ts
  const sortedFiles = [
    ...files.filter((f) => f === 'index.ts'),
    ...files.filter((f) => f !== 'index.ts'),
  ];
  for (const file of sortedFiles) {
    const filePath = path.join(folderPath, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const authorRegex = /^\s*\/\/\s*@ajs-author\s*(.*)$/gm;
    let match;
    while ((match = authorRegex.exec(content)) !== null) {
      if (match[1]) {
        return match[1].trim();
      }
    }
  }
  return '';
}
