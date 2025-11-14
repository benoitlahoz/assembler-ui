<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRegistry } from '../useRegistry';
import ToolbarButton from './ToolbarButton.vue';
import ToolbarSeparator from './ToolbarSeparator.vue';
import { ToolbarRegistryKey } from './registry-keys';

// ==========================================
// Toolbar Registry Setup
// ==========================================

// ==========================================
// Parent: Toolbar Container
// ==========================================
const { provider } = useRegistry();

const activeTool = ref<string | number | null>(null);
const clickHistory = ref<Array<{ id: string | number; time: number }>>([]);

const context = provider(ToolbarRegistryKey, {
  extraContext: {
    activeTool,
    handleClick: (id: string | number, type: 'button' | 'toggle') => {
      clickHistory.value.push({ id, time: Date.now() });

      if (type === 'toggle') {
        activeTool.value = activeTool.value === id ? null : id;
      } else {
        // For buttons, just record the click
        console.log(`Button clicked: ${id}`);
      }
    },
    isActive: (id: string | number) => activeTool.value === id,
  },
  onRegister: (id, data) => {
    console.log('Tool registered:', id, data);
  },
});

const allTools = computed(() =>
  context.getAll().sort((a, b) => String(a.id).localeCompare(String(b.id)))
);

const lastAction = computed(() => {
  const last = clickHistory.value[clickHistory.value.length - 1];
  if (!last) return 'None';
  const tool = context.get(last.id);
  return `${tool?.data.label || last.id} at ${new Date(last.time).toLocaleTimeString()}`;
});
</script>

<template>
  <div class="w-full max-w-4xl mx-auto space-y-6 p-6">
    <div class="space-y-2">
      <h2 class="text-2xl font-bold">useRegistry - Toolbar Demo</h2>
      <p class="text-muted-foreground">
        Dynamic toolbar with buttons, toggles, and separators managed by registry
      </p>
    </div>

    <!-- Toolbar -->
    <div class="border border-border rounded-lg p-2 bg-background">
      <div class="flex items-center gap-1">
        <ToolbarButton id="new" label="New" icon="📄" type="button" />
        <ToolbarButton id="open" label="Open" icon="📂" type="button" />
        <ToolbarButton id="save" label="Save" icon="💾" type="button" />

        <ToolbarSeparator id="sep1" />

        <ToolbarButton id="bold" label="Bold" icon="B" type="toggle" />
        <ToolbarButton id="italic" label="Italic" icon="I" type="toggle" />
        <ToolbarButton id="underline" label="Underline" icon="U" type="toggle" />

        <ToolbarSeparator id="sep2" />

        <ToolbarButton id="align-left" label="Align Left" icon="⬅️" type="toggle" />
        <ToolbarButton id="align-center" label="Align Center" icon="⏸️" type="toggle" />
        <ToolbarButton id="align-right" label="Align Right" icon="➡️" type="toggle" />

        <ToolbarSeparator id="sep3" />

        <ToolbarButton id="disabled" label="Disabled" icon="🚫" type="button" :disabled="true" />
      </div>
    </div>

    <!-- Active States -->
    <div class="grid grid-cols-2 gap-4">
      <div class="p-4 border border-border rounded-lg">
        <h3 class="font-semibold mb-2">Active Toggles</h3>
        <div class="text-sm text-muted-foreground">
          {{ activeTool ? context.get(activeTool)?.data.label : 'None' }}
        </div>
      </div>

      <div class="p-4 border border-border rounded-lg">
        <h3 class="font-semibold mb-2">Last Action</h3>
        <div class="text-sm text-muted-foreground">
          {{ lastAction }}
        </div>
      </div>
    </div>

    <!-- Debug Info -->
    <div class="p-4 bg-muted rounded-lg space-y-2">
      <h4 class="font-semibold">Debug Info</h4>
      <div class="text-sm space-y-1">
        <p><strong>Total Tools:</strong> {{ allTools.length }}</p>
        <p>
          <strong>Registered IDs:</strong>
          {{ allTools.map((t) => t.id).join(', ') }}
        </p>
        <p><strong>Click History:</strong> {{ clickHistory.length }} clicks</p>
      </div>
    </div>
  </div>
</template>
