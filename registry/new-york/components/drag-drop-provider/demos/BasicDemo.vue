<script setup lang="ts">
import { ref } from 'vue';
import DragDropProvider from '../DragDropProvider.vue';

const sourceItems = ref([
  { id: '1', title: 'Item 1', description: 'Draggable item', width: 1, height: 1 },
  { id: '2', title: 'Item 2', description: 'Draggable item', width: 1, height: 1 },
  { id: '3', title: 'Item 3', description: 'Draggable item', width: 1, height: 1 },
]);

const droppedItems = ref<any[]>([]);

const clearDropped = () => {
  droppedItems.value = [];
};
</script>

<template>
  <ClientOnly>
    <div class="w-full h-full p-8 bg-slate-50">
      <div class="max-w-4xl mx-auto space-y-6">
        <div>
          <h2 class="text-2xl font-bold mb-2">DragDropProvider - Basic Demo</h2>
          <p class="text-gray-600">
            Utilisation du pattern Provider/Context pour partager la configuration drag-drop
          </p>
        </div>

        <!-- Configuration partagée via DragDropProvider -->
        <DragDropProvider :allow-collision="true">
          <template #default="{ dragState, startDrag, handleDragOver, endDrag }">
            <div class="grid md:grid-cols-2 gap-6">
              <!-- Source -->
              <div>
                <h3 class="font-semibold mb-3">📦 Source Items</h3>
                <div class="space-y-3">
                  <div
                    v-for="item in sourceItems"
                    :key="item.id"
                    :class="[
                      'p-4 rounded-lg border-2 cursor-move transition-all',
                      dragState.isDragging && dragState.item?.id === item.id
                        ? 'opacity-40 border-blue-500'
                        : 'border-gray-300 hover:border-blue-400',
                    ]"
                    draggable="true"
                    @dragstart="startDrag($event, item, true)"
                    @dragend="endDrag"
                  >
                    <div class="font-semibold">{{ item.title }}</div>
                    <div class="text-sm text-gray-600">{{ item.description }}</div>
                  </div>
                </div>
              </div>

              <!-- Drop Zone -->
              <div>
                <div class="flex items-center justify-between mb-3">
                  <h3 class="font-semibold">📥 Drop Zone</h3>
                  <button
                    v-if="droppedItems.length > 0"
                    @click="clearDropped"
                    class="text-sm px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Clear
                  </button>
                </div>

                <div
                  :class="[
                    'min-h-[200px] p-6 rounded-lg border-2 border-dashed transition-colors',
                    dragState.isDragging
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 bg-gray-50',
                  ]"
                  @dragover="
                    (e) =>
                      handleDragOver(
                        e,
                        { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 },
                        () => ({ x: 0, y: 0 })
                      )
                  "
                  @drop="
                    (e) => {
                      e.preventDefault();
                      if (dragState.item && dragState.isValid) {
                        droppedItems.push({ ...dragState.item, id: `dropped-${Date.now()}` });
                      }
                      endDrag();
                    }
                  "
                >
                  <div class="text-center text-gray-500 mb-4">
                    {{ dragState.isDragging ? '📥 Drop here!' : '⬇️ Drop zone' }}
                  </div>

                  <div v-if="droppedItems.length > 0" class="space-y-2">
                    <div
                      v-for="item in droppedItems"
                      :key="item.id"
                      class="p-3 bg-white rounded border border-green-300"
                    >
                      <div class="font-medium">{{ item.title }}</div>
                      <div class="text-xs text-gray-500">Dropped successfully!</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Debug info -->
            <div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm">
              <div class="font-semibold text-blue-900 mb-2">🔍 Drag State</div>
              <pre class="text-blue-800">{{ JSON.stringify(dragState, null, 2) }}</pre>
            </div>
          </template>
        </DragDropProvider>

        <!-- Instructions -->
        <div class="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 class="font-semibold text-sm text-yellow-900 mb-2">💡 Avantages du Provider</h3>
          <ul class="text-sm text-yellow-800 space-y-1">
            <li>✓ Configuration partagée entre tous les composants enfants</li>
            <li>✓ Pas besoin de passer les props manuellement</li>
            <li>✓ Accès au contexte via useDragDropContext()</li>
            <li>✓ État centralisé du drag-drop</li>
            <li>✓ Facilite la création de composants réutilisables</li>
          </ul>
        </div>
      </div>
    </div>
  </ClientOnly>
</template>
