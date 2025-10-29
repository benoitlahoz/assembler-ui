<script lang="ts" setup>
import { ref } from "vue";
import { Dock, DockItem, DockSeparator } from "@/components/content/assembler/ui/dock";

const items = ref([
  {
    type: "icon",
    label: "Vue.js",
    src: "https://upload.wikimedia.org/wikipedia/commons/9/95/Vue.js_Logo_2.svg",
    active: true,
    loading: false,
    onClick() {
      if (!this.active) {
        setTimeout(() => {
          this.loading = false;
          this.active = true;
        }, 1000);
        this.loading = true;
        return;
      }
      this.active = !this.active;
    },
  },
  {
    type: "icon",
    label: "Nuxt.js",
    src: "https://nuxt.com/assets/design-kit/icon-green.svg",
    active: false,
    loading: false,
    onClick() {
      if (!this.active) {
        setTimeout(() => {
          this.loading = false;
          this.active = true;
        }, 1000);
        this.loading = true;
        return;
      }
      this.active = !this.active;
    },
  },
  {
    type: "icon",
    label: "ShadcnVue",
    src: "https://raw.githubusercontent.com/unovue/shadcn-vue/dev/apps/www/src/public/android-chrome-192x192.png",
    active: false,
    loading: false,
    onClick() {
      if (!this.active) {
        setTimeout(() => {
          this.loading = false;
          this.active = true;
        }, 1000);
        this.loading = true;
        return;
      }
      this.active = !this.active;
    },
  },
  {
    type: "icon",
    label: "Vite.js",
    src: "https://vitejs.dev/logo.svg",
    active: false,
    loading: false,
    onClick() {
      if (!this.active) {
        setTimeout(() => {
          this.loading = false;
          this.active = true;
        }, 1000);
        this.loading = true;
        return;
      }
      this.active = !this.active;
    },
  },
  {
    type: "separator",
  },
  {
    type: "iconify",
    label: "Recycle Bin",
    name: "mdi:trash-can-outline",
    active: false,
    loading: false,
    onClick() {
      if (!this.active) {
        setTimeout(() => {
          this.loading = false;
          this.active = true;
        }, 1000);
        this.loading = true;
        return;
      }
      this.active = !this.active;
    },
  },
]);
</script>

<template>
  <div
    class="w-full flex flex-col items-center min-h-128 rounded p-4"
    :style="`
      background-image: url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80');
      background-size: cover;
      background-position: center;`"
  >
    <div
      class="w-full flex flex-1 items-center justify-center rounded-lg bg-background/20 dark:bg-background/30 mx-4 mb-4 border border-muted/10 backdrop-blur-xs"
    >
      <div class="p-4 text-foreground w-128 h-64 overflow-y-auto flex flex-col gap-2">
        <h1 class="text-xl font-bold">Active Items</h1>
        <div class="font-semibold ml-4 flex flex-col gap-1">
          <div
            v-for="item in items.filter((it) => it.active === true)"
            :key="item.label"
            class="font-semibold"
          >
            {{ item.label }}
          </div>
        </div>
      </div>
    </div>
    <div class="w-full h-fit flex justify-center">
      <Dock
        class="bg-background/50 dark:bg-background/30 border-muted/10"
        expand="start"
        magnify="1.75"
      >
        <template
          v-for="(item, index) in items"
          :key="index"
        >
          <DockItem
            v-if="item.type === 'icon' || item.type === 'iconify'"
            class="p-1 rounded-lg drop-shadow-2xl shadow-2xl bg-gray-600 dark:bg-gray-700"
            :animate="item.loading"
            @click="item.onClick!()"
          >
            <div class="w-full h-full flex items-center justify-center relative">
              <img
                v-if="item.type === 'icon'"
                :src="item.src"
                alt="App Icon"
                class="w-3/4 h-3/4 object-contain"
                draggable="false"
              />
              <Icon
                v-else-if="item.type === 'iconify'"
                :name="item.name!"
                class="w-3/4 h-3/4 min-w-3/4 min-h-3/4 text-white"
              />
              <div
                v-if="item.active"
                class="absolute -bottom-3 w-1 h-1 rounded-full bg-foreground/60 pointer-events-none"
              ></div>
            </div>
          </DockItem>
          <DockSeparator
            v-else-if="item.type === 'separator'"
            class="bg-foreground/50 dark:bg-background/50"
          ></DockSeparator>
        </template>
      </Dock>
    </div>
  </div>
</template>
