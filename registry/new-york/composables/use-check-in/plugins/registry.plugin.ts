/**
 * Plugin de gestion du registre pour le système de check-in
 * Gère les opérations CRUD sur le registre des items
 */

import { triggerRef } from 'vue';
import type { Plugin, PluginContext, CheckInItem, CheckInItemMeta } from '../types';

export interface RegistryPlugin<T = any> extends Plugin<T> {
  checkIn: (id: string | number, data: T, meta?: CheckInItemMeta) => boolean;
  checkOut: (id: string | number) => boolean;
  get: (id: string | number) => CheckInItem<T> | undefined;
  update: (id: string | number, data: Partial<T>) => boolean;
  has: (id: string | number) => boolean;
  clear: () => void;
  checkInMany: (items: Array<{ id: string | number; data: T; meta?: CheckInItemMeta }>) => void;
  checkOutMany: (ids: Array<string | number>) => void;
  updateMany: (updates: Array<{ id: string | number; data: Partial<T> }>) => void;
}

/**
 * Crée le plugin de gestion du registre
 */
export const createRegistryPlugin = <T = any>(
  emitEvent?: <E extends string>(event: E, payload: any) => void
): RegistryPlugin<T> => {
  let context: PluginContext<T> | null = null;

  const checkIn = (id: string | number, data: T, meta?: CheckInItemMeta): boolean => {
    if (!context) return false;

    context.debug('checkIn', { id, data, meta });

    // Lifecycle: before
    if (context.options?.onBeforeCheckIn) {
      const result = context.options.onBeforeCheckIn(id, data);
      if (result === false) {
        context.debug('checkIn cancelled by onBeforeCheckIn', id);
        return false;
      }
    }

    context.registry.value.set(id, {
      id,
      data: data as any,
      timestamp: Date.now(),
      meta,
    });
    triggerRef(context.registry);

    // Emit event
    emitEvent?.('check-in', { id, data });

    // Lifecycle: after
    context.options?.onCheckIn?.(id, data);

    if (context.options?.debug) {
      context.debug('Registry state after check-in:', {
        total: context.registry.value.size,
        items: Array.from(context.registry.value.keys()),
      });
    }

    return true;
  };

  const checkOut = (id: string | number): boolean => {
    if (!context) return false;

    context.debug('checkOut', id);

    const existed = context.registry.value.has(id);
    if (!existed) return false;

    // Lifecycle: before
    if (context.options?.onBeforeCheckOut) {
      const result = context.options.onBeforeCheckOut(id);
      if (result === false) {
        context.debug('checkOut cancelled by onBeforeCheckOut', id);
        return false;
      }
    }

    context.registry.value.delete(id);
    triggerRef(context.registry);

    // Emit event
    emitEvent?.('check-out', { id });

    // Lifecycle: after
    context.options?.onCheckOut?.(id);

    if (context.options?.debug) {
      context.debug('Registry state after check-out:', {
        total: context.registry.value.size,
        items: Array.from(context.registry.value.keys()),
      });
    }

    return true;
  };

  const get = (id: string | number) => {
    return context?.registry.value.get(id);
  };

  const update = (id: string | number, data: Partial<T>): boolean => {
    if (!context) return false;

    const existing = context.registry.value.get(id);
    if (!existing) {
      context.debug('update failed: item not found', id);
      return false;
    }

    if (typeof existing.data === 'object' && typeof data === 'object') {
      const previousData = { ...existing.data };

      // Mise à jour directe sans relancer checkIn pour préserver le lifecycle
      Object.assign(existing.data as object, data);
      triggerRef(context.registry);

      // Emit event
      emitEvent?.('update', { id, data: existing.data });

      if (context.options?.debug) {
        context.debug('update diff:', {
          id,
          before: previousData,
          after: existing.data,
          changes: data,
        });
      }

      return true;
    }

    return false;
  };

  const has = (id: string | number) => {
    return context?.registry.value.has(id) ?? false;
  };

  const clear = () => {
    if (!context) return;

    context.debug('clear');
    const count = context.registry.value.size;
    context.registry.value.clear();
    triggerRef(context.registry);

    // Emit event
    emitEvent?.('clear', {});

    context.debug(`Cleared ${count} items from registry`);
  };

  const checkInMany = (items: Array<{ id: string | number; data: T; meta?: CheckInItemMeta }>) => {
    context?.debug('checkInMany', items.length, 'items');
    items.forEach(({ id, data, meta }) => checkIn(id, data, meta));
  };

  const checkOutMany = (ids: Array<string | number>) => {
    context?.debug('checkOutMany', ids.length, 'items');
    ids.forEach((id) => checkOut(id));
  };

  const updateMany = (updates: Array<{ id: string | number; data: Partial<T> }>) => {
    context?.debug('updateMany', updates.length, 'items');
    updates.forEach(({ id, data }) => update(id, data));
  };

  const cleanup = () => {
    if (!context) return;
    context.registry.value.clear();
    context.debug('[Registry] Cleaned up registry');
  };

  return {
    name: 'registry',
    install: (ctx: PluginContext<T>) => {
      context = ctx;
      ctx.debug('[Plugin] Registry plugin installed');
    },
    cleanup,
    checkIn,
    checkOut,
    get,
    update,
    has,
    clear,
    checkInMany,
    checkOutMany,
    updateMany,
  };
};
