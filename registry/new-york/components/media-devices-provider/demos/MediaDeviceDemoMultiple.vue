<script setup lang="ts">
/**
 * Advanced demo showing multiple VideoDevice components using the same provider.
 * Demonstrates stream caching - opening the same device twice uses the cached stream.
 */
import { ref } from 'vue';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MediaDevicesProvider,
  VideoDevice,
} from '~~/registry/new-york/components/media-devices-provider';

const videoRef1 = ref<HTMLVideoElement | null>(null);
const videoRef2 = ref<HTMLVideoElement | null>(null);
const selectedDevice1 = ref<string>('');
const selectedDevice2 = ref<string>('');

const handleStream1 = (stream: MediaStream | null) => {
  if (videoRef1.value && stream) {
    videoRef1.value.srcObject = stream;
  }
};

const handleStream2 = (stream: MediaStream | null) => {
  if (videoRef2.value && stream) {
    videoRef2.value.srcObject = stream;
  }
};
</script>

<template>
  <div class="space-y-6 p-6">
    <div>
      <Badge variant="outline" class="mt-4 p-2">
        💡 Try selecting the same camera for both viewers!
      </Badge>
    </div>

    <MediaDevicesProvider :open="true">
      <template #default="{ devices, errors }">
        <div class="space-y-6">
          <div class="grid md:grid-cols-2 gap-6">
            <!-- First viewer -->
            <div class="space-y-4 border rounded-lg p-4">
              <div class="flex items-center justify-between">
                <h4 class="font-medium">Viewer 1</h4>
                <Badge variant="secondary">Camera 1</Badge>
              </div>

              <div class="space-y-2">
                <label class="text-xs font-medium text-muted-foreground">Select Camera:</label>
                <div class="flex flex-col gap-2">
                  <Button
                    v-for="device in devices.filter((d) => d.kind === 'videoinput')"
                    :key="device.deviceId"
                    @click="selectedDevice1 = device.deviceId"
                    :variant="selectedDevice1 === device.deviceId ? 'default' : 'outline'"
                    size="sm"
                    class="w-full justify-start text-xs"
                  >
                    <span class="truncate">{{ device.label || 'Camera' }}</span>
                  </Button>
                </div>
              </div>

              <VideoDevice
                v-if="selectedDevice1"
                :device-id="selectedDevice1"
                :width="640"
                :height="480"
                auto-start
                @stream="handleStream1"
              >
                <template #default="{ stream, isActive, error }">
                  <div class="space-y-2">
                    <div
                      class="relative bg-black rounded overflow-hidden"
                      style="aspect-ratio: 4/3"
                    >
                      <video
                        ref="videoRef1"
                        autoplay
                        playsinline
                        muted
                        class="w-full h-full object-cover"
                      />
                      <div
                        v-if="!isActive"
                        class="absolute inset-0 flex items-center justify-center bg-muted/50"
                      >
                        <p class="text-xs text-muted-foreground">Inactive</p>
                      </div>
                    </div>
                    <div class="text-xs space-y-1">
                      <p>
                        Status:
                        <span :class="isActive ? 'text-green-600' : 'text-gray-500'">
                          {{ isActive ? 'Active' : 'Inactive' }}
                        </span>
                      </p>
                      <p v-if="stream" class="text-muted-foreground font-mono">
                        Tracks: {{ stream.getTracks().length }}
                      </p>
                    </div>
                    <div v-if="error" class="text-xs text-red-600 bg-red-50 p-2 rounded">
                      {{ error.message }}
                    </div>
                  </div>
                </template>
              </VideoDevice>

              <div
                v-else
                class="border-2 border-dashed rounded p-4 text-center text-xs text-muted-foreground"
                style="aspect-ratio: 4/3"
              >
                Select a camera
              </div>
            </div>

            <!-- Second viewer -->
            <div class="space-y-4 border rounded-lg p-4">
              <div class="flex items-center justify-between">
                <h4 class="font-medium">Viewer 2</h4>
                <Badge variant="secondary">Camera 2</Badge>
              </div>

              <div class="space-y-2">
                <label class="text-xs font-medium text-muted-foreground">Select Camera:</label>
                <div class="flex flex-col gap-2">
                  <Button
                    v-for="device in devices.filter((d) => d.kind === 'videoinput')"
                    :key="device.deviceId"
                    @click="selectedDevice2 = device.deviceId"
                    :variant="selectedDevice2 === device.deviceId ? 'default' : 'outline'"
                    size="sm"
                    class="w-full justify-start text-xs"
                  >
                    <span class="truncate">{{ device.label || 'Camera' }}</span>
                  </Button>
                </div>
              </div>

              <VideoDevice
                v-if="selectedDevice2"
                :device-id="selectedDevice2"
                :width="640"
                :height="480"
                auto-start
                @stream="handleStream2"
              >
                <template #default="{ stream, isActive, error }">
                  <div class="space-y-2">
                    <div
                      class="relative bg-black rounded overflow-hidden"
                      style="aspect-ratio: 4/3"
                    >
                      <video
                        ref="videoRef2"
                        autoplay
                        playsinline
                        muted
                        class="w-full h-full object-cover"
                      />
                      <div
                        v-if="!isActive"
                        class="absolute inset-0 flex items-center justify-center bg-muted/50"
                      >
                        <p class="text-xs text-muted-foreground">Inactive</p>
                      </div>
                    </div>
                    <div class="text-xs space-y-1">
                      <p>
                        Status:
                        <span :class="isActive ? 'text-green-600' : 'text-gray-500'">
                          {{ isActive ? 'Active' : 'Inactive' }}
                        </span>
                      </p>
                      <p v-if="stream" class="text-muted-foreground font-mono">
                        Tracks: {{ stream.getTracks().length }}
                      </p>
                    </div>
                    <div v-if="error" class="text-xs text-red-600 bg-red-50 p-2 rounded">
                      {{ error.message }}
                    </div>
                  </div>
                </template>
              </VideoDevice>

              <div
                v-else
                class="border-2 border-dashed rounded p-4 text-center text-xs text-muted-foreground"
                style="aspect-ratio: 4/3"
              >
                Select a camera
              </div>
            </div>
          </div>

          <!-- Info panel -->
          <div class="border rounded-lg p-4 bg-muted/30">
            <h4 class="font-medium mb-2 text-sm">Stream Caching Info</h4>
            <div class="text-xs space-y-2 text-muted-foreground">
              <p>
                • When both viewers use <strong>different cameras</strong>, the provider opens two
                separate streams.
              </p>
              <p>
                • When both viewers use the <strong>same camera</strong>, the provider reuses the
                cached stream.
              </p>
              <p>
                • This prevents unnecessary device access and improves performance when multiple
                components need the same media stream.
              </p>
              <p v-if="selectedDevice1 && selectedDevice2">
                <Badge
                  :variant="selectedDevice1 === selectedDevice2 ? 'default' : 'outline'"
                  class="mr-2"
                >
                  {{
                    selectedDevice1 === selectedDevice2
                      ? '✓ Same device - Stream cached!'
                      : 'Different devices - 2 streams'
                  }}
                </Badge>
              </p>
            </div>
          </div>

          <!-- Provider errors -->
          <div
            v-if="errors && errors.length > 0"
            class="p-4 rounded border border-destructive bg-destructive/10 text-destructive"
          >
            <p class="font-bold text-sm">Provider Errors:</p>
            <ul class="text-xs space-y-1 mt-2">
              <li v-for="(error, index) in errors" :key="index">{{ error.message }}</li>
            </ul>
          </div>
        </div>
      </template>
    </MediaDevicesProvider>
  </div>
</template>
