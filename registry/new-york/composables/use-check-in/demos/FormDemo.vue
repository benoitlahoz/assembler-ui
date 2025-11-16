<script setup lang="ts">
import { ref } from 'vue';
import FormContainer from './FormContainer.vue';
import FormField from './FormField.vue';

const formData = ref({
  name: '',
  email: '',
  password: '',
  message: '',
});

const submittedData = ref<Record<string, any> | null>(null);

const handleSubmit = (values: Record<string, any>) => {
  console.log('Form submitted:', values);
  submittedData.value = values;
};

const handleChange = (values: Record<string, any>) => {
  console.log('Form changed:', values);
};

// Validations custom
const validateEmail = (value: string) => {
  if (value && !value.includes('@')) {
    return 'Invalid email format';
  }
};

const validatePassword = (value: string) => {
  if (value && value.length < 6) {
    return 'Password must be at least 6 characters';
  }
};

const resetForm = () => {
  formData.value = {
    name: '',
    email: '',
    password: '',
    message: '',
  };
  submittedData.value = null;
};
</script>

<template>
  <div class="demo-container">
    <h2>Form Pattern Demo</h2>
    <p>Les FormField s'enregistrent et sont validés automatiquement par le FormContainer.</p>

    <FormContainer @submit="handleSubmit" @change="handleChange">
      <FormField
        id="name"
        name="name"
        label="Name"
        type="text"
        v-model="formData.name"
        required
        :position="1"
      />

      <FormField
        id="email"
        name="email"
        label="Email"
        type="email"
        v-model="formData.email"
        required
        :position="2"
        :validate="validateEmail"
      />

      <FormField
        id="password"
        name="password"
        label="Password"
        type="password"
        v-model="formData.password"
        required
        :position="3"
        :validate="validatePassword"
      />

      <FormField
        id="message"
        name="message"
        label="Message"
        type="textarea"
        v-model="formData.message"
        :position="4"
      />

      <template #actions>
        <div class="actions">
          <button type="submit" class="submit-button">Submit</button>
          <button type="button" class="reset-button" @click="resetForm">Reset</button>
        </div>
      </template>
    </FormContainer>

    <!-- État actuel -->
    <div class="state-display">
      <h3>Current Form Data:</h3>
      <pre>{{ JSON.stringify(formData, null, 2) }}</pre>

      <div v-if="submittedData" class="submitted-data">
        <h3>Submitted Data:</h3>
        <pre>{{ JSON.stringify(submittedData, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<style scoped>
.demo-container {
  padding: 2rem;
  max-width: 600px;
  margin: 0 auto;
}

h2 {
  margin-bottom: 0.5rem;
}

p {
  color: #6b7280;
  margin-bottom: 2rem;
}

.actions {
  display: flex;
  gap: 1rem;
}

.submit-button,
.reset-button {
  padding: 0.5rem 1.5rem;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-button {
  background: #3b82f6;
  color: white;
}

.submit-button:hover {
  background: #2563eb;
}

.reset-button {
  background: #e5e7eb;
  color: #374151;
}

.reset-button:hover {
  background: #d1d5db;
}

.state-display {
  margin-top: 2rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.375rem;
}

.state-display h3 {
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #6b7280;
}

.state-display pre {
  font-family: monospace;
  font-size: 0.75rem;
  margin: 0.5rem 0;
  white-space: pre-wrap;
  background: white;
  padding: 0.5rem;
  border-radius: 0.25rem;
}

.submitted-data {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}
</style>
