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
import {
  AudioMotionAnalyzer,
  AudioMotionGradient,
  AudioMotionMirror,
  AudioMotionMode,
  type AudioMotionGradientDefinition,
} from '~~/registry/new-york/components/audio-motion-analyzer';

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

const poppyGradient: AudioMotionGradientDefinition = {
  name: 'poppy',
  gradient: {
    bgColor: 'rgba(0, 0, 0, 0, 0)',
    dir: 'v' as const,
    colorStops: [
      { color: '#ff0000', pos: 0 },
      { color: '#ff8000', pos: 0.2 },
      { color: '#ffff00', pos: 0.4 },
      { color: '#80ff00', pos: 0.6 },
      { color: '#00ff00', pos: 0.8 },
      { color: '#00ffff', pos: 1 },
    ],
  },
};
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
        <!-- If you prefer to provide a container and let AudioMotionAnalyzer create the canvas <div class="w-full h-[400px] min-h-[400px]"> -->
        <AudioMotionAnalyzer
          :stream="stream"
          :mode="AudioMotionMode.Graph"
          gradient="sunset"
          show-peaks
          :mirror="AudioMotionMirror.None"
        >
          <!-- If styles are defined inline, they will take precedence over the classes -->
          <AudioMotionGradient
            name="sunset"
            class="bg-linear-to-r from-red-500 to-orange-500"
            style="
              background: linear-gradient(
                to bottom,
                #7e3ff2 0%,
                #ec4899 30%,
                #3b82f6 60%,
                #fde047 90%
              );
            "
          />

          <AudioMotionGradient
            name="foreground"
            style="
              background: linear-gradient(
                to bottom,
                var(--color-foreground) 0%,
                var(--color-foreground) 100%
              );
            "
          />

          <!-- TODO: This one doesn't work as expected -> see parsing-->
          <AudioMotionGradient
            name="foreground-broken"
            class="bg-linear-to-b from-[--color-foreground] via-purple-400 to-[--color-background] to-90%"
          />

          <!-- Gradient object takes precedence over class and styles -->
          <AudioMotionGradient :name="poppyGradient.name" :gradient="poppyGradient.gradient" />

          <canvas width="600" height="400" />
        </AudioMotionAnalyzer>
        <!-- </div> -->
        <template v-if="errors && errors.length">
          <div class="text-red-500 text-xs mt-2" style="">
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
