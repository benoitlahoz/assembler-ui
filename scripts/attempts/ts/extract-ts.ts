import fs from 'fs';
import path from 'path';
import * as ts from 'typescript';

export interface TsTypeExtract {
  name: string;
  kind: 'interface' | 'type' | 'enum';
}

export interface TsFileExtract {
  fileName: string;
  types: TsTypeExtract[];
  description?: string;
  category?: string;
  author?: string;
}

/**
 * Extrait les imports, exports et types d'un fichier TypeScript via AST.
 * @param filePath Chemin absolu du fichier .ts à lire
 * @returns Un objet contenant les imports, exports et types
 */
export function extractTs(filePath: string): TsFileExtract {
  if (!filePath.endsWith('.ts')) {
    throw new Error('Le fichier doit avoir une extension .ts');
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);

  // Extraction du commentaire multiligne en haut du fichier
  let description: string | undefined;
  let category: string | undefined;
  let author: string | undefined;
  const commentRegex = /^\/\*\*([\s\S]*?)\*\//;
  const match = content.match(commentRegex);
  if (match && typeof match[1] === 'string') {
    const comment = match[1];
    // Description = texte libre avant tout tag @
    if (typeof comment === 'string' && comment) {
      const descMatch = (comment.split(/@/)[0] || '').replace(/^[\s\*]+/gm, '').trim();
      description = descMatch;
    }
    // Recherche des tags @category, @author
    const catMatch = comment.match(/@category\s+([^@\n]*)/);
    const authorMatch = comment.match(/@author\s+([^@\n]*)/);
    if (catMatch && typeof catMatch[1] === 'string') category = catMatch[1].trim();
    if (authorMatch && typeof authorMatch[1] === 'string') author = authorMatch[1].trim();
  }

  // const imports: string[] = [];
  // const exports: string[] = [];
  const types: TsTypeExtract[] = [];

  function visit(node: ts.Node) {
    if (ts.isInterfaceDeclaration(node)) {
      types.push({ name: node.name.text, kind: 'interface' });
    }
    if (ts.isTypeAliasDeclaration(node)) {
      types.push({ name: node.name.text, kind: 'type' });
    }
    if (ts.isEnumDeclaration(node)) {
      types.push({ name: node.name.text, kind: 'enum' });
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  return {
    fileName: path.basename(filePath),
    types,
    description,
    category,
    author,
  };
}

// Exemple d'utilisation :
// const info = extractTsAstInfo('/chemin/vers/fichier.ts');
// console.log(info);
