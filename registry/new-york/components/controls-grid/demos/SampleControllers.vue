<script setup lang="ts">
/**
 * Exemples de composants à utiliser dans la grille
 * Ces composants montrent comment créer des contrôleurs personnalisés
 */
import { ref, computed } from 'vue'

// Props communes à tous les composants
interface BaseProps {
  id: string
  width?: number
  height?: number
}

// ===========================
// Button Component
// ===========================
interface ButtonProps extends BaseProps {
  label?: string
  value?: boolean
  color?: string
}

const buttonProps = withDefaults(defineProps<ButtonProps>(), {
  label: 'Button',
  value: false,
  color: '#3b82f6',
})

const buttonEmit = defineEmits<{
  'update:value': [value: boolean]
  'click': []
}>()

const buttonActive = ref(buttonProps.value)

const toggleButton = () => {
  buttonActive.value = !buttonActive.value
  buttonEmit('update:value', buttonActive.value)
  buttonEmit('click')
}

// ===========================
// Slider Component
// ===========================
interface SliderProps extends BaseProps {
  min?: number
  max?: number
  value?: number
  label?: string
  color?: string
}

const sliderProps = withDefaults(defineProps<SliderProps>(), {
  min: 0,
  max: 100,
  value: 50,
  label: 'Slider',
  color: '#8b5cf6',
})

const sliderEmit = defineEmits<{
  'update:value': [value: number]
}>()

const sliderValue = ref(sliderProps.value)

const handleSliderChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  sliderValue.value = Number(target.value)
  sliderEmit('update:value', sliderValue.value)
}

// ===========================
// Knob Component (rotary)
// ===========================
interface KnobProps extends BaseProps {
  min?: number
  max?: number
  value?: number
  label?: string
  color?: string
}

const knobProps = withDefaults(defineProps<KnobProps>(), {
  min: 0,
  max: 100,
  value: 50,
  label: 'Knob',
  color: '#ec4899',
})

const knobEmit = defineEmits<{
  'update:value': [value: number]
}>()

const knobValue = ref(knobProps.value)
const isDragging = ref(false)
const startY = ref(0)
const startValue = ref(0)

const knobRotation = computed(() => {
  const percentage = (knobValue.value - knobProps.min) / (knobProps.max - knobProps.min)
  return percentage * 270 - 135 // -135° à +135°
})

const handleKnobMouseDown = (event: MouseEvent) => {
  isDragging.value = true
  startY.value = event.clientY
  startValue.value = knobValue.value
}

const handleKnobMouseMove = (event: MouseEvent) => {
  if (!isDragging.value) return
  
  const deltaY = startY.value - event.clientY
  const range = knobProps.max - knobProps.min
  const newValue = Math.max(
    knobProps.min,
    Math.min(knobProps.max, startValue.value + (deltaY / 100) * range)
  )
  
  knobValue.value = Math.round(newValue)
  knobEmit('update:value', knobValue.value)
}

const handleKnobMouseUp = () => {
  isDragging.value = false
}

// ===========================
// XY Pad Component
// ===========================
interface XYPadProps extends BaseProps {
  xMin?: number
  xMax?: number
  yMin?: number
  yMax?: number
  xValue?: number
  yValue?: number
  label?: string
  color?: string
}

const xyPadProps = withDefaults(defineProps<XYPadProps>(), {
  xMin: 0,
  xMax: 100,
  yMin: 0,
  yMax: 100,
  xValue: 50,
  yValue: 50,
  label: 'XY Pad',
  color: '#ef4444',
})

const xyPadEmit = defineEmits<{
  'update:x': [value: number]
  'update:y': [value: number]
}>()

const xValue = ref(xyPadProps.xValue)
const yValue = ref(xyPadProps.yValue)
const padDragging = ref(false)

const padPosition = computed(() => ({
  x: ((xValue.value - xyPadProps.xMin) / (xyPadProps.xMax - xyPadProps.xMin)) * 100,
  y: 100 - ((yValue.value - xyPadProps.yMin) / (xyPadProps.yMax - xyPadProps.yMin)) * 100,
}))

const updatePadPosition = (event: MouseEvent, element: HTMLElement) => {
  const rect = element.getBoundingClientRect()
  const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width))
  const y = Math.max(0, Math.min(1, 1 - (event.clientY - rect.top) / rect.height))
  
  xValue.value = Math.round(xyPadProps.xMin + x * (xyPadProps.xMax - xyPadProps.xMin))
  yValue.value = Math.round(xyPadProps.yMin + y * (xyPadProps.yMax - xyPadProps.yMin))
  
  xyPadEmit('update:x', xValue.value)
  xyPadEmit('update:y', yValue.value)
}

const handlePadMouseDown = (event: MouseEvent) => {
  padDragging.value = true
  updatePadPosition(event, event.currentTarget as HTMLElement)
}

const handlePadMouseMove = (event: MouseEvent) => {
  if (!padDragging.value) return
  updatePadPosition(event, event.currentTarget as HTMLElement)
}

const handlePadMouseUp = () => {
  padDragging.value = false
}

// Global mouse handlers
import { onMounted, onUnmounted } from 'vue'

onMounted(() => {
  document.addEventListener('mousemove', handleKnobMouseMove)
  document.addEventListener('mouseup', handleKnobMouseUp)
  document.addEventListener('mousemove', handlePadMouseMove)
  document.addEventListener('mouseup', handlePadMouseUp)
})

