<script setup lang="ts">
import { ref } from 'vue';
import {
  ObjectComposer,
  ObjectComposerHeader,
  ObjectComposerTitle,
  ObjectComposerDescription,
  ObjectComposerItem,
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
  <div class="demo-container">
    <div class="demo-section">
      <ObjectComposer v-model="userData" title="Données Utilisateur">
        <ObjectComposerHeader>
          <ObjectComposerTitle>User Data (Default)</ObjectComposerTitle>
          <ObjectComposerDescription>
            Edit this user data with ease using the intuitive Object Composer.
          </ObjectComposerDescription>
        </ObjectComposerHeader>
        <Separator class="my-4" />
        <ObjectComposerItem
          v-for="(value, key) in userData"
          :key="key"
          :itemKey="key"
          :value="value"
        />
      </ObjectComposer>
    </div>

    <div class="demo-section">
      <h2 class="demo-title">Rendu Personnalisé</h2>
      <p class="demo-description">
        Utilisez un slot pour personnaliser l'affichage de chaque élément. L'arborescence fonctionne
        automatiquement.
      </p>
      <ObjectComposer v-model="userData" title="Données Utilisateur">
        <ObjectComposerHeader>
          <ObjectComposerTitle>User Data (Custom)</ObjectComposerTitle>
          <ObjectComposerDescription>
            Custom rendering with slot - tree navigation still works!
          </ObjectComposerDescription>
        </ObjectComposerHeader>
        <Separator class="my-4" />
        <ObjectComposerItem
          v-for="(value, key) in userData"
          :key="key"
          :itemKey="key"
          :value="value"
        >
          <template #default="{ itemKey, value, valueType, displayValue, isExpandable }">
            <div class="custom-item">
              <span class="custom-key">{{ itemKey }}</span>
              <span class="custom-separator">→</span>
              <span class="custom-value" :class="`custom-type-${valueType}`">
                {{ isExpandable ? `${displayValue} items` : displayValue }}
              </span>
              <span v-if="valueType === 'string'" class="custom-badge">text</span>
              <span v-else-if="valueType === 'number'" class="custom-badge">num</span>
              <span v-else-if="valueType === 'boolean'" class="custom-badge">bool</span>
              <span v-else-if="valueType === 'array'" class="custom-badge">array</span>
              <span v-else-if="valueType === 'object'" class="custom-badge">object</span>
            </div>
          </template>
        </ObjectComposerItem>
      </ObjectComposer>
    </div>

    <div class="demo-section">
      <h2 class="demo-title">Mode Lecture Seule</h2>
      <p class="demo-description">
        Cet éditeur est en mode lecture seule. Les modifications ne sont pas autorisées.
      </p>
      <ObjectComposer v-model="readonlyData" title="Configuration Système" :readonly="true">
        <ObjectComposerItem
          v-for="(value, key) in readonlyData"
          :key="key"
          :itemKey="key"
          :value="value"
        />
      </ObjectComposer>
    </div>

    <div class="demo-section">
      <h2 class="demo-title">Données JSON</h2>
      <p class="demo-description">Voici le contenu JSON actuel de l'éditeur :</p>
      <pre class="json-output">{{ JSON.stringify(userData, null, 2) }}</pre>
    </div>
  </div>
</template>

<style scoped>
.demo-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 16px;
  display: flex;
  flex-direction: column;
  gap: 48px;
}

.demo-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.demo-title {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}

.demo-description {
  font-size: 14px;
  color: #666;
  margin: 0;
  line-height: 1.6;
}

.json-output {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.6;
  color: white;
  overflow-x: auto;
  margin: 0;
}

.json-output::-webkit-scrollbar {
  height: 8px;
}

.json-output::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.json-output::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.json-output::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}

.custom-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.custom-key {
  font-weight: 600;
  color: #2563eb;
}

.custom-separator {
  color: #94a3b8;
  font-weight: 500;
}

.custom-value {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
}

.custom-value.custom-type-string {
  color: #059669;
}

.custom-value.custom-type-number {
  color: #dc2626;
}

.custom-value.custom-type-boolean {
  color: #7c3aed;
}

.custom-value.custom-type-null {
  color: #64748b;
  font-style: italic;
}

.custom-value.custom-type-object,
.custom-value.custom-type-array {
  color: #ea580c;
  font-weight: 500;
}

.custom-badge {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 4px;
  background-color: #e2e8f0;
  color: #475569;
}
</style>
