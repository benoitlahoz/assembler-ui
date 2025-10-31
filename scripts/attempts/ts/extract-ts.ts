import fs from 'fs';
import path from 'path';
import * as ts from 'typescript';
import { extractCommentBlock } from '../common/extract-comment-block';

export interface TsFileExtract {
  fileName: string;
  types: { name: string; type: string }[];
  description?: string;
  category?: string;
  author?: string;
}

const visit = (node: ts.Node, types: { name: string; type: string }[]) => {
  if (ts.isInterfaceDeclaration(node)) {
    types.push({ name: node.name.text, type: 'interface' });
  }
  if (ts.isTypeAliasDeclaration(node)) {
    types.push({ name: node.name.text, type: 'type' });
  }
  if (ts.isEnumDeclaration(node)) {
    types.push({ name: node.name.text, type: 'enum' });
  }
  ts.forEachChild(node, (child) => visit(child, types));
};

// Extracts types and top-of-file JSDoc info from a TypeScript file using the AST
// @param filePath Absolute path to the .ts file to read
// @returns An object containing types, description, category, and author
export const extractTs = (filePath: string): TsFileExtract => {
  if (!filePath.endsWith('.ts')) {
    throw new Error('File must have a .ts extension');
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);

  // Extract the top multiline comment (JSDoc) from the file
  let description: string | undefined;
  let category: string | undefined;
  let author: string | undefined;
  const match = extractCommentBlock(content);
  if (match && typeof match[1] === 'string') {
    const comment = match[1];
    // Description = free text before any @ tag
    if (typeof comment === 'string' && comment) {
      const descMatch = (comment.split(/@/)[0] || '').replace(/^[\s\*]+/gm, '').trim();
      description = descMatch;
    }
    // Look for @category and @author tags
    const catMatch = comment.match(/@category\s+([^@\n]*)/);
    const authorMatch = comment.match(/@author\s+([^@\n]*)/);
    if (catMatch && typeof catMatch[1] === 'string') category = catMatch[1].trim();
    if (authorMatch && typeof authorMatch[1] === 'string') author = authorMatch[1].trim();
  }

  const types: { name: string; type: string }[] = [];

  visit(sourceFile, types);

  return {
    fileName: path.basename(filePath),
    types,
    description,
    category,
    author,
  };
};
