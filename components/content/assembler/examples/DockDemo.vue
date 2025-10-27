<template>
  <div class="z-10 flex h-56 w-full flex-col items-center justify-center">
    <div class="h-8 w-full">
      <Dock :transition="500">
        <template
          v-for="(item, index) in views"
          :key="index"
        >
          <DockItem
            v-if="item.label"
            :tooltip="item.label"
            :badge="item.badge"
            @click="item.action && item.action()"
          >
            <div
              :class="`h-full ${index === 0 ? 'bg-primary text-background group-hover:bg-primary group-hover:text-background' : ''} aspect-square bg-background rounded-full flex items-center justify-center group-hover:bg-foreground group-hover:text-background transition-colors duration-500`"
            >
              <component
                :is="item.icon"
                class="h-full"
              />
            </div>
            <template #tooltip>{{ item.label }}</template>
          </DockItem>
          <DockSeparator v-else />
        </template>
      </Dock>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { DockItemsList, DockBadgeConfig } from "~/components/content/assembler/ui/dock";
import { CircleGauge, GraduationCap, Search, Hand, Book, Trash2 } from "lucide-vue-next";

const recycleBinBadge = ref<DockBadgeConfig | undefined>({
  type: "circle" as const,
  variant: "destructive" as const,
});

const views = ref<DockItemsList>([
  {
    icon: CircleGauge,
    label: "Tableau de bord",
    name: "dashboard",
    action: () => console.warn("Go to dashboard"),
  },
  {
    icon: Book,
    label: "Notices",
    name: "books",
    badge: { type: "number", value: 5 },
    action: () => console.warn("Go to books"),
  },
  {
    icon: Hand,
    label: "Prêts",
    name: "loans",
    action: () => console.warn("Go to loans"),
  },
  {
    icon: GraduationCap,
    label: "Élèves",
    name: "pupils",
    action: () => console.warn("Go to pupils"),
  },
  {
    icon: Search,
    label: "Recherche",
    name: "search",
    action: () => console.warn("Go to search"),
  },
  {
    separator: true,
  },
  {
    icon: Trash2,
    label: "Corbeille",
    name: "recycle-bin",
    badge: recycleBinBadge.value,
    action: () => console.warn("Go to recycle bin"),
  },
]);
</script>
