<script setup lang="ts">
import { provide } from 'vue';
import { useCheckIn } from '../../../composables/use-check-in/useCheckIn';

export interface ToolbarItemData {
  label: string;
  icon?: string;
  disabled?: boolean;
  onClick?: () => void;
}

const props = withDefaults(
  defineProps<{
    /** Identifiant du desk (pour fournir un contexte unique) */
    deskId?: string;
  }>(),
  {
    deskId: 'toolbar',
  }
);

// Créer le desk pour enregistrer les boutons
const { desk, DeskInjectionKey } = useCheckIn<ToolbarItemData>().createDesk({
  context: {},
  onBeforeCheckIn: (id: string | number, data: ToolbarItemData) => {
    console.log('[ToolbarContainer] Button checking in:', id, data);
    return true;
  },
});

// Fournir le desk aux enfants (ToolbarButton)
provide(DeskInjectionKey, desk);

// Récupérer les items par groupe (tri par meta.position)
const startItems = desk.getGroup('start', { sortBy: 'meta.position', order: 'asc' });
const mainItems = desk.getGroup('main', { sortBy: 'meta.position', order: 'asc' });
const endItems = desk.getGroup('end', { sortBy: 'meta.position', order: 'asc' });
</script>

<template>
  <div class="toolbar-container">
    <!-- Le slot contient les ToolbarButton qui s'enregistrent automatiquement -->
    <slot />

    <!-- Rendu des boutons enregistrés par groupe -->
    <div class="toolbar-groups">
      <!-- Groupe Start -->
      <div v-if="startItems.length > 0" class="toolbar-group toolbar-start">
        <button
          v-for="item in startItems"
          :key="item.id"
          :disabled="item.data.disabled"
          @click="item.data.onClick"
          class="toolbar-button"
        >
          <span v-if="item.data.icon" class="icon">{{ item.data.icon }}</span>
          {{ item.data.label }}
        </button>
      </div>

      <!-- Groupe Main -->
      <div v-if="mainItems.length > 0" class="toolbar-group toolbar-main">
        <button
          v-for="item in mainItems"
          :key="item.id"
          :disabled="item.data.disabled"
          @click="item.data.onClick"
          class="toolbar-button"
        >
          <span v-if="item.data.icon" class="icon">{{ item.data.icon }}</span>
          {{ item.data.label }}
        </button>
      </div>

      <!-- Groupe End -->
      <div v-if="endItems.length > 0" class="toolbar-group toolbar-end">
        <button
          v-for="item in endItems"
          :key="item.id"
          :disabled="item.data.disabled"
          @click="item.data.onClick"
          class="toolbar-button"
        >
          <span v-if="item.data.icon" class="icon">{{ item.data.icon }}</span>
          {{ item.data.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.toolbar-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.toolbar-groups {
  display: flex;
  gap: 1rem;
  align-items: center;
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  background: white;
}

.toolbar-group {
  display: flex;
  gap: 0.5rem;
}

.toolbar-start {
  margin-right: auto;
}

.toolbar-main {
  flex: 1;
  justify-content: center;
}

.toolbar-end {
  margin-left: auto;
}

.toolbar-button {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.toolbar-button:hover:not(:disabled) {
  background: #f3f4f6;
}

.toolbar-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.icon {
  font-size: 1.25rem;
}
</style>
