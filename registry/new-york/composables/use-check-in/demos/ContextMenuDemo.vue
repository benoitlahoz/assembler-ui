<script setup lang="ts">
import { ref } from 'vue';
import ContextMenuProvider from './ContextMenuProvider.vue';
import ContextMenuItem from './ContextMenuItem.vue';

const showMenu = ref(false);
const menuX = ref(0);
const menuY = ref(0);
const lastAction = ref('');

const handleContextMenu = (event: MouseEvent) => {
  event.preventDefault();
  menuX.value = event.clientX;
  menuY.value = event.clientY;
  showMenu.value = true;
};

const closeMenu = () => {
  showMenu.value = false;
};

const handleAction = (action: string) => {
  lastAction.value = action;
  console.log('Action:', action);
};
</script>

<template>
  <div class="demo-container">
    <h2>Context Menu Pattern Demo</h2>
    <p>Faites un clic droit dans la zone ci-dessous pour afficher le menu contextuel.</p>

    <ContextMenuProvider :show="showMenu" :x="menuX" :y="menuY" @close="closeMenu">
      <!-- Items principaux -->
      <ContextMenuItem
        id="open"
        label="Open"
        icon="📂"
        :position="1"
        @click="handleAction('open')"
      />
      <ContextMenuItem
        id="copy"
        label="Copy"
        icon="📋"
        :position="2"
        @click="handleAction('copy')"
      />
      <ContextMenuItem
        id="paste"
        label="Paste"
        icon="📄"
        :position="3"
        @click="handleAction('paste')"
      />
      <ContextMenuItem
        id="rename"
        label="Rename"
        icon="✏️"
        :position="4"
        @click="handleAction('rename')"
      />

      <!-- Items dangereux -->
      <ContextMenuItem
        id="delete"
        label="Delete"
        icon="🗑️"
        danger
        :position="1"
        @click="handleAction('delete')"
      />
    </ContextMenuProvider>

    <!-- Zone cliquable -->
    <div class="context-area" @contextmenu="handleContextMenu">
      Right-click here to open the context menu
    </div>

    <!-- État actuel -->
    <div class="state-display">
      <h3>Last Action:</h3>
      <pre>{{ lastAction || 'None' }}</pre>
      <p class="hint">Menu Position: ({{ menuX }}, {{ menuY }})</p>
    </div>
  </div>
</template>

<style scoped>
.demo-container {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

h2 {
  margin-bottom: 0.5rem;
}

p {
  color: #6b7280;
  margin-bottom: 2rem;
}

.context-area {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  border: 2px dashed #d1d5db;
  border-radius: 0.375rem;
  background: #f9fafb;
  cursor: context-menu;
  user-select: none;
  transition: all 0.2s;
  font-size: 1.125rem;
  color: #6b7280;
}

.context-area:hover {
  border-color: #9ca3af;
  background: #f3f4f6;
}

.state-display {
  margin-top: 2rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.375rem;
}

.state-display h3 {
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #6b7280;
}

.state-display pre {
  font-family: monospace;
  margin: 0.5rem 0;
}

.state-display .hint {
  margin: 0.5rem 0 0;
  font-size: 0.75rem;
  color: #9ca3af;
}
</style>
