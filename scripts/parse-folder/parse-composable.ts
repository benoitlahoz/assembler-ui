import fs from 'fs';
import pathModule from 'path';
import { extractDescriptionAndTags } from './common/extract-description-and-tags';
import { extractParams } from './composables/params';
import { extractReturns } from './composables/returns';
import { extractComposableTypes } from './composables/types';

/**
 * Parse a TypeScript composable file
 * @param filePath - Path to the composable .ts file
 * @param config - Configuration object
 * @returns Parsed composable information
 */
export const extractComposable = (filePath: string, config: Record<string, any>) => {
  const GlobalPath = config.globalPath || 'registry/new-york/';

  const absPath = filePath.startsWith('/') ? filePath : `${process.cwd()}/${filePath}`;

  // Chemin relatif à config.globalPath et toujours préfixé par config.globalPath
  let relPath = absPath.includes(config.globalPath)
    ? pathModule.relative(config.globalPath, absPath)
    : filePath;
  // Toujours préfixer par config.globalPath (et éviter les doubles slashs)
  relPath = pathModule.join(config.globalPath, relPath).replace(/\\/g, '/');

  const content = fs.readFileSync(absPath, 'utf-8');

  // Extract description and tags from top comment
  const descAndTags = extractDescriptionAndTags(content);
  const description = descAndTags.description;
  const tags = descAndTags.tags;

  // Extract parameters
  const params = extractParams(content, absPath);

  // Extract return type
  const returns = extractReturns(content, absPath);

  // Extract types
  const types = extractComposableTypes(content, absPath);

  return {
    path: relPath,
    description,
    tags,
    params,
    returns,
    types,
    source: content,
  };
};
