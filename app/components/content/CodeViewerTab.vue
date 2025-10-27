<template>
  <div class="code-viewer-tab">
    <CodeBlock
      :code="rawCode"
      :language="language"
      :show-copy="true"
      :show-header="false"
      :show-border="false"
      :show-rounded="false"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
// Utilise l'auto-import global de Nuxt

interface Props {
  componentName?: string;
  filename?: string;
  language?: string;
  type?: string;
  id?: string;
  extension?: string;
  label?: string;
}

const props = withDefaults(defineProps<Props>(), {
  language: 'vue',
  type: 'ui',
  extension: 'vue',
});

const rawCode = ref('');

onMounted(async () => {
  // Load component code from registry
  try {
    const registryId = props.id || props.componentName;

    if (!registryId) {
      rawCode.value = '// No registry ID or component name provided';
      return;
    }

    const response = await fetch(`/r/${registryId}.json`);
    if (response.ok) {
      const registry = await response.json();

      // Find the file based on label, filename, or component name
      let file;

      // First try with label (like "Button.vue" or "index.ts")
      if (props.label) {
        file = registry.files?.find((f: any) => {
          const fileName = f.path.split('/').pop(); // Get filename from path
          return fileName === props.label || f.path.includes(props.label);
        });
      }

      // Then try with filename
      if (!file && props.filename) {
        file = registry.files?.find((f: any) =>
          f.path.toLowerCase().includes(props.filename!.toLowerCase())
        );
      }

      // Then try based on language/extension
      if (!file) {
        if (props.language === 'typescript' || props.extension === 'ts') {
          file = registry.files?.find((f: any) => f.path.includes('index.ts'));
        } else {
          file = registry.files?.find((f: any) => f.path.includes('.vue'));
        }
      }

      if (file) {
        rawCode.value = file.content;

        // Auto-detect language from file extension if not explicitly set
        const fileExt = file.path.split('.').pop()?.toLowerCase();
        if (fileExt === 'ts' && props.language === 'javascript') {
          // Update language to typescript for .ts files
          // This will be used by CodeBlock
        }
      } else {
        rawCode.value = `// Could not find file for ${
          props.label || props.componentName || 'unknown'
        }\n// Available files: ${registry.files
          ?.map((f: any) => f.path)
          .join(', ')}`;
      }
    } else {
      rawCode.value = `// Registry not found for ${registryId}`;
    }
  } catch (error) {
    console.error('Error loading component code:', error);
    rawCode.value = `// Error loading component code\n// ${error}`;
  }
});
</script>
