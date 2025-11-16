<script setup lang="ts">
import { inject, ref, watch } from 'vue';
import { useCheckIn } from '../../../composables/use-check-in/useCheckIn';
import type { FormFieldData } from './FormContainer.vue';

const props = withDefaults(
  defineProps<{
    /** Identifiant unique du champ */
    id?: string;
    /** Nom du champ (pour les valeurs du formulaire) */
    name: string;
    /** Label du champ */
    label: string;
    /** Type de champ */
    type?: 'text' | 'email' | 'password' | 'textarea' | 'select';
    /** Valeur initiale */
    modelValue?: any;
    /** Champ requis */
    required?: boolean;
    /** Position dans le formulaire */
    position?: number;
    /** Fonction de validation custom */
    validate?: (value: any) => string | undefined;
  }>(),
  {
    type: 'text',
    position: 0,
  }
);

const emit = defineEmits<{
  'update:modelValue': [value: any];
}>();

// Injecter le desk
const desk = inject<any>('__check_in_desk__' as any);

// État local de la valeur
const localValue = ref(props.modelValue);

// Émettre les changements
const handleChange = (value: any) => {
  localValue.value = value;
  emit('update:modelValue', value);
};

// Watch les changements externes de modelValue
watch(
  () => props.modelValue,
  (newValue) => {
    localValue.value = newValue;
  }
);

// S'enregistrer auprès du desk
const { updateSelf } = useCheckIn<FormFieldData>().checkIn(desk, {
  autoCheckIn: true,
  id: props.id || props.name,
  group: 'field',
  position: props.position,
  data: () => ({
    name: props.name,
    value: localValue.value,
    label: props.label,
    type: props.type,
    required: props.required,
    validate: props.validate,
    onChange: handleChange,
  }),
  watchData: true,
  shallow: true,
});

// Watch localValue pour mettre à jour le desk
watch(localValue, () => {
  updateSelf();
});
</script>

<template>
  <!-- Transparent - ne rend rien -->
</template>
