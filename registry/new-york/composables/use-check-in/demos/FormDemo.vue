<script setup lang="ts">
import { ref, computed, type Ref } from 'vue';
import { useCheckIn } from '../useCheckIn';
import FormField from './FormField.vue';

interface FormFieldData {
  name: string;
  label: string;
  value: any;
  required?: boolean;
}

interface FormDeskContext {
  updateValue: (name: string, value: any) => void;
  getValue: (name: string) => any;
  setError: (name: string, error: string) => void;
  getError: (name: string) => string | undefined;
  clearError: (name: string) => void;
}

const { createDesk } = useCheckIn<FormFieldData, FormDeskContext>();

const formData = ref<Record<string, any>>({});
const errors = ref<Record<string, string>>({});

const { desk } = createDesk('formDesk', {
  context: {
    updateValue: (name: string, value: any) => {
      formData.value[name] = value;
      if (errors.value[name]) {
        delete errors.value[name];
      }
    },
    getValue: (name: string) => formData.value[name],
    setError: (name: string, error: string) => {
      errors.value[name] = error;
    },
    getError: (name: string) => errors.value[name],
    clearError: (name: string) => {
      delete errors.value[name];
    },
  },
  onCheckIn: (id, data) => {
    if (data.value !== undefined) {
      formData.value[data.name] = data.value;
    }
  },
});

const allFields = computed(() => desk.getAll());
const isValid = computed(() => Object.keys(errors.value).length === 0);
const fieldCount = computed(() => allFields.value.length);

const validateForm = () => {
  errors.value = {};
  let isFormValid = true;

  allFields.value.forEach((field) => {
    const value = formData.value[field.data.name];

    if (field.data.required && (!value || value.trim() === '')) {
      errors.value[field.data.name] = `${field.data.label} is required`;
      isFormValid = false;
    }

    // Email validation
    if (field.data.name === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        errors.value[field.data.name] = 'Invalid email format';
        isFormValid = false;
      }
    }
  });

  return isFormValid;
};

const handleSubmit = () => {
  if (validateForm()) {
    alert(`✅ Form submitted successfully!\n\n${JSON.stringify(formData.value, null, 2)}`);
  } else {
    alert('❌ Please fix the errors before submitting');
  }
};

const resetForm = () => {
  formData.value = {};
  errors.value = {};
};

const fillSample = () => {
  formData.value = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    message: 'This is a sample message for testing purposes.',
  };
};
</script>

<template>
  <div class="w-full max-w-2xl mx-auto space-y-6 p-6">
    <!-- Header -->
    <div class="space-y-2">
      <h2 class="text-2xl font-bold">📝 Form Demo - useCheckIn</h2>
      <p class="text-muted-foreground">
        A dynamic form system where fields register themselves at a central desk. The desk manages
        validation, errors, and form state.
      </p>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-3 gap-4">
      <div class="bg-muted p-4 rounded-lg">
        <div class="text-sm text-muted-foreground">Fields</div>
        <div class="text-2xl font-bold">{{ fieldCount }}</div>
      </div>
      <div class="bg-muted p-4 rounded-lg">
        <div class="text-sm text-muted-foreground">Status</div>
        <div :class="['text-lg font-bold', isValid ? 'text-green-600' : 'text-red-600']">
          {{ isValid ? '✓ Valid' : '✗ Invalid' }}
        </div>
      </div>
      <div class="bg-muted p-4 rounded-lg">
        <div class="text-sm text-muted-foreground">Errors</div>
        <div class="text-2xl font-bold text-red-600">{{ Object.keys(errors).length }}</div>
      </div>
    </div>

    <!-- Form -->
    <form @submit.prevent="handleSubmit" class="space-y-4 p-6 border border-border rounded-lg">
      <FormField
        name="name"
        label="Full Name"
        type="text"
        placeholder="Enter your name"
        :required="true"
      />

      <FormField
        name="email"
        label="Email Address"
        type="email"
        placeholder="your.email@example.com"
        :required="true"
      />

      <FormField
        name="message"
        label="Message"
        type="textarea"
        placeholder="Type your message here..."
        :required="true"
      />

      <!-- Actions -->
      <div class="flex gap-2 pt-4">
        <button
          type="submit"
          class="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
        >
          📤 Submit Form
        </button>
        <button
          type="button"
          @click="resetForm"
          class="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90"
        >
          🔄 Reset
        </button>
        <button
          type="button"
          @click="fillSample"
          class="px-4 py-2 bg-muted text-muted-foreground rounded hover:bg-muted/80"
        >
          💡 Fill Sample
        </button>
      </div>
    </form>

    <!-- Form State Debug -->
    <div class="p-4 bg-muted/50 rounded-lg text-xs space-y-2">
      <div class="font-bold">📊 Form State:</div>
      <div>
        <strong>Fields:</strong>
        {{ allFields.map((f) => f.data.name).join(', ') || 'None' }}
      </div>
      <div>
        <strong>Data:</strong>
        <pre class="mt-1 overflow-auto">{{ JSON.stringify(formData, null, 2) }}</pre>
      </div>
      <div v-if="Object.keys(errors).length > 0">
        <strong>Errors:</strong>
        <pre class="mt-1 overflow-auto text-red-600">{{ JSON.stringify(errors, null, 2) }}</pre>
      </div>
    </div>

    <!-- Info -->
    <div class="text-xs text-muted-foreground space-y-1 border-t pt-4">
      <div><strong>💡 How it works:</strong></div>
      <div>• Form creates a desk with <code>createDesk('formDesk', ...)</code></div>
      <div>• Each field auto-registers using <code>checkIn('formDesk', ...)</code></div>
      <div>• The desk provides centralized validation and error management</div>
      <div>• Fields communicate through the desk's context methods</div>
    </div>
  </div>
</template>
