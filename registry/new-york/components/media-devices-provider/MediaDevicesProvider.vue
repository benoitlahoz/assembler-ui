<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { updateDevices } from './utils';

const availableDevices = ref<MediaDeviceInfo[]>([]);

export interface MediaDevicesProviderProps {
  /**
   * Media stream constraints to request specific media types (audio/video).
   */
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
      if (!props.constraints || (!props.constraints.audio && !props.constraints.video)) {
        throw new Error('At least one of audio or video constraints must be specified.');
      }

      // Open at least one stream to get access to device labels and info.
      const stream = await navigator.mediaDevices.getUserMedia(newConstraints);
      await updateAvailableDevices();
    } catch (error) {
      console.error('Error accessing media devices with constraints:', error);
    }
  },
  { immediate: true }
);

onMounted(async () => {
  navigator.mediaDevices.addEventListener('devicechange', updateAvailableDevices);
});

onUnmounted(() => {
  navigator.mediaDevices.removeEventListener('devicechange', updateAvailableDevices);
});
</script>

<template>
  <slot :availableDevices="availableDevices" />
</template>

<style scoped></style>
