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
  <div class="h-128 max-h-128 overflow-auto">
    <div class="mb-4">
      <ObjectComposer v-model="userData">
        <ObjectComposerHeader>
          <ObjectComposerTitle>User Data (Default)</ObjectComposerTitle>
          <ObjectComposerDescription>
            Edit this user data with ease using the intuitive Object Composer.
          </ObjectComposerDescription>
        </ObjectComposerHeader>
        <Separator class="my-4" />
      </ObjectComposer>
    </div>

    <div>
      <h2 class="demo-title">Données JSON</h2>
      <p class="demo-description">Voici le contenu JSON actuel de l'éditeur :</p>
      <pre class="json-output">{{ JSON.stringify(userData, null, 2) }}</pre>
    </div>
  </div>
</template>
