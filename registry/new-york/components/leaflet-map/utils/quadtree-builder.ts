/**
 * Progressive quadtree builder
 * Builds a spatial index from features without blocking the UI
 */

import { Quadtree, type Bounds, type QuadtreeItem } from './quadtree';

export interface Feature {
  id: string | number;
  lat: number;
  lng: number;
  [key: string]: any;
}

export interface BuildProgress {
  processed: number;
  total: number;
  percent: number;
}

/**
 * Build a quadtree from an array of features progressively
 * Uses requestIdleCallback or setTimeout to avoid blocking
 */
export async function buildQuadtreeProgressive<T extends Feature>(
  features: T[],
  bounds: Bounds,
  onProgress?: (progress: BuildProgress) => void,
  chunkSize = 500
): Promise<Quadtree<T>> {
  const quadtree = new Quadtree<T>(bounds, 8); // Higher capacity for better performance
  const total = features.length;
  let processed = 0;

  // Process features in chunks
  for (let i = 0; i < features.length; i += chunkSize) {
    const chunk = features.slice(i, Math.min(i + chunkSize, features.length));

    // Insert chunk
    for (const feature of chunk) {
      const item: QuadtreeItem<T> = {
        id: feature.id,
        lat: feature.lat,
        lng: feature.lng,
        data: feature,
      };
      quadtree.insert(item);
    }

    processed += chunk.length;

    // Report progress
    if (onProgress) {
      onProgress({
        processed,
        total,
        percent: Math.floor((processed / total) * 100),
      });
    }

    // Yield to browser
    await new Promise((resolve) => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(resolve as any);
      } else {
        setTimeout(resolve, 0);
      }
    });
  }

  return quadtree;
}

/**
 * Build multiple quadtrees for different feature types
 */
export async function buildMultipleQuadtrees(
  featureGroups: { name: string; features: Feature[] }[],
  bounds: Bounds,
  onProgress?: (name: string, progress: BuildProgress) => void
): Promise<Map<string, Quadtree<any>>> {
  const quadtrees = new Map<string, Quadtree<any>>();

  for (const group of featureGroups) {
    const quadtree = await buildQuadtreeProgressive(
      group.features,
      bounds,
      onProgress ? (progress) => onProgress(group.name, progress) : undefined
    );
    quadtrees.set(group.name, quadtree);
  }

  return quadtrees;
}
