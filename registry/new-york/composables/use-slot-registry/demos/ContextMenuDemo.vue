<script setup lang="ts">
import { ref, h } from 'vue';
import { useSlotRegistry } from '../useSlotRegistry';
import ContextMenuItem from './ContextMenuItem.vue';

interface MenuScope {
  x: number;
  y: number;
  targetElement?: HTMLElement;
}

const { createSlotRegistry } = useSlotRegistry<MenuScope>();

const { registry, renderSlots } = createSlotRegistry({
  defaultSort: { by: 'position', order: 'asc' },
});

const isMenuOpen = ref(false);
const menuPosition = ref({ x: 0, y: 0 });
const targetElement = ref<HTMLElement | null>(null);

const openContextMenu = (event: MouseEvent) => {
  event.preventDefault();
  menuPosition.value = { x: event.clientX, y: event.clientY };
  targetElement.value = event.target as HTMLElement;
  isMenuOpen.value = true;
};

const closeMenu = () => {
  isMenuOpen.value = false;
  targetElement.value = null;
};

// Fermer au clic en dehors
const handleClickOutside = (event: MouseEvent) => {
  const menu = document.getElementById('context-menu');
  if (menu && !menu.contains(event.target as Node)) {
    closeMenu();
  }
};

// Ajouter/retirer le listener
const toggleMenuListener = (open: boolean) => {
  if (open) {
    document.addEventListener('click', handleClickOutside);
  } else {
    document.removeEventListener('click', handleClickOutside);
  }
};

// Watch isMenuOpen
watch(isMenuOpen, toggleMenuListener);

onUnmounted(() => {
  toggleMenuListener(false);
});

const menuScope = computed(
  (): MenuScope => ({
    x: menuPosition.value.x,
    y: menuPosition.value.y,
    targetElement: targetElement.value || undefined,
  })
);
</script>

<template>
  <div class="w-full rounded-lg border bg-card p-6">
    <h3 class="mb-4 font-semibold">Context Menu Demo</h3>

    <!-- Zone avec menu contextuel -->
    <div
      class="flex min-h-48 cursor-context-menu items-center justify-center rounded border-2 border-dashed bg-muted/30 p-8"
      @contextmenu="openContextMenu"
    >
      <p class="text-muted-foreground">Clic droit ici pour ouvrir le menu contextuel</p>
    </div>

    <!-- Menu contextuel (rendu conditionnellement) -->
    <Teleport to="body">
      <div
        v-if="isMenuOpen"
        id="context-menu"
        class="fixed z-50 min-w-48 rounded-lg border bg-popover p-1 shadow-lg"
        :style="{
          left: `${menuPosition.x}px`,
          top: `${menuPosition.y}px`,
        }"
      >
        <component :is="() => renderSlots(menuScope)" />
      </div>
    </Teleport>

    <!-- Items du menu contextuel (s'enregistrent dynamiquement) -->
    <ContextMenuItem
      :registry="registry"
      label="Copier"
      icon="copy"
      :position="1"
      @select="
        () => {
          console.log('📋 Copier');
          closeMenu();
        }
      "
    />

    <ContextMenuItem
      :registry="registry"
      label="Couper"
      icon="scissors"
      :position="2"
      @select="
        () => {
          console.log('✂️ Couper');
          closeMenu();
        }
      "
    />

    <ContextMenuItem
      :registry="registry"
      label="Coller"
      icon="clipboard"
      :position="3"
      @select="
        () => {
          console.log('📄 Coller');
          closeMenu();
        }
      "
    />

    <ContextMenuItem
      :registry="registry"
      label="Supprimer"
      icon="trash"
      :position="4"
      variant="destructive"
      @select="
        () => {
          console.log('🗑️ Supprimer');
          closeMenu();
        }
      "
    />

    <ContextMenuItem
      :registry="registry"
      label="Propriétés"
      icon="info"
      :position="100"
      group="footer"
      @select="
        () => {
          console.log('ℹ️ Propriétés');
          closeMenu();
        }
      "
    />
  </div>
</template>

<script lang="ts">
import { watch, computed, onUnmounted } from 'vue';
</script>
