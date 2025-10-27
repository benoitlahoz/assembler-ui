<template>
  <div class="flex flex-col gap-12 p-8 min-h-128">
    <!-- Conteneur centré par défaut -->
    <div class="flex flex-col items-center justify-center gap-4 p-8">
      <MacOsDock
        orientation="horizontal"
        color="accent"
        class="px-16"
        expand="bottom"
      >
        <MacOsDockItem :active="true">
          <img
            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg"
            alt="Vue"
          />
        </MacOsDockItem>
        <MacOsDockSeparator />
        <MacOsDockItem>
          <img
            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg"
            alt="TS"
          />
        </MacOsDockItem>
        <MacOsDockSeparator />
        <MacOsDockItem>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/d/d5/Tailwind_CSS_Logo.svg"
            alt="Tailwind"
          />
        </MacOsDockItem>
      </MacOsDock>
    </div>

    <!-- Conteneur vertical centré par défaut -->
    <div class="flex flex-row items-center justify-center gap-4 rounded-xl p-8">
      <MacOsDock
        orientation="vertical"
        size="md"
        expand="right"
      >
        <MacOsDockItem :active="true">
          <img
            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg"
            alt="Vue"
          />
        </MacOsDockItem>
        <MacOsDockSeparator />
        <MacOsDockItem>
          <img
            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg"
            alt="TS"
          />
        </MacOsDockItem>
        <MacOsDockSeparator />
        <MacOsDockItem>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/d/d5/Tailwind_CSS_Logo.svg"
            alt="Tailwind"
          />
        </MacOsDockItem>
      </MacOsDock>
    </div>

    <!-- Conteneur positionné personnalisé -->
    <div class="relative min-h-96 w-full rounded-xl">
      <!-- Dock vertical en haut à droite -->
      <div class="absolute top-8 right-8 flex flex-col justify-start items-end">
        <MacOsDock
          orientation="vertical"
          size="sm"
          expand="right"
        >
          <MacOsDockItem :active="true">
            <img
              src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg"
              alt="Vue"
            />
          </MacOsDockItem>
          <MacOsDockSeparator />
          <MacOsDockItem>
            <img
              src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg"
              alt="TS"
            />
          </MacOsDockItem>
          <MacOsDockSeparator />
          <MacOsDockItem>
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/d/d5/Tailwind_CSS_Logo.svg"
              alt="Tailwind"
            />
          </MacOsDockItem>
        </MacOsDock>
      </div>
      <!-- Dock horizontal en bas au centre -->
      <div class="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center">
        <h3 class="mb-2 font-semibold">Dock horizontal (bottom-center, size: lg)</h3>
        <MacOsDock
          orientation="horizontal"
          size="lg"
          expand="top"
        >
          <MacOsDockItem :active="true">
            <img
              src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg"
              alt="Vue"
            />
          </MacOsDockItem>
          <MacOsDockSeparator />
          <MacOsDockItem>
            <img
              src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg"
              alt="TS"
            />
          </MacOsDockItem>
          <MacOsDockSeparator />
          <MacOsDockItem>
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/d/d5/Tailwind_CSS_Logo.svg"
              alt="Tailwind"
            />
          </MacOsDockItem>
        </MacOsDock>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import MacOsDock from "../ui/macos-dock/MacOsDock.vue";
import MacOsDockItem from "../ui/macos-dock/MacOsDockItem.vue";
import MacOsDockSeparator from "../ui/macos-dock/MacOsDockSeparator.vue";
</script>
