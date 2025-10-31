import prettier from 'prettier';

/**
 * Formatte du code source avec Prettier selon l'extension du fichier.
 * @param code Le code à formater
 * @param filename Le nom du fichier (pour détecter le parser)
 */
export async function formatCode(code: string, filename: string): Promise<string> {
  if (!code) return '';
  let parser: prettier.BuiltInParserName = 'babel';
  if (filename.endsWith('.vue')) parser = 'vue';
  else if (filename.endsWith('.ts')) parser = 'typescript';
  else if (filename.endsWith('.json')) parser = 'json';
  else if (filename.endsWith('.css')) parser = 'css';
  else if (filename.endsWith('.scss')) parser = 'scss';
  else if (filename.endsWith('.md')) parser = 'markdown';
  else if (filename.endsWith('.html')) parser = 'html';
  try {
    return prettier.format(code, { parser });
  } catch (e) {
    return code; // Si erreur, retourne le code brut
  }
}
