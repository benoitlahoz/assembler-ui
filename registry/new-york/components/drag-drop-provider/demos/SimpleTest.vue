<script setup lang="ts">
import { ref } from 'vue';
import DragDropProvider from '../DragDropProvider.vue';

const items = ref([
  { id: '1', title: 'Item 1', width: 1, height: 1 },
  { id: '2', title: 'Item 2', width: 1, height: 1 },
  { id: '3', title: 'Item 3', width: 1, height: 1 },
  { id: '4', title: 'Item 4', width: 1, height: 1 },
]);

// Index de l'item en cours de drag
const draggedIndex = ref<number | null>(null);

// Index de survol
const hoverIndex = ref<number | null>(null);

const handleDragStart = (index: number) => {
  draggedIndex.value = index;
  hoverIndex.value = null;
};

const handleDragOver = (index: number) => {
  if (draggedIndex.value === null || draggedIndex.value === index) return;
  hoverIndex.value = index;
};

const handleDrop = () => {
  if (draggedIndex.value === null || hoverIndex.value === null) {
    draggedIndex.value = null;
    hoverIndex.value = null;
    return;
  }

  // Réorganiser le tableau
  const draggedItem = items.value[draggedIndex.value];
  if (!draggedItem) return;

  const newItems = [...items.value];

  // Retirer l'item de son ancienne position
  newItems.splice(draggedIndex.value, 1);

  // Insérer à la nouvelle position
  newItems.splice(hoverIndex.value, 0, draggedItem);

  items.value = newItems;
  draggedIndex.value = null;
  hoverIndex.value = null;
};

const handleDragEnd = () => {
  draggedIndex.value = null;
  hoverIndex.value = null;
};
</script>

<template>
  <ClientOnly>
    <div class="p-8 bg-slate-50">
      <h2 class="text-2xl font-bold mb-4">Sortable List Demo</h2>
      <p class="text-gray-600 mb-6">Démo de liste réorganisable par drag & drop</p>

      <DragDropProvider :allow-collision="true">
        <template #default="{ dragState }">
          <div class="max-w-md space-y-3">
            <div
              v-for="(item, index) in items"
              :key="item.id"
              :class="[
                'p-4 bg-white border-2 rounded-lg cursor-move transition-all',
                draggedIndex === index
                  ? 'opacity-40 border-blue-500'
                  : hoverIndex === index
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 hover:border-blue-400',
              ]"
              draggable="true"
              @dragstart="handleDragStart(index)"
              @dragover.prevent="handleDragOver(index)"
              @drop="handleDrop"
              @dragend="handleDragEnd"
            >
              <div class="flex items-center gap-3">
                <div class="text-2xl">☰</div>
                <div class="font-semibold">{{ item.title }}</div>
              </div>
            </div>
          </div>

          <!-- Debug info -->
          <div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm max-w-md">
            <div class="font-semibold text-blue-900 mb-2">🔍 Drag State</div>
            <div class="space-y-1 text-blue-800">
              <div>Is Dragging: {{ dragState.isDragging }}</div>
              <div v-if="draggedIndex !== null">Dragged Index: {{ draggedIndex }}</div>
              <div v-if="hoverIndex !== null">Hover Index: {{ hoverIndex }}</div>
            </div>
          </div>

          <!-- Instructions -->
          <div class="p-4 bg-yellow-50 border border-yellow-200 rounded-lg max-w-md mt-4">
            <h3 class="font-semibold text-sm text-yellow-900 mb-2">💡 Instructions</h3>
            <ul class="text-sm text-yellow-800 space-y-1">
              <li>• Drag un item pour le déplacer</li>
              <li>• Drop sur un autre item pour échanger les positions</li>
              <li>• La liste se réorganise automatiquement</li>
            </ul>
          </div>
        </template>
      </DragDropProvider>
    </div>
  </ClientOnly>
</template>
