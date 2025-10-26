<!-- eslint-disable vue/no-v-html -->
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

    <div class="relative p-4 bg-white dark:bg-gray-950 max-h-128 overflow-auto">
      <CodeCopy
        class="absolute top-2 right-2"
        :code="rawString"
      />
      <pre class="text-sm"><code
        class="language-vue"
        v-html="highlightedCode"
      ></code></pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'

interface Props {
  filename?: string
  language?: string
  componentName: string
  type: 'ui' | 'examples' | 'blocks'
  id?: string
  extension?: string
}

const props = withDefaults(defineProps<Props>(), {
  language: 'vue',
  extension: 'vue'
})

const rawString = ref('')

const highlightedCode = computed(() => {
  if (!rawString.value) return ''
  return hljs.highlight(rawString.value, { language: props.language }).value
})

// Charger le contenu du registre
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
      rawString.value = file.content
    }
  } catch (error) {
    console.error('Error loading component file:', error)
    rawString.value = '// Component not found'
  }
})
</script>