onUnmounted(() => {
  document.removeEventListener('mousemove', handleKnobMouseMove)
  document.removeEventListener('mouseup', handleKnobMouseUp)
  document.removeEventListener('mousemove', handlePadMouseMove)
  document.removeEventListener('mouseup', handlePadMouseUp)
})
</script>

<template>
  <!-- Button Component -->
  <div
    v-if="buttonProps.id"
    class="controller button-controller"
    :class="{ active: buttonActive }"
    :style="{ backgroundColor: buttonProps.color }"
    @click="toggleButton"
  >
    <span class="label">{{ buttonProps.label }}</span>
    <div class="button-indicator" />
  </div>

  <!-- Slider Component -->
  <div
    v-if="sliderProps.id"
    class="controller slider-controller"
  >
    <span class="label">{{ sliderProps.label }}</span>
    <div class="slider-track">
      <div
        class="slider-fill"
        :style="{
          width: `${((sliderValue - sliderProps.min) / (sliderProps.max - sliderProps.min)) * 100}%`,
          backgroundColor: sliderProps.color,
        }"
      />
      <input
        v-model.number="sliderValue"
        type="range"
        :min="sliderProps.min"
        :max="sliderProps.max"
        class="slider-input"
        @input="handleSliderChange"
      >
    </div>
    <span class="value">{{ sliderValue }}</span>
  </div>

  <!-- Knob Component -->
  <div
    v-if="knobProps.id"
    class="controller knob-controller"
  >
    <span class="label">{{ knobProps.label }}</span>
    <div
      class="knob-container"
      @mousedown="handleKnobMouseDown"
    >
      <svg class="knob-svg" viewBox="0 0 100 100">
        <!-- Background arc -->
        <path
          d="M 15,85 A 40 40 0 1 1 85,85"
          fill="none"
          stroke="#e5e5e5"
          stroke-width="8"
          stroke-linecap="round"
        />
        <!-- Value arc -->
        <path
          d="M 15,85 A 40 40 0 1 1 85,85"
          fill="none"
          :stroke="knobProps.color"
          stroke-width="8"
          stroke-linecap="round"
          :stroke-dasharray="`${((knobValue - knobProps.min) / (knobProps.max - knobProps.min)) * 188.5} 188.5`"
        />
        <!-- Knob circle -->
        <circle cx="50" cy="50" r="30" :fill="knobProps.color" />
        <!-- Indicator line -->
        <line
          x1="50"
          y1="50"
          x2="50"
          y2="25"
          stroke="white"
          stroke-width="3"
          stroke-linecap="round"
          :transform="`rotate(${knobRotation} 50 50)`"
        />
      </svg>
    </div>
    <span class="value">{{ knobValue }}</span>
  </div>

  <!-- XY Pad Component -->
  <div
    v-if="xyPadProps.id"
    class="controller xypad-controller"
  >
    <span class="label">{{ xyPadProps.label }}</span>
    <div
      class="xypad-area"
      @mousedown="handlePadMouseDown"
    >
      <div class="xypad-crosshair-h" :style="{ top: `${padPosition.y}%` }" />
      <div class="xypad-crosshair-v" :style="{ left: `${padPosition.x}%` }" />
      <div
        class="xypad-pointer"
        :style="{
          left: `${padPosition.x}%`,
          top: `${padPosition.y}%`,
          backgroundColor: xyPadProps.color,
        }"
      />
    </div>
    <div class="xypad-values">
      <span>X: {{ xValue }}</span>
      <span>Y: {{ yValue }}</span>
    </div>
  </div>
</template>

<style scoped>
.controller {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  height: 100%;
  padding: 0.75rem;
  user-select: none;
}

.label {
  font-size: 0.75rem;
  font-weight: 600;
  color: hsl(var(--foreground));
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.value {
  font-size: 0.875rem;
  font-weight: 500;
  color: hsl(var(--muted-foreground));
  font-variant-numeric: tabular-nums;
}

/* Button */
.button-controller {
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 8px;
  color: white;
}

.button-controller:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.button-controller.active {
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.3);
}

.button-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.3);
  transition: background-color 0.2s;
}

.button-controller.active .button-indicator {
  background-color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.6);
}

/* Slider */
.slider-controller {
  gap: 0.25rem;
}

.slider-track {
  position: relative;
  width: 100%;
  height: 8px;
  background-color: #e5e5e5;
  border-radius: 4px;
  overflow: hidden;
}

.slider-fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  transition: width 0.1s;
  pointer-events: none;
}

.slider-input {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

/* Knob */
.knob-container {
  position: relative;
  width: 80%;
  aspect-ratio: 1;
  cursor: pointer;
}

.knob-svg {
  width: 100%;
  height: 100%;
}

/* XY Pad */
.xypad-controller {
  gap: 0.5rem;
}

.xypad-area {
  position: relative;
  width: 100%;
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  border-radius: 8px;
  cursor: crosshair;
  overflow: hidden;
}

.xypad-crosshair-h,
.xypad-crosshair-v {
  position: absolute;
  background-color: rgba(255, 255, 255, 0.3);
  pointer-events: none;
}

.xypad-crosshair-h {
  left: 0;
  right: 0;
  height: 1px;
}

.xypad-crosshair-v {
  top: 0;
  bottom: 0;
  width: 1px;
}

.xypad-pointer {
  position: absolute;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid white;
  transform: translate(-50%, -50%);
  pointer-events: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.xypad-values {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: hsl(var(--muted-foreground));
}
</style>
