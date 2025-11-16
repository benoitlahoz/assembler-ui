<script setup lang="ts">
import { computed, h, getCurrentInstance } from 'vue';
import { useSlotRegistry, type SlotRegistry } from '../useSlotRegistry';
import UiButton from '~/components/ui/button/Button.vue';

interface Props {
  registry: SlotRegistry;
  label: string;
  icon?: string;
  group?: string;
  position?: number;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  group: 'main',
  position: 0,
  disabled: false,
});

const emit = defineEmits<{
  click: [];
}>();

const { registerSlot, memoizedId } = useSlotRegistry();

const slotId = memoizedId(getCurrentInstance(), 'toolbar-btn');

const isDisabled = computed(() => props.disabled);

// Enregistre le bouton comme slot
registerSlot(props.registry, {
  id: slotId,
  autoRegister: true,
  group: props.group,
  position: props.position,
  priority: props.disabled ? 0 : 10,
  visible: true,
  render: () => {
    return h(
      UiButton,
      {
        variant: 'ghost',
        size: 'sm',
        disabled: isDisabled.value,
        class: 'h-8 px-2',
        onClick: () => {
          if (!isDisabled.value) {
            emit('click');
          }
        },
      },
      {
        default: () => [
          props.icon &&
            h('span', {
              class: `i-lucide-${props.icon} mr-1.5 h-4 w-4`,
            }),
          props.label,
        ],
      }
    );
  },
});
</script>

<template>
  <!-- Ce composant n'a pas de template, il s'enregistre uniquement comme slot -->
</template>
