<!--
  📅 Planificateur temporel (Timeline)
  Exemple d'utilisation de useDragDrop pour un calendrier horaire
-->
<script setup lang="ts">
import { ref, computed } from 'vue';
import { useElementBounding } from '@vueuse/core';
import { useDragDrop } from '../useDragDrop';

interface Event {
  id: string;
  title: string;
  startHour: number; // 0-23
  duration: number;  // en heures
  color: string;
  type: 'meeting' | 'task' | 'break' | 'personal';
}

const timeline = ref<HTMLElement | null>(null);
const timelineBounds = useElementBounding(timeline);

const events = ref<Event[]>([
  { 
    id: 'e1', 
    title: 'Team Standup', 
    startHour: 9, 
    duration: 0.5,
    color: 'bg-blue-500',
    type: 'meeting'
  },
  { 
    id: 'e2', 
    title: 'Deep Work Session', 
    startHour: 10, 
    duration: 2,
    color: 'bg-purple-500',
    type: 'task'
  },
  { 
    id: 'e3', 
    title: 'Lunch Break', 
    startHour: 12, 
    duration: 1,
    color: 'bg-green-500',
    type: 'break'
  },
  { 
    id: 'e4', 
    title: 'Client Meeting', 
    startHour: 14, 
    duration: 1.5,
    color: 'bg-red-500',
    type: 'meeting'
  },
  { 
    id: 'e5', 
    title: 'Code Review', 
    startHour: 16, 
    duration: 1,
    color: 'bg-indigo-500',
    type: 'task'
  },
]);

const HOUR_HEIGHT = 80; // pixels par heure
const START_HOUR = 6;
const END_HOUR = 22;
const WORK_START = 8;
const WORK_END = 18;

const { dragState, startDrag, handleDragOver, endDrag } = useDragDrop({
  unitSize: HOUR_HEIGHT,
  gap: 0,
  validatePlacement: (x, y, width, height) => {
    const endHour = y + height;
    // Vérifier qu'on reste dans les heures affichées et les heures de travail
    return y >= WORK_START && endHour <= WORK_END;
  },
});

const onDragStart = (event: DragEvent, evt: Event) => {
  startDrag(event, {
    id: evt.id,
    width: 1,
    height: evt.duration,
    data: evt,
  }, true);
};

const onDragOver = (event: DragEvent) => {
  const bounds = {
    left: timelineBounds.left.value,
    top: timelineBounds.top.value,
    right: timelineBounds.right.value,
    bottom: timelineBounds.bottom.value,
    width: timelineBounds.width.value,
    height: timelineBounds.height.value,
  };

  handleDragOver(event, bounds, (virtualBounds) => {
    // Calculer l'heure basée sur la position Y
    const relativeY = virtualBounds.top - bounds.top;
    const hour = START_HOUR + (relativeY / HOUR_HEIGHT);
    
    // Arrondir à 15 minutes (0.25h)
    const roundedHour = Math.round(hour * 4) / 4;
    
    return { 
      x: 0, 
      y: Math.max(START_HOUR, Math.min(END_HOUR, roundedHour))
    };
  });
};

const onDrop = (event: DragEvent) => {
  event.preventDefault();
  
  if (dragState.value.item && dragState.value.hoverPosition && dragState.value.isValid) {
    const evt = events.value.find(e => e.id === dragState.value.item!.id);
    if (evt) {
      evt.startHour = dragState.value.hoverPosition.y;
    }
  }
  
  endDrag();
};

const hours = computed(() => {
  return Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);
});

const formatHour = (hour: number) => {
  const h = hour % 12 || 12;
  const period = hour < 12 ? 'AM' : 'PM';
  return `${h}:00 ${period}`;
};

const getEventStyle = (event: Event) => {
  return {
    position: 'absolute' as const,
    left: '80px',
    right: '20px',
    top: `${(event.startHour - START_HOUR) * HOUR_HEIGHT}px`,
    height: `${event.duration * HOUR_HEIGHT}px`,
  };
};

const isWorkHour = (hour: number) => {
  return hour >= WORK_START && hour < WORK_END;
};

const selectedEvent = ref<string | null>(null);

const addEvent = () => {
  const newEvent: Event = {
    id: `e${Date.now()}`,
    title: 'New Event',
    startHour: 10,
    duration: 1,
    color: 'bg-slate-500',
    type: 'task',
  };
  events.value.push(newEvent);
  selectedEvent.value = newEvent.id;
};

const removeEvent = (id: string) => {
  events.value = events.value.filter(e => e.id !== id);
  if (selectedEvent.value === id) {
    selectedEvent.value = null;
  }
};
</script>

