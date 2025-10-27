import type { Registry, RegistryFiles } from '../registry/schema';
import { readdir, readFile } from 'node:fs/promises';
import { join, resolve } from 'pathe';
import { compileScript, parse } from 'vue/compiler-sfc';

// Dépendances communes des composants
const DEPENDENCIES = new Map<string, string[]>([
  ['@nuxt/ui', []],
  ['@vueuse/core', []],
  ['clsx', []],
  ['tailwind-merge', []],
  ['vue-sonner', []],
  ['embla-carousel-vue', []],
  ['@tanstack/vue-table', []],
  ['motion-v', []],
  ['three', ['@types/three']],
  ['canvas-confetti', ['@types/canvas-confetti']],
  ['gsap', []],
  ['lucide-vue-next', []],
]);

// Dépendances entre composants Assembler UI
const COMPONENT_DEPENDENCIES = new Map<string, string[]>([
  // Exemple: ['complex-component', ['button', 'card']]
]);

const REGISTRY_URL = process.env.REGISTRY_URL ?? 'https://assembler-ui.com/r';
const REGISTRY_DEPENDENCY = '@/';

type ArrayItem<T> = T extends Array<infer X> ? X : never;
type RegistryItem = ArrayItem<Registry>;

export async function buildRegistry() {
  const registryRootPath = resolve('components', 'assembler');
  const registry: Registry = [];

  const uiPath = resolve(registryRootPath, 'ui');
  const blocksPath = resolve(registryRootPath, 'blocks');
  const composablesPath = resolve('composables');

  const [ui, block, hooks] = await Promise.all([
    crawlUI(uiPath),
    crawlBlock(blocksPath),
    crawlHook(composablesPath),
  ]);

  registry.push(...ui, ...block, ...hooks);

  return registry;
}

async function crawlUI(rootPath: string) {
  const dir = await readdir(rootPath, { recursive: true, withFileTypes: true });

  const uiRegistry: Registry = [];

  for (const dirent of dir) {
    if (!dirent.isDirectory()) continue;

    const componentPath = resolve(rootPath, dirent.name);
    const ui = await buildUIRegistry(componentPath, dirent.name);
    uiRegistry.push(ui);
  }

  return uiRegistry;
}

async function crawlBlock(rootPath: string) {
  const type = 'registry:block' as const;

  const dir = await readdir(rootPath, { withFileTypes: true });

  const registry: Registry = [];

  for (const dirent of dir) {
    if (!dirent.isFile()) {
      const result = await buildBlockRegistry(`${rootPath}/${dirent.name}`, dirent.name);

      if (result.files && result.files.length) {
        registry.push(result);
      }
      continue;
    }
    if (!dirent.name.endsWith('.vue') || !dirent.isFile()) continue;

    const [name] = dirent.name.split('.vue');

    const filepath = join(rootPath, dirent.name);
    const source = await readFile(filepath, { encoding: 'utf8' });
    const relativePath = join('blocks', dirent.name);

    const target = 'pages/index.vue';

    const file = {
      name: dirent.name,
      content: source,
      path: relativePath,
      target,
      type,
    };
    const { dependencies, registryDependencies } = await getFileDependencies(filepath, source);

    registry.push({
      name,
      type,
      files: [file],
      registryDependencies: Array.from(registryDependencies),
      dependencies: Array.from(dependencies),
    });
  }

  return registry;
}

async function crawlHook(rootPath: string) {
  const type = 'registry:hook' as const;
  const registry: Registry = [];

  const dir = await readdir(rootPath, { withFileTypes: true });

  for (const dirent of dir) {
    if (!dirent.isFile() || !dirent.name.endsWith('.ts')) continue;

    const [name] = dirent.name.split('.ts');
    const filepath = join(rootPath, dirent.name);
    const source = await readFile(filepath, { encoding: 'utf8' });
    const relativePath = join('composables', dirent.name);

    const file = {
      name: dirent.name,
      content: source,
      path: relativePath,
      type,
      target: '',
    };

    const { dependencies, registryDependencies } = await getFileDependencies(filepath, source);

    registry.push({
      name,
      type,
      files: [file],
      registryDependencies: Array.from(registryDependencies),
      dependencies: Array.from(dependencies),
    });
  }

  return registry;
}

