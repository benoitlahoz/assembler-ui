<template>
  <div class="relative group">
    <!-- Header avec nom du fichier et bouton copier -->
    <div
      v-if="showHeader && (filename || showCopy)"
      class="flex items-center justify-between bg-muted px-4 py-2 border-b text-sm text-muted-foreground"
    >
      <span
        v-if="filename"
        class="font-medium flex items-center"
      >
        <Icon
          :icon="getFileIcon(filename)"
          class="w-4 h-4 mr-2"
        />
        {{ filename }}
      </span>
      <span v-else></span>
      <button
        v-if="showCopy"
        class="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-background rounded"
        :class="{ 'opacity-100': copied }"
        @click="copyCode"
      >
        <svg
          v-if="!copied"
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
        <svg
          v-else
          class="w-4 h-4 text-green-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </button>
    </div>

    <!-- Code block avec highlight.js manuel -->
    <pre
      ref="codeRef"
      class="overflow-x-auto p-4 text-sm leading-relaxed hljs m-0"
      :class="[
        'bg-muted/50',
        showBorder ? 'border' : '',
        showRounded && showHeader && (filename || showCopy)
          ? 'border-t-0 rounded-b-lg'
          : showRounded
          ? 'rounded-lg'
          : '',
      ]"
    ><code :class="`language-${props.language}`">{{ code }}</code></pre>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue';
import { Icon } from '@iconify/vue';
import hljs from 'highlight.js';

// Import des langages spécifiques
import 'highlight.js/lib/languages/javascript';
import 'highlight.js/lib/languages/typescript';
import 'highlight.js/lib/languages/xml';
import 'highlight.js/lib/languages/css';
import 'highlight.js/lib/languages/bash';

export interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  showCopy?: boolean;
  showHeader?: boolean;
  showBorder?: boolean;
  showRounded?: boolean;
}

const props = withDefaults(defineProps<CodeBlockProps>(), {
  language: 'javascript',
  showCopy: true,
  showHeader: true,
  showBorder: true,
  showRounded: true,
});

const copied = ref(false);
const codeRef = ref<HTMLElement>();

// Function to get the appropriate icon for file types
const getFileIcon = (filename: string) => {
  if (filename.includes('.vue')) return 'vscode-icons:file-type-vue';
  if (filename.includes('.ts')) return 'vscode-icons:file-type-typescript';
  if (filename.includes('.js')) return 'vscode-icons:file-type-js';
  if (filename.includes('.json')) return 'vscode-icons:file-type-json';
  if (filename.includes('.css')) return 'vscode-icons:file-type-css';
  if (filename.includes('.sh') || filename === 'terminal')
    return 'vscode-icons:file-type-shell';
  if (filename.includes('tailwind.config'))
    return 'vscode-icons:file-type-tailwind';
  if (filename.includes('.md')) return 'vscode-icons:file-type-markdown';
  return 'vscode-icons:default-file'; // Icône par défaut
};

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(props.code);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (error) {
    console.error('Failed to copy code:', error);
  }
};

const performHighlighting = async () => {
  await nextTick(); // Attendre que le DOM soit mis à jour

  if (codeRef.value && props.code) {
    const codeElement = codeRef.value.querySelector('code');
    if (codeElement) {
      try {
        hljs.highlightElement(codeElement);

        // Vérifier si le highlighting a fonctionné
        if (!codeElement.classList.contains('hljs')) {
          const result = hljs.highlightAuto(props.code);
          codeElement.innerHTML = result.value;
        }
      } catch (error) {
        console.error('Highlight error:', error);
        // Fallback complet
        try {
          const result = hljs.highlightAuto(props.code);
          codeElement.innerHTML = result.value;
        } catch (fallbackError) {
          console.error('Fallback failed:', fallbackError);
        }
      }
    }
  }
};

onMounted(() => {
  performHighlighting();
});

// Watch pour re-highlight quand le code change
watch(
  () => props.code,
  (newCode) => {
    if (newCode) {
      performHighlighting();
    }
  }
);
</script>