<template>
  <div class="w-full h-full p-8 bg-slate-50">
    <div class="max-w-4xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold">Daily Schedule</h2>
        <button
          @click="addEvent"
          class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          ➕ Add Event
        </button>
      </div>
      
      <div class="bg-white rounded-lg shadow-lg border overflow-hidden">
        <!-- Header -->
        <div class="px-6 py-3 bg-slate-100 border-b font-semibold">
          <div class="text-sm text-slate-600">
            {{ new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}
          </div>
        </div>
        
        <!-- Timeline -->
        <div class="relative overflow-auto max-h-[700px]">
          <div 
            ref="timeline"
            class="relative"
            :style="{ height: `${(END_HOUR - START_HOUR + 1) * HOUR_HEIGHT}px` }"
            @dragover="onDragOver"
            @drop="onDrop"
          >
            <!-- Hour slots -->
            <div
              v-for="hour in hours"
              :key="hour"
              :class="[
                'absolute left-0 right-0 border-b',
                isWorkHour(hour) ? 'bg-white' : 'bg-slate-50'
              ]"
              :style="{
                top: `${(hour - START_HOUR) * HOUR_HEIGHT}px`,
                height: `${HOUR_HEIGHT}px`,
              }"
            >
              <!-- Hour label -->
              <div class="absolute left-4 top-2 text-sm font-semibold text-slate-600">
                {{ formatHour(hour) }}
              </div>
              
              <!-- Quarter hour lines -->
              <div class="absolute left-16 right-0 top-1/4 border-t border-slate-200"></div>
              <div class="absolute left-16 right-0 top-1/2 border-t border-slate-300"></div>
              <div class="absolute left-16 right-0 top-3/4 border-t border-slate-200"></div>
            </div>
            
            <!-- Work hours overlay -->
            <div
              class="absolute left-0 right-0 border-2 border-blue-200 border-dashed pointer-events-none"
              :style="{
                top: `${(WORK_START - START_HOUR) * HOUR_HEIGHT}px`,
                height: `${(WORK_END - WORK_START) * HOUR_HEIGHT}px`,
              }"
            >
              <div class="absolute left-2 top-2 text-xs text-blue-600 font-semibold bg-white px-2 py-1 rounded">
                Work Hours
              </div>
            </div>
            
            <!-- Events -->
            <div
              v-for="event in events"
              :key="event.id"
              :style="getEventStyle(event)"
              :class="[
                'rounded-lg shadow-md cursor-move transition-all p-3',
                'border-l-4',
                event.color,
                'text-white',
                selectedEvent === event.id ? 'ring-4 ring-blue-300' : '',
                dragState.isDragging && dragState.item?.id === event.id ? 'opacity-40' : 'opacity-100',
              ]"
              draggable="true"
              @dragstart="onDragStart($event, event)"
              @dragend="endDrag"
              @click="selectedEvent = event.id"
              @dblclick="removeEvent(event.id)"
            >
              <div class="font-semibold text-sm">{{ event.title }}</div>
              <div class="text-xs opacity-90 mt-1">
                {{ formatHour(event.startHour) }} - {{ formatHour(event.startHour + event.duration) }}
                ({{ event.duration }}h)
              </div>
              <div class="text-xs opacity-75 mt-1 capitalize">
                {{ event.type }}
              </div>
            </div>
            
            <!-- Hover preview -->
            <div
              v-if="dragState.isDragging && dragState.hoverPosition && dragState.item"
              :style="{
                position: 'absolute',
                left: '80px',
                right: '20px',
                top: `${(dragState.hoverPosition.y - START_HOUR) * HOUR_HEIGHT}px`,
                height: `${dragState.item.height * HOUR_HEIGHT}px`,
              }"
              :class="[
                'rounded-lg pointer-events-none',
                dragState.isValid 
                  ? 'border-2 border-green-400 bg-green-100 bg-opacity-30' 
                  : 'border-2 border-red-400 bg-red-100 bg-opacity-30'
              ]"
            >
              <div class="p-2 text-sm font-semibold" :class="dragState.isValid ? 'text-green-700' : 'text-red-700'">
                {{ formatHour(dragState.hoverPosition.y) }}
                {{ dragState.isValid ? '✓' : '✗' }}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Instructions -->
      <div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 class="font-semibold text-sm text-blue-900 mb-2">💡 Instructions</h3>
        <ul class="text-sm text-blue-800 space-y-1">
          <li>• Drag events to reschedule them</li>
          <li>• Events snap to 15-minute intervals</li>
          <li>• Can only place events during work hours (8 AM - 6 PM)</li>
          <li>• Click to select, double-click to delete</li>
        </ul>
      </div>
    </div>
  </div>
</template>
