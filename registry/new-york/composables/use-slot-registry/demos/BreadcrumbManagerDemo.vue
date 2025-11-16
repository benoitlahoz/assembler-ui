<script setup lang="ts">
import { ref, computed } from 'vue';
import { useSlotRegistry } from '../useSlotRegistry';
import BreadcrumbItem from './BreadcrumbItem.vue';

interface BreadcrumbScope {
  isLast: boolean;
  index: number;
  total: number;
}

const { createSlotRegistry } = useSlotRegistry<BreadcrumbScope>();

const { registry, renderSlots } = createSlotRegistry({
  defaultSort: { by: 'position', order: 'asc' },
});

const currentPath = ref('/projects/assembler-ui/registry/use-slot-registry');

// Computed pour passer un scope aux slots
const breadcrumbScope = computed(() => {
  const items = registry.getAll();
  return (index: number) => ({
    isLast: index === items.length - 1,
    index,
    total: items.length,
  });
});
</script>

<template>
  <div class="w-full rounded-lg border bg-card p-6">
    <h3 class="mb-4 font-semibold">Breadcrumb Manager Demo</h3>

    <!-- Breadcrumb dynamique -->
    <nav class="mb-4 flex items-center gap-2 rounded bg-muted/30 p-3 text-sm">
      <component
        :is="
          () => {
            const items = registry.getAll();
            return items.flatMap((item, index) => {
              const scope: BreadcrumbScope = {
                isLast: index === items.length - 1,
                index,
                total: items.length,
              };
              return registry.renderSlots(scope);
            });
          }
        "
      />
    </nav>

    <div class="text-sm text-muted-foreground">
      <strong>Chemin actuel:</strong> {{ currentPath }}
    </div>

    <!-- Les breadcrumbs s'enregistrent ici -->
    <BreadcrumbItem :registry="registry" label="Accueil" href="/" :position="1" />

    <BreadcrumbItem :registry="registry" label="Projects" href="/projects" :position="2" />

    <BreadcrumbItem
      :registry="registry"
      label="assembler-ui"
      href="/projects/assembler-ui"
      :position="3"
    />

    <BreadcrumbItem
      :registry="registry"
      label="registry"
      href="/projects/assembler-ui/registry"
      :position="4"
    />

    <BreadcrumbItem
      :registry="registry"
      label="use-slot-registry"
      href="/projects/assembler-ui/registry/use-slot-registry"
      :position="5"
      :is-active="true"
    />
  </div>
</template>
