<script setup lang="ts">
import { ref } from 'vue';
import DragDropProvider from '../DragDropProvider.vue';

const items = ref([
  { id: '1', title: 'Item 1', width: 1, height: 1 },
  { id: '2', title: 'Item 2', width: 1, height: 1 },
]);
</script>

<template>
  <div class="p-8">
    <h2 class="text-2xl font-bold mb-4">Test DragDropProvider</h2>

    <DragDropProvider :allow-collision="true">
      <template #default="{ dragState, startDrag, endDrag }">
        <div class="space-y-4">
          <div class="p-4 bg-blue-100 rounded">
            Provider is rendering!
            <br />
            Is Dragging: {{ dragState.isDragging }}
          </div>

          <div
            v-for="item in items"
            :key="item.id"
            class="p-4 bg-white border rounded cursor-move"
            draggable="true"
            @dragstart="(e) => startDrag(e, item, true)"
            @dragend="endDrag"
          >
            {{ item.title }}
          </div>
        </div>
      </template>
    </DragDropProvider>
  </div>
</template>
