<!--
  🎨 Éditeur de layout libre (style Figma)
  Exemple d'utilisation de useDragDrop pour un canvas libre
-->
<script setup lang="ts">
import { ref } from 'vue';
import { useElementBounding } from '@vueuse/core';
import { useDragDrop } from '../useDragDrop';

interface Widget {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'text' | 'image' | 'button' | 'box';
  label: string;
  color: string;
}

const canvas = ref<HTMLElement | null>(null);
const canvasBounds = useElementBounding(canvas);

const widgets = ref<Widget[]>([
  { 
    id: 'w1', 
    x: 50, 
    y: 50, 
    width: 200, 
    height: 100, 
    type: 'text',
    label: 'Text Block',
    color: 'bg-blue-100 border-blue-300'
  },
  { 
    id: 'w2', 
    x: 300, 
    y: 80, 
    width: 150, 
    height: 150, 
    type: 'image',
    label: '🖼️ Image',
    color: 'bg-purple-100 border-purple-300'
  },
  { 
    id: 'w3', 
    x: 100, 
    y: 250, 
    width: 180, 
    height: 60, 
    type: 'button',
    label: 'Button Widget',
    color: 'bg-green-100 border-green-300'
  },
]);

const selectedWidget = ref<string | null>(null);

const { dragState, startDrag, handleDragOver, endDrag, getVirtualBounds } = useDragDrop({
  gap: 0,
  // Mode adaptatif : unitSize non défini
  // width et height seront en pixels directement
});

const onDragStart = (event: DragEvent, widget: Widget) => {
  selectedWidget.value = widget.id;
  
  startDrag(event, {
    id: widget.id,
    width: widget.width,
    height: widget.height,
    data: widget,
  }, true);
};

const onDragOver = (event: DragEvent) => {
  const bounds = {
    left: canvasBounds.left.value,
    top: canvasBounds.top.value,
    right: canvasBounds.right.value,
    bottom: canvasBounds.bottom.value,
    width: canvasBounds.width.value,
    height: canvasBounds.height.value,
  };

  handleDragOver(event, bounds, (virtualBounds) => {
    // Retourner la position en pixels relative au canvas
    return {
      x: Math.round(virtualBounds.left - bounds.left),
      y: Math.round(virtualBounds.top - bounds.top),
    };
  });
};

const onDrop = (event: DragEvent) => {
  event.preventDefault();
  
  if (dragState.value.item && dragState.value.hoverPosition) {
    const widget = widgets.value.find(w => w.id === dragState.value.item!.id);
    if (widget) {
      widget.x = dragState.value.hoverPosition.x;
      widget.y = dragState.value.hoverPosition.y;
    }
  }
  
  endDrag();
  selectedWidget.value = null;
};

const deleteWidget = (id: string) => {
  widgets.value = widgets.value.filter(w => w.id !== id);
  if (selectedWidget.value === id) {
    selectedWidget.value = null;
  }
};

const addWidget = (type: Widget['type']) => {
  const newWidget: Widget = {
    id: `w${Date.now()}`,
    x: 20,
    y: 20,
    width: type === 'button' ? 180 : type === 'image' ? 150 : 200,
    height: type === 'button' ? 60 : type === 'image' ? 150 : 100,
    type,
    label: type === 'text' ? 'Text Block' : type === 'image' ? '🖼️ Image' : 'Button',
    color: type === 'text' ? 'bg-blue-100 border-blue-300' : 
           type === 'image' ? 'bg-purple-100 border-purple-300' : 
           'bg-green-100 border-green-300',
  };
  
  widgets.value.push(newWidget);
};
</script>

<template>
  <div class="w-full h-full flex bg-slate-50">
    <!-- Toolbar -->
    <aside class="w-64 bg-white border-r p-4">
      <h3 class="font-bold text-lg mb-4">Widgets</h3>
      
      <div class="space-y-2">
        <button
          @click="addWidget('text')"
          class="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          ➕ Text Block
        </button>
        
        <button
          @click="addWidget('image')"
          class="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition"
        >
          ➕ Image
        </button>
        
        <button
          @click="addWidget('button')"
          class="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
        >
          ➕ Button
        </button>
      </div>
      
      <div v-if="selectedWidget" class="mt-8 p-3 bg-slate-100 rounded">
        <h4 class="font-semibold text-sm mb-2">Selected</h4>
        <p class="text-xs text-slate-600 mb-2">{{ selectedWidget }}</p>
        <button
          @click="deleteWidget(selectedWidget)"
          class="text-xs px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        >
          🗑️ Delete
        </button>
      </div>
      
      <div class="mt-8 text-xs text-slate-500">
        <p class="mb-1">💡 Tips:</p>
        <ul class="list-disc list-inside space-y-1">
          <li>Drag widgets to reposition</li>
          <li>Click to select</li>
          <li>Add new widgets from buttons</li>
        </ul>
      </div>
    </aside>

    <!-- Canvas -->
    <div class="flex-1 p-8 overflow-auto">
      <div 
        ref="canvas"
        class="relative w-full h-[800px] bg-white rounded-lg shadow-inner border-2 border-dashed border-slate-300"
        @dragover="onDragOver"
        @drop="onDrop"
      >
        <!-- Grid background (optional) -->
        <div 
          class="absolute inset-0 pointer-events-none opacity-20"
          style="
            background-image: 
              linear-gradient(rgba(0,0,0,.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,.05) 1px, transparent 1px);
            background-size: 20px 20px;
          "
        ></div>
        
        <!-- Widgets -->
        <div
          v-for="widget in widgets"
          :key="widget.id"
          :style="{
            position: 'absolute',
            left: `${widget.x}px`,
            top: `${widget.y}px`,
            width: `${widget.width}px`,
            height: `${widget.height}px`,
          }"
          :class="[
            'border-2 rounded-lg cursor-move transition-all flex items-center justify-center',
            widget.color,
            selectedWidget === widget.id ? 'ring-2 ring-blue-500 ring-offset-2' : '',
            dragState.isDragging && dragState.item?.id === widget.id ? 'opacity-50' : 'opacity-100',
          ]"
          draggable="true"
          @click="selectedWidget = widget.id"
          @dragstart="onDragStart($event, widget)"
          @dragend="endDrag"
        >
          <span class="font-semibold text-sm select-none">{{ widget.label }}</span>
        </div>
        
        <!-- Hover indicator -->
        <div
          v-if="dragState.isDragging && dragState.hoverPosition && dragState.item"
          :style="{
            position: 'absolute',
            left: `${dragState.hoverPosition.x}px`,
            top: `${dragState.hoverPosition.y}px`,
            width: `${dragState.item.width}px`,
            height: `${dragState.item.height}px`,
          }"
          class="border-2 border-blue-400 bg-blue-100 bg-opacity-30 rounded-lg pointer-events-none"
        ></div>
      </div>
    </div>
  </div>
</template>
