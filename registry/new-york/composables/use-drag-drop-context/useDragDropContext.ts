/**
 * useDragDropContext - Composable pour accéder au contexte drag-drop fourni par DragDropProvider
 *
 * @category interactions
 * @type registry:hook
 */

import { inject } from 'vue';
import type { UseDragDropReturn, UseDragDropOptions } from '../use-drag-drop/useDragDrop';

/**
 * Injection key pour le contexte drag-drop
 */
export const DRAG_DROP_INJECTION_KEY = Symbol('drag-drop-context');

export interface DragDropContext<T = any> extends UseDragDropReturn<T> {
  options: Readonly<UseDragDropOptions & { mode?: 'drag' | 'resize' | 'both' }>;
}

/**
 * Hook pour accéder au contexte drag-drop dans un composant enfant
 *
 * @throws Error si utilisé en dehors d'un DragDropProvider
 * @returns Le contexte drag-drop fourni par le DragDropProvider parent
 *
 * @example
 * ```vue
 * <script setup>
 * import { useDragDropContext } from '@/composables/use-drag-drop-context'
 *
 * const { dragState, startDrag, endDrag, options } = useDragDropContext()
 * </script>
 * ```
 */
export function useDragDropContext<T = any>(): DragDropContext<T> {
  const context = inject<DragDropContext<T>>(DRAG_DROP_INJECTION_KEY);

  if (!context) {
    throw new Error(
      'useDragDropContext must be used within a DragDropProvider component. ' +
        'Make sure to wrap your component with <DragDropProvider>.'
    );
  }

  return context;
}

/**
 * Hook pour accéder au contexte drag-drop de manière optionnelle
 *
 * @returns Le contexte drag-drop s'il existe, undefined sinon
 *
 * @example
 * ```vue
 * <script setup>
 * import { useDragDropContextOptional } from '@/composables/use-drag-drop-context'
 *
 * const context = useDragDropContextOptional()
 *
 * if (context) {
 *   // Utiliser le contexte fourni par le provider
 *   const { dragState } = context
 * } else {
 *   // Créer sa propre instance de useDragDrop
 * }
 * </script>
 * ```
 */
export function useDragDropContextOptional<T = any>(): DragDropContext<T> | undefined {
  return inject<DragDropContext<T> | undefined>(DRAG_DROP_INJECTION_KEY, undefined);
}
