/**
 * Exemple de plugin personnalisé pour useCheckIn
 * Ce plugin ajoute un système de slots/emplacements réutilisable
 */

import type { Plugin, PluginContext, CheckInItem } from '../types';

export interface SlotMeta {
  slotId?: string;
  slotType?: string;
  slotData?: Record<string, any>;
}

export interface SlotsPlugin<T = any> extends Plugin<T> {
  /** Enregistre un slot */
  registerSlot: (slotId: string, slotType: string, config?: Record<string, any>) => void;
  /** Désenregistre un slot */
  unregisterSlot: (slotId: string) => void;
  /** Récupère les items d'un slot */
  getSlotItems: (slotId: string) => CheckInItem<T>[];
  /** Vérifie si un slot existe */
  hasSlot: (slotId: string) => boolean;
}

/**
 * Crée un plugin de gestion de slots
 *
 * @example
 * ```ts
 * const slotsPlugin = createSlotsPlugin<MyItem>();
 *
 * const { desk } = createDesk({
 *   plugins: [slotsPlugin]
 * });
 *
 * // Enregistrer un slot
 * slotsPlugin.registerSlot('header-actions', 'toolbar', { position: 'right' });
 *
 * // Check-in dans le slot
 * checkIn(desk, {
 *   id: 'btn-1',
 *   data: myButton,
 *   meta: {
 *     slotId: 'header-actions',
 *     slotType: 'toolbar'
 *   }
 * });
 *
 * // Récupérer les items du slot
 * const headerActions = slotsPlugin.getSlotItems('header-actions');
 * ```
 */
export const createSlotsPlugin = <T = any>(): SlotsPlugin<T> => {
  let context: PluginContext<T> | null = null;

  // Registry des slots
  const slots = new Map<
    string,
    {
      slotId: string;
      slotType: string;
      config?: Record<string, any>;
    }
  >();

  const registerSlot = (slotId: string, slotType: string, config?: Record<string, any>) => {
    if (slots.has(slotId)) {
      context?.debug(`[Slots] Slot '${slotId}' already registered, updating config`);
    }

    slots.set(slotId, { slotId, slotType, config });
    context?.debug(`[Slots] Registered slot '${slotId}' of type '${slotType}'`, config);
  };

  const unregisterSlot = (slotId: string) => {
    const existed = slots.delete(slotId);
    if (existed) {
      context?.debug(`[Slots] Unregistered slot '${slotId}'`);
    }
  };

  const getSlotItems = (slotId: string): CheckInItem<T>[] => {
    if (!context) return [];

    const items = Array.from(context.registry.value.values()).filter(
      (item) => (item.meta as any)?.slotId === slotId
    );

    context?.debug(`[Slots] Retrieved ${items.length} items from slot '${slotId}'`);
    return items;
  };

  const hasSlot = (slotId: string): boolean => {
    return slots.has(slotId);
  };

  const cleanup = () => {
    slots.clear();
    context?.debug('[Slots] Cleaned up all slots');
  };

  return {
    name: 'slots',
    install: (ctx: PluginContext<T>) => {
      context = ctx;
      ctx.debug('[Plugin] Slots plugin installed');
    },
    cleanup,
    registerSlot,
    unregisterSlot,
    getSlotItems,
    hasSlot,
  };
};

/**
 * Exemple d'utilisation dans un composant
 */
export const SlotsPluginExample = `
<!-- Parent.vue -->
<script setup lang="ts">
import { useCheckIn, createSlotsPlugin } from './useCheckIn';

interface ToolbarItem {
  label: string;
  icon?: string;
  onClick: () => void;
}

const { createDesk } = useCheckIn<ToolbarItem>();
const slotsPlugin = createSlotsPlugin<ToolbarItem>();

const { desk } = createDesk({
  plugins: [slotsPlugin]
});

// Enregistrer des slots
slotsPlugin.registerSlot('header-left', 'toolbar', { align: 'left' });
slotsPlugin.registerSlot('header-right', 'toolbar', { align: 'right' });
slotsPlugin.registerSlot('footer-actions', 'toolbar', { align: 'center' });

// Computed pour récupérer les items par slot
const headerLeftItems = computed(() => slotsPlugin.getSlotItems('header-left'));
const headerRightItems = computed(() => slotsPlugin.getSlotItems('header-right'));
const footerItems = computed(() => slotsPlugin.getSlotItems('footer-actions'));
</script>

<template>
  <div>
    <header>
      <div class="left">
        <ToolbarButton
          v-for="item in headerLeftItems"
          :key="item.id"
          v-bind="item.data"
        />
      </div>
      <div class="right">
        <ToolbarButton
          v-for="item in headerRightItems"
          :key="item.id"
          v-bind="item.data"
        />
      </div>
    </header>
    
    <main>
      <slot /> <!-- Child components -->
    </main>
    
    <footer>
      <ToolbarButton
        v-for="item in footerItems"
        :key="item.id"
        v-bind="item.data"
      />
    </footer>
  </div>
</template>

<!-- Child.vue -->
<script setup lang="ts">
import { useCheckIn } from './useCheckIn';

const props = defineProps<{
  slotId: 'header-left' | 'header-right' | 'footer-actions';
  label: string;
  icon?: string;
}>();

const { checkIn } = useCheckIn<ToolbarItem>();

checkIn(desk, {
  autoCheckIn: true,
  id: \`btn-\${props.label}\`,
  data: {
    label: props.label,
    icon: props.icon,
    onClick: () => console.log(\`\${props.label} clicked\`)
  },
  meta: {
    slotId: props.slotId,
    slotType: 'toolbar',
    user: {
      // Custom data spécifique à votre usage
    }
  }
});
</script>
`;
