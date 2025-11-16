<script setup lang="ts">
import { provide, Teleport } from 'vue';
import { useCheckIn } from '../useCheckIn';

export interface ContextMenuItemData {
  label: string;
  icon?: string;
  disabled?: boolean;
  separator?: boolean;
  danger?: boolean;
  onClick?: () => void;
}

const props = withDefaults(
  defineProps<{
    /** Position X du menu */
    x?: number;
    /** Position Y du menu */
    y?: number;
    /** Afficher le menu */
    show?: boolean;
  }>(),
  {
    x: 0,
    y: 0,
    show: false,
  }
);

const emit = defineEmits<{
  close: [];
}>();

// Créer le desk pour enregistrer les items
const { desk, DeskInjectionKey } = useCheckIn<ContextMenuItemData>().createDesk({
  context: {},
});

// Fournir le desk aux enfants
provide(DeskInjectionKey, desk);

// Récupérer les items par groupe (actions, danger, etc.)
const mainItems = desk.getGroup('main', { sortBy: 'meta.position', order: 'asc' });
const dangerItems = desk.getGroup('danger', { sortBy: 'meta.position', order: 'asc' });

const handleItemClick = (item: any) => {
  if (!item.data.disabled && !item.data.separator) {
    item.data.onClick?.();
    emit('close');
  }
};

const handleBackdropClick = () => {
  emit('close');
};
</script>

<template>
  <div class="context-menu-provider">
    <!-- Le slot contient les ContextMenuItem qui s'enregistrent -->
    <slot />

    <!-- Rendu du menu via Teleport -->
    <Teleport to="body">
      <div v-if="show" class="context-menu-backdrop" @click="handleBackdropClick">
        <div class="context-menu" :style="{ top: `${y}px`, left: `${x}px` }" @click.stop>
          <!-- Items principaux -->
          <div v-if="mainItems.length > 0" class="menu-section">
            <button
              v-for="item in mainItems"
              :key="item.id"
              class="menu-item"
              :class="{
                'is-disabled': item.data.disabled,
                'is-separator': item.data.separator,
              }"
              :disabled="item.data.disabled"
              @click="handleItemClick(item)"
            >
              <span v-if="item.data.icon" class="menu-icon">{{ item.data.icon }}</span>
              <span class="menu-label">{{ item.data.label }}</span>
            </button>
          </div>

          <!-- Séparateur si les deux groupes ont des items -->
          <div v-if="mainItems.length > 0 && dangerItems.length > 0" class="menu-divider" />

          <!-- Items dangereux -->
          <div v-if="dangerItems.length > 0" class="menu-section">
            <button
              v-for="item in dangerItems"
              :key="item.id"
              class="menu-item is-danger"
              :class="{ 'is-disabled': item.data.disabled }"
              :disabled="item.data.disabled"
              @click="handleItemClick(item)"
            >
              <span v-if="item.data.icon" class="menu-icon">{{ item.data.icon }}</span>
              <span class="menu-label">{{ item.data.label }}</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.context-menu-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9998;
}

.context-menu {
  position: fixed;
  z-index: 9999;
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius);
  box-shadow: 0 10px 15px hsl(var(--foreground) / 0.1);
  min-width: 200px;
  padding: 0.25rem;
  animation: menuIn 0.15s ease-out;
}

@keyframes menuIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.menu-section {
  display: flex;
  flex-direction: column;
}

.menu-divider {
  height: 1px;
  background: hsl(var(--border));
  margin: 0.25rem 0;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s;
  border-radius: var(--radius);
  font-size: 0.875rem;
}

.menu-item:hover:not(.is-disabled) {
  background: hsl(var(--muted) / 0.5);
}

.menu-item.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.menu-item.is-danger {
  color: hsl(var(--destructive));
}

.menu-item.is-danger:hover:not(.is-disabled) {
  background: hsl(var(--destructive) / 0.1);
}

.menu-item.is-separator {
  border-bottom: 1px solid hsl(var(--border));
  margin-bottom: 0.25rem;
}

.menu-icon {
  font-size: 1rem;
}

.menu-label {
  flex: 1;
}
</style>
