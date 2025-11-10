<script setup lang="ts">
import {
  inject,
  watch,
  ref,
  type Ref,
  nextTick,
  onBeforeUnmount,
  type HTMLAttributes,
  onMounted,
} from 'vue';
import { useTailwindClassParser } from '~~/registry/new-york/composables/use-css-parser/useCssParser';
import { LeafletMapKey, LeafletModuleKey } from '.';

export interface LeafletCircleProps {
  lat?: number | string;
  lng?: number | string;
  radius?: number | string;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<LeafletCircleProps>(), {
  lat: 43.280608,
  lng: 5.350242,
  radius: 100,
});

const { getTailwindBaseCssValues } = useTailwindClassParser();

const L = inject(LeafletModuleKey, null);
const map = inject<Ref<L.Map | null>>(LeafletMapKey, ref(null));
const circle = ref<L.Circle | null>(null);

const getColors = () => {
  const classNames = props.class ? props.class.toString().split(' ') : [];
  const el = document.createElement('div');
  el.className = classNames.join(' ');
  el.style.position = 'absolute';
  el.style.visibility = 'hidden';
  el.style.zIndex = '-9999';
  document.body.appendChild(el);
  const cssValues = getTailwindBaseCssValues(el, ['color', 'background-color', 'opacity']);
  document.body.removeChild(el);
  return {
    color: cssValues['color'] || 'blue',
    fillColor: cssValues['background-color'] || 'blue',
    fillOpacity: cssValues['opacity'] ? parseFloat(cssValues['opacity']) : 0.2,
  };
};

watch(
  () => [map.value, props.lat, props.lng, props.radius],
  () => {
    nextTick(() => {
      if (
        map.value &&
        L &&
        !isNaN(Number(props.lat)) &&
        !isNaN(Number(props.lng)) &&
        !isNaN(Number(props.radius))
      ) {
        if (circle.value) {
          circle.value.setLatLng([Number(props.lat), Number(props.lng)]);
          circle.value.setRadius(Number(props.radius));
        } else {
          circle.value = L.circle([Number(props.lat), Number(props.lng)], {
            radius: Number(props.radius),
          });
          circle.value.addTo(map.value);
        }
        const colors = getColors();
        circle.value.setStyle({
          color: colors.color,
          fillColor: colors.fillColor,
          fillOpacity: colors.fillOpacity,
        });
      } else {
        if (circle.value) {
          circle.value.remove();
          circle.value = null as any;
        }
      }
    });
  },
  { immediate: true, flush: 'post' }
);

onBeforeUnmount(() => {
  if (circle.value) {
    circle.value.remove();
  }
});
</script>

<template><slot /></template>
