/**
 * Plugin de gestion des événements pour le système de check-in
 * Fournit un système d'événements typé et performant
 */

import type {
  Plugin,
  PluginContext,
  DeskEventType,
  DeskEventCallback,
  DeskEventPayload,
} from '../types';

export interface EventsPlugin<T = any> extends Plugin<T> {
  on: <E extends DeskEventType>(event: E, callback: DeskEventCallback<T, E>) => () => void;
  off: <E extends DeskEventType>(event: E, callback: DeskEventCallback<T, E>) => void;
  emit: <E extends DeskEventType>(
    event: E,
    payload: Omit<DeskEventPayload<T>[E], 'timestamp'>
  ) => void;
}

/**
 * Crée le plugin de gestion des événements
 */
export const createEventsPlugin = <T = any>(): EventsPlugin<T> => {
  const eventListeners = new Map<DeskEventType, Set<DeskEventCallback<T, any>>>();
  let context: PluginContext<T> | null = null;

  const emit = <E extends DeskEventType>(
    event: E,
    payload: Omit<DeskEventPayload<T>[E], 'timestamp'>
  ) => {
    const listeners = eventListeners.get(event);
    if (!listeners || listeners.size === 0) return;

    const eventPayload = {
      ...payload,
      timestamp: Date.now(),
    } as DeskEventPayload<T>[E];

    context?.debug(`[Event] ${event}`, eventPayload);
    listeners.forEach((callback) => callback(eventPayload));
  };

  const on = <E extends DeskEventType>(event: E, callback: DeskEventCallback<T, E>) => {
    if (!eventListeners.has(event)) {
      eventListeners.set(event, new Set());
    }
    eventListeners.get(event)!.add(callback);

    context?.debug(
      `[Event] Listener added for '${event}', total: ${eventListeners.get(event)!.size}`
    );

    // Return unsubscribe function
    return () => off(event, callback);
  };

  const off = <E extends DeskEventType>(event: E, callback: DeskEventCallback<T, E>) => {
    const listeners = eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback);
      context?.debug(`[Event] Listener removed for '${event}', remaining: ${listeners.size}`);
    }
  };

  const cleanup = () => {
    eventListeners.clear();
    context?.debug('[Event] Cleaned up all event listeners');
  };

  return {
    name: 'events',
    install: (ctx: PluginContext<T>) => {
      context = ctx;
      ctx.debug('[Plugin] Events plugin installed');
    },
    cleanup,
    on,
    off,
    emit,
  };
};
