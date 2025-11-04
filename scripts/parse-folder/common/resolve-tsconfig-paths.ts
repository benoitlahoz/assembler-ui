import * as ts from 'typescript';
import path from 'path';
import fs from 'fs';

/**
 * Lit et résout le tsconfig.json avec tous ses extends/imports
 * et extrait les alias de paths
 * @param tsconfigPath - Chemin vers le tsconfig.json (relatif à root)
 * @param root - Racine du projet (par défaut: process.cwd())
 */
export const resolveTsConfigPaths = (
  tsconfigPath: string = 'tsconfig.json',
  root?: string
): Record<string, string> => {
  const projectRoot = root || process.cwd();
  const configPath = path.resolve(projectRoot, tsconfigPath);

  if (!fs.existsSync(configPath)) {
    console.warn(`tsconfig.json non trouvé à: ${configPath}`);
    return {};
  }

  // Lire et parser le tsconfig avec TypeScript (gère les extends automatiquement)
  const configFile = ts.readConfigFile(configPath, ts.sys.readFile);

  if (configFile.error) {
    console.warn('Erreur lors de la lecture du tsconfig.json:', configFile.error.messageText);
    return {};
  }

  // Parser la configuration complète (résout les extends)
  const parsedConfig = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    path.dirname(configPath)
  );

  if (!parsedConfig.options.paths) {
    return {};
  }

  const aliases: Record<string, string> = {};

  // Déterminer le baseUrl correct
  // Si un baseUrl est explicite, l'utiliser, sinon utiliser le répertoire du tsconfig
  let basePath = path.dirname(configPath);

  // Si le tsconfig extend un autre fichier, les paths sont relatifs au fichier étendu
  if (configFile.config.extends) {
    const extendsPath = path.resolve(path.dirname(configPath), configFile.config.extends);
    if (fs.existsSync(extendsPath)) {
      basePath = path.dirname(extendsPath);
    }
  }

  const baseUrl = parsedConfig.options.baseUrl || '.';
  const absoluteBaseUrl = path.resolve(basePath, baseUrl);

  // Convertir les paths TypeScript en alias
  for (const [alias, targets] of Object.entries(parsedConfig.options.paths)) {
    if (!targets || targets.length === 0) continue;

    // Prendre le premier target (généralement il n'y en a qu'un)
    const target = targets[0];
    if (!target) continue;

    // Retirer les wildcards (* ou /*) de l'alias et du target
    const cleanAlias = alias.replace(/\/?\*$/, '');
    const cleanTarget = target.replace(/\/?\*$/, '');

    // Résoudre le chemin absolu
    const absoluteTarget = path.resolve(absoluteBaseUrl, cleanTarget);

    // Normaliser le chemin relatif depuis la racine du projet
    let relativeTarget = path.relative(projectRoot, absoluteTarget);

    // Si le chemin remonte (..), cela signifie qu'il pointe en dehors du root
    if (relativeTarget.startsWith('..')) {
      // Ignorer les alias qui pointent au-dessus du root spécifié
      continue;
    }

    aliases[cleanAlias] = relativeTarget;
  }

  return aliases;
};

/**
 * Convertit les paths TypeScript en format utilisable par extract-imports
 * Ajoute les variantes avec et sans slash final
 * @param tsconfigPath - Chemin vers le tsconfig.json (relatif à root)
 * @param root - Racine du projet (par défaut: process.cwd())
 */
export const formatAliasesForExtractImports = (
  tsconfigPath?: string,
  root?: string
): Record<string, string> => {
  const paths = resolveTsConfigPaths(tsconfigPath, root);
  const formatted: Record<string, string> = {};

  for (const [alias, target] of Object.entries(paths)) {
    // Version sans slash
    formatted[alias] = target;

    // Version avec slash final si l'alias n'en a pas déjà un
    if (!alias.endsWith('/')) {
      formatted[alias + '/'] = target;
    }
  }

  return formatted;
};
