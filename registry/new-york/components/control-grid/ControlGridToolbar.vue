<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  useControlRegistry,
  type ControlDefinition,
} from '~~/registry/new-york/composables/use-control-registry/useControlRegistry';

interface Props {
  /**
   * Catégorie de contrôles à afficher (si non spécifié, affiche tous les contrôles)
   */
  category?: string;
  /**
   * Orientation de la toolbar
   */
  orientation?: 'horizontal' | 'vertical';
  /**
   * Taille des items dans la toolbar
   */
  itemSize?: number;
  /**
   * Espacement entre les items
   */
  gap?: number;
  /**
   * Afficher les labels des contrôles
   */
  showLabels?: boolean;
  /**
   * Taille des labels
   */
  labelSize?: 'sm' | 'md' | 'lg';
}

const props = withDefaults(defineProps<Props>(), {
  orientation: 'horizontal',
  itemSize: 60,
  gap: 8,
  showLabels: true,
  labelSize: 'sm',
});

const emit = defineEmits<{
  'control-selected': [control: ControlDefinition];
  'control-drag-start': [control: ControlDefinition, event: DragEvent];
}>();

const { getAllControls, getControlsByCategory } = useControlRegistry();

// Controls à afficher
const controls = computed(() => {
  if (props.category) {
    return getControlsByCategory(props.category);
  }
  return getAllControls();
});

// Grouper les contrôles par catégorie si aucune catégorie n'est spécifiée
const groupedControls = computed(() => {
  if (props.category) {
    return { [props.category]: controls.value };
  }

  const groups: Record<string, ControlDefinition[]> = {};
  controls.value.forEach((control) => {
    const category = control.category || 'Autres';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(control);
  });
  return groups;
});

// Classes pour les labels
const labelClasses = computed(() => {
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };
  return `${sizeClasses[props.labelSize]} font-medium truncate`;
});

// Gestion du drag
const handleDragStart = (event: DragEvent, control: ControlDefinition) => {
  if (!event.dataTransfer) return;

  const dragData = {
    id: `${control.id}-${Date.now()}`,
    width: control.defaultSize?.width || 1,
    height: control.defaultSize?.height || 1,
    component: control.component,
    color: control.color,
    ...control.defaultProps,
  };

  event.dataTransfer.effectAllowed = 'copy';
  event.dataTransfer.setData('application/json', JSON.stringify(dragData));

  emit('control-drag-start', control, event);
};

// Gestion du clic
const handleControlClick = (control: ControlDefinition) => {
  emit('control-selected', control);
};
</script>

<template>
  <div
    class="controls-toolbar flex bg-card border border-border rounded-lg shadow-sm"
    :class="{
      'flex-col overflow-y-auto': orientation === 'vertical',
      'flex-row overflow-x-auto': orientation === 'horizontal',
    }"
    :style="{
      '--item-size': `${itemSize}px`,
      '--gap-size': `${gap}px`,
    }"
  >
    <div
      v-for="(categoryControls, categoryName) in groupedControls"
      :key="categoryName"
      class="controls-group"
      :class="{
        'flex flex-col': orientation === 'vertical',
        'flex flex-row': orientation === 'horizontal',
      }"
    >
      <!-- Titre de la catégorie (si plusieurs catégories) -->
      <div
        v-if="!category && Object.keys(groupedControls).length > 1"
        class="category-header px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/50 sticky"
        :class="{
          'top-0': orientation === 'vertical',
          'left-0': orientation === 'horizontal',
        }"
      >
        {{ categoryName }}
      </div>

      <!-- Liste des contrôles -->
      <div
        class="controls-list flex"
        :class="{
          'flex-col': orientation === 'vertical',
          'flex-row': orientation === 'horizontal',
        }"
        :style="{ gap: `${gap}px`, padding: `${gap}px` }"
      >
        <div
          v-for="control in categoryControls"
          :key="control.id"
          class="control-item flex cursor-move select-none transition-all duration-200 hover:scale-105 active:cursor-grabbing active:opacity-70"
          :class="{
            'flex-col items-center': true,
            'min-w-(--item-size)': orientation === 'horizontal',
          }"
          :draggable="true"
          @dragstart="handleDragStart($event, control)"
          @click="handleControlClick(control)"
          :title="control.description || control.name"
        >
          <!-- Aperçu du contrôle -->
          <div
            class="control-preview relative flex items-center justify-center bg-background border-2 border-border rounded-lg overflow-hidden transition-all duration-200 hover:border-primary hover:shadow-md"
            :style="{
              width: `${itemSize}px`,
              height: `${itemSize}px`,
              backgroundColor: control.color ? `${control.color}20` : undefined,
              borderColor: control.color || undefined,
            }"
          >
            <!-- Icône du contrôle si disponible -->
            <div
              v-if="control.icon"
              class="control-icon text-2xl"
              :style="{ color: control.color }"
            >
              {{ control.icon }}
            </div>

            <!-- Aperçu miniature du composant -->
            <div
              v-else
              class="control-component-preview w-full h-full flex items-center justify-center p-2 pointer-events-none"
            >
              <component
                v-if="control.component"
                :is="control.component"
                v-bind="{ ...control.defaultProps, disabled: true }"
                class="scale-75 opacity-80"
              />
            </div>

            <!-- Badge de taille -->
            <div
              class="absolute bottom-1 right-1 px-1.5 py-0.5 text-[10px] font-mono bg-background/90 border border-border rounded"
            >
              {{ control.defaultSize?.width || 1 }}×{{ control.defaultSize?.height || 1 }}
            </div>
          </div>

          <!-- Label du contrôle -->
          <span
            v-if="showLabels"
            class="control-label mt-1 text-center max-w-full"
            :class="labelClasses"
            :style="{ maxWidth: `${itemSize}px` }"
          >
            {{ control.name }}
          </span>
        </div>
      </div>
    </div>

    <!-- Slot pour contenu personnalisé -->
    <slot :controls="controls" />
  </div>
</template>

<style scoped>
.controls-toolbar {
  --item-size: 60px;
  --gap-size: 8px;
}

/* Personnalisation de la scrollbar */
.controls-toolbar::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.controls-toolbar::-webkit-scrollbar-track {
  background: hsl(var(--muted));
  border-radius: 4px;
}

.controls-toolbar::-webkit-scrollbar-thumb {
  background: hsl(var(--muted-foreground) / 0.3);
  border-radius: 4px;
}

.controls-toolbar::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--muted-foreground) / 0.5);
}

/* Animation au survol */
.control-item:hover .control-preview {
  transform: translateY(-2px);
}

.control-item:active .control-preview {
  transform: translateY(0);
}
</style>
