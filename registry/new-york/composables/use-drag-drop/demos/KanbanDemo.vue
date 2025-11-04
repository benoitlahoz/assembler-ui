<!--
  📋 Liste de tâches réorganisables (Kanban)
  Exemple d'utilisation de useDragDrop pour un système Kanban
-->
<script setup lang="ts">
import { ref } from 'vue';
import { useDragDrop } from '../useDragDrop';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'doing' | 'done';
}

const tasks = ref<Task[]>([
  { 
    id: '1', 
    title: 'Design UI mockups', 
    description: 'Create Figma designs for new feature',
    status: 'todo' 
  },
  { 
    id: '2', 
    title: 'Implement drag and drop', 
    description: 'Build reusable composable',
    status: 'doing' 
  },
  { 
    id: '3', 
    title: 'Write documentation', 
    description: 'Add examples and API docs',
    status: 'doing' 
  },
  { 
    id: '4', 
    title: 'Deploy to production', 
    description: 'Release version 1.0',
    status: 'done' 
  },
]);

const { dragState, startDrag, endDrag } = useDragDrop({
  unitSize: 60, // Hauteur approximative d'une tâche
  gap: 8,
});

const onDragStart = (event: DragEvent, task: Task) => {
  startDrag(event, {
    id: task.id,
    width: 1,
    height: 1,
    data: task,
  }, true);
};

const onDrop = (event: DragEvent, newStatus: Task['status']) => {
  event.preventDefault();
  
  if (dragState.value.item?.data) {
    const task = tasks.value.find(t => t.id === dragState.value.item!.id);
    if (task) {
      task.status = newStatus;
    }
  }
  
  endDrag();
};

const getColumnTasks = (status: Task['status']) => {
  return tasks.value.filter(t => t.status === status);
};

const columnConfig = {
  todo: { label: 'À faire', color: 'bg-slate-100' },
  doing: { label: 'En cours', color: 'bg-blue-100' },
  done: { label: 'Terminé', color: 'bg-green-100' },
};
</script>

<template>
  <div class="w-full h-full p-8 bg-slate-50">
    <h2 class="text-2xl font-bold mb-6">Kanban Board</h2>
    
    <div class="flex gap-6">
      <div
        v-for="(config, status) in columnConfig"
        :key="status"
        class="flex-1 min-w-0"
      >
        <div 
          class="bg-white rounded-lg shadow-sm overflow-hidden"
        >
          <!-- En-tête de colonne -->
          <div :class="['px-4 py-3 font-semibold border-b', config.color]">
            {{ config.label }}
            <span class="ml-2 text-sm opacity-70">
              ({{ getColumnTasks(status as Task['status']).length }})
            </span>
          </div>
          
          <!-- Zone de drop -->
          <div
            class="p-4 min-h-[500px] space-y-3"
            @dragover.prevent
            @drop="onDrop($event, status as Task['status'])"
          >
            <!-- Cartes de tâches -->
            <div
              v-for="task in getColumnTasks(status as Task['status'])"
              :key="task.id"
              draggable="true"
              @dragstart="onDragStart($event, task)"
              @dragend="endDrag"
              :class="[
                'bg-white border rounded-lg p-4 cursor-move transition-all',
                'hover:shadow-md hover:border-blue-300',
                dragState.isDragging && dragState.item?.id === task.id 
                  ? 'opacity-50 scale-95' 
                  : 'opacity-100 scale-100'
              ]"
            >
              <h3 class="font-semibold text-sm mb-2">{{ task.title }}</h3>
              <p class="text-xs text-slate-600">{{ task.description }}</p>
              
              <div class="mt-3 flex items-center gap-2">
                <div class="w-6 h-6 rounded-full bg-slate-300"></div>
                <span class="text-xs text-slate-500">#{{ task.id }}</span>
              </div>
            </div>
            
            <!-- Placeholder quand vide -->
            <div
              v-if="getColumnTasks(status as Task['status']).length === 0"
              class="text-center text-slate-400 text-sm py-8"
            >
              Glissez une tâche ici
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Animation personnalisée pour le drag */
[draggable="true"] {
  transition: transform 0.2s, opacity 0.2s, box-shadow 0.2s;
}

[draggable="true"]:active {
  cursor: grabbing;
}
</style>
