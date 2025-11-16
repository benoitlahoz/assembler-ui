<script setup lang="ts">
import { computed, ref, watch, inject, type InjectionKey } from 'vue';
import { useCheckIn, type CheckInDesk } from '../useCheckIn';

interface FormFieldData {
  name: string;
  label: string;
  value: any;
  required?: boolean;
}

// Récupère le Symbol du desk fourni par le parent
const formDesk = inject<{ deskSymbol: InjectionKey<CheckInDesk<FormFieldData>> }>('formDesk')!;

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

const { checkIn, memoizedId } = useCheckIn<FormFieldData>();

const { desk } = checkIn(formDesk?.deskSymbol, {
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

const localValue = ref(props.value);

watch(
  localValue,
  (newValue) => {
    if (desk && 'updateValue' in desk) {
      desk.updateValue(props.name, newValue);
    }
  },
  { immediate: true }
);

const error = computed(() => {
  if (!desk || !('getError' in desk)) return '';
  return desk.getError(props.name) || '';
});

const inputId = computed(() => `field-${props.name}`);
</script>

<template>
  <div class="space-y-2">
    <label :for="inputId" class="block text-sm font-medium">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <input
      v-if="type !== 'textarea'"
      :id="inputId"
      v-model="localValue"
      :type="type"
      :placeholder="placeholder"
      :class="[
        'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2',
        error ? 'border-red-500 focus:ring-red-500' : 'border-border focus:ring-primary',
      ]"
    />

    <textarea
      v-else
      :id="inputId"
      v-model="localValue"
      :placeholder="placeholder"
      rows="4"
      :class="[
        'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2',
        error ? 'border-red-500 focus:ring-red-500' : 'border-border focus:ring-primary',
      ]"
    />

    <p v-if="error" class="text-sm text-red-500">{{ error }}</p>
  </div>
</template>
