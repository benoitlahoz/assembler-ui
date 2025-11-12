<script setup lang="ts">
import { inject, unref, useTemplateRef, watch, nextTick } from 'vue';
import { LeafletControlsKey } from '.';

export interface LeafletControlItemProps {
  name: string;
  title?: string;
  type?: 'push' | 'toggle';
}

const props = withDefaults(defineProps<LeafletControlItemProps>(), {
  title: 'A control button',
  type: 'toggle',
});

const wrapperRef = useTemplateRef('wrapperRef');

const controlsContext = inject(LeafletControlsKey);

const getContentHtml = () => {
  const wrapper = unref(wrapperRef);
  if (wrapper) {
    const firstChild = wrapper.firstElementChild;
    if (firstChild) {
      return firstChild.outerHTML;
    }
  }
  return '';
};

watch(
  () => wrapperRef,
  () => {
    nextTick(() => {
      if (!controlsContext) return;

      const html = getContentHtml();
      controlsContext?.registerItem({
        name: props.name,
        title: props.title || 'A control button',
        html,
      });
    });
  },
  { immediate: true, deep: true }
);
</script>

<template>
  <div>
    <div ref="wrapperRef">
      <slot>
        <!-- default 'plus' icon -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </slot>
    </div>
  </div>
</template>
