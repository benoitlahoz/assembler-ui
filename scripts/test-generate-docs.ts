import fs from 'fs';
import path from 'path';
import ejs from 'ejs';
import { decode } from 'entities';
import { stripComments } from './docs/common/strip-comments';
import { formatCode } from './docs/common/format-code';
import { escapeMarkdownTableCell } from './docs/common/escape-markdown';
import { normalizeLineBreaks } from './docs/common/normalize-line-breaks';
import { sortFilesByMain, sortCodesByMain } from './docs/common/sort-files-by-main';

import config from '../assembler-ui.config';

/**
 * Script de test pour générer des documentations MDC à partir des assemblerjs-test.json enrichis
 *
 * Différences avec generate-docs.ts :
 * 1. Utilise assemblerjs-test.json au lieu de assemblerjs.json
 * 2. Utilise les templates de tests/ qui incluent les dépendances dans le code-tree
 * 3. Génère dans les dossiers content/ avec le suffixe -test.md
 *
 * Usage:
 *   yarn tsx scripts/test-generate-docs.ts
 */

const GlobalComponentsPath = config.globalPath || 'registry/new-york/';
const DescriptionFilename = 'assemblerjs-test.json'; // Utilise les fichiers de test
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
  dependencies?: {
    dependsOn: Array<{ path: string; name: string }>;
    usedBy: string[];
  };
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
  // Utilise le mapping de la configuration si disponible, sinon 'miscellaneous'
  const typeMapping = config.typeMapping as Record<string, string> | undefined;
  const base = typeMapping?.[normalizedType] || 'miscellaneous';
  // Génère dans les dossiers content/ usuels
  if (category && base !== 'miscellaneous') {
    return path.resolve(process.cwd(), `content/${base}/${category}`);
  }
  return path.resolve(process.cwd(), `content/${base}`);
}

