import path from 'path';
import fs from 'fs';
import { extractTs } from './ts/extract-ts';
import { extractVueSfc } from './parse-vue-sfc';
import { extractVueSfcSetup } from './parse-vue-sfc-setup';

/**
 * Extrait la documentation et les métadonnées d'un fichier TypeScript.
 * @param file Chemin du fichier TypeScript
 * @returns Un objet structuré avec description, author, category, imports, exports, types, source
 */
export const extractFolder = (file: string) => {
  const absPath = file.startsWith('/') ? file : path.resolve(process.cwd(), file);
  const tsSource = fs.readFileSync(absPath, 'utf-8');
  const info = extractTs(absPath);
  return {
    file,
    description: info.description || '',
    author: info.author || '',
    category: info.category || '',
    types: info.types,
    source: tsSource,
  };
};

if (require.main === module) {
  const tsFilePath = 'registry/new-york/components/button-foo/index.ts';
  const tsResult = extractFolder(tsFilePath);

  // Chercher les exports de composants Vue
  const vueExports = [];
  const vueExportRegex = /export\s+\{\s*default\s+as\s+(\w+)\s*\}\s+from\s+['"](.+\.vue)['"]/g;
  const tsSource = tsResult.source;
  let match;
  while ((match = vueExportRegex.exec(tsSource))) {
    vueExports.push({ name: match[1], path: match[2] });
  }

  // Pour chaque composant, détecter le type (setup ou non) et parser
  const vueResults = vueExports.map(({ name, path: vueRelPath }) => {
    if (!vueRelPath) return { name, file: undefined, isSetup: false, doc: undefined };
    const vueAbsPath = vueRelPath.startsWith('/')
      ? vueRelPath
      : path.resolve(path.dirname(tsFilePath), vueRelPath);
    if (!vueAbsPath) return { name, file: undefined, isSetup: false, doc: undefined };
    const vueSource = fs.readFileSync(vueAbsPath, 'utf-8');
    // Heuristique : présence de <script setup>
    const isSetup = /<script\s+setup[\s>]/.test(vueSource);
    const doc = isSetup ? extractVueSfcSetup(vueAbsPath) : extractVueSfc(vueAbsPath);
    return { name, file: vueAbsPath, doc };
  });

  const result = {
    ts: tsResult,
    vue: vueResults,
  };

  fs.writeFileSync('scripts/attempts/ts-comments.json', JSON.stringify(result, null, 2), 'utf-8');
  console.log('TS+Vue comments extraction result written to scripts/attempts/ts/ts-comments.json');
}
