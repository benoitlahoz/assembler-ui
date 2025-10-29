<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

const knobVariants = {
  default: 'stroke-gray-300 fill-white',
  primary: 'stroke-blue-500 fill-blue-100',
  secondary: 'stroke-gray-500 fill-gray-100',
  destructive: 'stroke-red-500 fill-red-100',
};

const knobSizes = {
  sm: 32,
  md: 48,
  lg: 64,
};

const props = defineProps({
  modelValue: { type: Number, default: 0 },
  min: { type: Number, default: 0 },
  max: { type: Number, default: 100 },
  step: { type: Number, default: 1 },
  variant: { type: String, default: 'default' },
  size: { type: String, default: 'md' },
  disabled: { type: Boolean, default: false },
});

const emit = defineEmits(['update:modelValue']);

const radius = computed(() => knobSizes[props.size as keyof typeof knobSizes] / 2 - 6);
const center = computed(() => knobSizes[props.size as keyof typeof knobSizes] / 2);
const circumference = computed(() => 2 * Math.PI * radius.value);
const percent = computed(() => (props.modelValue - props.min) / (props.max - props.min));
const dashoffset = computed(() => circumference.value * (1 - percent.value));

function handleDrag(e: MouseEvent | TouchEvent) {
  if (props.disabled) return;
  const svg = (e.target as SVGElement).closest('svg');
  if (!svg) return;
  const rect = svg.getBoundingClientRect();
  const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
  const y = 'touches' in e ? e.touches[0].clientY : e.clientY;
  const dx = x - (rect.left + center.value);
  const dy = y - (rect.top + center.value);
  let angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
  if (angle < 0) angle += 360;
  const value =
    Math.round(((angle / 360) * (props.max - props.min)) / props.step) * props.step + props.min;
  emit('update:modelValue', Math.max(props.min, Math.min(props.max, value)));
}

function startDrag(e: MouseEvent | TouchEvent) {
  handleDrag(e);
  window.addEventListener('mousemove', handleDrag);
  window.addEventListener('touchmove', handleDrag);
  window.addEventListener('mouseup', stopDrag);
  window.addEventListener('touchend', stopDrag);
}

function stopDrag() {
  window.removeEventListener('mousemove', handleDrag);
  window.removeEventListener('touchmove', handleDrag);
  window.removeEventListener('mouseup', stopDrag);
  window.removeEventListener('touchend', stopDrag);
}

const svgClass = computed(() =>
  cn(
    'transition-all select-none',
    knobVariants[props.variant as keyof typeof knobVariants],
    props.disabled && 'opacity-50 cursor-not-allowed'
  )
);
</script>

<template>
  <div
    :class="
      cn(
        'inline-flex items-center justify-center',
        size === 'sm' && 'w-8 h-8',
        size === 'md' && 'w-12 h-12',
        size === 'lg' && 'w-16 h-16',
        disabled && 'pointer-events-none opacity-50'
      )
    "
  >
    <svg
      :width="knobSizes[size]"
      :height="knobSizes[size]"
      :viewBox="`0 0 ${knobSizes[size]} ${knobSizes[size]}`"
      :class="svgClass"
      @mousedown="startDrag"
      @touchstart.prevent="startDrag"
      style="touch-action: none"
    >
      <circle :cx="center" :cy="center" :r="radius" class="stroke-2 fill-none opacity-30" />
      <circle
        :cx="center"
        :cy="center"
        :r="radius"
        class="stroke-2 fill-none transition-all"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashoffset"
        stroke-linecap="round"
        style="transform: rotate(-90deg); transform-origin: center"
      />
      <circle
        :cx="center + radius * Math.cos(((percent * 360 - 90) * Math.PI) / 180)"
        :cy="center + radius * Math.sin(((percent * 360 - 90) * Math.PI) / 180)"
        r="4"
        class="fill-current stroke-none shadow"
      />
    </svg>
    <span class="absolute text-xs font-medium select-none pointer-events-none">
      {{ modelValue }}
    </span>
  </div>
</template>
