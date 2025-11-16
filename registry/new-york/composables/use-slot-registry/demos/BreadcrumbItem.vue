<script setup lang="ts">
import { h, getCurrentInstance } from 'vue';
import { useSlotRegistry, type SlotRegistry } from '../useSlotRegistry';

interface BreadcrumbScope {
  isLast: boolean;
  index: number;
  total: number;
}

interface Props {
  registry: SlotRegistry<BreadcrumbScope>;
  label: string;
  href: string;
  position: number;
  isActive?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isActive: false,
});

const { registerSlot, memoizedId } = useSlotRegistry<BreadcrumbScope>();

const slotId = memoizedId(getCurrentInstance(), 'breadcrumb');

registerSlot(props.registry, {
  id: slotId,
  autoRegister: true,
  position: props.position,
  render: (scope) => {
    const nodes = [];

    // Le lien/texte
    if (props.isActive) {
      nodes.push(
        h(
          'span',
          {
            class: 'font-medium text-foreground',
          },
          props.label
        )
      );
    } else {
      nodes.push(
        h(
          'a',
          {
            href: props.href,
            class: 'text-muted-foreground hover:text-foreground transition-colors',
            onClick: (e: Event) => {
              e.preventDefault();
              console.log(`Navigate to: ${props.href}`);
            },
          },
          props.label
        )
      );
    }

    // Séparateur (sauf pour le dernier)
    if (scope && !scope.isLast) {
      nodes.push(
        h(
          'span',
          {
            class: 'text-muted-foreground/50 mx-2',
          },
          '/'
        )
      );
    }

    return nodes;
  },
});
</script>

<template>
  <!-- Pas de template, enregistrement via render function avec scoped slot -->
</template>
