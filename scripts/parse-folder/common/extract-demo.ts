import fs from 'fs';
import { join, resolve, basename } from 'path';
import { toKebabCase } from '@assemblerjs/core';
import { convertTemplateToPug } from './convert-template-to-pug';

/**
 * Recherche récursive un fichier .vue du nom de la démo dans le dossier et ses sous-dossiers,
 * et retourne { name, html, pug } ou undefined si non trouvé.
 * @param folderPath Chemin absolu ou relatif du dossier de recherche
 * @param demoName Nom de la démo (sans extension)
 * @returns {{ name: string, html: string, pug: string } | undefined}
 */
const extractDemoCode = (
  folderPath: string,
  demoName: string,
  GlobalPath: string
): { name: string; html: string | undefined; pug: string | undefined } | undefined => {
  const absFolder = folderPath.startsWith('/') ? folderPath : resolve(process.cwd(), folderPath);
  const files = fs.readdirSync(absFolder);
  for (const file of files) {
    const fullPath = join(absFolder, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      const found = extractDemoCode(fullPath, demoName, GlobalPath);
      if (found) return found;
    } else if (stat.isFile() && file.endsWith('.vue') && basename(file, '.vue') === demoName) {
      const vueSource = fs.readFileSync(fullPath, 'utf-8');
      // html = tout le code du fichier, préserve les sauts de ligne et l'indentation
      const searchString = `~~/${GlobalPath}components`;
      let html = vueSource.replace(searchString, '@/components/ui');
      // console.log(html);
      // pug = tout le fichier mais avec le template converti en pug, préserve aussi les sauts de ligne
      const templateMatch = vueSource.match(/<template[^>]*>([\s\S]*?)<\/template>/i);
      const templateContent = templateMatch && templateMatch[1] ? templateMatch[1] : '';
      const pug = templateContent
        ? convertTemplateToPug(vueSource, templateContent).replace(searchString, '@/components/ui')
        : undefined;
      return { name: toKebabCase(demoName), html, pug };
    }
  }
  return undefined;
};

export const extractDemo = (
  absDir: string,
  allItems: any[],
  config: Record<string, any>
): any[] => {
  const GlobalPath = config.globalPath || 'registry/new-york/';

  const rawDemos = allItems
    .filter((f: any) => f.demo)
    .flatMap((f: any) => {
      if (Array.isArray(f.demo)) return f.demo;
      return [f.demo];
    });

  const demo: any[] = [];
  for (const entry of rawDemos) {
    if (typeof entry === 'string') {
      const demoObj = extractDemoCode(absDir, entry, GlobalPath);
      demo.push({
        name: toKebabCase(entry),
        definition: undefined,
        html: demoObj ? demoObj.html : undefined,
        pug: demoObj ? demoObj.pug : undefined,
      });
    } else if (Array.isArray(entry)) {
      for (const sub of entry) {
        if (typeof sub === 'string') {
          const demoObj = extractDemoCode(absDir, sub, GlobalPath);
          demo.push({
            name: toKebabCase(sub),
            definition: undefined,
            html: demoObj ? demoObj.html : undefined,
            pug: demoObj ? demoObj.pug : undefined,
          });
        } else if (typeof sub === 'object' && sub !== null) {
          const demoObj = extractDemoCode(absDir, sub.name, GlobalPath);
          demo.push({
            name: toKebabCase(sub.name),
            definition: sub.definition,
            html: demoObj ? demoObj.html : undefined,
            pug: demoObj ? demoObj.pug : undefined,
          });
        }
      }
    } else if (typeof entry === 'object' && entry !== null) {
      const demoObj = extractDemoCode(absDir, entry.name, GlobalPath);
      demo.push({
        name: toKebabCase(entry.name),
        definition: entry.definition,
        html: demoObj ? demoObj.html : undefined,
        pug: demoObj ? demoObj.pug : undefined,
      });
    }
  }
  return demo;
};
