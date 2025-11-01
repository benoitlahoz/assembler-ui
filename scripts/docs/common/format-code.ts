import prettier from 'prettier';

/**
 * Formatte un SFC Vue avec template Pug :
 * - extrait le template pug
 * - le formate avec Prettier Pug
 * - ajoute les sauts de ligne entre blocs racines
 * - recompose le SFC avec les blocs <script> et <style> d'origine
 */
export async function formatVueSfcWithPug(code: string): Promise<string> {
  // Extraction des blocs
  const scriptMatch = code.match(/<script[\s\S]*?<\/script>/gi);
  const templateMatch = code.match(/<template[^>]*lang=["']pug["'][^>]*>([\s\S]*?)<\/template>/i);
  const styleMatch = code.match(/<style[\s\S]*?<\/style>/gi);

  // Formatage du bloc template
  let formattedTemplate = '';
  if (templateMatch) {
    const templatePug = templateMatch[1] || '';
    formattedTemplate = '<template lang="pug">\n' +
      templatePug
        .split('\n')
        .map((line) => {
          // Remplace les tabulations par 2 espaces
          let l = line.replace(/\t/g, '  ');
          // Remplace chaque groupe de 4 espaces par 2 espaces (pour normaliser)
          l = l.replace(/ {4}/g, '  ');
          // Supprime les espaces en fin de ligne
          l = l.replace(/[ \t]+$/g, '');
          return l;
        })
        .join('\n') +
      '\n</template>';
  }

  // Formatage du bloc script
  let formattedScript = '';
  if (scriptMatch && scriptMatch.length > 0) {
    formattedScript = scriptMatch.join('\n');
  }

  // Formatage du bloc style
  let formattedStyle = '';
  if (styleMatch && styleMatch.length > 0) {
    formattedStyle = styleMatch.join('\n');
  }

  // Réassemblage avec saut de ligne entre chaque bloc existant
  let result = '';
  if (formattedScript) {
    result += formattedScript.trim() + '\n\n';
  }
  if (formattedTemplate) {
    result += formattedTemplate.trim() + '\n\n';
  }
  if (formattedStyle) {
    result += formattedStyle.trim() + '\n';
  }
  return result;
}

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
    return await prettier.format(code, { parser });
  } catch (e) {
    return code; // Si erreur, retourne le code brut
  }
}
