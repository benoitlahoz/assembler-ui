---
title: MediaDevicesProvider
description: A renderless provider component that supplies media devices information and handles permissions.
---




  




::tabs
  :::tabs-item{icon="i-lucide-eye" label="Preview"}
    <media-devices-provider-demo-simple />
  :::

  :::tabs-item{icon="i-lucide-code" label="Code"}
  ```vue
<script setup lang="ts">
import { onMounted } from "vue";
import { MediaDevicesProvider } from "@/components/ui/media-devices-provider";

onMounted(() => {
  console.log("MediaDevicesProviderDemoSimple mounted");
});
</script>
<template>
  <MediaDevicesProvider>
    <template #default="{ availableDevices }">
      <div>
        <h3>Media Devices Provider Demo</h3>
        <p>
          This is a simple demonstration of the MediaDevicesProvider component.
        </p>
        <pre>{{ availableDevices }}</pre>
      </div>
    </template>
  </MediaDevicesProvider>
</template>

  ```
  :::
::



## Install with CLI
::hr-underline
::

This will install the item in the path defined by your `components.json` file, thanks to shadcn-vue.

:::code-group{.w-full}
  ```bash [yarn]
  npx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/media-devices-provider.json"
  ```

  ```bash [npm]
  npx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/media-devices-provider.json"
  ```

  ```bash [pnpm]
  pnpm dlx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/media-devices-provider.json"
  ```

  ```bash [bun]
  bunx --bun shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/media-devices-provider.json"
  ```
:::



## Install Manually
::hr-underline
::

Copy and paste these files into your project.

:::code-tree{default-value="src/components/ui/media-devices-provider/index.ts"}


```ts [src/components/ui/media-devices-provider/index.ts]
export { default as MediaDevicesProvider } from "./MediaDevicesProvider.vue";

export { updateDevices } from "./utils";

export { type MediaDevicesProviderProps } from "./MediaDevicesProvider.vue";

```

```ts [src/components/ui/media-devices-provider/utils.ts]
export const updateDevices = async () => {
  try {
    return (await navigator.mediaDevices.enumerateDevices()) || [];
  } catch (error) {
    console.error("Erreur lors de la mise à jour des périphériques :", error);
    return [];
  }
};

```

```vue [src/components/ui/media-devices-provider/MediaDevicesProvider.vue]
<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";
import { updateDevices } from "./utils";

const availableDevices = ref<MediaDeviceInfo[]>([]);

export interface MediaDevicesProviderProps {
  constraints?: MediaStreamConstraints;
}

const props = withDefaults(defineProps<MediaDevicesProviderProps>(), {
  constraints: () => ({ audio: true, video: true }),
});

const updateAvailableDevices = async () => {
  availableDevices.value = await updateDevices();
};

watch(
  () => props.constraints,
  async (newConstraints) => {
    try {
      if (
        !props.constraints ||
        (!props.constraints.audio && !props.constraints.video)
      ) {
        throw new Error(
          "At least one of audio or video constraints must be specified.",
        );
      }

      const stream = await navigator.mediaDevices.getUserMedia(newConstraints);
      await updateAvailableDevices();
    } catch (error) {
      console.error("Error accessing media devices with constraints:", error);
    }
  },
  { immediate: true },
);

onMounted(async () => {
  navigator.mediaDevices.addEventListener(
    "devicechange",
    updateAvailableDevices,
  );
});

onUnmounted(() => {
  navigator.mediaDevices.removeEventListener(
    "devicechange",
    updateAvailableDevices,
  );
});
</script>

<template>
  <slot :availableDevices="availableDevices" />
</template>

<style scoped></style>

```


:::




## MediaDevicesProvider
::hr-underline
::


Media stream constraints to request specific media types (audio/video).
   



**API**: composition







  ### Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `constraints`{.primary .text-primary} | `MediaStreamConstraints` | — | Media stream constraints to request specific media types (audio/video). |






  ### Slots
| Name | Description |
|------|-------------|
| `default`{.primary .text-primary} | — |













  ### Types
| Name | Type | Description |
|------|------|-------------|
| `MediaDevicesProviderProps`{.primary .text-primary} | `interface` | - |






---







::tip
You can copy and adapt this template for any component documentation.
::