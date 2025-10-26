<template>
  <div class="my-4 w-full space-y-4">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">{{ label || 'Preview' }}</h3>
        </div>
      </template>

      <div class="border-b border-gray-200 dark:border-gray-800">
        <nav class="flex space-x-8" aria-label="Tabs">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            :class="[
              selectedTab === tab.key
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2'
            ]"
            @click="selectedTab = tab.key"
          >
            <UIcon :name="tab.icon" class="w-4 h-4" />
            {{ tab.label }}
          </button>
        </nav>
      </div>

      <div class="mt-4">
        <div v-if="selectedTab === 'preview'" class="p-6 min-h-48">
          <component :is="loadedComponent" v-if="loadedComponent" />
          <div v-else class="text-gray-500 dark:text-gray-400 text-center">
            Composant {{ componentName }} non trouvé
          </div>
        </div>
        <div v-else-if="selectedTab === 'code'">
          <CodeViewerTab
            :id="id"
            :component-name="componentName"
            :type="type"
            :filename="`${componentName}.vue`"
            language="vue"
          />
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import CodeViewerTab from './common/CodeViewerTab.vue'

interface Props {
  label?: string
  componentName: string
  type: 'examples' | 'ui'
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Preview',
})

const loadedComponent = ref(null)
const selectedTab = ref('preview')

const tabs = computed(() => [
  {
    key: 'preview',
    label: 'Preview',
    icon: 'i-lucide-laptop-minimal'
  },
  {
    key: 'code',
    label: 'Code',
    icon: 'i-lucide-code'
  }
])

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
