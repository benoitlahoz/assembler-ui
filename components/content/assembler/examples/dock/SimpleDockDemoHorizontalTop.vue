<script lang="ts" setup>
import { ref } from "vue";

const hovered = ref<string>("No Item Hovered");
</script>

<template>
  <div class="w-full flex flex-col min-h-64 h-96 rounded p-4">
    <div class="flex justify-center items-start">
      <Dock
        expand="end"
        orientation="horizontal"
      >
        <DockItem
          @mouseover="hovered = 'VSCode'"
          @mouseleave="hovered = 'No Item Hovered'"
        >
          <Icon
            name="vscode-icons:file-type-vscode"
            class="w-3/4 h-3/4 min-w-3/4 min-h-3/4"
          />
        </DockItem>
        <DockItem
          @mouseover="hovered = 'Vue'"
          @mouseleave="hovered = 'No Item Hovered'"
        >
          <Icon
            name="vscode-icons:file-type-vue"
            class="w-3/4 h-3/4 min-w-3/4 min-h-3/4"
          />
        </DockItem>
        <DockSeparator />
        <DockItem
          @mouseover="hovered = 'GitHub'"
          @mouseleave="hovered = 'No Item Hovered'"
        >
          <Icon
            name="octicon:mark-github-16"
            class="w-3/4 h-3/4 min-w-3/4 min-h-3/4"
          />
        </DockItem>
      </Dock>
    </div>
    <div class="flex-1 flex items-center justify-center">
      <p class="text-center font-bold">{{ hovered }}</p>
    </div>
  </div>
</template>