export async function generateTestDocs(): Promise<void> {
  console.log('🧪 Test de génération de documentation MDC avec dépendances\n');
  console.log('='.repeat(80));

  const baseDir = path.resolve(process.cwd(), GlobalComponentsPath);
  const componentTemplatePath = path.resolve(
    process.cwd(),
    'scripts/docs/templates/tests/component-layout.mdc.ejs'
  );
  const composableTemplatePath = path.resolve(
    process.cwd(),
    'scripts/docs/templates/tests/composable-layout.mdc.ejs'
  );
  const assemblerJsons = findAssemblerJsons(baseDir);

  console.log(`\n📄 ${assemblerJsons.length} fichier(s) assemblerjs-test.json trouvé(s)\n`);

  const errors: { dir: string; error: any }[] = [];
  let total = 0;
  let withDependencies = 0;

  for (const assemblerPath of assemblerJsons) {
    total++;
    const assembler: AssemblerDoc = JSON.parse(fs.readFileSync(assemblerPath, 'utf-8'));

    console.log(`📝 Traitement: ${assembler.name}`);

    try {
      const allFiles: FileEntry[] = getFilesFromAssembler(assemblerPath);
      const normalizedType = (assembler.type || '').split(':').pop() || '';
      let files: FileEntry[] = allFiles;

      if (normalizedType === 'ui' || normalizedType === 'component') {
        files = allFiles.filter((f) => f.path.endsWith('.vue'));
      } else if (normalizedType === 'hook') {
        files = allFiles.filter((f) => f.path.endsWith('.ts') && !f.path.endsWith('.d.ts'));
        files = sortFilesByMain(files, assembler.name);
      }

      const codes = (
        await Promise.all(
          allFiles.map(async (file) => {
            let code = '';
            let lang = '';
            let filename = path.basename(file.path);

            if (file.doc && file.doc.source) {
              if (typeof file.doc.source === 'object') {
                if (file.doc.source.html) {
                  code = file.doc.source.html;
                } else {
                  const docKeys = ['description', 'tags', 'author', 'category', 'title', 'name'];
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

      let sortedCodes = codes;
      if (normalizedType === 'hook') {
        sortedCodes = sortCodesByMain(codes, assembler.name);
      }

      let codeBasePath = `src/components/ui/${assembler.name}`;
      if (normalizedType === 'block') codeBasePath = `src/components/blocks/${assembler.name}`;
      else if (normalizedType === 'hook') codeBasePath = `src/composables/${assembler.name}`;
      else if (normalizedType === 'component') codeBasePath = `src/components/ui/${assembler.name}`;

      let codeTreeDefaultValue = '';
      if (sortedCodes.length > 0 && sortedCodes[0] && sortedCodes[0].filename) {
        codeTreeDefaultValue = `${codeBasePath}/${sortedCodes[0].filename}`;
      }

      // AJOUT: Charger les codes des dépendances
      let dependencyCodes: any[] = [];
      if (assembler.dependencies && assembler.dependencies.dependsOn.length > 0) {
        for (const dep of assembler.dependencies.dependsOn) {
          // Charger le fichier assemblerjs-test.json de la dépendance
          const depPath = path.resolve(process.cwd(), GlobalComponentsPath, dep.path);
          const depAssemblerPath = path.join(depPath, DescriptionFilename);

          if (fs.existsSync(depAssemblerPath)) {
            const depAssembler = JSON.parse(fs.readFileSync(depAssemblerPath, 'utf-8'));
            const depFiles = getFilesFromAssembler(depAssemblerPath);
            const depNormalizedType = (depAssembler.type || '').split(':').pop() || '';

            // Déterminer le basePath de la dépendance
            let depBasePath = `src/components/ui/${dep.name}`;
            if (depNormalizedType === 'block') depBasePath = `src/components/blocks/${dep.name}`;
            else if (depNormalizedType === 'hook') depBasePath = `src/composables/${dep.name}`;
            else if (depNormalizedType === 'component')
              depBasePath = `src/components/ui/${dep.name}`;

            // Charger les codes de la dépendance
            const depCodesRaw = await Promise.all(
              depFiles.map(async (file) => {
                let code = '';
                let lang = '';
                let filename = path.basename(file.path);

                if (file.doc && file.doc.source) {
                  if (typeof file.doc.source === 'object') {
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

                code = decode(code);
                code = stripComments(code);
                code = await formatCode(code, filename);

                return {
                  code,
                  lang,
                  filename,
                  basePath: depBasePath,
                };
              })
            );

            dependencyCodes.push(...depCodesRaw.filter(Boolean));
          }
        }
      }

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

      const templateData: {
        assembler: AssemblerDoc;
        title: string;
        description: string;
        install: Record<string, string>;
        files: FileEntry[];
        codes: any[];
        codeBasePath: string;
        codeTreeDefaultValue: string;
        installPaths: Record<string, string>;
        dependencies: { dependsOn: Array<{ path: string; name: string }>; usedBy: string[] };
        dependencyCodes: any[];
        demo?: any;
        escapePipe?: (text: string) => string;
      } = {
        assembler,
        title: assembler.title || assembler.name || '',
        description: assembler.description || '',
        install: installPaths ?? {},
        files,
        codes: sortedCodes,
        codeBasePath,
        codeTreeDefaultValue,
        installPaths: installPaths ?? {},
        dependencies: assembler.dependencies || { dependsOn: [], usedBy: [] },
        dependencyCodes,
        escapePipe: escapeMarkdownTableCell,
      }; // Compter les composants avec dépendances
      if (assembler.dependencies) {
        const hasDepends = assembler.dependencies.dependsOn.length > 0;
        const hasUsedBy = assembler.dependencies.usedBy.length > 0;
        if (hasDepends || hasUsedBy) {
          withDependencies++;
          console.log(
            `   📦 Dépendances: ${assembler.dependencies.dependsOn.length} | Utilisé par: ${assembler.dependencies.usedBy.length}`
          );
        }
      }

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

      const templatePath =
        normalizedType === 'hook' ? composableTemplatePath : componentTemplatePath;
      const template = fs.readFileSync(templatePath, 'utf-8');
      const rendered = ejs.render(template, templateData, { filename: templatePath });

      const normalizedRendered = normalizeLineBreaks(rendered);

      const type = assembler.type || 'ui';
      const category = assembler.category;
      const outputDir = getOutputDir(type, category);
      if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
      const docFile = path.join(outputDir, `${assembler.name}-test.md`);
      fs.writeFileSync(docFile, normalizedRendered, 'utf-8');

      console.log(`   ✅ Documentation générée: ${path.relative(process.cwd(), docFile)}`);
    } catch (error) {
      console.error(`   ❌ Erreur: ${error}`);
      errors.push({ dir: assembler.name, error });
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('\n📊 Résumé de la génération:\n');
  const successful = total - errors.length;

  console.log(`✅ Succès: ${successful}/${total}`);
  console.log(`📦 Avec dépendances: ${withDependencies}`);
  console.log(`❌ Échecs: ${errors.length}`);

  if (errors.length > 0) {
    console.log('\nDocs en échec:');
    errors.forEach((r) => {
      console.log(`   - ${r.dir}: ${r.error}`);
    });
  }

  console.log('\n✨ Génération de documentation terminée!\n');
}

// Exécution directe si appelé en CLI
if (require.main === module) {
  generateTestDocs();
}
