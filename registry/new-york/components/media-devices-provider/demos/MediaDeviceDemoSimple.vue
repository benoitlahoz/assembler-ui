<script setup lang="ts">
/**
 * Simple demo of MediaDevice component with MediaDevicesProvider for stream caching.
 */
import { ref } from 'vue';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MediaDevicesProvider,
  VideoDevice,
} from '~~/registry/new-york/components/media-devices-provider';

const videoRef = ref<HTMLVideoElement | null>(null);
const selectedDeviceId = ref<string>('');

const handleStream = (stream: MediaStream | null) => {
  if (videoRef.value && stream) {
    videoRef.value.srcObject = stream;
  }
};

const selectDevice = (deviceId: string) => {
  selectedDeviceId.value = deviceId;
};
</script>

<template>
  <div class="space-y-4">
    <h3 class="text-lg font-semibold">MediaDevice with Provider - Stream Caching</h3>
    <p class="text-sm text-muted-foreground">
      Select a camera from the list. The provider caches streams to avoid reopening the same device.
    </p>

    <MediaDevicesProvider :open="true">
      <template #default="{ devices, errors }">
        <div class="space-y-4">
          <!-- Device selector -->
          <div class="space-y-2">
            <label class="text-sm font-medium">Available Cameras:</label>
            <div class="grid gap-2">
              <Button
                v-for="device in devices.filter((d) => d.kind === 'videoinput')"
                :key="device.deviceId"
                @click="selectDevice(device.deviceId)"
                :variant="selectedDeviceId === device.deviceId ? 'default' : 'outline'"
                size="sm"
                class="justify-start"
              >
                <Badge v-if="selectedDeviceId === device.deviceId" class="mr-2" variant="secondary">
                  Active
                </Badge>
                {{ device.label || 'Camera' }}
              </Button>
            </div>
          </div>

          <!-- VideoDevice with selected camera -->
          <VideoDevice
            v-if="selectedDeviceId"
            :device-id="selectedDeviceId"
            :width="1280"
            :height="720"
            :frame-rate="30"
            auto-start
            @stream="handleStream"
          >
            <template #default="{ stream, isActive, error, start, stop }">
              <div class="space-y-4">
                <!-- Video preview -->
                <div
                  class="relative bg-black rounded-lg overflow-hidden"
                  style="aspect-ratio: 16/9"
                >
                  <video
                    ref="videoRef"
                    autoplay
                    playsinline
                    muted
                    class="w-full h-full object-cover"
                  />
                  <div
                    v-if="!isActive"
                    class="absolute inset-0 flex items-center justify-center bg-muted/50"
                  >
                    <p class="text-muted-foreground">Camera not started</p>
                  </div>
                  <!-- Device info overlay -->
                  <div
                    v-if="isActive"
                    class="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs"
                  >
                    {{ devices.find((d) => d.deviceId === selectedDeviceId)?.label || 'Camera' }}
                  </div>
                </div>

                <!-- Controls -->
                <div class="flex gap-2">
                  <Button @click="start" :disabled="isActive"> Start Camera </Button>
                  <Button @click="stop" :disabled="!isActive" variant="destructive">
                    Stop Camera
                  </Button>
                </div>

                <!-- Status -->
                <div class="text-sm space-y-1">
                  <p>
                    Status:
                    <span :class="isActive ? 'text-green-600' : 'text-gray-500'">
                      {{ isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </p>
                  <p v-if="stream" class="text-xs text-muted-foreground">
                    Tracks: {{ stream.getTracks().length }} | Device ID:
                    {{ selectedDeviceId.substring(0, 20) }}...
                  </p>
                </div>

                <!-- Error -->
                <div
                  v-if="error"
                  class="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm"
                >
                  <p class="font-medium">Error:</p>
                  <p>
                    {{ error.message || error }}
                    {{ (error as any).constraint ? `(${(error as any).constraint})` : '' }}
                  </p>
                </div>
              </div>
            </template>
          </VideoDevice>

          <!-- No device selected -->
          <div
            v-else
            class="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground"
          >
            <p>Select a camera from the list above to start</p>
          </div>

          <!-- Provider errors -->
          <div
            v-if="errors && errors.length > 0"
            class="p-4 rounded border border-destructive bg-destructive/10 text-destructive"
          >
            <p class="font-bold">Provider Errors:</p>
            <ul class="text-sm space-y-1 mt-2">
              <li v-for="(error, index) in errors" :key="index">
                {{ error.message || error }}
                {{ (error as any).constraint ? `(${(error as any).constraint})` : '' }}
              </li>
            </ul>
          </div>
        </div>
      </template>
    </MediaDevicesProvider>
  </div>
</template>
