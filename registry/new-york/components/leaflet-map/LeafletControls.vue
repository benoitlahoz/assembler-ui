<script setup lang="ts">
import {
  ref,
  provide,
  type Ref,
  type HTMLAttributes,
  inject,
  watch,
  nextTick,
  type InjectionKey,
  computed,
} from 'vue';
import type { ControlOptions } from 'leaflet';
import {
  useCheckIn,
  type CheckInDesk,
} from '~~/registry/new-york/composables/use-check-in/useCheckIn';
import { cn } from '@/lib/utils';
import { LeafletControlsKey, LeafletMapKey, LeafletModuleKey } from '.';

export interface ControlItemReference {
  name: string;
  title: string;
  html: string;
  type?: 'push' | 'toggle';
  active?: boolean;
}

export interface LeafletControlsContext {
  controlsRegistry: Ref<Map<string, ControlItemReference>>;
  registerItem: (item: ControlItemReference) => void;
  unregisterItem: (name: string) => void;
  deskSymbol: InjectionKey<CheckInDesk<ControlItemReference>>; // For useCheckIn integration
}

export interface LeafletControlsProps {
  position?: ControlOptions['position'];
  class?: HTMLAttributes['class'];
  style?: HTMLAttributes['style'];
  activeItem?: string | null;
  enabled?: boolean;
}

const props = withDefaults(defineProps<LeafletControlsProps>(), {
  position: 'topleft',
  class: 'rounded-[4px] shadow-(--leaflet-control-bar-shadow) bg-white',
  style: '',
  activeItem: null,
  enabled: true,
});

const emit = defineEmits<{
  (e: 'item-clicked', name: string): void;
}>();

const L = inject(LeafletModuleKey, ref());
const map = inject(LeafletMapKey, ref(null));

const control = ref<any>(null);

// Initialize useCheckIn for control items management
const { openDesk } = useCheckIn<ControlItemReference>();
const { desk, deskSymbol } = openDesk({
  extraContext: {
    // Expose activeItem to child controls
    activeItem: () => props.activeItem,
  },
  onCheckIn: (id, itemRef) => {
    console.log('[LeafletControls] Control item registered:', id, itemRef.name);
  },
  onCheckOut: (id) => {
    console.log('[LeafletControls] Control item unregistered:', id);
  },
});

// Use desk items as registry
const controlsRegistry = computed(() => {
  const registry = new Map<string, ControlItemReference>();
  // Use desk.registry.value to establish reactive dependency
  desk.registry.value.forEach((item) => {
    registry.set(item.data.name, item.data);
  });
  return registry;
});

// Deprecated: kept for backward compatibility
const registerItem = (item: ControlItemReference) => {
  console.warn(
    'LeafletControls: registerItem is deprecated. Use useCheckIn with checkIn() instead.'
  );
  const existing = controlsRegistry.value.get(item.name);
  // Only update if content changed
  if (!existing || existing.html !== item.html) {
    // Manual registration fallback (not recommended)
  }
};

// Deprecated: kept for backward compatibility
const unregisterItem = (name: string) => {
  console.warn(
    'LeafletControls: unregisterItem is deprecated. Use useCheckIn with automatic cleanup instead.'
  );
};

const createButton = (container: HTMLElement, name: string, title: string) => {
  if (!L.value) return;

  const controlItem = controlsRegistry.value.get(name);
  if (!controlItem) {
    return;
  }
  // Use <a> instead of <div> for proper Leaflet styling (.leaflet-bar a)
  const button = L.value!.DomUtil.create('a', '', container);
  button.href = '#';
  button.title = title;
  // Wrap content in a flex div for centering
  button.innerHTML = `<div class="flex items-center justify-center h-full">${controlItem.html}</div>`;
  button.setAttribute('role', 'button');
  button.setAttribute('aria-label', title);
  button.setAttribute('tabindex', '0');
  button.dataset.toolType = name;
  button.dataset.buttonType = controlItem.type || 'toggle';

  // Set initial active state
  if (controlItem.type === 'toggle' && (controlItem.active || props.activeItem === name)) {
    button.classList.add('leaflet-draw-toolbar-button-enabled');
  }

  L.value!.DomEvent.on(button, 'click', (e: Event) => {
    L.value!.DomEvent.preventDefault(e);
    handleButtonClick(name, controlItem.type || 'toggle');
  });

  return button;
};

const handleButtonClick = (name: string, type: 'push' | 'toggle') => {
  if (type === 'toggle') {
    // For toggle buttons, emit the click and let parent handle active state
    emit('item-clicked', name);
  } else {
    // For push buttons, just emit the click
    emit('item-clicked', name);
  }
};

