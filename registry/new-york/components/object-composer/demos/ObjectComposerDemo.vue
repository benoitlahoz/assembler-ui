<script setup lang="ts">
import { ref } from 'vue';
import {
  ObjectComposer,
  ObjectComposerHeader,
  ObjectComposerTitle,
  ObjectComposerDescription,
  ObjectComposerItem,
  ObjectComposerField,
} from '~~/registry/new-york/components/object-composer';
import { Separator } from '@/components/ui/separator';

const userData = ref({
  user: {
    name: 'Jean Dupont',
    age: 30,
    email: 'jean.dupont@example.com',
    active: true,
  },
  settings: {
    theme: 'dark',
    notifications: {
      email: true,
      push: false,
      sms: null,
    },
    preferences: {
      language: 'fr',
      timezone: 'Europe/Paris',
    },
  },
  tags: ['developer', 'designer', 'writer'],
  scores: [95, 87, 92, 88],
  metadata: {
    createdAt: '2025-11-14',
    updatedAt: '2025-11-14',
    version: 1.0,
  },
});

const readonlyData = ref({
  system: {
    version: '1.0.0',
    environment: 'production',
  },
  config: {
    debug: false,
    logLevel: 'info',
  },
});
</script>

<template>
  <div class="h-128 max-h-128 overflow-auto">
    <div class="mb-4">
      <h3 class="text-lg font-semibold mb-2">Basic Usage</h3>
      <p class="text-sm text-muted-foreground mb-4">
        ObjectComposer with header and auto-instantiated items
      </p>
      <ObjectComposer v-model="userData">
        <ObjectComposerHeader>
          <ObjectComposerTitle>User Data</ObjectComposerTitle>
          <ObjectComposerDescription>
            Editable JSON object with auto-generated fields
          </ObjectComposerDescription>
        </ObjectComposerHeader>
        <Separator class="my-4" />
        
        <!-- ObjectComposerItem auto-iterates over model -->
        <ObjectComposerItem />
      </ObjectComposer>
    </div>

    <Separator class="my-8" />

    <div class="mb-4">
      <h3 class="text-lg font-semibold mb-2">Custom Field Rendering</h3>
      <p class="text-sm text-muted-foreground mb-4">
        ObjectComposerItem with custom ObjectComposerField template
      </p>
      <ObjectComposer v-model="readonlyData">
        <ObjectComposerHeader>
          <ObjectComposerTitle>System Config</ObjectComposerTitle>
          <ObjectComposerDescription>
            Custom badge-style rendering for each field
          </ObjectComposerDescription>
        </ObjectComposerHeader>
        <Separator class="my-4" />
        
        <!-- Custom rendering: slot propagates to ObjectComposerField -->
        <ObjectComposerItem>
          <template #default="{ itemKey, value, valueType }">
            <div class="flex items-center gap-2">
              <!-- Icon based on type -->
              <span class="flex items-center gap-1.5">
                <span v-if="valueType === 'string'" class="text-red-500">📝</span>
                <span v-else-if="valueType === 'number'" class="text-blue-500">🔢</span>
                <span v-else-if="valueType === 'boolean'" class="text-purple-500">✓</span>
                <span v-else class="text-gray-500">📦</span>
                <span class="font-mono text-sm">{{ itemKey }}</span>
              </span>
              <span class="text-muted-foreground">=</span>
              <!-- Badge value -->
              <span
                class="px-2 py-0.5 rounded-md text-xs font-medium"
                :class="{
                  'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300':
                    valueType === 'string',
                  'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300':
                    valueType === 'number',
                  'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300':
                    valueType === 'boolean',
                }"
              >
                {{ typeof value === 'string' ? `"${value}"` : String(value) }}
              </span>
            </div>
          </template>
        </ObjectComposerItem>
      </ObjectComposer>
    </div>


    <Separator class="my-8" />

    <div>
      <h2 class="demo-title">Données JSON</h2>
      <p class="demo-description">Voici le contenu JSON actuel de l'éditeur :</p>
      <pre class="json-output">{{ JSON.stringify(userData, null, 2) }}</pre>
    </div>
  </div>
</template>
