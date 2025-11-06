<script setup lang="ts">
import AudioMotionAnalyzer from 'audiomotion-analyzer';
import { type Ref, inject, ref, watch, nextTick, useTemplateRef, unref, onUnmounted } from 'vue';
import { AudioContextInjectionKey } from '~~/registry/new-york/components/audio-context-provider';
import { useTypedElementSearch } from '~~/registry/new-york/composables/use-typed-element-search/useTypedElementSearch';
import { useTailwindClassParser } from '~~/registry/new-york/composables/use-tailwind-class-parser/useTailwindClassParser';

export interface AudioMotionAnalyzerProps {
  stream?: MediaStream | null;
  audio?: HTMLAudioElement | Ref<HTMLAudioElement | null> | null;
}

const props = withDefaults(defineProps<AudioMotionAnalyzerProps>(), {
  stream: undefined,
  audio: undefined,
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
          gradient: 'prism',
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
          gradient: 'prism',
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
        gradient: 'prism',
        mode: 3,
        barSpace: 0.6,
        ledBars: true,
        connectSpeakers: false,
      });
      analyzer.connectInput(source);
    } else if (canvas) {
      const gradient = getTailwindBaseCssValues(canvas, ['background-image']);
      console.log('Gradient CSS from Tailwind:', gradient); //
      const obj = parseLinearGradient(gradient['background-image'] || '');

      console.log('Parsed gradient:', obj);

      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      analyzer = new AudioMotionAnalyzer({
        audioCtx: context,
        canvas,
        width,
        height,
        gradient: 'prism',
        mode: 3,
        barSpace: 0.6,
        ledBars: true,
        connectSpeakers: false,
      });
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

watch(
  () => [props.stream, props.audio, injectedContext.value],
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
