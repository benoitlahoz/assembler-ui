<script setup lang="ts">
import { ref } from 'vue';
import { createReusableTemplate } from '@vueuse/core';
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

const enumerated = ref(false);

const camerasSelect = ref<string[]>([]);
const microphonesSelect = ref<string[]>([]);

const [DefineSkeleton, FieldSkeleton] = createReusableTemplate();

const onUpdateCamera = async (
  deviceId: string,
  start: (deviceId: string, constraints: MediaStreamConstraints) => void,
  stop: (deviceId: string) => void
) => {
  if (!camerasSelect.value.includes(deviceId)) {
    await start(deviceId, { video: { deviceId: { exact: deviceId } } });
  } else {
    camerasSelect.value = camerasSelect.value.filter((id) => id !== deviceId);
    stop(deviceId);
  }
};

const onUpdateMicrophone = async (
  deviceId: string,
  start: (deviceId: string, constraints: MediaStreamConstraints) => void,
  stop: (deviceId: string) => void
) => {
  if (!microphonesSelect.value.includes(deviceId)) {
    await start(deviceId, { audio: { deviceId: { exact: deviceId } } });
  } else {
    microphonesSelect.value = microphonesSelect.value.filter((id) => id !== deviceId);
    stop(deviceId);
  }
};
</script>
<template>
  <!-- Reusable Skeleton for Fields -->
  <DefineSkeleton>
    <FieldSet>
      <FieldLabel class="h-4 w-32 bg-gray-300 rounded-md animate-pulse" />
      <FieldDescription class="mt-1 h-3 w-48 bg-gray-200 rounded-md animate-pulse" />
      <Field class="mt-2">
        <div class="h-10 w-full bg-gray-300 rounded-md animate-pulse" />
      </Field>
    </FieldSet>
  </DefineSkeleton>

  <div class="flex flex-col">
    <FieldSet>
      <FieldLegend>Get Available Devices</FieldLegend>
      <FieldDescription>
        Click the button to enumerate available media devices (cameras, microphones and speakers).
      </FieldDescription>
      <Field>
        <Button :disabled="enumerated" variant="outline" @click="enumerated = true"
          >Enumerate Devices</Button
        >
      </Field>
    </FieldSet>

    <Separator class="my-4" />

    <MediaDevicesProvider
      :open="enumerated"
      v-slot="{ isLoading, devices, cameras, microphones, errors, start, stop }"
    >
      <template v-if="isLoading">
        <FieldGroup class="grid grid-cols-2 gap-4">
          <FieldSkeleton />
          <FieldSkeleton />
        </FieldGroup>
      </template>

      <template v-else-if="!devices.length">
        <div
          class="flex items-center justify-center p-8 border-2 border-dashed border-border rounded-lg"
        >
          <p class="text-lg text-muted">No device enumerated</p>
        </div>
      </template>

      <template v-else>
        <FieldGroup class="grid grid-cols-2 gap-4">
          <FieldSet class="min-w-0">
            <FieldLegend>Cameras</FieldLegend>
            <FieldDescription>
              Select one or more cameras from the list of available devices.
            </FieldDescription>
            <Field>
              <Select multiple v-model="camerasSelect" :disabled="!cameras.length">
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Select a camera" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <template v-if="cameras.length">
                      <SelectItem
                        v-for="camera in cameras"
                        :key="camera.deviceId"
                        :value="camera.label"
                        class="truncate"
                        @select="(e: CustomEvent) => onUpdateCamera(camera.deviceId, start, stop)"
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

          <FieldSet class="min-w-0">
            <FieldLegend>Audio Inputs</FieldLegend>
            <FieldDescription>
              Select one or more audio inputs from the list of available devices.
            </FieldDescription>
            <Field>
              <Select multiple v-model="microphonesSelect" :disabled="!microphones.length">
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Select an audio input" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <template v-if="microphones.length">
                      <SelectItem
                        v-for="microphone in microphones"
                        :key="microphone.deviceId"
                        :value="microphone.label"
                        class="truncate"
                        @select="
                          (e: CustomEvent) => onUpdateMicrophone(microphone.deviceId, start, stop)
                        "
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
      </template>
      <Separator class="my-4" />
      <FieldGroup>
        <template v-if="isLoading">
          <FieldSkeleton />
        </template>
        <template v-else>
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
        </template>
      </FieldGroup>
    </MediaDevicesProvider>
  </div>
</template>
