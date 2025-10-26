<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap gap-2">
      <AssemblerButton variant="default"> Default </AssemblerButton>
      <AssemblerButton variant="secondary"> Secondary </AssemblerButton>
      <AssemblerButton variant="destructive"> Destructive </AssemblerButton>
      <AssemblerButton variant="outline"> Outline </AssemblerButton>
      <AssemblerButton variant="ghost"> Ghost </AssemblerButton>
      <AssemblerButton variant="link"> Link </AssemblerButton>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <AssemblerButton size="sm"> Small </AssemblerButton>
      <AssemblerButton size="default"> Default </AssemblerButton>
      <AssemblerButton size="lg"> Large </AssemblerButton>
      <AssemblerButton size="icon">
        <UIcon name="i-lucide-heart" />
      </AssemblerButton>
    </div>
  </div>
</template>

<script setup lang="ts">
// Import du composant Button depuis notre registry
import AssemblerButton from '../../ui/button/Button.vue'
</script>
