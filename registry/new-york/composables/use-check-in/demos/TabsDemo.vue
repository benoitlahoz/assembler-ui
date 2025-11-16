<script setup lang="ts">
import { ref, computed, type Ref } from 'vue';
import { useCheckIn } from '../useCheckIn';
import TabPanel from './TabPanel.vue';

interface TabItemData {
  label: string;
  disabled?: boolean;
}

interface TabsDeskContext {
  activeTab: Ref<string>;
  setActive: (id: string) => void;
}

const { createDesk } = useCheckIn<TabItemData, TabsDeskContext>();

const activeTab = ref<string>('tab1');

const { desk } = createDesk('tabsDesk', {
  context: {
    activeTab,
    setActive: (id: string) => {
      const tab = desk.get(id);
      if (tab && !tab.data.disabled) {
        activeTab.value = id;
      }
    },
  },
  onCheckIn: (id, data) => {
    console.log(`✅ Tab "${data.label}" registered with id: ${id}`);
  },
  onCheckOut: (id) => {
    console.log(`❌ Tab with id: ${id} unregistered`);
    // Si l'onglet actif est fermé, passer au premier disponible
    if (activeTab.value === id) {
      const remainingTabs = desk.getAll();
      activeTab.value = remainingTabs[0]?.id.toString() || '';
    }
  },
});

const allTabs = computed(() => desk.getAll());
const activeTabData = computed(() => desk.get(activeTab.value));

// Simulation de l'ajout/suppression d'onglets
const tabCounter = ref(3);
const dynamicTabs = ref([
  { id: 'tab1', label: 'Introduction', content: 'Welcome to the tabs demo!' },
  { id: 'tab2', label: 'Features', content: 'Explore amazing features here.' },
  { id: 'tab3', label: 'Settings', content: 'Configure your preferences.' },
]);

const addTab = () => {
  tabCounter.value++;
  const newId = `tab${tabCounter.value}`;
  dynamicTabs.value.push({
    id: newId,
    label: `Tab ${tabCounter.value}`,
    content: `Dynamic content for tab ${tabCounter.value}`,
  });
  activeTab.value = newId;
};

const removeTab = (id: string) => {
  const index = dynamicTabs.value.findIndex((t) => t.id === id);
  if (index !== -1) {
    dynamicTabs.value.splice(index, 1);
  }
};
</script>

<template>
  <div class="w-full max-w-4xl mx-auto space-y-6 p-6">
    <!-- Header -->
    <div class="space-y-2">
      <h2 class="text-2xl font-bold">📑 Tabs Demo - useCheckIn</h2>
      <p class="text-muted-foreground">
        A simple tabs system using the check-in pattern. Each tab panel registers itself at the
        desk.
      </p>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-3 gap-4">
      <div class="bg-muted p-4 rounded-lg">
        <div class="text-sm text-muted-foreground">Total Tabs</div>
        <div class="text-2xl font-bold">{{ allTabs.length }}</div>
      </div>
      <div class="bg-muted p-4 rounded-lg">
        <div class="text-sm text-muted-foreground">Active Tab</div>
        <div class="text-lg font-bold truncate">{{ activeTabData?.data.label || 'None' }}</div>
      </div>
      <div class="bg-muted p-4 rounded-lg">
        <div class="text-sm text-muted-foreground">Tab ID</div>
        <div class="text-lg font-mono">{{ activeTab || 'N/A' }}</div>
      </div>
    </div>

    <!-- Tabs UI -->
    <div class="border border-border rounded-lg overflow-hidden">
      <!-- Tab Headers -->
      <div class="flex border-b border-border bg-muted/30">
        <button
          v-for="tab in allTabs"
          :key="tab.id"
          @click="desk.setActive(tab.id.toString())"
          :class="[
            'px-4 py-2 text-sm font-medium transition-colors relative',
            activeTab === tab.id
              ? 'bg-background text-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
            tab.data.disabled && 'opacity-50 cursor-not-allowed',
          ]"
          :disabled="tab.data.disabled"
        >
          {{ tab.data.label }}
          <div
            v-if="activeTab === tab.id"
            class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
          />
        </button>
      </div>

      <!-- Tab Content -->
      <div class="p-6">
        <TabPanel v-for="tab in dynamicTabs" :key="tab.id" :id="tab.id" :label="tab.label">
          <div class="space-y-4">
            <p class="text-lg">{{ tab.content }}</p>
            <div class="flex gap-2">
              <button
                @click="removeTab(tab.id)"
                class="px-3 py-1 bg-destructive text-destructive-foreground rounded text-sm hover:bg-destructive/90"
              >
                🗑️ Remove this tab
              </button>
            </div>
          </div>
        </TabPanel>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex gap-2">
      <button
        @click="addTab"
        class="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
      >
        ➕ Add New Tab
      </button>
    </div>

    <!-- Info -->
    <div class="text-xs text-muted-foreground space-y-1 border-t pt-4">
      <div><strong>💡 How it works:</strong></div>
      <div>• Parent creates a desk with <code>createDesk('tabsDesk', ...)</code></div>
      <div>• Each TabPanel auto-registers using <code>checkIn('tabsDesk', ...)</code></div>
      <div>• The desk tracks active tab and manages tab switching</div>
      <div>• Tabs are automatically cleaned up when unmounted</div>
    </div>
  </div>
</template>
