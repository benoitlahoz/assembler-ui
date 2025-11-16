<script setup lang="ts">
import { ref } from 'vue';
import ToolbarContainer from './ToolbarContainer.vue';
import ToolbarButton from './ToolbarButton.vue';

const showSearch = ref(false);
const isEditMode = ref(false);

const handleSave = () => {
  console.log('Save clicked');
};

const handleUndo = () => {
  console.log('Undo clicked');
};

const handleRedo = () => {
  console.log('Redo clicked');
};

const toggleSearch = () => {
  showSearch.value = !showSearch.value;
};

const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value;
};

const handleSettings = () => {
  console.log('Settings clicked');
};
</script>

<template>
  <div class="demo-container">
    <h2>Toolbar Pattern Demo</h2>
    <p>
      Les ToolbarButton sont dans le slot de ToolbarContainer et s'enregistrent automatiquement.
    </p>

    <ToolbarContainer desk-id="main-toolbar">
      <!-- Groupe Start: Actions primaires à gauche -->
      <ToolbarButton
        id="save"
        label="Save"
        icon="💾"
        group="start"
        :position="1"
        @click="handleSave"
      />
      <ToolbarButton
        id="undo"
        label="Undo"
        icon="↶"
        group="start"
        :position="2"
        :disabled="!isEditMode"
        @click="handleUndo"
      />
      <ToolbarButton
        id="redo"
        label="Redo"
        icon="↷"
        group="start"
        :position="3"
        :disabled="!isEditMode"
        @click="handleRedo"
      />

      <!-- Groupe Main: Actions centrales -->
      <ToolbarButton
        id="edit"
        :label="isEditMode ? 'View Mode' : 'Edit Mode'"
        icon="✏️"
        group="main"
        :position="1"
        @click="toggleEditMode"
      />

      <!-- Groupe End: Actions secondaires à droite -->
      <ToolbarButton
        id="search"
        :label="showSearch ? 'Hide Search' : 'Search'"
        icon="🔍"
        group="end"
        :position="1"
        @click="toggleSearch"
      />
      <ToolbarButton
        id="settings"
        label="Settings"
        icon="⚙️"
        group="end"
        :position="2"
        @click="handleSettings"
      />
    </ToolbarContainer>

    <!-- État actuel -->
    <div class="state-display">
      <h3>État actuel:</h3>
      <ul>
        <li>Edit Mode: {{ isEditMode ? 'ON' : 'OFF' }}</li>
        <li>Search: {{ showSearch ? 'Visible' : 'Hidden' }}</li>
        <li>Undo/Redo: {{ isEditMode ? 'Enabled' : 'Disabled' }}</li>
      </ul>
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
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: hsl(var(--foreground));
}

p {
  color: hsl(var(--muted-foreground));
  margin-bottom: 2rem;
}

.state-display {
  margin-top: 2rem;
  padding: 1rem;
  background: hsl(var(--muted) / 0.3);
  border-radius: var(--radius);
  border: 1px solid hsl(var(--border));
}

.state-display h3 {
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  color: hsl(var(--muted-foreground));
}

.state-display ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.state-display li {
  padding: 0.25rem 0;
  font-family: var(--font-mono);
  font-size: 0.875rem;
  color: hsl(var(--foreground));
}
</style>
