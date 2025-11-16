<script setup lang="ts">
import { provide, computed } from 'vue';
import { useCheckIn } from '../../../composables/use-check-in/useCheckIn';

export interface FormFieldData {
  name: string;
  value: any;
  label: string;
  type: string;
  required?: boolean;
  error?: string;
  validate?: (value: any) => string | undefined;
  onChange?: (value: any) => void;
}

const props = withDefaults(
  defineProps<{
    /** Identifiant du formulaire */
    formId?: string;
  }>(),
  {
    formId: 'form',
  }
);

const emit = defineEmits<{
  submit: [values: Record<string, any>];
  change: [values: Record<string, any>];
}>();

// Créer le desk pour enregistrer les champs
const { desk, DeskInjectionKey } = useCheckIn<FormFieldData>().createDesk({
  context: {},
  onCheckIn: (id, data) => {
    console.log('[FormContainer] Field registered:', id, data);
  },
});

// Fournir le desk aux enfants
provide(DeskInjectionKey, desk);

// Écouter les mises à jour pour émettre les changements
desk.on('update', () => {
  const values = getFormValues();
  emit('change', values);
});

// Récupérer tous les champs triés par position
const fields = desk.getGroup('field', { sortBy: 'meta.position', order: 'asc' });

// Computed pour les valeurs du formulaire
const getFormValues = () => {
  const values: Record<string, any> = {};
  fields.value.forEach((field) => {
    values[field.data.name] = field.data.value;
  });
  return values;
};

// Validation du formulaire
const validateForm = () => {
  let isValid = true;

  fields.value.forEach((field) => {
    let error: string | undefined;

    // Validation required
    if (field.data.required && !field.data.value) {
      error = `${field.data.label} is required`;
      isValid = false;
    }

    // Validation custom
    if (!error && field.data.validate) {
      error = field.data.validate(field.data.value);
      if (error) isValid = false;
    }

    // Mettre à jour l'erreur
    if (error !== field.data.error) {
      desk.update(field.id, { ...field.data, error });
    }
  });

  return isValid;
};

const handleSubmit = (e: Event) => {
  e.preventDefault();

  if (validateForm()) {
    const values = getFormValues();
    emit('submit', values);
  }
};

const hasErrors = computed(() => {
  return fields.value.some((field) => field.data.error);
});
</script>

<template>
  <form class="form-container" @submit="handleSubmit">
    <!-- Le slot contient les FormField qui s'enregistrent -->
    <slot />

    <!-- Rendu des champs -->
    <div class="form-fields">
      <div
        v-for="field in fields"
        :key="field.id"
        class="form-field"
        :class="{ 'has-error': field.data.error }"
      >
        <label :for="String(field.id)" class="field-label">
          {{ field.data.label }}
          <span v-if="field.data.required" class="required">*</span>
        </label>

        <input
          v-if="
            field.data.type === 'text' ||
            field.data.type === 'email' ||
            field.data.type === 'password'
          "
          :id="String(field.id)"
          :type="field.data.type"
          :value="field.data.value"
          class="field-input"
          @input="(e) => field.data.onChange?.((e.target as HTMLInputElement).value)"
        />

        <textarea
          v-else-if="field.data.type === 'textarea'"
          :id="String(field.id)"
          :value="field.data.value"
          class="field-textarea"
          @input="(e) => field.data.onChange?.((e.target as HTMLTextAreaElement).value)"
        />

        <select
          v-else-if="field.data.type === 'select'"
          :id="String(field.id)"
          :value="field.data.value"
          class="field-select"
          @change="(e) => field.data.onChange?.((e.target as HTMLSelectElement).value)"
        >
          <option value="">Select...</option>
          <!-- Options would be passed via slot or data -->
        </select>

        <div v-if="field.data.error" class="field-error">
          {{ field.data.error }}
        </div>
      </div>
    </div>

    <!-- Actions slot -->
    <div class="form-actions">
      <slot name="actions">
        <button type="submit" class="submit-button" :disabled="hasErrors">Submit</button>
      </slot>
    </div>
  </form>
</template>

<style scoped>
.form-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-fields {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-field.has-error .field-input,
.form-field.has-error .field-textarea,
.form-field.has-error .field-select {
  border-color: hsl(var(--destructive));
}

.field-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: hsl(var(--foreground));
}

.required {
  color: hsl(var(--destructive));
  margin-left: 0.25rem;
}

.field-input,
.field-textarea,
.field-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius);
  font-size: 0.875rem;
  transition: border-color 0.2s;
  background: hsl(var(--background));
  color: hsl(var(--foreground));
}

.field-input:focus,
.field-textarea:focus,
.field-select:focus {
  outline: none;
  border-color: hsl(var(--ring));
}

.field-textarea {
  min-height: 100px;
  resize: vertical;
}

.field-error {
  font-size: 0.75rem;
  color: hsl(var(--destructive));
}

.form-actions {
  margin-top: 1rem;
}

.submit-button {
  padding: 0.5rem 1.5rem;
  border: none;
  border-radius: var(--radius);
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.submit-button:hover:not(:disabled) {
  background: hsl(var(--primary) / 0.9);
}

.submit-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
