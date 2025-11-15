<script setup lang="ts">
import { ref, computed, provide } from 'vue';
import { useCheckIn } from '../useCheckIn';
import FormField from './FormField.vue';

// Type de données pour les champs de formulaire
interface FormFieldData {
  name: string;
  label: string;
  value: any;
  required?: boolean;
}

// Parent: Form Container
const { openDesk } = useCheckIn<FormFieldData>();

const formData = ref<Record<string, any>>({});
const errors = ref<Record<string, string>>({});

// Le parent ouvre un desk et le fournit à ses enfants
const { desk, deskSymbol: formDesk } = openDesk({
  context: {
    updateValue: (name: string, value: any) => {
      formData.value[name] = value;
      if (errors.value[name]) {
        delete errors.value[name];
        errors.value = { ...errors.value };
      }
    },
    getValue: (name: string) => formData.value[name],
    setError: (name: string, error: string) => {
      errors.value[name] = error;
      errors.value = { ...errors.value };
    },
    getError: (name: string) => errors.value[name],
  },
  onCheckIn: (id, data) => {
    if (data.value !== undefined) {
      formData.value[data.name] = data.value;
    }
  },
  onCheckOut: (id) => {
    // console.log('Field checked out:', id);
  },
});

// Fournir le deskSymbol dans un objet aux enfants
provide('formDesk', { deskSymbol: formDesk });

const allFields = computed(() => desk.getAll());
const isValid = computed(() => Object.keys(errors.value).length === 0);
const fieldCount = computed(() => allFields.value.length);

const validateForm = () => {
  errors.value = {};
  allFields.value.forEach((field) => {
    if (field.data.required && !formData.value[field.data.name]) {
      errors.value[field.data.name] = `${field.data.label} is required`;
    }
  });
  errors.value = { ...errors.value };
  return Object.keys(errors.value).length === 0;
};

const handleSubmit = () => {
  if (validateForm()) {
    alert(`Form submitted!\n\n${JSON.stringify(formData.value, null, 2)}`);
  }
};

const resetForm = () => {
  formData.value = {};
  errors.value = {};
};
</script>

<template>
  <div class="w-full max-w-2xl mx-auto space-y-6 p-6">
    <div class="space-y-2">
      <h2 class="text-2xl font-bold">useCheckIn - Form Demo</h2>
      <p class="text-muted-foreground">
        Form fields check in with parent for centralized state management
      </p>
    </div>

    <!-- Form Stats -->
    <div class="flex items-center gap-4 p-4 bg-muted rounded-lg">
      <span class="text-sm font-medium">{{ fieldCount }} fields</span>
      <span :class="['text-sm font-medium', isValid ? 'text-green-600' : 'text-red-600']">
        {{ isValid ? '✓ Valid' : '✗ Invalid' }}
      </span>
    </div>

    <!-- Form -->
    <form @submit.prevent="handleSubmit" class="space-y-4 p-6 border border-border rounded-lg">
      <FormField name="username" label="Username" :required="true" placeholder="Enter username" />
      <FormField
        name="email"
        label="Email"
        type="email"
        :required="true"
        placeholder="email@example.com"
      />
      <FormField name="bio" label="Bio" type="textarea" placeholder="Tell us about yourself..." />

      <div class="flex gap-2 pt-4">
        <button
          type="submit"
          class="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
        >
          Submit
        </button>
        <button
          type="button"
          @click="resetForm"
          class="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80"
        >
          Reset
        </button>
      </div>
    </form>

    <!-- Debug Info -->
    <div class="p-4 bg-muted rounded-lg space-y-2">
      <h4 class="font-semibold">Debug Info</h4>
      <div class="text-sm space-y-1">
        <pre class="bg-background p-2 rounded">{{ JSON.stringify(formData, null, 2) }}</pre>
        <p><strong>Fields:</strong> {{ allFields.map((f) => f.data.name).join(', ') }}</p>
      </div>
    </div>
  </div>
</template>
