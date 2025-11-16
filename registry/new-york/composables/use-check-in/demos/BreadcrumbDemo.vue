<script setup lang="ts">
import { ref } from 'vue';
import BreadcrumbContainer from './BreadcrumbContainer.vue';
import BreadcrumbItem from './BreadcrumbItem.vue';

const currentPath = ref(['home', 'projects', 'assembler-ui']);

const navigateTo = (segment: string) => {
  console.log('Navigate to:', segment);
  const index = currentPath.value.indexOf(segment);
  if (index !== -1) {
    currentPath.value = currentPath.value.slice(0, index + 1);
  }
};

const goToRoot = () => {
  currentPath.value = ['home'];
};

const addLevel = () => {
  currentPath.value.push(`level-${currentPath.value.length}`);
};
</script>

<template>
  <div class="demo-container">
    <h2>Breadcrumb Pattern Demo</h2>
    <p>Les BreadcrumbItem s'enregistrent automatiquement dans le BreadcrumbContainer.</p>

    <BreadcrumbContainer separator="›">
      <!-- Items dynamiques basés sur currentPath -->
      <BreadcrumbItem
        v-for="(segment, index) in currentPath"
        :key="segment"
        :id="segment"
        :label="segment.charAt(0).toUpperCase() + segment.slice(1)"
        :href="`/${currentPath.slice(0, index + 1).join('/')}`"
        :icon="index === 0 ? '🏠' : undefined"
        :disabled="index === currentPath.length - 1"
        :position="index"
        @click="navigateTo(segment)"
      />
    </BreadcrumbContainer>

    <!-- Controls -->
    <div class="controls">
      <button @click="goToRoot" class="control-button">Reset to Home</button>
      <button @click="addLevel" class="control-button">Add Level</button>
    </div>

    <!-- État actuel -->
    <div class="state-display">
      <h3>Current Path:</h3>
      <pre>{{ currentPath.join(' > ') }}</pre>
    </div>
  </div>
</template>

<style scoped>
.demo-container {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

h2 {
  margin-bottom: 0.5rem;
}

p {
  color: #6b7280;
  margin-bottom: 2rem;
}

.controls {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.control-button {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.control-button:hover {
  background: #f3f4f6;
}

.state-display {
  margin-top: 2rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.375rem;
}

.state-display h3 {
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #6b7280;
}

.state-display pre {
  font-family: monospace;
  margin: 0;
  white-space: pre-wrap;
}
</style>
