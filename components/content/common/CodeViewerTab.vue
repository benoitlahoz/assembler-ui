<template>
  <div class="relative">
    <div
      v-if="filename"
      class="flex items-center px-4 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800"
    >
      <UIcon name="i-vscode-icons-file-type-vue" class="w-4 h-4 mr-2" />
      <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
        {{ filename }}
      </span>
    </div>

    <div class="p-4 bg-white dark:bg-gray-950">
      <pre class="text-sm overflow-x-auto"><code
        :class="`language-${language}`"
      >{{ fileContent }}</code></pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Props {
  filename?: string
  label?: string
  language: string
  componentName: string
  type: 'ui' | 'examples' | 'blocks'
  id?: string
  extension?: string
}

const props = defineProps<Props>()

const fileContent = ref('')

// Charger le contenu au montage
onMounted(async () => {
  try {
    const response = await fetch(`/r/${props.id || props.componentName}.json`)
    const componentData = await response.json()

    const expectedPath =
      props.type === 'ui'
        ? `ui/${props.id || props.componentName}/${props.filename || `${props.componentName}.vue`}`
        : `${props.type}/${props.id || props.componentName}/${props.filename || `${props.componentName}.vue`}`

    const file = componentData?.files?.find((f: { path: string }) => f.path === expectedPath)

    if (file?.content) {
      fileContent.value = file.content
    }
  } catch {
    console.error('Error loading component file')
  }
})
</script>
