/**
 * Convertit un nom kebab-case en camelCase
 * Exemple: 'use-screen-share' => 'useScreenShare'
 */
function kebabToCamel(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Trie les fichiers pour placer en premier celui dont le nom (sans extension)
 * correspond au nom du composable/dossier en camelCase.
 *
 * @param files Tableau de fichiers avec leur path et name
 * @param folderName Nom du dossier (kebab-case, ex: 'use-screen-share')
 * @returns Le tableau trié avec le fichier principal en premier
 */
export function sortFilesByMain<T extends { path: string; name: string }>(
  files: T[],
  folderName: string
): T[] {
  // Convertit le nom du dossier en camelCase
  const mainFileName = kebabToCamel(folderName);

  // Sépare le fichier principal des autres
  const mainFile = files.find((file) => {
    const basename = file.path.split('/').pop() || '';
    const nameWithoutExt = basename.replace(/\.(ts|js|vue)$/, '');
    return nameWithoutExt === mainFileName;
  });

  const otherFiles = files.filter((file) => {
    const basename = file.path.split('/').pop() || '';
    const nameWithoutExt = basename.replace(/\.(ts|js|vue)$/, '');
    return nameWithoutExt !== mainFileName;
  });

  // Retourne le fichier principal en premier, suivi des autres
  return mainFile ? [mainFile, ...otherFiles] : files;
}

/**
 * Trie les codes pour placer en premier celui dont le nom (sans extension)
 * correspond au nom du composable/dossier en camelCase.
 *
 * @param codes Tableau de codes avec leur filename et name
 * @param folderName Nom du dossier (kebab-case, ex: 'use-screen-share')
 * @returns Le tableau trié avec le fichier principal en premier
 */
export function sortCodesByMain<T extends { filename: string; name: string }>(
  codes: (T | null)[],
  folderName: string
): (T | null)[] {
  // Filtre les valeurs null
  const validCodes = codes.filter((code): code is T => code !== null);

  // Convertit le nom du dossier en camelCase
  const mainFileName = kebabToCamel(folderName);

  // Sépare le fichier principal des autres
  const mainFile = validCodes.find((code) => {
    const nameWithoutExt = code.filename.replace(/\.(ts|js|vue)$/, '');
    return nameWithoutExt === mainFileName;
  });

  const otherFiles = validCodes.filter((code) => {
    const nameWithoutExt = code.filename.replace(/\.(ts|js|vue)$/, '');
    return nameWithoutExt !== mainFileName;
  });

  // Retourne le fichier principal en premier, suivi des autres
  return mainFile ? [mainFile, ...otherFiles] : validCodes;
}
