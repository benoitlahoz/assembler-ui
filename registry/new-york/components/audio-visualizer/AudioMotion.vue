<script setup lang="ts">
import AudioMotionAnalyzer from 'audiomotion-analyzer';
import {
  type Ref,
  type HTMLAttributes,
  inject,
  ref,
  watch,
  nextTick,
  useTemplateRef,
  unref,
  onUnmounted,
  computed,
} from 'vue';
import { AudioContextInjectionKey } from '~~/registry/new-york/components/audio-context-provider';
import { useTypedElementSearch } from '~~/registry/new-york/composables/use-typed-element-search/useTypedElementSearch';
import { useTailwindClassParser } from '~~/registry/new-york/composables/use-tailwind-class-parser/useTailwindClassParser';

export interface AudioMotionAnalyzerProps {
  class?: HTMLAttributes['class'];
  stream?: MediaStream | null;
  audio?: HTMLAudioElement | Ref<HTMLAudioElement | null> | null;
  gradient?: 'classic' | 'orangered' | 'prism' | 'rainbow' | 'steelblue';
}

const props = withDefaults(defineProps<AudioMotionAnalyzerProps>(), {
  stream: undefined,
  audio: undefined,
  gradient: 'classic',
});

const { getTypedElementAmongSiblings, getContainer } = useTypedElementSearch();
const { getTailwindBaseCssValues, parseLinearGradient } = useTailwindClassParser();

const noDisplayElement = useTemplateRef('noDisplayRef');
const injectedContext = inject<Ref<AudioContext | null>>(AudioContextInjectionKey, ref(null));

let analyzer: AudioMotionAnalyzer | null = null;
let source: MediaStreamAudioSourceNode | null = null;

const setupAudio = async () => {
  if (analyzer) {
    analyzer.destroy();
    analyzer = null;
  }

  const canvas: HTMLCanvasElement | null = searchCanvas();
  const container: HTMLElement | null = searchContainer();

  if (props.audio) {
    const audioElement = props.audio instanceof HTMLAudioElement ? props.audio : props.audio.value;
    if (audioElement) {
      if (!canvas && container) {
        const width = container.clientWidth;
        const height = container.clientHeight;
        analyzer = new AudioMotionAnalyzer(container, {
          source: audioElement,
          width,
          height,
          gradient: props.gradient,
          mode: 3,
          barSpace: 0.6,
          ledBars: true,
          connectSpeakers: false,
        });
      } else if (canvas) {
        analyzer = new AudioMotionAnalyzer({
          source: audioElement,
          canvas: canvas,
          width: canvas.width,
          height: canvas.height,
          gradient: props.gradient,
          mode: 3,
          barSpace: 0.6,
          ledBars: true,
          connectSpeakers: false,
        });
      } else {
        console.error(
          'No valid container or canvas found for AudioMotionAnalyzer with audio element.'
        );
      }
    }
  } else if (props.stream) {
    if (source) {
      source.disconnect();
      source = null;
    }
    const context = injectedContext.value || new AudioContext();
    source = context.createMediaStreamSource(props.stream);

    if (!canvas && container) {
      const width = container.clientWidth;
      const height = container.clientHeight;
      analyzer = new AudioMotionAnalyzer(container, {
        audioCtx: context,
        width,
        height,
        gradient: props.gradient,
        mode: 3,
        barSpace: 0.6,
        ledBars: true,
        connectSpeakers: false,
      });
      analyzer.connectInput(source);
    } else if (canvas) {
      const width = canvas.width;
      const height = canvas.height;
      analyzer = new AudioMotionAnalyzer({
        audioCtx: context,
        canvas,
        width,
        height,
        gradient: props.gradient,
        mode: 3,
        barSpace: 0.6,
        ledBars: true,
        connectSpeakers: false,
      });

      const computedGradient = handleGradientClass();
      if (computedGradient) {
        analyzer.registerGradient('custom', computedGradient as any);
        analyzer.gradient = 'custom';
      }
      analyzer.connectInput(source);
    } else {
      console.error(
        'No valid container or canvas found for AudioMotionAnalyzer with media stream.'
      );
    }
  } else {
    console.error(
      'No audio source (audio element or media stream) provided to AudioMotionAnalyzer.'
    );
  }
};

const searchCanvas = (): HTMLCanvasElement | null => {
  const el = unref(noDisplayElement);
  return el
    ? getTypedElementAmongSiblings(
        el,
        (el): el is HTMLCanvasElement => el instanceof HTMLCanvasElement
      )
    : null;
};

const searchContainer = (): HTMLElement | null => {
  const el = unref(noDisplayElement);
  return el ? getContainer(el) : null;
};

const cleanUp = () => {
  if (analyzer) {
    analyzer.destroy();
    analyzer = null;
  }
  if (source) {
    source.disconnect();
    source = null;
  }
};

const handleGradientClass = () => {
  const el = document.createElement('div');
  el.className = props.class || '';
  el.style.position = 'absolute';
  el.style.visibility = 'hidden';
  el.style.zIndex = '-9999';
  document.body.appendChild(el);
  const computedClass = getTailwindBaseCssValues(el, ['background-image']);
  console.warn('Computed Class:', computedClass);
  const computedGradient =
    computedClass['background-image'] && computedClass['background-image'] !== 'none'
      ? parseLinearGradient(computedClass['background-image'])
      : null;

  let gradient: {
    dir?: 'h' | 'v' | undefined;
    colorStops: Array<{ color: string; pos: number }>;
  } | null = null;

  if (computedGradient) {
    gradient = { dir: 'v', colorStops: [] };
    gradient.dir =
      computedGradient.direction.includes('bottom') || computedGradient.direction.includes('top')
        ? 'v'
        : 'h';
    gradient.colorStops = computedGradient.stops;
  }
  document.body.removeChild(el);
  return gradient;
};

watch(
  () => [props.stream, props.audio, props.class, injectedContext.value],
  () => {
    nextTick(async () => {
      await setupAudio();
    });
  },
  { immediate: true }
);

onUnmounted(() => {
  cleanUp();
});
</script>

<template>
  <!-- Hacky way to get content from this renderless component without forcing the user to set explicit width and height to its canvas -->
  <div ref="noDisplayRef" class="hidden z-[-9999]" />
  <slot />
</template>
