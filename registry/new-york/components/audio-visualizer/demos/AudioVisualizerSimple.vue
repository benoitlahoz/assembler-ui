<script setup lang="ts">
import { nextTick, ref } from 'vue';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  SelectItemText,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  MediaDevicesProvider,
  AudioDevice,
} from '~~/registry/new-york/components/media-devices-provider';
import { AudioVisualizer } from '~~/registry/new-york/components/audio-visualizer';

const selectedId = ref<string | null>(null);
</script>

<template>
  <MediaDevicesProvider :open="true" v-slot="{ microphones, stopAll, errors }">
    <FieldSet>
      <FieldLegend>Audio Inputs</FieldLegend>
      <FieldDescription>
        Select an audio input from the list of available devices.
      </FieldDescription>
      <FieldGroup class="space-y-4">
        <Field>
          <Select :disabled="!microphones.length" v-model="selectedId">
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Select an audio input" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <template v-if="microphones.length">
                  <SelectItem
                    v-for="microphone in microphones"
                    :key="microphone.deviceId"
                    :name="microphone.label"
                    :value="microphone.deviceId"
                    class="truncate"
                  >
                    <SelectItemText>
                      {{ microphone.label || 'Unnamed Device' }}
                    </SelectItemText>
                  </SelectItem>
                </template>
                <template v-else>
                  <SelectLabel>No Devices Found</SelectLabel>
                </template>
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
      </FieldGroup>
    </FieldSet>
    <AudioDevice v-if="selectedId" :device-id="selectedId ?? ''" auto-start v-slot="{ stream }">
      <AudioVisualizer :stream="stream" :width="600" :height="200" />
    </AudioDevice>
  </MediaDevicesProvider>
</template>
