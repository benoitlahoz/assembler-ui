<template>
  <div class="relative">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-sm font-medium text-gray-900 dark:text-gray-100">
        {{ label }}
      </h3>
    </div>

    <div
      class="relative rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950"
    >
      <div class="p-6">
        <component :is="loadedComponent" v-if="loadedComponent" />
        <div v-else class="text-gray-500 dark:text-gray-400">
          Composant {{ componentName }} non trouvé
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Props {
  label?: string
  componentName: string
  type: 'examples' | 'ui'
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Aperçu',
})

const loadedComponent = ref(null)

// Charger le composant au montage
onMounted(async () => {
  try {
    let componentPath = ''

    if (props.type === 'examples') {
      componentPath = props.id
        ? `../assembler/examples/${props.id}/${props.componentName}`
        : `../assembler/examples/${props.componentName}`
    } else if (props.type === 'ui') {
      componentPath = props.id
        ? `../assembler/ui/${props.id}/${props.componentName}`
        : `../assembler/ui/${props.componentName}`
    }

    if (componentPath) {
      const component = await import(componentPath)
      loadedComponent.value = component.default || component
    }
  } catch (error) {
    console.warn(`Could not load component: ${props.componentName}`, error)
  }
})
</script>
