<!--
  🎯 Drag depuis palette vers canvas
  Exemple d'utilisation de useDragDrop avec source externe
-->
<script setup lang="ts">
import { ref } from 'vue';
import { useElementBounding } from '@vueuse/core';
import { useDragDrop } from '../useDragDrop';

interface PaletteItem {
  id: string;
  label: string;
  type: string;
  emoji: string;
  color: string;
}

interface PlacedItem {
  id: string;
  x: number;
  y: number;
  type: string;
  emoji: string;
  color: string;
  label: string;
}

const palette: PaletteItem[] = [
  {
    id: 'circle',
    label: 'Circle',
    type: 'circle',
    emoji: '⭕',
    color: 'bg-red-100 border-red-300',
  },
  {
    id: 'square',
    label: 'Square',
    type: 'square',
    emoji: '⬜',
    color: 'bg-blue-100 border-blue-300',
  },
  {
    id: 'star',
    label: 'Star',
    type: 'star',
    emoji: '⭐',
    color: 'bg-yellow-100 border-yellow-300',
  },
  { id: 'heart', label: 'Heart', type: 'heart', emoji: '❤️', color: 'bg-pink-100 border-pink-300' },
  {
    id: 'diamond',
    label: 'Diamond',
    type: 'diamond',
    emoji: '💎',
    color: 'bg-purple-100 border-purple-300',
  },
  {
    id: 'rocket',
    label: 'Rocket',
    type: 'rocket',
    emoji: '🚀',
    color: 'bg-green-100 border-green-300',
  },
];

const canvas = ref<HTMLElement | null>(null);
const canvasBounds = useElementBounding(canvas);

const placedItems = ref<PlacedItem[]>([
  {
    id: 'demo-1',
    x: 100,
    y: 100,
    type: 'star',
    emoji: '⭐',
    color: 'bg-yellow-100 border-yellow-300',
    label: 'Star',
  },
]);

const { dragState, startDrag, handleDragOver, endDrag } = useDragDrop({
  unitSize: 80,
  gap: 0,
});

const onDragFromPalette = (event: DragEvent, item: PaletteItem) => {
  startDrag(
    event,
    {
      id: `${item.id}-${Date.now()}`,
      width: 80,
      height: 80,
      data: item,
    },
    false
  ); // fromContainer = false car vient de la palette
};

const onDragFromCanvas = (event: DragEvent, item: PlacedItem) => {
  startDrag(
    event,
    {
      id: item.id,
      width: 80,
      height: 80,
      data: item,
    },
    true
  ); // fromContainer = true car déjà sur le canvas
};

const onCanvasDragOver = (event: DragEvent) => {
  const bounds = {
    left: canvasBounds.left.value,
    top: canvasBounds.top.value,
    right: canvasBounds.right.value,
    bottom: canvasBounds.bottom.value,
    width: canvasBounds.width.value,
    height: canvasBounds.height.value,
  };

  handleDragOver(event, bounds, (virtualBounds) => ({
    x: Math.max(0, Math.round(virtualBounds.left - bounds.left)),
    y: Math.max(0, Math.round(virtualBounds.top - bounds.top)),
  }));
};

const onDropToCanvas = (event: DragEvent) => {
  event.preventDefault();

  if (!dragState.value.item || !dragState.value.hoverPosition) {
    endDrag();
    return;
  }

  if (dragState.value.fromContainer) {
    // Déplacer un item existant
    const item = placedItems.value.find((i) => i.id === dragState.value.item!.id);
    if (item) {
      item.x = dragState.value.hoverPosition.x;
      item.y = dragState.value.hoverPosition.y;
    }
  } else {
    // Ajouter un nouvel item depuis la palette
    const paletteData = dragState.value.item.data;
    placedItems.value.push({
      id: dragState.value.item.id,
      x: dragState.value.hoverPosition.x,
      y: dragState.value.hoverPosition.y,
      type: paletteData.type,
      emoji: paletteData.emoji,
      color: paletteData.color,
      label: paletteData.label,
    });
  }

  endDrag();
};

const removeItem = (id: string) => {
  placedItems.value = placedItems.value.filter((item) => item.id !== id);
};

const clearCanvas = () => {
  placedItems.value = [];
};