async function buildUIRegistry(componentPath: string, componentName: string) {
  const dir = await readdir(componentPath, {
    withFileTypes: true,
  });

  const files: RegistryFiles[] = [];
  const dependencies = new Set<string>();
  const registryDependencies = new Set<string>();
  const type = 'registry:ui';

  for (const dirent of dir) {
    if (!dirent.isFile()) continue;

    const filepath = join(componentPath, dirent.name);
    const relativePath = join('ui', componentName, dirent.name);
    const source = await readFile(filepath, { encoding: 'utf8' });
    const target = '';

    files.push({ content: source, path: relativePath, type, target });

    // Récupérer les dépendances seulement des fichiers .vue et .ts
    if (!dirent.name.endsWith('.vue') && !dirent.name.endsWith('.ts')) continue;

    const deps = await getFileDependencies(filepath, source);
    if (!deps) continue;

    deps.dependencies.forEach(dep => dependencies.add(dep));
    deps.registryDependencies.forEach(dep => registryDependencies.add(dep));
  }

  // Ajouter les dépendances de composants si elles existent
  const componentDeps = COMPONENT_DEPENDENCIES.get(componentName);
  if (componentDeps) {
    componentDeps.forEach(dep => {
      registryDependencies.add(`${REGISTRY_URL}/${dep}.json`);
    });
  }

  return {
    name: componentName,
    type,
    files,
    registryDependencies: Array.from(registryDependencies),
    dependencies: Array.from(dependencies),
  } satisfies RegistryItem;
}

async function buildBlockRegistry(blockPath: string, blockName: string) {
  const dir = await readdir(blockPath, {
    withFileTypes: true,
    recursive: true,
  });

  const files: RegistryFiles[] = [];
  const dependencies = new Set<string>();
  const registryDependencies = new Set<string>();

  for (const dirent of dir) {
    if (!dirent.isFile()) continue;

    const filepath = join(blockPath, dirent.name);
    const relativePath = join('blocks', blockName, dirent.name);
    const source = await readFile(filepath, { encoding: 'utf8' });

    files.push({
      content: source,
      path: relativePath,
      type: 'registry:component',
      target: '',
    });

    const deps = await getFileDependencies(filepath, source);
    if (!deps) continue;

    deps.dependencies.forEach(dep => dependencies.add(dep));
    deps.registryDependencies.forEach(dep => registryDependencies.add(dep));
  }

  return {
    type: 'registry:block',
    files,
    name: blockName,
    registryDependencies: Array.from(registryDependencies),
    dependencies: Array.from(dependencies),
  } satisfies RegistryItem;
}

async function getFileDependencies(filename: string, sourceCode: string) {
  const registryDependencies = new Set<string>();
  const dependencies = new Set<string>();

  function populateDeps(source: string) {
    const peerDeps = DEPENDENCIES.get(source);
    if (peerDeps !== undefined) {
      dependencies.add(source);
      peerDeps.forEach(dep => dependencies.add(dep));
    }

    if (source.startsWith(REGISTRY_DEPENDENCY) && !source.endsWith('.vue')) {
      const component = source.split('/').at(-1)!;
      const jsonPath = component === 'utils' ? component : `${REGISTRY_URL}/${component}.json`;
      registryDependencies.add(jsonPath);
    }
  }

  if (filename.endsWith('.ts')) {
    // Parsing simple pour TypeScript via regex
    const importRegex = /import\s+.*?\s+from\s+['"`]([^'"`]+)['"`]/g;
    let match;
    while ((match = importRegex.exec(sourceCode)) !== null) {
      populateDeps(match[1]);
    }
  } else {
    try {
      const parsed = parse(sourceCode, { filename });
      if (parsed.descriptor.script?.content || parsed.descriptor.scriptSetup?.content) {
        const compiled = compileScript(parsed.descriptor, { id: '' });

        Object.values(compiled.imports!).forEach(value => {
          populateDeps(value.source);
        });
      }
    } catch (error) {
      // Si le parsing échoue, on ignore les dépendances
      console.warn(`Failed to parse Vue SFC ${filename}:`, error);
    }
  }

  return { registryDependencies, dependencies };
}
