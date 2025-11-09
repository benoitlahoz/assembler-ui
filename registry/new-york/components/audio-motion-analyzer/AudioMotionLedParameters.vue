<script setup lang="ts">
import { inject, ref, watchEffect, type Ref } from 'vue';
import { AudioMotionLedParametersKey, type AudioMotionLedParametersDefinition } from '.';

export interface AudioMotionLedParametersProps {
  name: string;
  maxLeds: number;
  spaceV: number;
  spaceH: number;
}

const ledParams = inject<Ref<AudioMotionLedParametersDefinition[]>>(
  AudioMotionLedParametersKey,
  ref([])
);

const props = defineProps<AudioMotionLedParametersProps>();

watchEffect(() => {
  if (!ledParams.value.find((p) => p.name === props.name)) {
    ledParams.value.push({
      name: props.name,
      params: {
        maxLeds: props.maxLeds,
        spaceV: props.spaceV,
        spaceH: props.spaceH,
      },
    });
  } else {
    const existing = ledParams.value.find((p) => p.name === props.name);
    if (existing) {
      existing.params.maxLeds = props.maxLeds;
      existing.params.spaceV = props.spaceV;
      existing.params.spaceH = props.spaceH;
    }
  }
});
</script>
