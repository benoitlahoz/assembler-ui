<script setup lang="ts">
import { ref } from 'vue';
import ObjectComposer from '../ObjectComposer.vue';

const sampleData = ref({
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
      <h2 class="demo-title">Éditeur JSON Interactif</h2>
      <p class="demo-description">
        Éditez l'objet JSON ci-dessous. Vous pouvez ajouter, modifier ou supprimer des propriétés.
      </p>
      <ObjectComposer v-model="sampleData" title="Données Utilisateur" />
    </div>

    <div class="demo-section">
      <h2 class="demo-title">Mode Lecture Seule</h2>
      <p class="demo-description">
        Cet éditeur est en mode lecture seule. Les modifications ne sont pas autorisées.
      </p>
      <ObjectComposer v-model="readonlyData" title="Configuration Système" :readonly="true" />
    </div>

    <div class="demo-section">
      <h2 class="demo-title">Données JSON</h2>
      <p class="demo-description">Voici le contenu JSON actuel de l'éditeur :</p>
      <pre class="json-output">{{ JSON.stringify(sampleData, null, 2) }}</pre>
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
  background-color: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.6;
  color: #333;
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
</style>
