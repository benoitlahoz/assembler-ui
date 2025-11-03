import fs from 'fs';
import path from 'path';
import ejs from 'ejs';
import { decode } from 'entities';
import { stripComments } from './docs/common/strip-comments';
import { formatCode } from './docs/common/format-code';
import { escapeMarkdownTableCell } from './docs/common/escape-markdown';
import {
  runWithSpinner,
  displayGenerationSummary,
  showRemainingSpinner,
} from './utils/terminal-display';

import config from '../assembler-ui.config';

const GlobalComponentsPath = config.globalPath || 'registry/new-york/';
const DescriptionFilename = config.definitionFile || 'assemblerjs.json';
const InstallPaths = config.install || {
  pnpm: 'pnpm dlx shadcn-vue@latest add',
  npm: 'npx shadcn-vue@latest add',
  yarn: 'npx shadcn-vue@latest add',
  bun: 'bunx --bun shadcn-vue@latest add',
};

type AssemblerDoc = {
  install?: string;
  name: string;
  title?: string;
  description?: string;
  author?: string;
  [key: string]: any;
};

type FileEntry = {
  path: string;
  name: string;
  title?: string;
  doc: {
    source?: string | Record<string, any>;
    [key: string]: any;
  };
};

function findAssemblerJsons(dir: string): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(findAssemblerJsons(filePath));
    } else if (file === DescriptionFilename) {
      results.push(filePath);
    }
  }
  return results;
}

function getFilesFromAssembler(assemblerPath: string): FileEntry[] {
  const assembler = JSON.parse(fs.readFileSync(assemblerPath, 'utf-8'));
  if (!Array.isArray(assembler.files)) return [];
  return assembler.files.map((file: any) => ({
    ...file,
    doc: file.doc || {},
  }));
}

function getOutputDir(type: string, category?: string): string {
  // Normalise le type (ex: 'registry:ui' => 'ui')
  const normalizedType = (type || '').split(':').pop() || '';
  let base = 'misc';
  if (normalizedType === 'ui') base = 'components';
  else if (normalizedType === 'hook') base = 'composables';
  else if (normalizedType === 'block') base = 'blocks';
  // Ajoute la catégorie si présente
  if (category && base !== 'misc') {
    return path.resolve(process.cwd(), `content/${base}/${category}`);
  }
  return path.resolve(process.cwd(), `content/${base}`);
}

