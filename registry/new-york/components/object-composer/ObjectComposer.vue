<script setup lang="ts">
import { computed, ref, provide, triggerRef, type HTMLAttributes, type InjectionKey } from 'vue';
import { cn } from '@/lib/utils';
import { ObjectComposerItem } from '.';
import { Button } from '@/components/ui/button';
import {
  useCheckIn,
  type CheckInDesk,
} from '~~/registry/new-york/composables/use-check-in/useCheckIn';

interface ComposerItemData {
  key: string;
  value: any;
  path: string[];
  depth: number;
  isInArray: boolean;
}

interface ObjectComposerProps {
  readonly?: boolean;
  class?: HTMLAttributes['class'];
}

interface SlotProps {
  itemKey: string;
  value: any;
  valueType: string;
  displayValue: string;
  isExpandable: boolean;
  isEditing: boolean;
  editKey: string;
  editValue: string;
}

const props = withDefaults(defineProps<ObjectComposerProps>(), {
  readonly: false,
});

const model = defineModel<Record<string, any> | any[]>({ required: true });

// Path of the item currently being edited (null if none)
const editingPath = ref<string[] | null>(null);

// Initialize useCheckIn for managing items
const { createDesk } = useCheckIn<ComposerItemData>();
const { desk, DeskInjectionKey } = createDesk({
  context: {
    // Expose editingPath to child items
    editingPath,
    // Expose model update functions
    updateValue: (path: string[], value: any) => {
      let current: any = model.value;
      for (let i = 0; i < path.length - 1; i++) {
        const key = path[i];
        if (key) current = current[key];
      }
      const lastKey = path[path.length - 1];
      if (lastKey) {
        current[lastKey] = value;
        triggerRef(model); // Force reactivity update
      }
    },
    deleteValue: (path: string[]) => {
      let current: any = model.value;
      const lastKey = path[path.length - 1];
      for (let i = 0; i < path.length - 1; i++) {
        const key = path[i];
        if (key) current = current[key];
      }
      if (lastKey) {
        if (Array.isArray(current)) {
          current.splice(Number(lastKey), 1);
        } else {
          delete current[lastKey];
        }
        triggerRef(model); // Force reactivity update
      }
    },
    addValue: (path: string[], key: string, value: any) => {
      let current: any = model.value;
      for (const pathKey of path) {
        current = current[pathKey];
      }
      if (Array.isArray(current)) {
        current.push(value);
      } else {
        current[key] = value;
      }
      triggerRef(model); // Force reactivity update
    },
    updateKey: (path: string[], newKey: string) => {
      const parent = path.length > 1 ? path.slice(0, -1) : [];
      const oldKey = path[path.length - 1];
      let current: any = model.value;
      for (const key of parent) {
        current = current[key];
      }
      if (current && oldKey && !Array.isArray(current) && oldKey !== newKey) {
        const value = current[oldKey];
        delete current[oldKey];
        current[newKey] = value;
        triggerRef(model); // Force reactivity update
      }
    },
    startEdit: (path: string[]) => {
      editingPath.value = path;
    },
    cancelEdit: () => {
      editingPath.value = null;
    },
  },
  onCheckIn: (id, data) => {
    console.log('[ObjectComposer] Item registered:', id, data.key);
  },
  onCheckOut: (id) => {
    console.log('[ObjectComposer] Item unregistered:', id);
  },
  debug: false,
});

// Provide DeskInjectionKey for child items
provide('objectComposerDesk', { deskSymbol: DeskInjectionKey, model });
</script>

<template>
  <div data-slot="object-composer" :class="cn('flex flex-col text-sm', props.class)">
    <slot />
  </div>
</template>
