<template>
  <div class="space-y-4">
    <!-- Titre de la section code -->
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold text-foreground">
        {{ title || 'Code' }}
      </h3>
      <div class="flex gap-2">
        <!-- Boutons pour basculer entre les vues -->
        <button
          v-for="tab in tabs"
          :key="tab.key"
           class="px-3 py-1 text-sm rounded-md transition-colors"
          :class="[
            activeTab === tab.key
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground',
          ]"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Contenu basé sur l'onglet actif -->
    <div class="border rounded-lg overflow-hidden">
      <!-- Vue Preview -->
      <div
        v-if="activeTab === 'preview'"
        class="p-6 bg-background"
      >
        <slot name="preview">
          <div class="text-muted-foreground text-center py-8">
            Aucun aperçu disponible
          </div>
        </slot>
      </div>

      <!-- Vue Code -->
      <div v-else-if="activeTab === 'code'">
        <CodeBlock
          :code="code"
          :language="language"
          :filename="filename"
          :show-copy="true"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import CodeBlock from './CodeBlock.vue';

interface Tab {
  key: string;
  label: string;
}

export interface CodeViewerProps {
  title?: string;
  code: string;
  language?: string;
  filename?: string;
  showPreview?: boolean;
}

const props = withDefaults(defineProps<CodeViewerProps>(), {
  language: 'vue',
  showPreview: true,
});

const activeTab = ref('preview');

const tabs = computed(() => {
  const tabList: Tab[] = [];

  if (props.showPreview) {
    tabList.push({ key: 'preview', label: 'Aperçu' });
  }

  tabList.push({ key: 'code', label: 'Code' });

  return tabList;
});

// Initialiser l'onglet actif
onMounted(() => {
  activeTab.value = props.showPreview ? 'preview' : 'code';
});
</script>
