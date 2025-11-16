<script setup lang="ts">
import { ref } from 'vue';
import { useCheckIn, createValidationPlugin } from '../index';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';

interface User {
  name: string;
  email: string;
  age: number;
}

// Create desk with validation plugin
const { createDesk } = useCheckIn<User>();
const { desk } = createDesk('usersDesk', {
  plugins: [
    createValidationPlugin({
      required: ['name', 'email', 'age'],
      validate: (data) => {
        // Email validation
        if (!data.email.includes('@')) {
          return 'Email must contain @';
        }

        // Age validation
        if (data.age < 18) {
          return 'User must be at least 18 years old';
        }

        // Name validation
        if (data.name.length < 2) {
          return 'Name must be at least 2 characters';
        }

        return true;
      },
    }),
  ],
  debug: true,
});

// Form state
const formName = ref('');
const formEmail = ref('');
const formAge = ref<number | undefined>(undefined);
const validationMessage = ref('');
const successMessage = ref('');

const users = ref(desk.getAll());

const handleSubmit = () => {
  validationMessage.value = '';
  successMessage.value = '';

  // Try to check in the user
  const userId = `user-${Date.now()}`;
  const success = desk.checkIn(userId, {
    name: formName.value,
    email: formEmail.value,
    age: formAge.value!,
  });

  if (success) {
    successMessage.value = `User "${formName.value}" added successfully!`;
    // Reset form
    formName.value = '';
    formEmail.value = '';
    formAge.value = undefined;
    // Update users list
    users.value = desk.getAll();
  } else {
    validationMessage.value = 'Validation failed. Check console for details.';
  }
};

// Test cases
const testCases = [
  {
    label: 'Valid User',
    data: { name: 'John Doe', email: 'john@example.com', age: 25 },
    shouldPass: true,
  },
  {
    label: 'Missing Email @',
    data: { name: 'Jane', email: 'jane.example.com', age: 30 },
    shouldPass: false,
  },
  {
    label: 'Age < 18',
    data: { name: 'Bob', email: 'bob@example.com', age: 16 },
    shouldPass: false,
  },
  {
    label: 'Name Too Short',
    data: { name: 'A', email: 'a@example.com', age: 20 },
    shouldPass: false,
  },
];

const runTest = (testCase: (typeof testCases)[0]) => {
  validationMessage.value = '';
  successMessage.value = '';

  const success = desk.checkIn(`test-${Date.now()}`, testCase.data);

  if (success) {
    successMessage.value = `✅ Test passed: ${testCase.label}`;
    users.value = desk.getAll();
  } else {
    validationMessage.value = `❌ Test failed as expected: ${testCase.label}`;
  }
};
</script>

<template>
  <div class="w-full max-w-3xl mx-auto p-6 space-y-6">
    <div class="space-y-2">
      <h2 class="text-2xl font-bold">Validation Plugin Demo</h2>
      <p class="text-sm text-muted-foreground">
        This demo shows how the
        <code class="bg-muted px-1 rounded">createValidationPlugin</code> validates data before
        check-in.
      </p>
    </div>

    <!-- Add User Form -->
    <div class="border rounded-lg p-6 space-y-4">
      <h3 class="text-lg font-semibold">Add New User</h3>

      <div class="grid gap-4">
        <div class="space-y-2">
          <Label for="name">Name (min 2 chars)</Label>
          <Input id="name" v-model="formName" placeholder="Enter name" />
        </div>

        <div class="space-y-2">
          <Label for="email">Email (must contain @)</Label>
          <Input id="email" v-model="formEmail" type="email" placeholder="Enter email" />
        </div>

        <div class="space-y-2">
          <Label for="age">Age (min 18)</Label>
          <Input id="age" v-model.number="formAge" type="number" placeholder="Enter age" />
        </div>

        <Button @click="handleSubmit"> Add User </Button>

        <div
          v-if="successMessage"
          class="p-3 bg-green-50 text-green-800 rounded border border-green-200"
        >
          {{ successMessage }}
        </div>

        <div
          v-if="validationMessage"
          class="p-3 bg-red-50 text-red-800 rounded border border-red-200"
        >
          {{ validationMessage }}
        </div>
      </div>
    </div>

    <!-- Test Cases -->
    <div class="border rounded-lg p-6 space-y-4">
      <h3 class="text-lg font-semibold">Validation Test Cases</h3>
      <p class="text-sm text-muted-foreground">Click to test different validation scenarios</p>

      <div class="grid gap-2">
        <Button
          v-for="(testCase, index) in testCases"
          :key="index"
          variant="outline"
          class="justify-start"
          @click="runTest(testCase)"
        >
          <span class="font-mono text-xs mr-2">
            {{ testCase.shouldPass ? '✅' : '❌' }}
          </span>
          {{ testCase.label }}:
          <span class="ml-2 text-xs text-muted-foreground">
            {{ testCase.data.name }} / {{ testCase.data.email }} / {{ testCase.data.age }}
          </span>
        </Button>
      </div>
    </div>

    <!-- Users List -->
    <div class="border rounded-lg p-6 space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold">Validated Users ({{ users.length }})</h3>
        <Button
          variant="outline"
          size="sm"
          @click="
            desk.clear();
            users = [];
          "
        >
          Clear All
        </Button>
      </div>

      <div v-if="users.length === 0" class="text-center py-8 text-muted-foreground">
        No users added yet
      </div>

      <div v-else class="space-y-2">
        <div
          v-for="user in users"
          :key="user.id"
          class="flex items-center justify-between p-3 bg-muted/30 rounded"
        >
          <div>
            <div class="font-medium">{{ user.data.name }}</div>
            <div class="text-sm text-muted-foreground">
              {{ user.data.email }} · {{ user.data.age }} years old
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            @click="
              desk.checkOut(user.id);
              users = desk.getAll();
            "
          >
            Remove
          </Button>
        </div>
      </div>
    </div>

    <!-- Plugin Info -->
    <div class="space-y-2 p-4 bg-muted/30 rounded-lg">
      <h3 class="font-semibold">Validation Rules:</h3>
      <ul class="text-sm space-y-1 list-disc list-inside text-muted-foreground">
        <li><code class="bg-background px-1 rounded">required</code>: ['name', 'email', 'age']</li>
        <li>
          <code class="bg-background px-1 rounded">validate</code>: Custom validation function
        </li>
        <li>Email must contain '@'</li>
        <li>Age must be ≥ 18</li>
        <li>Name must be ≥ 2 characters</li>
      </ul>
    </div>
  </div>
</template>
