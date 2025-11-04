import * as ts from 'typescript';
import path from 'path';
import fs from 'fs';
import { formatAliasesForExtractImports } from './resolve-tsconfig-paths';

/**
 * Interface pour représenter un import détecté
 */
export interface ImportInfo {
  /** Nom du module importé (ex: 'useMediaDevices') */
  name: string;
  /** Chemin source de l'import tel qu'écrit dans le code */
  importPath: string;
  /** Chemin absolu résolu du fichier importé (si trouvé) */
  resolvedPath?: string;
  /** Chemin relatif depuis globalPath (ex: 'composables/use-media-devices/useMediaDevices.ts') */
  relativePath?: string;
  /** Type d'import détecté */
  type: 'local' | 'internal' | 'external';
  /** Spécificateurs importés (ex: ['useMediaDevices', 'MediaDevicesKey']) */
  specifiers: string[];
}

/**
 * Configuration pour la résolution des chemins
 */
interface ResolveConfig {
  /** Chemin absolu du fichier source */
  sourceFilePath: string;
  /** Chemin global du projet (ex: 'registry/new-york/') */
  globalPath: string;
  /** Dossiers à scanner dans globalPath */
  paths: string[];
  /**
   * Alias de chemins (ex: {'~~': 'registry/new-york', '@': 'app'})
   * Si non fourni, sera automatiquement résolu depuis tsconfig.json
   */
  aliases?: Record<string, string>;
  /** Racine du projet pour la résolution des alias (par défaut: process.cwd()) */
  root?: string;
  /** Chemin vers le tsconfig.json (par défaut: 'tsconfig.json') */
  tsconfigPath?: string;
}

/**
 * Extrait tous les imports d'un fichier TypeScript ou Vue
 * @param content Contenu du fichier
 * @param filePath Chemin absolu du fichier
 * @param config Configuration
 * @returns Liste des imports détectés
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
 * Trouve un fichier en testant différentes extensions
 */
const findFileWithExtensions = (basePath: string): string | undefined => {
  const extensions = ['', '.ts', '.js', '.vue', '.d.ts', '/index.ts', '/index.js', '/index.vue'];

  for (const ext of extensions) {
    const testPath = basePath + ext;
    if (fs.existsSync(testPath)) {
      return testPath;
    }
  }

  return undefined;
};

/**
 * Filtre les imports pour ne garder que ceux qui sont internes (dans globalPath)
 */
export const filterInternalImports = (imports: ImportInfo[]): ImportInfo[] => {
  return imports.filter((imp) => imp.type === 'internal');
};

/**
 * Filtre les imports pour ne garder que ceux qui sont internes ET en dehors du dossier du fichier source
 * @param imports Liste des imports
 * @param sourceFilePath Chemin absolu du fichier source
 * @returns Imports internes externes au dossier du fichier source
 */
export const filterExternalInternalImports = (
  imports: ImportInfo[],
  sourceFilePath: string
): ImportInfo[] => {
  const sourceDir = path.dirname(sourceFilePath);

  return imports.filter((imp) => {
    if (imp.type !== 'internal') return false;
    if (!imp.resolvedPath) return false;

    // Le resolvedPath peut pointer vers un fichier ou un dossier
    // Si c'est un dossier, on le normalise pour la comparaison
    let importDir = imp.resolvedPath;

    // Si le resolvedPath est un fichier, prendre son dossier parent
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