export async function generateDocs(): Promise<void> {
  const baseDir = path.resolve(process.cwd(), GlobalComponentsPath);
  const templatePath = path.resolve(
    process.cwd(),
    'scripts/docs/templates/component-layout.mdc.ejs'
  );
  const assemblerJsons = findAssemblerJsons(baseDir);

  const errors: { dir: string; error: any }[] = [];
  let total = 0;
  let remaining = assemblerJsons.length;

  for (const assemblerPath of assemblerJsons) {
    total++;
    const assembler: AssemblerDoc = JSON.parse(fs.readFileSync(assemblerPath, 'utf-8'));

    try {
      await runWithSpinner({
        message: `Generating doc for '${assembler.name}'`,
        action: async () => {
          const allFiles: FileEntry[] = getFilesFromAssembler(assemblerPath);
          // On ne garde que les .vue pour la doc détaillée si registry:ui ou registry:hook
          const normalizedType = (assembler.type || '').split(':').pop() || '';
          let files: FileEntry[] = allFiles;
          if (normalizedType === 'ui' || normalizedType === 'hook') {
            files = allFiles.filter((f) => f.path.endsWith('.vue'));
          }

          // Pour le code-tree, on prend tous les fichiers (vue ou non)
          const codes = (
            await Promise.all(
              allFiles.map(async (file) => {
                let code = '';
                let lang = '';
                let filename = path.basename(file.path);
                // On prend le code brut, sans entités, pour tous les fichiers connus
                if (file.doc && file.doc.source) {
                  if (typeof file.doc.source === 'object') {
                    // On privilégie .html, sinon on prend la première string longue ou multi-ligne
                    if (file.doc.source.html) {
                      code = file.doc.source.html;
                    } else {
                      const docKeys = [
                        'description',
                        'tags',
                        'author',
                        'category',
                        'title',
                        'name',
                      ];
                      const firstString = Object.entries(file.doc.source)
                        .filter(
                          ([k, v]) =>
                            typeof v === 'string' &&
                            !docKeys.includes(k) &&
                            (v.includes('\n') ||
                              v.length > 40 ||
                              ['vue', 'js', 'ts', 'json', 'html', 'css', 'scss', 'md'].includes(k))
                        )
                        .map(([k, v]) => v)[0];
                      if (firstString) code = firstString;
                    }
                  } else if (typeof file.doc.source === 'string') {
                    code = file.doc.source;
                  }
                }
                const ext = (file.path.split('.').pop() ?? '').toLowerCase();
                if (ext === 'vue') lang = 'vue';
                else if (ext === 'js') lang = 'js';
                else if (ext === 'ts') lang = 'ts';
                else if (ext === 'json') lang = 'json';
                else lang = ext;
                const validExts = ['vue', 'js', 'ts', 'json', 'html', 'css', 'scss', 'md', 'd.ts'];
                if (!validExts.some((e) => filename.endsWith(e))) return null;
                if (!code || !code.trim()) return null;

                // Décodage complet (entities) puis suppression des commentaires puis formatage
                code = decode(code);
                code = stripComments(code);
                code = await formatCode(code, filename);

                return {
                  name: file.name,
                  title: file.title || file.name,
                  code,
                  lang,
                  filename,
                };
              })
            )
          ).filter(Boolean);

          // Détermine le chemin de base pour le code-tree selon le type et le nom de l'item
          let codeBasePath = `src/components/ui/${assembler.name}`;
          if (normalizedType === 'block') codeBasePath = `src/components/blocks/${assembler.name}`;
          else if (normalizedType === 'hook') codeBasePath = `src/composables/${assembler.name}`;

          // Définit le default-value pour le code-tree (premier fichier du tableau codes)
          let codeTreeDefaultValue = '';
          if (codes.length > 0 && codes[0] && codes[0].filename) {
            codeTreeDefaultValue = `${codeBasePath}/${codes[0].filename}`;
          }
          // Lecture du champ install (toujours une string) et création d'un objet des chemins
          // Crée les commandes d'installation finales à partir des templates InstallPaths et assembler.install
          let installPaths: Record<string, string>;
          if (assembler.install && typeof assembler.install === 'string') {
            installPaths = {
              pnpm: `${InstallPaths.pnpm} "${assembler.install}"`.trim(),
              npm: `${InstallPaths.npm} "${assembler.install}"`.trim(),
              yarn: `${InstallPaths.yarn} "${assembler.install}"`.trim(),
              bun: `${InstallPaths.bun} "${assembler.install}"`.trim(),
            };
          } else {
            installPaths = InstallPaths;
          }
          const templateData: Record<string, any> = {
            install: installPaths,
            name: assembler.name,
            title: assembler.title || assembler.name,
            description: assembler.description || '',
            author: assembler.author || '',
            files,
            codes,
            codeBasePath,
            codeTreeDefaultValue,
            // Helper function for escaping pipes in markdown tables
            escapePipe: escapeMarkdownTableCell,
          };
          // Si demo existe et est un array non vide, formater chaque entrée comme pour le code-tree et passer à templateData.demo
          if (Array.isArray(assembler.demo) && assembler.demo.length > 0) {
            const formattedDemo = await Promise.all(
              assembler.demo.map(async (demo) => {
                let html = demo.html || '';
                let pug = demo.pug || '';
                const vueFilename = (demo.name || 'demo') + '.vue';
                const pugFilename = (demo.name || 'demo') + '.vue';

                if (html) {
                  html = decode(html);
                  html = stripComments(html);
                  html = await formatCode(html, vueFilename);
                }
                if (pug) {
                  pug = decode(pug);
                  pug = stripComments(pug);
                  pug = await formatCode(pug, pugFilename);
                }
                return {
                  ...demo,
                  html,
                  pug,
                };
              })
            );
            templateData.demo = formattedDemo;
          }

          const template = fs.readFileSync(templatePath, 'utf-8');
          const rendered = ejs.render(template, templateData, { filename: templatePath });

          // Déterminer le dossier de sortie selon le type et la catégorie
          const type = assembler.type || 'ui';
          const category = assembler.category;
          const outputDir = getOutputDir(type, category);
          if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
          const docFile = path.join(outputDir, `${assembler.name}.md`);
          fs.writeFileSync(docFile, rendered, 'utf-8');

          return { name: assembler.name, type: normalizedType };
        },
        successMessage: (res) => `Doc generated for '${res?.name}' (type: ${res?.type}).`,
        failMessage: `Error while generating doc for '${assembler.name}'`,
      });
    } catch (error) {
      errors.push({ dir: assembler.name, error });
    }

    remaining--;
    showRemainingSpinner(remaining);
  }

  displayGenerationSummary(total, errors, {
    successMessage: `✔ {count} doc(s) generated successfully.`,
  });
  console.log('');
}

// Exécution directe si appelé en CLI
if (require.main === module) {
  generateDocs();
}
