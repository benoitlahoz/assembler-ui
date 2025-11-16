<script setup lang="ts">
import { watch, computed } from 'vue';
import { useCheckIn, createActiveItemPlugin } from '../index';
import { Button } from '@/components/ui/button';

interface TabData {
  label: string;
  content: string;
}

// Create desk with active item plugin
const { createDesk } = useCheckIn<TabData>();
const { desk } = createDesk('tabsDesk', {
  plugins: [createActiveItemPlugin()],
  debug: true,
});

// Type assertion for plugin methods
const deskWithActive = desk as typeof desk & {
  activeId: { value: string | number | null };
  setActive: (id: string | number | null) => boolean;
  getActive: () => any;
  clearActive: () => void;
  hasActive: boolean;
};

// Register tabs
desk.checkIn('tab1', { label: 'Tab 1', content: 'Content for tab 1' });
desk.checkIn('tab2', { label: 'Tab 2', content: 'Content for tab 2' });
desk.checkIn('tab3', { label: 'Tab 3', content: 'Content for tab 3' });

// Set initial active tab
deskWithActive.setActive('tab1');

// Get all tabs
const tabs = computed(() => desk.getAll());

// Get active tab data
const activeTab = computed(() => {
  const active = deskWithActive.getActive();
  return active?.data;
});

// Watch active changes
watch(
  () => deskWithActive.activeId.value,
  (id) => {
    console.log('Active tab changed:', id);
  }
);

const handleTabClick = (id: string | number) => {
  deskWithActive.setActive(id);
};
</script>

<template>
  <div class="w-full max-w-2xl mx-auto p-6 space-y-4">
    <div class="space-y-2">
      <h2 class="text-2xl font-bold">Active Item Plugin Demo</h2>
      <p class="text-sm text-muted-foreground">
        This demo shows how the <code class="bg-muted px-1 rounded">createActiveItemPlugin</code>
        manages an active item in a tabs-like interface.
      </p>
    </div>

    <div class="border rounded-lg overflow-hidden">
      <!-- Tab Headers -->
      <div class="flex border-b bg-muted/30">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="px-4 py-2 font-medium transition-colors hover:bg-muted/50"
          :class="{
            'border-b-2 border-primary bg-background': deskWithActive.activeId.value === tab.id,
            'text-muted-foreground': deskWithActive.activeId.value !== tab.id,
          }"
          @click="handleTabClick(tab.id)"
        >
          {{ tab.data.label }}
        </button>
      </div>

      <!-- Tab Content -->
      <div class="p-6">
        <div v-if="activeTab">
          <h3 class="text-lg font-semibold mb-2">{{ activeTab.label }}</h3>
          <p class="text-muted-foreground">{{ activeTab.content }}</p>
        </div>
        <div v-else class="text-muted-foreground">No tab selected</div>
      </div>
    </div>

    <!-- Plugin Info -->
    <div class="space-y-2 p-4 bg-muted/30 rounded-lg">
      <h3 class="font-semibold">Plugin Methods Used:</h3>
      <ul class="text-sm space-y-1 list-disc list-inside text-muted-foreground">
        <li><code class="bg-background px-1 rounded">setActive(id)</code> - Set the active tab</li>
        <li>
          <code class="bg-background px-1 rounded">getActive()</code> - Get current active tab data
        </li>
        <li>
          <code class="bg-background px-1 rounded">activeId</code> - Reactive ref of active ID
        </li>
        <li>
          <code class="bg-background px-1 rounded">hasActive</code> - Computed boolean ({{
            deskWithActive.hasActive
          }})
        </li>
      </ul>
    </div>

    <!-- Actions -->
    <div class="flex gap-2">
      <Button variant="outline" @click="deskWithActive.clearActive?.()"> Clear Active </Button>
      <Button
        variant="outline"
        @click="
          () => {
            desk.checkIn('tab4', { label: 'Tab 4', content: 'New tab content' });
            deskWithActive.setActive('tab4');
          }
        "
      >
        Add New Tab
      </Button>
    </div>
  </div>
</template>
