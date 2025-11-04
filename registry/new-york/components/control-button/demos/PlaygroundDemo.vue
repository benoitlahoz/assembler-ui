<script setup lang="ts">
import { ref } from 'vue';
import { ControlButton } from '~~/registry/new-york/components/control-button';

const variants = ['default', 'outline', 'ghost', 'solid'] as const;
const shapes = ['square', 'circle'] as const;
const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

const selectedVariant = ref<(typeof variants)[number]>('default');
const selectedShape = ref<(typeof shapes)[number]>('square');
const selectedColor = ref(colors[0]);
</script>

<template>
  <div class="p-8 space-y-8">
    <div class="space-y-4">
      <h2 class="text-2xl font-bold">Control Button Playground</h2>

      <!-- Contrôles -->
      <div class="flex gap-6 items-start p-4 bg-muted/30 rounded-lg">
        <div class="space-y-2">
          <label class="text-sm font-medium">Variant</label>
          <div class="flex gap-2">
            <button
              v-for="variant in variants"
              :key="variant"
              class="px-3 py-1 text-xs rounded border"
              :class="
                selectedVariant === variant ? 'bg-primary text-primary-foreground' : 'bg-background'
              "
              @click="selectedVariant = variant"
            >
              {{ variant }}
            </button>
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium">Shape</label>
          <div class="flex gap-2">
            <button
              v-for="shape in shapes"
              :key="shape"
              class="px-3 py-1 text-xs rounded border"
              :class="
                selectedShape === shape ? 'bg-primary text-primary-foreground' : 'bg-background'
              "
              @click="selectedShape = shape"
            >
              {{ shape }}
            </button>
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium">Color</label>
          <div class="flex gap-2">
            <button
              v-for="color in colors"
              :key="color"
              class="w-8 h-8 rounded border-2"
              :class="selectedColor === color ? 'border-foreground' : 'border-transparent'"
              :style="{ backgroundColor: color }"
              @click="selectedColor = color"
            />
          </div>
        </div>
      </div>

      <!-- Aperçu -->
      <div class="p-8 bg-card border rounded-lg flex items-center justify-center">
        <div class="w-32 h-32">
          <ControlButton :variant="selectedVariant" :shape="selectedShape" :color="selectedColor">
            <span class="text-2xl">★</span>
          </ControlButton>
        </div>
      </div>

      <!-- Code -->
      <div class="p-4 bg-muted rounded-lg">
        <pre class="text-xs"><code>&lt;ControlButton
  variant="{{ selectedVariant }}"
  shape="{{ selectedShape }}"
  color="{{ selectedColor }}"
&gt;
  &lt;span class="text-2xl"&gt;★&lt;/span&gt;
&lt;/ControlButton&gt;</code></pre>
      </div>
    </div>
  </div>
</template>
