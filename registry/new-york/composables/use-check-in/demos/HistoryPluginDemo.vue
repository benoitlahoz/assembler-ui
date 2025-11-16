<script setup lang="ts">
import { ref, computed } from 'vue';
import { useCheckIn, createHistoryPlugin, type HistoryEntry } from '../index';
import { Button } from '@/components/ui/button';

interface TaskData {
  title: string;
  completed: boolean;
}

// Create desk with history plugin
const { createDesk } = useCheckIn<TaskData>();
const { desk } = createDesk('tasksDesk', {
  plugins: [createHistoryPlugin({ maxHistory: 50 })],
  debug: true,
});

// Type assertion for plugin methods
const deskWithHistory = desk as typeof desk & {
  history: { value: HistoryEntry<TaskData>[] };
  getHistory: () => HistoryEntry<TaskData>[];
  clearHistory: () => void;
  getLastHistory: (count: number) => HistoryEntry<TaskData>[];
  getHistoryByAction: (action: 'check-in' | 'check-out' | 'update') => HistoryEntry<TaskData>[];
};

// Initialize with some tasks
desk.checkIn('task1', { title: 'Learn useCheckIn', completed: false });
desk.checkIn('task2', { title: 'Build a demo', completed: false });
desk.checkIn('task3', { title: 'Write documentation', completed: false });

// Current tasks
const tasks = ref(desk.getAll());

// History computed
const history = computed(() => deskWithHistory.getHistory());
const checkInHistory = computed(() => deskWithHistory.getHistoryByAction('check-in'));
const checkOutHistory = computed(() => deskWithHistory.getHistoryByAction('check-out'));
const updateHistory = computed(() => deskWithHistory.getHistoryByAction('update'));

// Add task
const newTaskTitle = ref('');
const addTask = () => {
  if (!newTaskTitle.value.trim()) return;

  const taskId = `task-${Date.now()}`;
  desk.checkIn(taskId, {
    title: newTaskTitle.value,
    completed: false,
  });

  newTaskTitle.value = '';
  tasks.value = desk.getAll();
};

// Toggle task completion
const toggleTask = (id: string | number) => {
  const task = desk.get(id);
  if (task) {
    desk.update(id, { completed: !task.data.completed });
    tasks.value = desk.getAll();
  }
};

// Remove task
const removeTask = (id: string | number) => {
  desk.checkOut(id);
  tasks.value = desk.getAll();
};

// Format timestamp
const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString();
};

// Get action icon
const getActionIcon = (action: string) => {
  switch (action) {
    case 'check-in':
      return '➕';
    case 'check-out':
      return '➖';
    case 'update':
      return '✏️';
    default:
      return '•';
  }
};
</script>

<template>
  <div class="w-full max-w-4xl mx-auto p-6 space-y-6">
    <div class="space-y-2">
      <h2 class="text-2xl font-bold">History Plugin Demo</h2>
      <p class="text-sm text-muted-foreground">
        This demo shows how the <code class="bg-muted px-1 rounded">createHistoryPlugin</code>
        tracks all check-in, check-out, and update operations.
      </p>
    </div>

    <div class="grid md:grid-cols-2 gap-6">
      <!-- Tasks List -->
      <div class="border rounded-lg p-6 space-y-4">
        <h3 class="text-lg font-semibold">Tasks</h3>

        <!-- Add Task -->
        <div class="flex gap-2">
          <input
            v-model="newTaskTitle"
            type="text"
            placeholder="New task..."
            class="flex-1 px-3 py-2 border rounded-md"
            @keyup.enter="addTask"
          />
          <Button @click="addTask">Add</Button>
        </div>

        <!-- Tasks -->
        <div class="space-y-2">
          <div
            v-for="task in tasks"
            :key="task.id"
            class="flex items-center gap-2 p-2 hover:bg-muted/30 rounded"
          >
            <input
              type="checkbox"
              :checked="task.data.completed"
              class="w-4 h-4"
              @change="toggleTask(task.id)"
            />
            <span
              class="flex-1"
              :class="{ 'line-through text-muted-foreground': task.data.completed }"
            >
              {{ task.data.title }}
            </span>
            <Button variant="ghost" size="sm" @click="removeTask(task.id)"> × </Button>
          </div>

          <div v-if="tasks.length === 0" class="text-center py-8 text-muted-foreground">
            No tasks yet
          </div>
        </div>

        <div class="pt-4 border-t flex gap-2">
          <Button
            variant="outline"
            size="sm"
            @click="
              desk.clear();
              tasks = [];
            "
          >
            Clear All Tasks
          </Button>
          <Button variant="outline" size="sm" @click="deskWithHistory.clearHistory()">
            Clear History
          </Button>
        </div>
      </div>

      <!-- History -->
      <div class="border rounded-lg p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">Operation History</h3>
          <span class="text-sm text-muted-foreground">{{ history.length }} entries</span>
        </div>

        <!-- History Stats -->
        <div class="grid grid-cols-3 gap-2 text-center">
          <div class="p-2 bg-green-50 rounded border border-green-200">
            <div class="text-2xl font-bold text-green-700">{{ checkInHistory.length }}</div>
            <div class="text-xs text-green-600">Check-ins</div>
          </div>
          <div class="p-2 bg-blue-50 rounded border border-blue-200">
            <div class="text-2xl font-bold text-blue-700">{{ updateHistory.length }}</div>
            <div class="text-xs text-blue-600">Updates</div>
          </div>
          <div class="p-2 bg-red-50 rounded border border-red-200">
            <div class="text-2xl font-bold text-red-700">{{ checkOutHistory.length }}</div>
            <div class="text-xs text-red-600">Check-outs</div>
          </div>
        </div>

        <!-- History Timeline -->
        <div class="space-y-1 max-h-96 overflow-y-auto">
          <div
            v-for="(entry, index) in [...history].reverse()"
            :key="index"
            class="flex items-start gap-2 p-2 text-sm hover:bg-muted/30 rounded"
          >
            <span class="text-lg">{{ getActionIcon(entry.action) }}</span>
            <div class="flex-1 min-w-0">
              <div class="font-medium capitalize">{{ entry.action }}</div>
              <div v-if="entry.data" class="text-xs text-muted-foreground truncate">
                {{ entry.data.title }}
              </div>
              <div class="text-xs text-muted-foreground">{{ formatTime(entry.timestamp) }}</div>
            </div>
          </div>

          <div v-if="history.length === 0" class="text-center py-8 text-muted-foreground">
            No history yet
          </div>
        </div>
      </div>
    </div>

    <!-- Plugin Info -->
    <div class="space-y-2 p-4 bg-muted/30 rounded-lg">
      <h3 class="font-semibold">Plugin Methods & Properties:</h3>
      <div class="grid md:grid-cols-2 gap-2">
        <ul class="text-sm space-y-1 list-disc list-inside text-muted-foreground">
          <li><code class="bg-background px-1 rounded">getHistory()</code> - Get full history</li>
          <li>
            <code class="bg-background px-1 rounded">clearHistory()</code> - Clear all history
          </li>
          <li>
            <code class="bg-background px-1 rounded">getLastHistory(n)</code> - Get last N entries
          </li>
        </ul>
        <ul class="text-sm space-y-1 list-disc list-inside text-muted-foreground">
          <li>
            <code class="bg-background px-1 rounded">getHistoryByAction()</code> - Filter by action
          </li>
          <li><code class="bg-background px-1 rounded">history</code> - Reactive history array</li>
          <li><code class="bg-background px-1 rounded">maxHistory</code> - Limit: 50 entries</li>
        </ul>
      </div>
    </div>
  </div>
</template>
