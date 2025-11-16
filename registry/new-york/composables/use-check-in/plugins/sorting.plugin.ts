/**
 * Plugin de tri et filtrage pour le système de check-in
 * Fournit des fonctions optimisées pour trier et filtrer les items
 */

import type { Plugin, PluginContext, CheckInItem, GetAllOptions } from '../types';

export interface SortingPlugin<T = any> extends Plugin<T> {
  getAll: (options?: GetAllOptions<T>) => CheckInItem<T>[];
}

/**
 * Cache pour les fonctions de tri compilées
 */
const sortFnCache = new Map<string, (a: any, b: any) => number>();

/**
 * Compile une fonction de tri optimisée
 */
const compileSortFn = <T>(
  sortBy: keyof T | 'timestamp' | `meta.${string}`,
  order: 'asc' | 'desc' = 'asc'
): ((a: CheckInItem<T>, b: CheckInItem<T>) => number) => {
  const cacheKey = `${String(sortBy)}-${order}`;
  const cached = sortFnCache.get(cacheKey);
  if (cached) return cached;

  let fn: (a: CheckInItem<T>, b: CheckInItem<T>) => number;

  if (sortBy === 'timestamp') {
    fn = (a, b) => {
      const aVal = a.timestamp || 0;
      const bVal = b.timestamp || 0;
      const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      return order === 'desc' ? -comparison : comparison;
    };
  } else if (typeof sortBy === 'string' && sortBy.startsWith('meta.')) {
    const metaKey = sortBy.slice(5); // Remove 'meta.' prefix
    fn = (a, b) => {
      const aVal = (a.meta as any)?.[metaKey];
      const bVal = (b.meta as any)?.[metaKey];
      const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      return order === 'desc' ? -comparison : comparison;
    };
  } else {
    const key = sortBy as keyof T;
    fn = (a, b) => {
      const aVal = a.data[key];
      const bVal = b.data[key];
      const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      return order === 'desc' ? -comparison : comparison;
    };
  }

  sortFnCache.set(cacheKey, fn);
  return fn;
};

/**
 * Crée le plugin de tri et filtrage
 */
export const createSortingPlugin = <T = any>(): SortingPlugin<T> => {
  let context: PluginContext<T> | null = null;

  const getAll = (options?: GetAllOptions<T>): CheckInItem<T>[] => {
    if (!context) return [];

    let items = Array.from(context.registry.value.values());

    // Filtrage par groupe (via meta.group)
    if (options?.group !== undefined) {
      items = items.filter((item) => item.meta?.group === options.group);
    }

    // Filtrage custom
    if (options?.filter) {
      items = items.filter(options.filter);
    }

    // Tri optimisé avec cache
    if (options?.sortBy) {
      const sortFn = compileSortFn<T>(options.sortBy, options.order);
      items.sort(sortFn);
    }

    return items;
  };

  const cleanup = () => {
    // Le cache est global, on ne le nettoie pas ici
    // mais on pourrait ajouter une méthode pour purger le cache si nécessaire
    context?.debug('[Sorting] Plugin cleaned up');
  };

  return {
    name: 'sorting',
    install: (ctx: PluginContext<T>) => {
      context = ctx;
      ctx.debug('[Plugin] Sorting plugin installed');
    },
    cleanup,
    getAll,
  };
};

/**
 * Purge le cache de tri (utile en développement avec HMR)
 */
export const clearSortCache = () => {
  sortFnCache.clear();
};
