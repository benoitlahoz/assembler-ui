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
import { AudioMotion } from '~~/registry/new-york/components/audio-visualizer';

const selectedId = ref<string | null>(null);

const selectedMode = ref<
  | 'fft'
  | 'fft-enhanced'
  | 'waveform'
  | 'frequency-bars'
  | 'mirrored-spectrum'
  | 'peak-hold'
  | 'spectrogram'
  | 'scope-xy'
  | 'waterfall'
  | 'led-bars'
>('fft-enhanced');
const visualizerModes = [
  { value: 'fft', label: 'FFT' },
  { value: 'fft-enhanced', label: 'Enhanced FFT' },
  { value: 'waveform', label: 'Waveform' },
  { value: 'frequency-bars', label: 'Bars' },
  { value: 'mirrored-spectrum', label: 'Mirrored Spectrum' },
  { value: 'peak-hold', label: 'Peak Hold' },
  { value: 'spectrogram', label: 'Spectrogram' },
  { value: 'scope-xy', label: 'Scope XY' },
  { value: 'waterfall', label: 'Waterfall' },
  { value: 'led-bars', label: 'LED Bars' },
];
</script>

<template>
  <MediaDevicesProvider :open="true" v-slot="{ microphones, stopAll, errors }">
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-8">
      <!-- Colonne 1 : Sélection de l'audio -->
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

      <!-- Colonne 2 : Sélection du mode de visualisation -->
      <FieldSet>
        <FieldLegend>Visualization Mode</FieldLegend>
        <FieldDescription> Choose the display mode for the audio visualizer. </FieldDescription>
        <FieldGroup class="space-y-4">
          <Field>
            <Select v-model="selectedMode">
              <SelectTrigger class="w-full">
                <SelectValue placeholder="Select a mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem v-for="mode in visualizerModes" :key="mode.value" :value="mode.value">
                    <SelectItemText>{{ mode.label }}</SelectItemText>
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        </FieldGroup>
      </FieldSet>
    </div>

    <AudioDevice
      v-if="selectedId"
      :device-id="selectedId ?? ''"
      auto-start
      echo-cancellation
      v-slot="{ stream }"
    >
      <AudioContextProvider v-slot="{ errors, state }">
        <!-- If you prefere to provide a conainer and let AudioMotion create the canvas <div class="w-full h-[400px] min-h-[400px]"> -->
        <AudioMotion :stream="stream">
          <canvas
            width="600"
            height="400"
            class="w-full border border-border mt-4 bg-linear-to-b from-blue-500 via-purple-500 to-pink-500"
          />
        </AudioMotion>
        <!-- </div> -->
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
