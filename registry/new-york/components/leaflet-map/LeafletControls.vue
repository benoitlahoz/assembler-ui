<script setup lang="ts">
import { ref, provide, type Ref, type HTMLAttributes, inject, watch, nextTick } from 'vue';
import { cn } from '@/lib/utils';
import type { ControlOptions } from 'leaflet';
import { LeafletControlsKey, LeafletMapKey, LeafletModuleKey } from '.';

export interface ControlItemReference {
  name: string;
  title: string;
  html: string;
}

export interface LeafletControlsContext {
  controlsRegistry: Ref<Map<string, ControlItemReference>>;
  registerItem: (item: ControlItemReference) => void;
  unregisterItem: (name: string) => void;
}

export interface LeafletControlsProps {
  position?: ControlOptions['position'];
  class?: HTMLAttributes['class'];
  style?: HTMLAttributes['style'];
}

const props = withDefaults(defineProps<LeafletControlsProps>(), {
  position: 'topleft',
  class: 'rounded-[4px] shadow-(--leaflet-control-bar-shadow) bg-white',
  style: '',
});

const L = inject(LeafletModuleKey, ref());
const map = inject(LeafletMapKey, ref(null));

const control = ref<any>(null);

const controlsRegistry = ref<Map<string, ControlItemReference>>(new Map());

const registerItem = (item: ControlItemReference) => {
  const existing = controlsRegistry.value.get(item.name);
  // Only update if content changed
  if (!existing || existing.html !== item.html) {
    controlsRegistry.value.set(item.name, item);
    // Trigger reactivity
    controlsRegistry.value = new Map(controlsRegistry.value);
  }
};

const unregisterItem = (name: string) => {
  controlsRegistry.value.delete(name);
};

const createButton = (container: HTMLElement, name: string, title: string) => {
  if (!L.value) return;
  console.log('Should create button for', name);

  const control = controlsRegistry.value.get(name);
  console.log('Control', control);
  if (!control) {
    return;
  }
  console.log('HTML', control.html);
  const button = L.value!.DomUtil.create('div', 'leaflet-draw-button', container);
  button.title = title;
  button.innerHTML = control.html;
  button.setAttribute('role', 'button');
  button.setAttribute('aria-label', title);
  button.setAttribute('tabindex', '0');
  button.dataset.toolType = name;

  L.value!.DomEvent.on(button, 'click', (e: Event) => {
    L.value!.DomEvent.preventDefault(e);
    console.log('Click');
  });

  return button;
};

const createControl = () => {
  if (!L.value || !map.value) return;
  console.log('Creating controls with', controlsRegistry.value);

  const Controls = L.value.Control.extend({
    options: {
      position: props.position,
    },

    onAdd() {
      const container = L.value!.DomUtil.create(
        'div',
        'leaflet-controls-bar leaflet-control leaflet-bar'
      );

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

watch(
  () => map.value,
  () => {
    console.log('Map changed', map.value, control.value);
    if (map.value) {
      if (!control.value) {
        // Wait a bit for initial items to register
        nextTick(() => {
          setTimeout(() => {
            createControl();
          }, 150);
        });
      } else if (!control.value._map) {
        control.value.addTo(map.value);
      }
    } else if (control.value && control.value._map) {
      control.value.remove();
    }
  },
  { immediate: true }
);

// Watch the registry to recreate control when items change
watch(
  controlsRegistry,
  (newRegistry) => {
    console.log('Registry changed', newRegistry.size);
    if (newRegistry.size > 0 && map.value && control.value?._map) {
      // Remove old control and recreate with updated items
      control.value.remove();
      control.value = null;
      nextTick(() => {
        createControl();
      });
    }
  },
  { deep: true }
);

const context: LeafletControlsContext = {
  controlsRegistry,
  registerItem,
  unregisterItem,
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
</style>
