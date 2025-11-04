import * as ts from 'typescript';
import path from 'path';
import fs from 'fs';
import { formatAliasesForExtractImports } from './resolve-tsconfig-paths';

/**
 * Interface to represent a detected import
 */
export interface ImportInfo {
  /** Name of the imported module (e.g., 'useMediaDevices') */
  name: string;
  /** Source path of the import as written in the code */
  importPath: string;
  /** Resolved absolute path of the imported file (if found) */
  resolvedPath?: string;
  /** Relative path from globalPath (e.g., 'composables/use-media-devices/useMediaDevices.ts') */
  relativePath?: string;
  /** Type of detected import */
  type: 'local' | 'internal' | 'external';
  /** Imported specifiers (e.g., ['useMediaDevices', 'MediaDevicesKey']) */
  specifiers: string[];
}

/**
 * Configuration for path resolution
 */
interface ResolveConfig {
  /** Absolute path of the source file */
  sourceFilePath: string;
  /** Global project path (e.g., 'registry/new-york/') */
  globalPath: string;
  /** Folders to scan in globalPath */
  paths: string[];
  /**
   * Path aliases (e.g., {'~~': 'registry/new-york', '@': 'app'})
   * If not provided, will be automatically resolved from tsconfig.json
   */
  aliases?: Record<string, string>;
  /** Project root for alias resolution (default: process.cwd()) */
  root?: string;
  /** Path to tsconfig.json (default: 'tsconfig.json') */
  tsconfigPath?: string;
}

/**
 * Extracts all imports from a TypeScript or Vue file
 * @param content File content
 * @param filePath Absolute path of the file
 * @param config Configuration
 * @returns List of detected imports
 */