const selectedItem = ref<string | null>(null);
</script>

<template>
  <div class="w-full h-full flex bg-slate-50">
    <!-- Palette -->
    <aside class="w-64 bg-white border-r p-4 space-y-4">
      <div>
        <h3 class="font-bold text-lg mb-4">Shape Palette</h3>

        <div class="space-y-2">
          <div
            v-for="item in palette"
            :key="item.id"
            draggable="true"
            @dragstart="onDragFromPalette($event, item)"
            @dragend="endDrag"
            :class="[
              'p-4 rounded-lg border-2 cursor-move transition-all',
              'hover:shadow-md hover:scale-105',
              'flex items-center gap-3',
              item.color,
            ]"
          >
            <span class="text-3xl">{{ item.emoji }}</span>
            <span class="font-semibold text-sm">{{ item.label }}</span>
          </div>
        </div>
      </div>

      <div class="pt-4 border-t">
        <h4 class="font-semibold text-sm mb-3">Canvas Controls</h4>

        <button
          @click="clearCanvas"
          class="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm"
        >
          🗑️ Clear Canvas
        </button>

        <div class="mt-4 text-xs text-slate-600">
          <p class="font-semibold mb-1">Items: {{ placedItems.length }}</p>
        </div>
      </div>

      <div class="pt-4 border-t text-xs text-slate-500">
        <p class="font-semibold mb-2">💡 How to use:</p>
        <ul class="list-disc list-inside space-y-1">
          <li>Drag shapes from palette</li>
          <li>Drop on canvas to place</li>
          <li>Drag placed items to move</li>
          <li>Double-click to remove</li>
        </ul>
      </div>
    </aside>

    <!-- Canvas -->
    <div class="flex-1 p-8">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-2xl font-bold">Canvas</h2>
        <div class="text-sm text-slate-600">
          Drag shapes from the palette to place them on the canvas
        </div>
      </div>

      <div
        ref="canvas"
        class="relative w-full h-[700px] bg-white rounded-lg shadow-lg border-2 border-slate-200 overflow-hidden"
        @dragover="onCanvasDragOver"
        @drop="onDropToCanvas"
      >
        <!-- Grid pattern -->
        <div
          class="absolute inset-0 pointer-events-none opacity-10"
          style="
            background-image:
              linear-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px);
            background-size: 40px 40px;
          "
        ></div>

        <!-- Placed items -->
        <div
          v-for="item in placedItems"
          :key="item.id"
          :style="{
            position: 'absolute',
            left: `${item.x}px`,
            top: `${item.y}px`,
            width: '80px',
            height: '80px',
          }"
          :class="[
            'border-2 rounded-xl cursor-move transition-all',
            'flex items-center justify-center text-4xl',
            'hover:shadow-lg hover:scale-110',
            item.color,
            dragState.isDragging && dragState.item?.id === item.id
              ? 'opacity-40 scale-95'
              : 'opacity-100',
            selectedItem === item.id ? 'ring-4 ring-blue-400' : '',
          ]"
          draggable="true"
          @dragstart="onDragFromCanvas($event, item)"
          @dragend="endDrag"
          @click="selectedItem = item.id"
          @dblclick="removeItem(item.id)"
          :title="`${item.label} - Double-click to remove`"
        >
          {{ item.emoji }}
        </div>

        <!-- Hover preview -->
        <div
          v-if="dragState.isDragging && dragState.hoverPosition && dragState.item"
          :style="{
            position: 'absolute',
            left: `${dragState.hoverPosition.x}px`,
            top: `${dragState.hoverPosition.y}px`,
            width: '80px',
            height: '80px',
          }"
          class="border-2 border-dashed border-blue-400 bg-blue-100 bg-opacity-40 rounded-xl pointer-events-none flex items-center justify-center text-3xl"
        >
          {{ dragState.item.data?.emoji }}
        </div>

        <!-- Empty state -->
        <div
          v-if="placedItems.length === 0 && !dragState.isDragging"
          class="absolute inset-0 flex items-center justify-center text-slate-400 text-lg"
        >
          <div class="text-center">
            <div class="text-6xl mb-4">👈</div>
            <p>Drag shapes from the palette</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
