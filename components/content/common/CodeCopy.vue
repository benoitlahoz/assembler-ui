<template>
  <UButton
    :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'"
    variant="outline"
    size="sm"
    :class="$props.class"
    @click="copyCode"
  >
    {{ copied ? 'Copied!' : 'Copy' }}
  </UButton>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  code: string
  class?: string
}

const props = defineProps<Props>()

const copied = ref(false)

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(props.code)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy code: ', err)
  }
}
</script>