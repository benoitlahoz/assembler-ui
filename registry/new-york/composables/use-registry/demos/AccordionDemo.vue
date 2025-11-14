<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRegistry } from '../useRegistry';
import AccordionItem from './AccordionItem.vue';
import { AccordionRegistryKey } from './registry-keys';

// ==========================================
// Accordion Registry Setup
// ==========================================

// ==========================================
// Parent: Accordion Container
// ==========================================
const { provider } = useRegistry();

const openItems = ref<Set<string | number>>(new Set());
const allowMultiple = ref(false);

const context = provider(AccordionRegistryKey, {
  extraContext: {
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
  onRegister: (id, data) => {
    if (data.open) {
      if (!allowMultiple.value) {
        openItems.value.clear();
      }
      openItems.value.add(id);
      openItems.value = new Set(openItems.value);
    }
  },
});

const itemCount = computed(() => context.getAll().length);
</script>

<template>
  <div class="w-full max-w-2xl mx-auto space-y-6 p-6">
    <div class="space-y-2">
      <h2 class="text-2xl font-bold">useRegistry - Accordion Demo</h2>
      <p class="text-muted-foreground">Collapsible sections with registry-based state management</p>
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
      <AccordionItem id="item1" title="What is useRegistry?" :open="true">
        <p class="text-muted-foreground">
          <strong>useRegistry</strong> is a generic composable for managing parent-child component
          relationships using Vue's provide/inject pattern. It creates a centralized registry where
          child components can auto-register themselves.
        </p>
      </AccordionItem>

      <AccordionItem id="item2" title="How does it work?">
        <ul class="space-y-2 text-muted-foreground list-disc list-inside">
          <li>Parent component creates a registry context using <code>provider()</code></li>
          <li>Child components subscribe using <code>consumer()</code> with auto-registration</li>
          <li>Registry maintains a reactive Map of all registered items</li>
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
            context
              .getAll()
              .map((i) => `${i.id}: "${i.data.title}"`)
              .join(', ')
          }}
        </p>
      </div>
    </div>
  </div>
</template>
