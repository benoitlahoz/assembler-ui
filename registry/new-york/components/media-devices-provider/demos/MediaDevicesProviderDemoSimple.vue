<script setup lang="ts">
import { onMounted } from 'vue';
import { MediaDevicesProvider } from '~~/registry/new-york/components/media-devices-provider';

onMounted(() => {
  console.log('MediaDevicesProviderDemoSimple mounted');
});
</script>
<template>
  <MediaDevicesProvider>
    <template #default="{ availableDevices }">
      <div>
        <h3>Media Devices Provider Demo</h3>
        <p>This is a simple demonstration of the MediaDevicesProvider component.</p>
        <pre>{{ availableDevices }}</pre>
      </div>
    </template>
  </MediaDevicesProvider>
</template>
