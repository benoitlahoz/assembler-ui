<script setup lang="ts">
import { ref, computed } from 'vue';
import { useCheckIn, createLoggerPlugin } from '../index';
import { Button } from '@/components/ui/button';

interface MessageData {
  text: string;
  sender: string;
}

// Create desk with logger plugin
const { createDesk } = useCheckIn<MessageData>();
const { desk } = createDesk('messagesDesk', {
  plugins: [
    createLoggerPlugin({
      prefix: '[ChatDemo]',
      verbose: true,
    }),
  ],
  debug: true,
});

// Messages
const messages = ref(desk.getAll());

// Form
const newMessage = ref('');
const sender = ref('User');

// Console logs
const consoleLogs = ref<string[]>([]);

// Intercept console.log
const originalLog = console.log;
console.log = (...args: any[]) => {
  const message = args
    .map((arg) => (typeof arg === 'object' ? JSON.stringify(arg) : arg))
    .join(' ');

  if (message.includes('[ChatDemo]') || message.includes('[useCheckIn]')) {
    consoleLogs.value.unshift(message);
    if (consoleLogs.value.length > 20) {
      consoleLogs.value.pop();
    }
  }

  originalLog.apply(console, args);
};

// Add message
const addMessage = () => {
  if (!newMessage.value.trim()) return;

  const messageId = `msg-${Date.now()}`;
  desk.checkIn(messageId, {
    text: newMessage.value,
    sender: sender.value,
  });

  newMessage.value = '';
  messages.value = desk.getAll();
};

// Remove message
const removeMessage = (id: string | number) => {
  desk.checkOut(id);
  messages.value = desk.getAll();
};

// Edit message
const editMessage = (id: string | number) => {
  const newText = prompt('Edit message:');
  if (newText) {
    desk.update(id, { text: newText });
    messages.value = desk.getAll();
  }
};

// Clear console
const clearConsole = () => {
  consoleLogs.value = [];
};

// Add some initial messages
desk.checkIn('msg1', { text: 'Hello! Logger plugin is active.', sender: 'System' });
desk.checkIn('msg2', { text: 'Check the console on the right →', sender: 'System' });
messages.value = desk.getAll();
</script>

<template>
  <div class="w-full max-w-6xl mx-auto p-6 space-y-6">
    <div class="space-y-2">
      <h2 class="text-2xl font-bold">Logger Plugin Demo</h2>
      <p class="text-sm text-muted-foreground">
        This demo shows how the <code class="bg-muted px-1 rounded">createLoggerPlugin</code> logs
        all operations to the console.
      </p>
    </div>

    <div class="grid md:grid-cols-2 gap-6">
      <!-- Messages Panel -->
      <div class="border rounded-lg p-6 space-y-4">
        <h3 class="text-lg font-semibold">Messages</h3>

        <!-- Add Message Form -->
        <div class="space-y-2">
          <div class="flex gap-2">
            <select v-model="sender" class="px-3 py-2 border rounded-md">
              <option>User</option>
              <option>Admin</option>
              <option>System</option>
            </select>
            <input
              v-model="newMessage"
              type="text"
              placeholder="Type a message..."
              class="flex-1 px-3 py-2 border rounded-md"
              @keyup.enter="addMessage"
            />
            <Button @click="addMessage">Send</Button>
          </div>
        </div>

        <!-- Messages List -->
        <div class="space-y-2 max-h-96 overflow-y-auto">
          <div
            v-for="message in messages"
            :key="message.id"
            class="p-3 bg-muted/30 rounded-lg space-y-2"
          >
            <div class="flex items-start justify-between">
              <div>
                <div class="font-semibold text-sm">{{ message.data.sender }}</div>
                <div class="text-muted-foreground">{{ message.data.text }}</div>
              </div>
              <div class="flex gap-1">
                <Button variant="ghost" size="sm" @click="editMessage(message.id)"> ✏️ </Button>
                <Button variant="ghost" size="sm" @click="removeMessage(message.id)"> × </Button>
              </div>
            </div>
          </div>

          <div v-if="messages.length === 0" class="text-center py-8 text-muted-foreground">
            No messages yet
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-2 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            @click="
              desk.clear();
              messages = [];
            "
          >
            Clear Messages
          </Button>
          <Button
            variant="outline"
            size="sm"
            @click="
              desk.checkIn(`msg-${Date.now()}`, {
                text: 'Batch operation test',
                sender: 'System',
              });
              messages = desk.getAll();
            "
          >
            Add Test Message
          </Button>
        </div>
      </div>

      <!-- Console Logs Panel -->
      <div class="border rounded-lg p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">Console Logs</h3>
          <Button variant="outline" size="sm" @click="clearConsole"> Clear Console </Button>
        </div>

        <!-- Console Output -->
        <div
          class="bg-black text-green-400 font-mono text-xs p-4 rounded-lg max-h-96 overflow-y-auto space-y-1"
        >
          <div
            v-for="(log, index) in consoleLogs"
            :key="index"
            class="whitespace-pre-wrap break-all"
          >
            {{ log }}
          </div>

          <div v-if="consoleLogs.length === 0" class="text-green-600">
            Waiting for operations...
          </div>
        </div>

        <!-- Logger Info -->
        <div class="space-y-2 p-4 bg-muted/30 rounded-lg">
          <h4 class="font-semibold text-sm">Logger Configuration:</h4>
          <ul class="text-xs space-y-1 list-disc list-inside text-muted-foreground">
            <li><code class="bg-background px-1 rounded">prefix</code>: '[ChatDemo]'</li>
            <li><code class="bg-background px-1 rounded">verbose</code>: true (shows full data)</li>
            <li>Logs on: check-in, check-out operations</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Plugin Info -->
    <div class="space-y-2 p-4 bg-muted/30 rounded-lg">
      <h3 class="font-semibold">What Gets Logged:</h3>
      <div class="grid md:grid-cols-3 gap-4 text-sm">
        <div>
          <div class="font-medium mb-1">Check-in Operations</div>
          <ul class="space-y-1 list-disc list-inside text-muted-foreground">
            <li>Item ID</li>
            <li>Full data (verbose mode)</li>
            <li>Timestamp</li>
          </ul>
        </div>
        <div>
          <div class="font-medium mb-1">Check-out Operations</div>
          <ul class="space-y-1 list-disc list-inside text-muted-foreground">
            <li>Item ID</li>
            <li>Removal confirmation</li>
          </ul>
        </div>
        <div>
          <div class="font-medium mb-1">Debug Mode</div>
          <ul class="space-y-1 list-disc list-inside text-muted-foreground">
            <li>Plugin installation</li>
            <li>Registry state</li>
            <li>Event emissions</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
