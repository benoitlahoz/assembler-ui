<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRegistry } from '../useRegistry';
import TabPanel from './TabPanel.vue';
import { TabsRegistryKey } from './registry-keys';

// ==========================================
// Tabs Demo Setup
// ==========================================

// ==========================================
// 3. Parent Component Logic
// ==========================================
const { provider } = useRegistry();

const activeTab = ref<string>('tab1');
const tabCount = ref(0);

const context = provider(TabsRegistryKey, {
  extraContext: {
    activeTab,
    setActive: (id: string) => {
      const tab = context.get(id as string);
      if (tab && !tab.data.disabled) {
        activeTab.value = id as string;
      }
    },
  },
  onRegister: (id, data) => {
    console.log('Tab registered:', id, data);
    tabCount.value++;
    // Set first tab as active
    if (tabCount.value === 1) {
      activeTab.value = id as string;
    }
  },
  onUnregister: (id) => {
    console.log('Tab unregistered:', id);
    tabCount.value--;
  },
});

const allTabs = computed(() => context.getAll());
const activeTabData = computed(() => context.get(activeTab.value));
</script>

<template>
  <div class="w-full max-w-2xl mx-auto space-y-6 p-6">
    <div class="space-y-2">
      <h2 class="text-2xl font-bold">useRegistry - Tabs Demo</h2>
      <p class="text-muted-foreground">
        Example of a tabs system using the generic registry pattern
      </p>
    </div>

    <!-- Tabs Navigation -->
    <div class="border-b border-border">
      <div class="flex gap-2">
        <button
          v-for="tab in allTabs"
          :key="tab.id"
          :class="[
            'px-4 py-2 font-medium transition-colors border-b-2',
            activeTab === tab.id
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground',
            tab.data.disabled && 'opacity-50 cursor-not-allowed',
          ]"
          :disabled="tab.data.disabled"
          @click="context.setActive(tab.id as string)"
        >
          <span v-if="tab.data.icon" class="mr-2">{{ tab.data.icon }}</span>
          {{ tab.data.label }}
        </button>
      </div>
    </div>

    <!-- Tab Content -->
    <div class="p-4 border border-border rounded-lg">
      <TabPanel id="tab1" label="Profile" icon="👤">
        <div class="space-y-4">
          <h3 class="text-xl font-semibold">Profile Settings</h3>
          <p class="text-muted-foreground">Manage your profile information and preferences.</p>
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <span class="font-medium">Username:</span>
              <span>john.doe</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="font-medium">Email:</span>
              <span>john@example.com</span>
            </div>
          </div>
        </div>
      </TabPanel>

      <TabPanel id="tab2" label="Notifications" icon="🔔">
        <div class="space-y-4">
          <h3 class="text-xl font-semibold">Notification Settings</h3>
          <p class="text-muted-foreground">Configure how you receive notifications.</p>
          <div class="space-y-2">
            <label class="flex items-center gap-2">
              <input type="checkbox" class="rounded" checked />
              <span>Email notifications</span>
            </label>
            <label class="flex items-center gap-2">
              <input type="checkbox" class="rounded" />
              <span>Push notifications</span>
            </label>
          </div>
        </div>
      </TabPanel>

      <TabPanel id="tab3" label="Security" icon="🔒">
        <div class="space-y-4">
          <h3 class="text-xl font-semibold">Security Settings</h3>
          <p class="text-muted-foreground">Keep your account secure.</p>
          <div class="space-y-2">
            <button
              class="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Change Password
            </button>
            <button
              class="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80"
            >
              Enable 2FA
            </button>
          </div>
        </div>
      </TabPanel>

      <TabPanel id="tab4" label="Disabled Tab" :disabled="true" icon="❌">
        <div class="space-y-4">
          <h3 class="text-xl font-semibold">This tab is disabled</h3>
          <p class="text-muted-foreground">You should not see this content.</p>
        </div>
      </TabPanel>
    </div>

    <!-- Debug Info -->
    <div class="p-4 bg-muted rounded-lg space-y-2">
      <h4 class="font-semibold">Debug Info</h4>
      <div class="text-sm space-y-1">
        <p><strong>Active Tab:</strong> {{ activeTab }}</p>
        <p><strong>Active Tab Label:</strong> {{ activeTabData?.data.label }}</p>
        <p><strong>Total Tabs:</strong> {{ tabCount }}</p>
        <p><strong>Registered Tabs:</strong> {{ allTabs.map((t) => t.id).join(', ') }}</p>
      </div>
    </div>
  </div>
</template>
