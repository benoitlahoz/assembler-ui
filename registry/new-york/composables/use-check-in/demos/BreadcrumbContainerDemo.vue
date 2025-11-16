<script setup lang="ts">
import { provide } from 'vue';
import { useCheckIn } from '../useCheckIn';

export interface BreadcrumbItemData {
  label: string;
  href?: string;
  icon?: string;
  disabled?: boolean;
  onClick?: () => void;
}

const props = withDefaults(
  defineProps<{
    /** Identifiant du desk */
    deskId?: string;
    /** Séparateur personnalisé */
    separator?: string;
  }>(),
  {
    deskId: 'breadcrumb',
    separator: '/',
  }
);

// Créer le desk pour enregistrer les items
const { desk, DeskInjectionKey } = useCheckIn<BreadcrumbItemData>().createDesk({
  context: {},
  onBeforeCheckIn: (id, data) => {
    console.log('[BreadcrumbContainer] Item checking in:', id, data);
    return true;
  },
});

// Fournir le desk aux enfants
provide(DeskInjectionKey, desk);

// Récupérer tous les items triés par position
const items = desk.getGroup('breadcrumb', { sortBy: 'meta.position', order: 'asc' });
</script>

<template>
  <nav class="breadcrumb-container">
    <!-- Le slot contient les BreadcrumbItem qui s'enregistrent -->
    <slot />

    <!-- Rendu des breadcrumbs -->
    <ol class="breadcrumb-list">
      <li
        v-for="(item, index) in items"
        :key="item.id"
        class="breadcrumb-item"
        :class="{ 'is-disabled': item.data.disabled }"
      >
        <span v-if="item.data.icon" class="breadcrumb-icon">{{ item.data.icon }}</span>

        <a
          v-if="item.data.href && !item.data.disabled"
          :href="item.data.href"
          class="breadcrumb-link"
          @click.prevent="item.data.onClick"
        >
          {{ item.data.label }}
        </a>

        <span v-else class="breadcrumb-text">
          {{ item.data.label }}
        </span>

        <span v-if="index < items.length - 1" class="breadcrumb-separator">
          {{ separator }}
        </span>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.breadcrumb-container {
  padding: 0.5rem 0;
}

.breadcrumb-list {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  list-style: none;
  padding: 0;
  margin: 0;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
}

.breadcrumb-item.is-disabled {
  opacity: 0.5;
}

.breadcrumb-icon {
  font-size: 1rem;
}

.breadcrumb-link {
  color: hsl(var(--primary));
  text-decoration: none;
  cursor: pointer;
  transition: color 0.2s;
}

.breadcrumb-link:hover {
  text-decoration: underline;
  opacity: 0.8;
}

.breadcrumb-text {
  color: hsl(var(--muted-foreground));
}

.breadcrumb-separator {
  color: hsl(var(--muted-foreground));
  margin: 0 0.25rem;
  user-select: none;
}
</style>
