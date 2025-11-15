<script setup lang="ts">
import { ref, computed, provide } from 'vue';
import { useCheckIn } from '../useCheckIn';
import AccordionItem from './AccordionDemoItem.vue';

// ==========================================
// Accordion Check-In Setup
// ==========================================

interface AccordionItemData {
  title: string;
  open?: boolean;
}

// ==========================================
// Parent: Accordion Container
// ==========================================
const { openDesk } = useCheckIn<AccordionItemData>();

const openItems = ref<Set<string | number>>(new Set());
const allowMultiple = ref(false);

// Le parent ouvre un desk et le fournit à ses enfants
const { desk, DeskInjectionKey: accordionDesk } = openDesk({
  context: {
    openItems,
    toggle: (id: string | number) => {
      if (openItems.value.has(id)) {
        openItems.value.delete(id);
      } else {
        if (!allowMultiple.value) {
          openItems.value.clear();
        }
        openItems.value.add(id);
      }
      // Force reactivity
      openItems.value = new Set(openItems.value);
    },
    isOpen: (id: string | number) => openItems.value.has(id),
  },
  onCheckIn: (id, data) => {
    if (data.open) {
      if (!allowMultiple.value) {
        openItems.value.clear();
      }
      openItems.value.add(id);
      openItems.value = new Set(openItems.value);
    }
  },
});

// Fournir le deskSymbol dans un objet aux enfants
provide('accordionDesk', { deskSymbol: accordionDesk });

const itemCount = computed(() => desk.getAll().length);
</script>

<template>
  <div class="w-full max-w-2xl mx-auto space-y-6 p-6">
    <div class="space-y-2">
      <h2 class="text-2xl font-bold">useCheckIn - Accordion Demo</h2>
      <p class="text-muted-foreground">Collapsible sections with check-in desk state management</p>
    </div>

    <!-- Controls -->
    <div class="flex items-center gap-4 p-4 bg-muted rounded-lg">
      <label class="flex items-center gap-2">
        <input v-model="allowMultiple" type="checkbox" class="rounded" />
        <span class="text-sm font-medium">Allow multiple open</span>
      </label>
      <span class="text-sm text-muted-foreground">{{ itemCount }} items registered</span>
    </div>

    <!-- Accordion Items -->
    <div class="border border-border rounded-lg divide-y divide-border">
      <AccordionItem id="item1" title="What is useCheckIn?" :open="true">
        <p class="text-muted-foreground">
          <strong>useCheckIn</strong> is a generic composable for managing parent-child component
          relationships using Vue's provide/inject pattern. Parent components open a "check-in desk"
          where children check in with their data, like passengers at an airport.
        </p>
      </AccordionItem>

      <AccordionItem id="item2" title="How does it work?">
        <ul class="space-y-2 text-muted-foreground list-disc list-inside">
          <li>Parent component opens a check-in desk using <code>openDesk()</code></li>
          <li>Child components check in using <code>checkIn()</code> with auto-registration</li>
          <li>Desk maintains a reactive Map of all checked-in items</li>
          <li>Changes propagate automatically through Vue's reactivity system</li>
        </ul>
      </AccordionItem>

      <AccordionItem id="item3" title="What are the benefits?">
        <div class="space-y-2 text-muted-foreground">
          <p><strong>Benefits include:</strong></p>
          <ul class="list-disc list-inside space-y-1 ml-4">
            <li>Type-safe with full TypeScript support</li>
            <li>Auto-cleanup when components unmount</li>
            <li>Flexible extra context for custom logic</li>
            <li>Automatic reactivity updates</li>
            <li>Reusable across different component types</li>
          </ul>
        </div>
      </AccordionItem>

      <AccordionItem id="item4" title="Common use cases">
        <div class="space-y-2 text-muted-foreground">
          <p>Common patterns that benefit from this approach:</p>
          <ul class="list-disc list-inside space-y-1 ml-4">
            <li>Tabs / Tab Panels</li>
            <li>Accordions / Collapsible sections</li>
            <li>Dropdown menus with items</li>
            <li>Form field registration</li>
            <li>Wizard steps</li>
            <li>List items with selection state</li>
          </ul>
        </div>
      </AccordionItem>
    </div>

    <!-- Debug Info -->
    <div class="p-4 bg-muted rounded-lg space-y-2">
      <h4 class="font-semibold">Debug Info</h4>
      <div class="text-sm space-y-1">
        <p><strong>Open Items:</strong> {{ Array.from(openItems).join(', ') || 'None' }}</p>
        <p><strong>Allow Multiple:</strong> {{ allowMultiple }}</p>
        <p>
          <strong>All Items:</strong>
          {{
            desk
              .getAll()
              .map((i) => `${i.id}: "${i.data.title}"`)
              .join(', ')
          }}
        </p>
      </div>
    </div>
  </div>
</template>
