<script setup lang="ts">
import { ref } from 'vue';
import { Button } from '~/components/ui/button';
import BreadcrumbContainer from './BreadcrumbContainer.vue';
import BreadcrumbItem from './BreadcrumbItem.vue';

const currentPath = ref(['home', 'projects', 'assembler-ui']);

const navigateTo = (segment: string) => {
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
      <Button @click="goToRoot" variant="outline">Reset to Home</Button>
      <Button @click="addLevel" variant="outline">Add Level</Button>
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
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: hsl(var(--foreground));
}

p {
  color: hsl(var(--muted-foreground));
  margin-bottom: 2rem;
}

.controls {
  display: flex;
  gap: 0.5rem;
  margin-top: 2rem;
}

.state-display {
  margin-top: 2rem;
  padding: 1rem;
  background: hsl(var(--muted) / 0.3);
  border-radius: var(--radius);
  border: 1px solid hsl(var(--border));
}

.state-display h3 {
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  color: hsl(var(--muted-foreground));
}

.state-display pre {
  font-family: var(--font-mono);
  margin: 0;
  white-space: pre-wrap;
  color: hsl(var(--foreground));
}
</style>
