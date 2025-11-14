<script setup lang="ts">
import { computed, ref, type HTMLAttributes } from 'vue';
import { cn } from '@/lib/utils';
import { ObjectComposerItem } from '.';
import { Button } from '@/components/ui/button';

interface ObjectComposerProps {
  data: Record<string, any> | any[];
  readonly?: boolean;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<ObjectComposerProps>(), {
  readonly: false,
});

const model = defineModel<Record<string, any> | any[]>({ required: true });

// Chemin de l'élément en cours d'édition (null si aucun)
const editingPath = ref<string[] | null>(null);

const rootEntries = computed(() => {
  if (Array.isArray(model.value)) {
    return model.value.map((item, index) => [String(index), item]);
  }
  return Object.entries(model.value);
});
</script>

<template>
  <div data-slot="object-composer" :class="cn('flex flex-col text-sm', props.class)">
    <slot />
  </div>
</template>
