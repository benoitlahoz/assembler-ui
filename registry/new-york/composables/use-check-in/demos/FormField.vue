<script setup lang="ts">
import { computed, ref, watch, type Ref } from 'vue';
import { useCheckIn } from '../useCheckIn';

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

const props = withDefaults(
  defineProps<{
    name: string;
    label: string;
    type?: 'text' | 'email' | 'textarea';
    required?: boolean;
    placeholder?: string;
    value?: any;
  }>(),
  {
    type: 'text',
    required: false,
    value: '',
  }
);

const { checkIn, memoizedId } = useCheckIn<FormFieldData, FormDeskContext>();

const { desk } = checkIn('formDesk', {
  required: true,
  autoCheckIn: true,
  id: memoizedId(props.name),
  data: () => ({
    name: props.name,
    label: props.label,
    value: props.value,
    required: props.required,
  }),
});

if (!desk) {
  throw new Error('FormField must be used within a form desk context');
}

const localValue = ref(desk.getValue(props.name) || props.value);

watch(
  localValue,
  (newValue) => {
    desk.updateValue(props.name, newValue);
  },
  { deep: true }
);

const error = computed(() => desk.getError(props.name));
const hasError = computed(() => !!error.value);
</script>

<template>
  <div class="space-y-2">
    <label :for="name" class="block text-sm font-medium">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <textarea
      v-if="type === 'textarea'"
      :id="name"
      v-model="localValue"
      :placeholder="placeholder"
      :class="[
        'w-full px-3 py-2 border rounded-md resize-y min-h-[100px]',
        hasError
          ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
          : 'border-input focus:ring-primary focus:border-primary',
      ]"
    />

    <input
      v-else
      :id="name"
      :type="type"
      v-model="localValue"
      :placeholder="placeholder"
      :class="[
        'w-full px-3 py-2 border rounded-md',
        hasError
          ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
          : 'border-input focus:ring-primary focus:border-primary',
      ]"
    />

    <div v-if="hasError" class="text-sm text-red-600">{{ error }}</div>
  </div>
</template>
