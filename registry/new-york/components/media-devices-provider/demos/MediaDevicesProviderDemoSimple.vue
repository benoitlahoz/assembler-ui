<script setup lang="ts">
import { ref } from 'vue';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MediaDevicesProvider } from '~~/registry/new-york/components/media-devices-provider';

const open = ref(false);
</script>
<template>
  <div class="h-128 max-h-128 overflow-hidden flex flex-col">
    <Button :disabled="open" class="m-4 mb-2" @click="open = true">Open Devices</Button>
    <MediaDevicesProvider :open="open" v-slot="{ devices, errors }">
      <div class="overflow-y-auto flex-1 min-h-0 select-none m-4 rounded border border-muted">
        <table class="w-full">
          <thead
            class="sticky top-0 bg-default z-10 after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-border"
          >
            <tr>
              <th class="text-left p-2 bg-default">Type</th>
              <th class="text-left p-2 bg-default">Label</th>
              <th class="text-left p-2 bg-default">Device ID</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="device in devices"
              :key="device.deviceId"
              class="border-b border-muted hover:bg-accent"
            >
              <td class="p-2">
                <Badge
                  :variant="
                    device.kind === 'videoinput'
                      ? 'default'
                      : device.kind === 'audioinput'
                        ? 'secondary'
                        : 'destructive'
                  "
                >
                  {{ device.kind }}
                </Badge>
              </td>
              <td class="p-2">{{ device.label || 'Without label' }}</td>
              <td class="p-2 font-mono text-xs text-gray-500">
                {{ device.deviceId.substring(0, 20) }}...
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div
        v-if="errors && errors.length > 0"
        class="mt-4 mx-4 p-4 rounded border border-destructive bg-destructive/10 text-destructive mb-4"
      >
        <p class="font-bold">Errors:</p>
        <ul>
          <li v-for="(error, index) in errors" :key="index" class="text-sm">{{ error }}</li>
        </ul>
      </div>
    </MediaDevicesProvider>
  </div>
</template>
