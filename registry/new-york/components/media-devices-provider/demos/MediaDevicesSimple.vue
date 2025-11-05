<script setup lang="ts">
import { ref } from 'vue';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
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
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { MediaDevicesProvider } from '~~/registry/new-york/components/media-devices-provider';

const open = ref(false);

const camerasSelect = ref<string[]>([]);
const microphonesSelect = ref<string[]>([]);
</script>
<template>
  <div class="flex flex-col">
    <FieldSet>
      <FieldLegend>Get Available Devices</FieldLegend>
      <FieldDescription>
        Click the button to enumerate available media devices (cameras, microphones and speakers).
      </FieldDescription>
      <Field>
        <Button :disabled="open" variant="outline" @click="open = true">Enumerate Devices</Button>
      </Field>
    </FieldSet>
    <Separator class="my-4" />
    <MediaDevicesProvider :open="open" v-slot="{ cameras, microphones, errors }">
      <FieldGroup class="grid grid-cols-2 gap-4">
        <FieldSet>
          <FieldLegend>Cameras</FieldLegend>
          <FieldDescription> Select from the list of available camera devices. </FieldDescription>
          <Field>
            <Select multiple v-model="camerasSelect">
              <SelectTrigger class="w-[180px]">
                <SelectValue placeholder="Select a camera" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <template v-if="cameras.length">
                    <SelectLabel>Available Cameras</SelectLabel>
                    <SelectItem
                      v-for="camera in cameras"
                      :key="camera.deviceId"
                      :value="camera.deviceId"
                    >
                      {{ camera.label || 'Unnamed Device' }}
                    </SelectItem>
                  </template>
                  <template v-else>
                    <SelectLabel>No Devices Found</SelectLabel>
                  </template>
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        </FieldSet>

        <FieldSet>
          <FieldLegend>Audio Inputs</FieldLegend>
          <FieldDescription>
            Select from the list of available audio input devices.
          </FieldDescription>
          <Field>
            <Select multiple v-model="microphonesSelect">
              <SelectTrigger class="w-[180px]">
                <SelectValue placeholder="Select an audio input" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <template v-if="microphones.length">
                    <SelectLabel>Available Microphones</SelectLabel>
                    <SelectItem
                      v-for="microphone in microphones"
                      :key="microphone.deviceId"
                      :value="microphone.deviceId"
                    >
                      {{ microphone.label || 'Unnamed Device' }}
                    </SelectItem>
                  </template>
                  <template v-else>
                    <SelectLabel>No Devices Found</SelectLabel>
                  </template>
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        </FieldSet>
      </FieldGroup>
      <Separator class="my-4" />
      <FieldGroup>
        <FieldSet>
          <Field>
            <FieldLabel>Errors</FieldLabel>
            <div class="flex space-x-2">
              <template v-if="errors.length" v-for="(error, index) in errors" :key="index">
                <Badge variant="destructive">
                  {{ error.message || (error as any).constraint || error }}
                </Badge>
              </template>
              <template v-else>
                <Badge variant="default">No Errors</Badge>
              </template>
            </div>
          </Field>
        </FieldSet>
      </FieldGroup>
    </MediaDevicesProvider>
  </div>
</template>
