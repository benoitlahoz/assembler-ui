<script setup lang="ts">
import { ref } from 'vue';
import { Field, FieldDescription, FieldGroup, FieldLegend, FieldSet } from '@/components/ui/field';
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
import {
  MediaDevicesProvider,
  AudioDevice,
} from '~~/registry/new-york/components/media-devices-provider';
import { AudioContextProvider } from '~~/registry/new-york/components/audio-context-provider';
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
      <AudioContextProvider v-slot="{ context, errors, state }">
        <AudioVisualizer
          :stream="stream"
          :context="context"
          :width="600"
          :height="200"
          mode="frequency-bars"
        />
        <template v-if="errors && errors.length">
          <div class="text-red-500 text-xs mt-2">
            <div v-for="(err, i) in errors" :key="i">{{ err.message }}</div>
          </div>
        </template>
        <template v-if="state !== 'running'">
          <div class="text-yellow-500 text-xs mt-2">AudioContext non actif</div>
        </template>
      </AudioContextProvider>
    </AudioDevice>
  </MediaDevicesProvider>
</template>
