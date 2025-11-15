<script setup lang="ts">
import {
  inject,
  unref,
  useTemplateRef,
  ref,
  computed,
  watch,
  nextTick,
  onBeforeUnmount,
} from 'vue';
import { useCheckIn } from '~~/registry/new-york/composables/use-check-in/useCheckIn';
import { LeafletControlsKey, type ControlItemReference } from '.';

export interface LeafletControlItemProps {
  name: string;
  title?: string;
  type?: 'push' | 'toggle';
  active?: boolean;
}

const props = withDefaults(defineProps<LeafletControlItemProps>(), {
  title: 'A control button',
  type: 'toggle',
  active: false,
});

const emit = defineEmits<{
  (e: 'click', name: string): void;
}>();

const wrapperRef = useTemplateRef('wrapperRef');

const controlsContext = inject(LeafletControlsKey);
console.log('[LeafletControlItem] Controls context:', controlsContext ? 'FOUND' : 'NOT FOUND');
if (controlsContext) {
  console.log('[LeafletControlItem] DeskInjectionKey:', controlsContext.DeskInjectionKey);
}

// Use checkIn for automatic registration/cleanup
const { checkIn } = useCheckIn<ControlItemReference>();

let observer: MutationObserver | null = null;
// Trigger to force data function re-evaluation when content changes
const contentVersion = ref(0);

const getContentHtml = () => {
  const wrapper = unref(wrapperRef);
  if (wrapper) {
    const firstChild = wrapper.firstElementChild;
    if (firstChild) {
      // Check if it's an SVG and if it has actual content
      if (firstChild.tagName === 'svg' || firstChild.querySelector('svg')) {
        const svg = firstChild.tagName === 'svg' ? firstChild : firstChild.querySelector('svg');
        // Iconify SVGs start empty and get populated, check if it has content
        if (svg && svg.children.length > 0) {
          // Clone the element to modify it without affecting the original
          const clone = firstChild.cloneNode(true) as HTMLElement;
          const svgElement = clone.tagName === 'svg' ? clone : clone.querySelector('svg');

          if (svgElement) {
            // Get computed color from the original element
            const computedColor = window.getComputedStyle(firstChild).color;

            // Force currentColor on all paths and shapes for Iconify icons
            svgElement
              .querySelectorAll('path, circle, rect, polygon, polyline, line')
              .forEach((el) => {
                const element = el as SVGElement;
                if (element.hasAttribute('fill') && element.getAttribute('fill') !== 'none') {
                  element.setAttribute('fill', computedColor || 'currentColor');
                }
                if (element.hasAttribute('stroke') && element.getAttribute('stroke') !== 'none') {
                  element.setAttribute('stroke', computedColor || 'currentColor');
                }
              });
          }

          return clone.outerHTML;
        }
      } else {
        // Non-SVG content, return immediately
        return firstChild.outerHTML;
      }
    }
  }
  return '';
};

// Check in with controls desk
const { desk } = controlsContext?.DeskInjectionKey
  ? checkIn(controlsContext.DeskInjectionKey, {
      autoCheckIn: true,
      id: props.name,
      data: () => {
        // Access contentVersion to create reactive dependency
        contentVersion.value;
        const html = getContentHtml();
        console.log(
          `[LeafletControlItem] Generating data for ${props.name}, html length:`,
          html.length
        );
        return {
          name: props.name,
          title: props.title || 'A control button',
          html: html || '',
          type: props.type,
          active: props.active,
        };
      },
      watchData: true,
      debug: false, // Enable debug mode
    })
  : { desk: ref(null) };

// Computed helper using desk to access shared context
const isActive = computed(() => {
  if (!desk || props.type === 'push') return false;
  // Access activeItem from desk's extraContext
  const activeItemName = (desk as any).activeItem?.();
  return activeItemName === props.name || props.active;
});

// Setup MutationObserver to detect when async content loads (for SVG icons)
watch(
  () => wrapperRef.value,
  (wrapper) => {
    if (!wrapper) return;

    nextTick(() => {
      observer = new MutationObserver((mutations) => {
        const hasContent = mutations.some((mutation) => {
          return mutation.addedNodes.length > 0 || mutation.type === 'attributes';
        });

        if (hasContent && controlsContext) {
          // Increment version to trigger data function re-evaluation
          contentVersion.value++;
        }
      });

      const firstChild = wrapper.firstElementChild;
      if (firstChild) {
        observer.observe(firstChild, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['viewBox', 'width', 'height'],
        });
      }
    });
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
});
</script>

<template>
  <div class="hidden">
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
