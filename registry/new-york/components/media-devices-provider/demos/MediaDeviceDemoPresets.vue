<script setup lang="ts">
/**
 * Demo showing VideoDevice with MediaDevicesProvider and different constraint presets.
 * Demonstrates stream caching when switching between presets on the same device.
 */
import { ref, computed } from 'vue';
import { toPascalCase } from '@assemblerjs/core';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  MediaDevicesProvider,
  VideoDevice,
  VideoPresets,
} from '~~/registry/new-york/components/media-devices-provider';

type PresetName = keyof typeof VideoPresets;

const selectedPreset = ref<PresetName>('hd');
const selectedDeviceId = ref<string>('');
const videoRef = ref<HTMLVideoElement | null>(null);
const currentStream = ref<MediaStream | null>(null);

const currentPreset = computed(() => VideoPresets[selectedPreset.value]);

const handleStream = (stream: MediaStream | null) => {
  currentStream.value = stream;
  if (videoRef.value) {
    videoRef.value.srcObject = stream;
  }
};

const selectDevice = (deviceId: string) => {
  selectedDeviceId.value = deviceId;
};

const getActualResolution = () => {
  if (!videoRef.value || !currentStream.value) return null;
  const videoTrack = currentStream.value.getVideoTracks()[0];
  if (!videoTrack) return null;
  const settings = videoTrack.getSettings();
  return {
    width: settings.width,
    height: settings.height,
    frameRate: settings.frameRate,
  };
};

const formatPresetName = (name: string): string => {
  // List of standard preset names that should not be formatted
  const standardNames: Record<string, string> = {
    sd: 'SD',
    hd: 'HD',
    fullhd: 'Full HD',
    '4k': '4K',
    uhd: 'UHD',
    uhd4k: 'UHD 4K',
    qhd: 'QHD',
    vga: 'VGA',
    qvga: 'QVGA',
  };

  const lowerName = name.toLowerCase();

  // Return standard name if it exists
  if (standardNames[lowerName]) {
    return standardNames[lowerName];
  }

  // Otherwise, convert to Pascal Case with spaces for non-standard names
  // but ensure 'hd' is always in uppercase
  let formatted = toPascalCase(name)
    .replace(/([A-Z])/g, ' $1')
    .trim();

  // Replace any occurrence of 'Hd' with 'HD' (case-insensitive)
  formatted = formatted.replace(/\bHd\b/gi, 'HD');

  return formatted;
};
</script>

<template>
  <div class="h-128 max-h-128 overflow-hidden flex flex-col">
    <MediaDevicesProvider :open="true">
      <template #default="{ devices, errors }">
        <div class="flex flex-col h-full overflow-hidden">
          <!-- Top controls section -->
          <div class="p-4 space-y-4 border-b border-muted">
            <!-- Device selector -->
            <div class="space-y-2">
              <Label class="text-sm font-bold mb-4">Available Cameras</Label>
              <div class="grid gap-2">
                <Button
                  v-for="device in devices.filter((d) => d.kind === 'videoinput')"
                  :key="device.deviceId"
                  @click="selectDevice(device.deviceId)"
                  :variant="selectedDeviceId === device.deviceId ? 'default' : 'outline'"
                  size="sm"
                  class="justify-start"
                >
                  <Badge
                    v-if="selectedDeviceId === device.deviceId"
                    class="mr-2"
                    variant="secondary"
                  >
                    Active
                  </Badge>
                  {{ device.label || 'Camera' }}
                </Button>
              </div>
            </div>

            <!-- Preset selector -->
            <div class="space-y-2">
              <Label class="text-sm font-bold mb-4">Video Quality</Label>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Button
                  v-for="(preset, name) in VideoPresets"
                  :key="name"
                  @click="selectedPreset = name as PresetName"
                  :variant="selectedPreset === name ? 'default' : 'outline'"
                  size="sm"
                >
                  {{ formatPresetName(name as string) }}
                </Button>
              </div>
            </div>
          </div>

          <!-- Main content area - scrollable -->
          <div class="flex-1 overflow-y-auto min-h-0">
            <!-- VideoDevice with selected preset and device -->
            <VideoDevice
              v-if="selectedDeviceId"
              :device-id="selectedDeviceId"
              v-bind="currentPreset"
              auto-start
              @stream="handleStream"
            >
              <template #default="{ stream, isActive, error, start, stop }">
                <div class="p-4 space-y-4">
                  <!-- Video preview -->
                  <div
                    class="relative bg-black rounded-lg overflow-hidden border border-muted"
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
                    <!-- Resolution overlay -->
                    <div
                      v-if="isActive"
                      class="absolute top-2 left-2 space-y-1 bg-black/70 text-white px-2 py-1 rounded text-xs font-mono"
                    >
                      <div>{{ formatPresetName(selectedPreset) }}</div>
                      <div v-if="getActualResolution()">
                        {{ getActualResolution()?.width }}x{{ getActualResolution()?.height }} @
                        {{ getActualResolution()?.frameRate?.toFixed(0) }}fps
                      </div>
                    </div>
                  </div>

                  <!-- Controls -->
                  <div class="flex gap-2">
                    <Button @click="start" :disabled="isActive"> Start Camera </Button>
                    <Button @click="stop" :disabled="!isActive" variant="destructive">
                      Stop Camera
                    </Button>
                  </div>

                  <!-- Info panels -->
                  <div class="grid md:grid-cols-2 gap-4">
                    <!-- Requested constraints -->
                    <div class="border rounded-lg p-4 bg-muted/30">
                      <h4 class="font-medium mb-2 text-sm">Requested Constraints:</h4>
                      <pre class="text-xs overflow-auto">{{ currentPreset }}</pre>
                    </div>

                    <!-- Actual settings -->
                    <div class="border rounded-lg p-4 bg-muted/30">
                      <h4 class="font-medium mb-2 text-sm">Actual Settings:</h4>
                      <div v-if="isActive && stream" class="text-xs space-y-1 font-mono">
                        <p v-if="getActualResolution()">
                          Resolution: {{ getActualResolution()?.width }}x{{
                            getActualResolution()?.height
                          }}
                        </p>
                        <p v-if="getActualResolution()?.frameRate">
                          Frame Rate: {{ getActualResolution()?.frameRate?.toFixed(2) }} fps
                        </p>
                        <p>Tracks: {{ stream.getTracks().length }}</p>
                        <p class="break-all">Device: {{ selectedDeviceId.substring(0, 30) }}...</p>
                      </div>
                      <p v-else class="text-xs text-muted-foreground">
                        Start camera to see actual settings
                      </p>
                    </div>
                  </div>

                  <!-- Error -->
                  <div
                    v-if="error"
                    class="p-4 rounded border border-destructive bg-destructive/10 text-destructive"
                  >
                    <p class="font-bold">Error:</p>
                    <p class="text-sm mt-1">
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
              class="m-4 border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground"
            >
              <p>Select a camera to start</p>
            </div>
          </div>

          <!-- Provider errors - fixed at bottom -->
          <div
            v-if="errors && errors.length > 0"
            class="m-4 mt-0 p-4 rounded border border-destructive bg-destructive/10 text-destructive"
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
