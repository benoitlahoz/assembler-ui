import type { z } from 'zod';
import type { Registry, registryItemTypeSchema } from '../registry/schema';
import { existsSync, promises as fs } from 'node:fs';
import path from 'node:path';
import { registry } from '../registry';
import { buildRegistry as crawlContent } from './crawl-content';
import { registryEntrySchema, registrySchema } from '../registry/schema';

const REGISTRY_PATH = path.join(process.cwd(), 'public/r');

const REGISTRY_INDEX_WHITELIST: z.infer<typeof registryItemTypeSchema>[] = [
  'registry:ui',
  'registry:block',
  'registry:hook',
];

// Fonction pour construire les styles du registry
async function buildStyles(registry: Registry) {
  const targetPath = path.join(REGISTRY_PATH);

  // Créer le répertoire s'il n'existe pas
  if (!existsSync(targetPath)) {
    await fs.mkdir(targetPath, { recursive: true });
  }

  for (const item of registry) {
    if (!REGISTRY_INDEX_WHITELIST.includes(item.type)) continue;

    let files;
    if (item.files) {
      files = await Promise.all(
        item.files.map(async _file => {
          const file = {
            path: _file.path,
            type: _file.type,
            content: '',
            target: _file.target ?? '',
          };

          let content: string;
          try {
            if (file.type === 'registry:hook') {
              content = await fs.readFile(path.join(process.cwd(), file.path), 'utf8');
            } else {
              content = await fs.readFile(
                path.join(process.cwd(), 'components', 'assembler', file.path),
                'utf8'
              );
            }
          } catch (error) {
            console.error(error);
            return;
          }

          const target = file.target || '';

          return {
            path: file.path,
            type: file.type,
            content,
            target,
          };
        })
      );
    }

    const payload = registryEntrySchema
      .omit({
        category: true,
        subcategory: true,
      })
      .safeParse({
        ...item,
        files,
      });

    if (payload.success) {
      await writeFile(
        path.join(targetPath, `${item.name}.json`),
        JSON.stringify(payload.data, null, 2)
      );
    }
  }
}

try {
  // Vérifier si le répertoire public/r existe, sinon le créer
  if (!existsSync(REGISTRY_PATH)) {
    await fs.mkdir(REGISTRY_PATH, { recursive: true });
  }

  const content = await crawlContent();

  const result = registrySchema.safeParse([...registry, ...content]);

  if (!result.success) {
    console.error(result.error);
    process.exit(1);
  }

  await buildStyles(result.data);

  console.log('✅ Registry built successfully!');
} catch (error) {
  console.error(error);
  process.exit(1);
}

async function writeFile(path: string, payload: string) {
  return fs.writeFile(path, `${payload}\r\n`, 'utf8');
}
