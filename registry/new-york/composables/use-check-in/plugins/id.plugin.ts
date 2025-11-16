/**
 * Plugin de génération d'IDs pour le système de check-in
 * Fournit des générateurs d'IDs sécurisés et mémorisés
 */

import type { Plugin, PluginContext } from '../types';

export interface IdPlugin extends Plugin {
  generateId: (prefix?: string) => string;
  memoizedId: (
    instanceOrId: object | string | number | null | undefined,
    prefix?: string
  ) => string;
  clearCache: () => void;
}

// WeakMap pour générer des IDs stables basés sur l'instance du composant
const instanceIdMap = new WeakMap<object, string>();
// Map pour les IDs custom fournis par l'utilisateur
const customIdMap = new Map<string, string>();
let instanceCounter = 0;

/**
 * Génère un ID cryptographiquement sécurisé
 */
const generateSecureId = (prefix = 'item'): string => {
  // Essaie crypto.randomUUID si disponible (navigateur moderne + Node 19+)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  // Sinon utilise crypto.getRandomValues (quasi-universel)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    const id = Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
    return `${prefix}-${id}`;
  }

  // Fallback ultime pour environnements très anciens
  const isDev = typeof process !== 'undefined' && process.env?.NODE_ENV === 'development';
  if (isDev) {
    console.warn(
      '[useCheckIn] crypto API not available, using Math.random fallback. ' +
        'Consider upgrading to a modern environment.'
    );
  }
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  return `${prefix}-${timestamp}-${random}`;
};

/**
 * Crée le plugin de génération d'IDs
 */
export const createIdPlugin = (): IdPlugin => {
  let context: PluginContext | null = null;

  const generateId = (prefix = 'item'): string => {
    const id = generateSecureId(prefix);
    context?.debug('[ID] Generated secure ID:', id);
    return id;
  };

  /**
   * Génère un ID mémorisé pour un composant
   *
   * @param instanceOrId
   *   - Instance Vue (getCurrentInstance()) → ID mémorisé via WeakMap (stable au remontage)
   *   - String/Number (nanoid(), props.id, etc.) → Utilise cet ID (stable si même valeur)
   *   - null/undefined → Génère un ID cryptographiquement sécurisé (warning en dev)
   * @param prefix - Préfixe pour l'ID (ex: 'tab', 'field')
   * @returns ID mémorisé et stable
   */
  const memoizedId = (
    instanceOrId: object | string | number | null | undefined,
    prefix = 'item'
  ): string => {
    // Cas 1: C'est un string ou number = ID custom fourni par l'utilisateur
    if (typeof instanceOrId === 'string' || typeof instanceOrId === 'number') {
      const key = `${prefix}-${instanceOrId}`;
      let id = customIdMap.get(key);
      if (!id) {
        id = String(instanceOrId);
        customIdMap.set(key, id);
        context?.debug('[ID] Memoized custom ID:', { key, id });
      }
      return id;
    }

    // Cas 2: C'est un object = instance Vue (getCurrentInstance())
    if (instanceOrId && typeof instanceOrId === 'object') {
      let id = instanceIdMap.get(instanceOrId);
      if (!id) {
        id = `${prefix}-${++instanceCounter}`;
        instanceIdMap.set(instanceOrId, id);
        context?.debug('[ID] Memoized instance ID:', { prefix, id, counter: instanceCounter });
      }
      return id;
    }

    // Cas 3: null/undefined = génération cryptographiquement sécurisée avec warning
    const isDev = typeof process !== 'undefined' && process.env?.NODE_ENV === 'development';
    if (isDev) {
      console.warn(
        `[useCheckIn] memoizedId: no instance or custom ID provided. ` +
          `Generated cryptographically secure ID. ` +
          `Consider passing getCurrentInstance() or a custom ID (nanoid, uuid, props.id, etc.).`
      );
    }
    return generateId(prefix);
  };

  const clearCache = () => {
    customIdMap.clear();
    instanceCounter = 0;
    context?.debug('[ID] Cleared ID cache');
  };

  const cleanup = () => {
    clearCache();
    context?.debug('[ID] Plugin cleaned up');
  };

  return {
    name: 'id',
    install: (ctx: PluginContext) => {
      context = ctx;
      ctx.debug('[Plugin] ID plugin installed');
    },
    cleanup,
    generateId,
    memoizedId,
    clearCache,
  };
};

/**
 * Purge le cache d'IDs (utile en développement avec HMR)
 */
export const clearIdCache = () => {
  customIdMap.clear();
  instanceCounter = 0;
};
