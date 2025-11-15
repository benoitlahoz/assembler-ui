<script setup lang="ts">
import { computed, inject, type InjectionKey } from 'vue';
import { useCheckIn, type CheckInDesk } from '../useCheckIn';

// Le type de données pour les items de l'accordéon
interface AccordionItemData {
  title: string;
  open?: boolean;
}

// Récupère le Symbol du desk fourni par le parent
const accordionDesk = inject<{ deskSymbol: InjectionKey<CheckInDesk<AccordionItemData>> }>(
  'accordionDesk'
)!;

const props = withDefaults(
  defineProps<{
    id: string;
    title: string;
    open?: boolean;
  }>(),
  {
    open: false,
  }
);

const { checkIn } = useCheckIn<AccordionItemData>();

const { desk } = checkIn(accordionDesk, {
  required: true,
  autoCheckIn: true,
  id: props.id,
  data: () => ({
    title: props.title,
    open: props.open,
  }),
  watchData: true,
});

const isOpen = computed(() => (desk as any)?.isOpen(props.id) || false);

const toggle = () => {
  (desk as any)?.toggle(props.id);
};
</script>

<template>
  <div class="accordion-item">
    <button
      :class="[
        'w-full px-4 py-3 flex items-center justify-between',
        'text-left font-medium hover:bg-muted/50 transition-colors',
      ]"
      @click="toggle"
    >
      <span>{{ title }}</span>
      <span :class="['transition-transform', isOpen && 'rotate-180']">▼</span>
    </button>
    <div v-show="isOpen" class="px-4 py-3 bg-muted/30">
      <slot />
    </div>
  </div>
</template>