const updateButtonContent = () => {
  if (!control.value) return;

  const container = control.value.getContainer();
  if (!container) return;

  const buttons = container.querySelectorAll('a[data-tool-type]');
  buttons.forEach((button: Element) => {
    const htmlButton = button as HTMLElement;
    const toolType = htmlButton.dataset.toolType;
    if (toolType) {
      const controlItem = controlsRegistry.value.get(toolType);
      if (controlItem) {
        const wrappedHtml = `<div class="flex items-center justify-center h-full">${controlItem.html}</div>`;
        if (htmlButton.innerHTML !== wrappedHtml) {
          htmlButton.innerHTML = wrappedHtml;
        }
      }
    }
  });
};

const updateActiveButton = () => {
  if (!control.value) return;

  const container = control.value.getContainer();
  if (!container) return;

  const buttons = container.querySelectorAll('a[data-tool-type]');
  buttons.forEach((button: Element) => {
    const htmlButton = button as HTMLElement;
    const toolType = htmlButton.dataset.toolType;
    const buttonType = htmlButton.dataset.buttonType;

    if (buttonType === 'toggle') {
      if (toolType === props.activeItem) {
        htmlButton.classList.add('leaflet-draw-toolbar-button-enabled');
      } else {
        htmlButton.classList.remove('leaflet-draw-toolbar-button-enabled');
      }
    }
  });
};

const createControl = () => {
  if (!L.value || !map.value) return;

  const items = Array.from(controlsRegistry.value.values());

  const Controls = L.value.Control.extend({
    options: {
      position: props.position,
    },

    onAdd() {
      const container = L.value!.DomUtil.create(
        'div',
        'leaflet-controls-bar leaflet-control leaflet-bar'
      );

      L.value!.DomEvent.disableClickPropagation(container);
      L.value!.DomEvent.disableScrollPropagation(container);

      controlsRegistry.value.forEach((control, name) => {
        createButton(container, name, control.title);
      });

      return container;
    },

    onRemove() {
      // Nothing to clean up yet
    },
  });

  control.value = new Controls();
  control.value.addTo(map.value);
};

// Fonction pour créer le contrôle si toutes les conditions sont remplies
const tryCreateControl = () => {
  const itemsCount = controlsRegistry.value.size;

  // Check if all items have HTML content (icons loaded)
  const allItemsHaveContent = Array.from(controlsRegistry.value.values()).every(
    (item) => item.html && item.html.trim().length > 0
  );

  if (map.value && props.enabled && itemsCount > 0 && !control.value && allItemsHaveContent) {
    nextTick(() => {
      createControl();
    });
  }
};

watch(
  [() => map.value, () => props.enabled],
  ([newMap, newEnabled]) => {
    if (newMap && newEnabled) {
      if (!control.value) {
        // Try to create if we have items
        tryCreateControl();
      } else if (!control.value._map) {
        control.value.addTo(newMap);
      }
    } else if (control.value && control.value._map) {
      control.value.remove();
    }
  },
  { immediate: true }
);

// Watch activeItem to update button states
watch(
  () => props.activeItem,
  () => {
    nextTick(() => {
      updateActiveButton();
    });
  }
);

// Watch the registry to create control when items arrive
let previousItemCount = 0;
watch(
  controlsRegistry,
  (newRegistry) => {
    const currentItemCount = newRegistry.size;

    // If control doesn't exist yet, try to create it
    if (!control.value) {
      tryCreateControl();
      previousItemCount = currentItemCount;
      return;
    }

    // If number of items changed, recreate the control
    if (currentItemCount !== previousItemCount) {
      if (control.value._map) {
        control.value.remove();
      }
      control.value = null;
      tryCreateControl();
      previousItemCount = currentItemCount;
    } else {
      // Same number of items, just update button content (for async icon loading)
      updateButtonContent();
    }
  },
  { deep: true }
);

const context: LeafletControlsContext = {
  controlsRegistry,
  registerItem,
  unregisterItem,
  deskSymbol,
};

provide(LeafletControlsKey, context);
</script>

<template>
  <slot />
  <div :class="cn('hidden', props.class)" :style="props.style"></div>
</template>

<style>
:root {
  --leaflet-control-bar-shadow: 0 1px 5px rgba(0, 0, 0, 0.65);
}

/* Active/enabled state for toggle buttons */
.leaflet-draw-toolbar-button-enabled {
  background-color: #e0e0e0 !important;
  background-image: linear-gradient(to bottom, #e0e0e0, #c0c0c0) !important;
}
</style>
