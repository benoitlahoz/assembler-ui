import fs from 'fs';
import * as ts from 'typescript';
import { extractCvaVariants } from '../vue-sfc-composition/cva-variants';
import { extractCommentBlock } from '../common/extract-comment-block';
import { extractDescriptionAndTags } from '../common/extract-description-and-tags';

export interface TsFileExtract {
  types: Array<{ name: string; type: string }>;
  description?: string;
  variants?: Record<string, Record<string, string[]>>;
  // Les tags peuvent être string, objet ou tableau (pour compatibilité avec extractDescriptionAndTags)
  [tag: string]:
    | any
    | string
    | { name: string; definition: string[]; html?: string; pug?: string }
    | (string | { name: string; definition: string[]; html?: string; pug?: string })[];
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
  let tags: Record<string, any> = {};
  const match = extractCommentBlock(content);
  if (match && typeof match[1] === 'string') {
    const comment = match[1];
    const descAndTags = extractDescriptionAndTags('/**' + comment + '*/');
    description = descAndTags.description;
    tags = descAndTags.tags || {};
  }

  const types: { name: string; type: string }[] = [];

  visit(sourceFile, types);

  // Ajout de l'extraction des variants cva uniquement pour index.ts
  let variants: Record<string, Record<string, string[]>> | undefined = undefined;
  if (filePath.endsWith('index.ts')) {
    variants = extractCvaVariants(content, filePath);
  }

  return {
    types,
    description,
    ...(variants ? { variants } : {}),
    ...tags,
  };
};

// Extrait le bloc declare module d'un fichier d.ts
export const extractDeclareModule = (tsSourceFile: string) => {
  const match = tsSourceFile.match(/declare module ['"]([^'\"]+)['"]\s*\{([\s\S]*?)\}/);
  if (match && match[1] && match[2]) {
    const declareBody = match[2].trim();
    return {
      module: match[1],
      source: `declare module '${match[1]}' {\n${declareBody}\n}`,
    };
  }
  return null;
};
