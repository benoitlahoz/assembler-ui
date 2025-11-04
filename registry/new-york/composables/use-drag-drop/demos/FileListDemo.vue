<!--
  🗂️ Réorganisation de fichiers (style explorateur)
  Exemple d'utilisation de useDragDrop pour réordonner une liste
-->
<script setup lang="ts">
import { ref, computed } from 'vue';
import { useDragDrop } from '../useDragDrop';

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: string;
  order: number;
  icon: string;
}

const files = ref<FileItem[]>([
  { id: 'f1', name: 'README.md', type: 'file', size: '2.4 KB', order: 0, icon: '📄' },
  { id: 'f2', name: 'package.json', type: 'file', size: '1.2 KB', order: 1, icon: '📦' },
  { id: 'f3', name: 'src', type: 'folder', order: 2, icon: '📁' },
  { id: 'f4', name: 'components', type: 'folder', order: 3, icon: '📁' },
  { id: 'f5', name: 'index.ts', type: 'file', size: '845 B', order: 4, icon: '📄' },
  { id: 'f6', name: 'styles.css', type: 'file', size: '3.1 KB', order: 5, icon: '🎨' },
  { id: 'f7', name: 'utils', type: 'folder', order: 6, icon: '📁' },
  { id: 'f8', name: 'config.ts', type: 'file', size: '512 B', order: 7, icon: '⚙️' },
]);

const sortedFiles = computed(() => {
  return [...files.value].sort((a, b) => a.order - b.order);
});

const { dragState, startDrag, endDrag } = useDragDrop({
  unitSize: 48, // Hauteur d'un élément de liste
  gap: 4,
});

const dragOverIndex = ref<number | null>(null);

const onDragStart = (event: DragEvent, file: FileItem) => {
  startDrag(
    event,
    {
      id: file.id,
      width: 1,
      height: 1,
      data: file,
    },
    true
  );
};

const onDragOver = (event: DragEvent, index: number) => {
  event.preventDefault();

  if (!dragState.value.item) return;

  dragOverIndex.value = index;

  const targetFile = sortedFiles.value[index];
  if (!targetFile || dragState.value.item.id === targetFile.id) return;

  // Trouver l'index actuel de l'item draggé
  const draggedFile = files.value.find((f) => f.id === dragState.value.item!.id);
  if (!draggedFile) return;

  const currentIndex = sortedFiles.value.findIndex((f) => f.id === draggedFile.id);

  // Si on change de position, réorganiser
  if (currentIndex !== index) {
    // Réorganiser les ordres
    const newFiles = [...sortedFiles.value];
    newFiles.splice(currentIndex, 1);
    newFiles.splice(index, 0, draggedFile);

    // Mettre à jour les ordres
    newFiles.forEach((f, i) => {
      const file = files.value.find((file) => file.id === f.id);
      if (file) file.order = i;
    });
  }
};

const onDragLeave = () => {
  dragOverIndex.value = null;
};

const onDragEndHandler = () => {
  endDrag();
  dragOverIndex.value = null;
};

const selectedFile = ref<string | null>(null);

const selectFile = (id: string) => {
  selectedFile.value = selectedFile.value === id ? null : id;
};
</script>

<template>
  <div class="w-full h-full p-8 bg-slate-50">
    <div class="max-w-2xl mx-auto">
      <h2 class="text-2xl font-bold mb-6">File Explorer - Reorder Files</h2>

      <div class="bg-white rounded-lg shadow-sm border">
        <!-- Header -->
        <div class="px-4 py-3 bg-slate-100 border-b font-semibold text-sm flex items-center gap-4">
          <span class="flex-1">Name</span>
          <span class="w-24 text-right">Size</span>
          <span class="w-16 text-right">Type</span>
        </div>

        <!-- File list -->
        <div class="divide-y">
          <div
            v-for="(file, index) in sortedFiles"
            :key="file.id"
            draggable="true"
            @dragstart="onDragStart($event, file)"
            @dragover="onDragOver($event, index)"
            @dragleave="onDragLeave"
            @dragend="onDragEndHandler"
            @click="selectFile(file.id)"
            :class="[
              'px-4 py-3 cursor-move transition-all flex items-center gap-4',
              'hover:bg-slate-50',
              selectedFile === file.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : '',
              dragState.isDragging && dragState.item?.id === file.id ? 'opacity-40' : 'opacity-100',
              dragOverIndex === index && dragState.item?.id !== file.id
                ? 'border-t-2 border-t-blue-400'
                : '',
            ]"
          >
            <!-- Icon & Name -->
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <span class="text-2xl shrink-0">{{ file.icon }}</span>
              <span class="font-medium text-sm truncate">{{ file.name }}</span>
            </div>

            <!-- Size -->
            <span class="w-24 text-right text-sm text-slate-600">
              {{ file.size || '-' }}
            </span>

            <!-- Type -->
            <span class="w-16 text-right text-xs text-slate-500 capitalize">
              {{ file.type }}
            </span>
          </div>
        </div>

        <!-- Empty state -->
        <div v-if="files.length === 0" class="px-4 py-12 text-center text-slate-400">
          No files found
        </div>
      </div>

      <!-- Instructions -->
      <div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 class="font-semibold text-sm text-blue-900 mb-2">💡 Instructions</h3>
        <ul class="text-sm text-blue-800 space-y-1">
          <li>• Drag and drop files to reorder them</li>
          <li>• Click on a file to select it</li>
          <li>• The list maintains the order automatically</li>
        </ul>
      </div>

      <!-- Debug info -->
      <div v-if="dragState.isDragging" class="mt-4 p-3 bg-slate-100 rounded text-xs font-mono">
        <div>Dragging: {{ dragState.item?.data?.name }}</div>
        <div>Is Valid: {{ dragState.isValid }}</div>
      </div>
    </div>
  </div>
</template>