export const extractImports = (
  content: string,
  filePath: string,
  config: ResolveConfig
): ImportInfo[] => {
  // Auto-résoudre les alias depuis tsconfig.json si non fournis
  const resolvedConfig = {
    ...config,
    aliases: config.aliases || formatAliasesForExtractImports(config.tsconfigPath, config.root),
  };

  const imports: ImportInfo[] = [];
  const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);

  const visit = (node: ts.Node) => {
    // Import classique: import { X } from 'path'
    if (ts.isImportDeclaration(node) && node.moduleSpecifier) {
      if (ts.isStringLiteral(node.moduleSpecifier)) {
        const importPath = node.moduleSpecifier.text;
        const specifiers = extractImportSpecifiers(node);
        const importInfo = resolveImportPath(importPath, resolvedConfig);

        imports.push({
          name: extractModuleName(importPath),
          importPath,
          ...importInfo,
          specifiers,
        });
      }
    }

    // Dynamic import: import('path')
    if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
      const arg = node.arguments[0];
      if (arg && ts.isStringLiteral(arg)) {
        const importPath = arg.text;
        const importInfo = resolveImportPath(importPath, resolvedConfig);

        imports.push({
          name: extractModuleName(importPath),
          importPath,
          ...importInfo,
          specifiers: [],
        });
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return imports;
};

/**
 * Extrait les spécificateurs d'un import (ce qui est importé)
 */
const extractImportSpecifiers = (node: ts.ImportDeclaration): string[] => {
  const specifiers: string[] = [];

  if (node.importClause) {
    // Default import: import X from 'path'
    if (node.importClause.name) {
      specifiers.push(node.importClause.name.text);
    }

    // Named imports: import { X, Y } from 'path'
    if (node.importClause.namedBindings) {
      if (ts.isNamedImports(node.importClause.namedBindings)) {
        node.importClause.namedBindings.elements.forEach((element) => {
          specifiers.push(element.name.text);
        });
      }
      // Namespace import: import * as X from 'path'
      else if (ts.isNamespaceImport(node.importClause.namedBindings)) {
        specifiers.push(node.importClause.namedBindings.name.text);
      }
    }
  }

  return specifiers;
};

/**
 * Extrait le nom du module depuis un chemin d'import
 */
const extractModuleName = (importPath: string): string => {
  // Pour les imports avec extension
  const withoutExt = importPath.replace(/\.(ts|js|vue)$/, '');
  // Prendre le dernier segment du chemin
  const segments = withoutExt.split('/');
  return segments[segments.length - 1] || importPath;
};

/**
 * Résout un chemin d'import et détermine s'il appartient au code interne
 */
const resolveImportPath = (
  importPath: string,
  config: ResolveConfig
): Pick<ImportInfo, 'resolvedPath' | 'relativePath' | 'type'> => {
  const { sourceFilePath, globalPath, paths, aliases = {}, root } = config;

  // Import externe (node_modules)
  // Un import est externe s'il ne commence pas par '.', '/', ou un alias configuré
  // et qu'il ne correspond pas à un alias partiel comme '@/' ou '~~/'
  if (
    !importPath.startsWith('.') &&
    !importPath.startsWith('/') &&
    !startsWithAlias(importPath, aliases)
  ) {
    return { type: 'external' };
  }

  let resolvedPath: string | undefined;
  let type: 'local' | 'internal' = 'local';

  // Résolution avec alias
  if (startsWithAlias(importPath, aliases)) {
    resolvedPath = resolveAlias(importPath, aliases, root);
  }
  // Import relatif
  else if (importPath.startsWith('.')) {
    const sourceDir = path.dirname(sourceFilePath);
    resolvedPath = path.resolve(sourceDir, importPath);
  }
  // Import absolu
  else if (importPath.startsWith('/')) {
    resolvedPath = importPath;
  }

  // Si on a un chemin résolu, vérifier s'il existe (avec extensions)
  if (resolvedPath) {
    resolvedPath = findFileWithExtensions(resolvedPath);
  }

  // Déterminer si c'est un import interne (dans globalPath)
  if (resolvedPath) {
    const absGlobalPath = path.resolve(process.cwd(), globalPath);

    if (resolvedPath.startsWith(absGlobalPath)) {
      type = 'internal';
      const relativePath = path.relative(absGlobalPath, resolvedPath);
      return {
        resolvedPath,
        relativePath: relativePath.replace(/\\/g, '/'),
        type,
      };
    }
  }

  return {
    resolvedPath,
    type,
  };
};

/**
 * Vérifie si un chemin d'import commence par un alias
 */
const startsWithAlias = (importPath: string, aliases: Record<string, string>): boolean => {
  return Object.keys(aliases).some((alias) => {
    // Pour les alias se terminant par '/', vérifier que l'import commence exactement par cet alias
    if (alias.endsWith('/')) {
      return importPath.startsWith(alias);
    }
    // Pour les alias sans '/', vérifier qu'ils sont suivis de '/' ou qu'ils correspondent exactement
    return importPath === alias || importPath.startsWith(alias + '/');
  });
};

/**
 * Résout un chemin d'import avec alias
 */
const resolveAlias = (
  importPath: string,
  aliases: Record<string, string>,
  root?: string
): string => {
  const projectRoot = root || process.cwd();

  for (const [alias, target] of Object.entries(aliases)) {
    if (importPath === alias || importPath.startsWith(alias + '/')) {
      const remainder = importPath.slice(alias.length);
      return path.resolve(projectRoot, target, remainder.replace(/^\//, ''));
    }
  }
  return importPath;
};

/**
 * Finds a file by trying different extensions
 */
const findFileWithExtensions = (basePath: string): string | undefined => {
  const extensions = ['', '.ts', '.js', '.vue', '.d.ts', '/index.ts', '/index.js', '/index.vue'];

  for (const ext of extensions) {
    const fileTestPath = basePath + ext;
    if (fs.existsSync(fileTestPath)) {
      return fileTestPath;
    }
  }

  return undefined;
};

/**
 * Filters imports to keep only those that are internal (in globalPath)
 */
export const filterInternalImports = (imports: ImportInfo[]): ImportInfo[] => {
  return imports.filter((imp) => imp.type === 'internal');
};

/**
 * Filters imports to keep only those that are internal AND outside the source file's folder
 * @param imports List of imports
 * @param sourceFilePath Absolute path of the source file
 * @returns Internal imports external to the source file's folder
 */
export const filterExternalInternalImports = (
  imports: ImportInfo[],
  sourceFilePath: string
): ImportInfo[] => {
  const sourceDir = path.dirname(sourceFilePath);

  return imports.filter((imp) => {
    if (imp.type !== 'internal') return false;
    if (!imp.resolvedPath) return false;

    // The resolvedPath can point to a file or folder
    // If it's a folder, normalize it for comparison
    let importDir = imp.resolvedPath;

    // If the resolvedPath is a file, take its parent folder
    if (fs.existsSync(imp.resolvedPath)) {
      const stats = fs.statSync(imp.resolvedPath);
      if (stats.isFile()) {
        importDir = path.dirname(imp.resolvedPath);
      }
    }

    // Vérifier que le dossier du fichier importé n'est pas le même que celui du fichier source
    return importDir !== sourceDir;
  });
};

/**
 * Groupe les imports par type de dossier (components, composables, blocks, etc.)
 */
export const groupImportsByFolder = (
  imports: ImportInfo[],
  paths: string[]
): Record<string, ImportInfo[]> => {
  const groups: Record<string, ImportInfo[]> = {};

  paths.forEach((folder) => {
    groups[folder] = [];
  });

  imports.forEach((imp) => {
    if (imp.relativePath) {
      const firstSegment = imp.relativePath.split('/')[0];
      if (firstSegment && paths.includes(firstSegment)) {
        groups[firstSegment]?.push(imp);
      }
    }
  });

  return groups;
};
