<script setup lang="ts">
import { nextTick, ref, useTemplateRef } from 'vue';
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
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  MediaDevicesProvider,
  AudioDevice,
  VideoDevice,
} from '~~/registry/new-york/components/media-devices-provider';
import SelectItemText from '~/components/ui/select/SelectItemText.vue';

type DeviceId = string;

const enumerated = ref(false);

const camerasSelect = ref<DeviceId[]>([]);
const microphonesSelect = ref<DeviceId[]>([]);

const cameraRefs = ref<HTMLVideoElement[]>([]);
const microphoneRefs = ref<HTMLAudioElement[]>([]);

const onUpdateCamera = async (
  deviceId: DeviceId,
  start: (deviceId: string, constraints: MediaStreamConstraints) => void,
  stop: (deviceId: string) => void
) => {
  if (!camerasSelect.value.includes(deviceId)) {
    await start(deviceId, { video: { deviceId: { exact: deviceId } } });
  } else {
    camerasSelect.value = camerasSelect.value.filter((camera) => camera !== deviceId);
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
    microphonesSelect.value = microphonesSelect.value.filter((mic) => mic !== deviceId);
    stop(deviceId);
  }
};

const handleVideoStream = (index: number, stream: MediaStream | null) => {
  nextTick(() => {
    const element = cameraRefs.value[index];
    if (element) {
      element.srcObject = stream;
    }
  });
};

const handleAudioStream = (index: number, stream: MediaStream | null) => {
  nextTick(() => {
    const element = microphoneRefs.value[index];
    if (element) {
      element.srcObject = stream;
    }
  });
};
</script>
<template>
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
      v-slot="{ devices, cameras, microphones, errors, start, stop }"
    >
      <template v-if="!devices.length">
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
              <Select multiple :disabled="!cameras.length" v-model="camerasSelect">
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Select a camera" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <template v-if="cameras.length">
                      <SelectItem
                        v-for="camera in cameras"
                        :key="camera.deviceId"
                        :name="camera.label"
                        :value="camera.deviceId"
                        class="truncate"
                        @select="onUpdateCamera(camera.deviceId, start, stop)"
                      >
                        <SelectItemText>
                          {{ camera.label || 'Unnamed Device' }}
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
          </FieldSet>

          <FieldSet class="min-w-0">
            <FieldLegend>Audio Inputs</FieldLegend>
            <FieldDescription>
              Select one or more audio inputs from the list of available devices.
            </FieldDescription>
            <Field>
              <Select multiple :disabled="!microphones.length">
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
                        @select="onUpdateMicrophone(microphone.deviceId, start, stop)"
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
          </FieldSet>
        </FieldGroup>
      </template>

      <Separator class="my-4" />

      <div class="grid grid-cols-2 gap-4">
        <VideoDevice
          v-for="(deviceId, index) in camerasSelect"
          :key="deviceId"
          :device-id="deviceId"
          :width="1280"
          :height="720"
          :frame-rate="30"
          auto-start
          @stream="(stream: MediaStream | null) => handleVideoStream(index, stream)"
          v-slot="{ isActive }"
        >
          <video
            v-if="isActive"
            ref="cameraRefs"
            class="aspect-video w-full h-auto rounded-md border border-border"
            autoplay
            playsinline
            muted
          ></video>
        </VideoDevice>

        <AudioDevice
          v-for="(deviceId, index) in microphonesSelect"
          :key="deviceId"
          :device-id="deviceId"
          :echo-cancellation="true"
          :noise-suppression="false"
          :auto-gain-control="true"
          auto-start
          @stream="(stream: MediaStream | null) => handleAudioStream(index, stream)"
          v-slot="{ isActive }"
        >
          <audio
            v-if="isActive"
            ref="microphoneRefs"
            class="w-full h-auto rounded-md border border-border"
            autoplay
            playsinline
            muted
          ></audio>
        </AudioDevice>
      </div>

      <Separator class="my-4" />

      <FieldGroup>
        <FieldSet>
          <Field>
            <FieldLabel>Errors</FieldLabel>
            <div class="flex space-x-2">
              <template v-if="errors.length" v-for="(error, index) in errors" :key="index">
                <Badge variant="destructive">
                  {{
                    error.message
                      ? error.message
                      : (error as any).constraint
                        ? `${error} (${(error as any).constraint})`
                        : error
                  }}
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
