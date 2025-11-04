import fs from 'fs';
import path from 'path';
import ejs from 'ejs';
import { decode } from 'entities';
import { stripComments } from './docs/common/strip-comments';
import { formatCode } from './docs/common/format-code';
import { escapeMarkdownTableCell } from './docs/common/escape-markdown';
import { normalizeLineBreaks } from './docs/common/normalize-line-breaks';
import { sortFilesByMain, sortCodesByMain } from './docs/common/sort-files-by-main';
import {
  runWithSpinner,
  displayGenerationSummary,
  showRemainingSpinner,
} from './utils/terminal-display';

import config from '../assembler-ui.config';

/**
 * Script to generate MDC documentation from enriched assemblerjs.json files
 *
 * Usage:
 *   yarn tsx scripts/generate-docs.ts
 */

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
  // Normalize the type (e.g., 'registry:ui' => 'ui')
  const normalizedType = (type || '').split(':').pop() || '';
  // Use the type mapping from config if available, otherwise 'miscellaneous'
  const typeMapping = config.typeMapping as Record<string, string> | undefined;
  const base = typeMapping?.[normalizedType] || 'miscellaneous';
  // Generate in the usual content/ folders
  if (category && base !== 'miscellaneous') {
    return path.resolve(process.cwd(), `content/${base}/${category}`);
  }
  return path.resolve(process.cwd(), `content/${base}`);
}

export async function generateDocs(): Promise<void> {
  const baseDir = path.resolve(process.cwd(), GlobalComponentsPath);
  const componentTemplatePath = path.resolve(
    process.cwd(),
    'scripts/docs/templates/component-layout.mdc.ejs'
  );
  const composableTemplatePath = path.resolve(
    process.cwd(),
    'scripts/docs/templates/composable-layout.mdc.ejs'
  );
  const assemblerJsons = findAssemblerJsons(baseDir);

  const errors: { dir: string; error: any }[] = [];
  let total = 0;
  let remaining = assemblerJsons.length;
  let withDependencies = 0;

  for (const assemblerPath of assemblerJsons) {
    total++;
    const assembler: AssemblerDoc = JSON.parse(fs.readFileSync(assemblerPath, 'utf-8'));

    try {
      await runWithSpinner({
        message: `Generating doc for '${assembler.name}'`,
        action: async () => {
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

                // Calculate the filename relative to the composable folder
                // E.g., "registry/new-york/composables/use-media-devices/bar/index.ts"
                // -> search for "use-media-devices/" and take what follows
                let filename = path.basename(file.path);
                const componentFolderName = `${assembler.name}/`;
                const componentFolderIndex = file.path.indexOf(componentFolderName);
                if (componentFolderIndex !== -1) {
                  // Extract the relative path after the composable name
                  filename = file.path.substring(componentFolderIndex + componentFolderName.length);
                }

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
          else if (normalizedType === 'component')
            codeBasePath = `src/components/ui/${assembler.name}`;

          let codeTreeDefaultValue = '';
          if (sortedCodes.length > 0 && sortedCodes[0] && sortedCodes[0].filename) {
            codeTreeDefaultValue = `${codeBasePath}/${sortedCodes[0].filename}`;
          }

          // Load dependency codes
          let dependencyCodes: any[] = [];
          if (assembler.dependencies && assembler.dependencies.dependsOn.length > 0) {
            for (const dep of assembler.dependencies.dependsOn) {
              const depPath = path.resolve(process.cwd(), GlobalComponentsPath, dep.path);
              const depAssemblerPath = path.join(depPath, DescriptionFilename);

              if (fs.existsSync(depAssemblerPath)) {
                const depAssembler = JSON.parse(fs.readFileSync(depAssemblerPath, 'utf-8'));
                const depFiles = getFilesFromAssembler(depAssemblerPath);
                const depNormalizedType = (depAssembler.type || '').split(':').pop() || '';

                let depBasePath = `src/components/ui/${dep.name}`;
                if (depNormalizedType === 'block')
                  depBasePath = `src/components/blocks/${dep.name}`;
                else if (depNormalizedType === 'hook') depBasePath = `src/composables/${dep.name}`;
                else if (depNormalizedType === 'component')
                  depBasePath = `src/components/ui/${dep.name}`;

                const depCodesRaw = await Promise.all(
                  depFiles.map(async (file) => {
                    let code = '';
                    let lang = '';

                    let filename = path.basename(file.path);
                    const depFolderName = `${dep.name}/`;
                    const depFolderIndex = file.path.indexOf(depFolderName);
                    if (depFolderIndex !== -1) {
                      filename = file.path.substring(depFolderIndex + depFolderName.length);
                    }

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
                                  ['vue', 'js', 'ts', 'json', 'html', 'css', 'scss', 'md'].includes(
                                    k
                                  ))
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

                    const validExts = [
                      'vue',
                      'js',
                      'ts',
                      'json',
                      'html',
                      'css',
                      'scss',
                      'md',
                      'd.ts',
                    ];
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
          };

          // Count components with dependencies
          if (assembler.dependencies) {
            const hasDepends = assembler.dependencies.dependsOn.length > 0;
            const hasUsedBy = assembler.dependencies.usedBy.length > 0;
            if (hasDepends || hasUsedBy) {
              withDependencies++;
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
          const docFile = path.join(outputDir, `${assembler.name}.md`);
          fs.writeFileSync(docFile, normalizedRendered, 'utf-8');

          return {
            name: assembler.name,
            type: normalizedType,
            hasDeps:
              assembler.dependencies &&
              (assembler.dependencies.dependsOn.length > 0 ||
                assembler.dependencies.usedBy.length > 0),
          };
        },
        successMessage: (res) =>
          `Doc generated for '${res?.name}' (type: ${res?.type})${res?.hasDeps ? ' with dependencies' : ''}.`,
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

  if (withDependencies > 0) {
    console.log(`📦 ${withDependencies} with dependencies`);
  }
  console.log('');
}

// Direct execution if called as CLI
if (require.main === module) {
  generateDocs();
}
