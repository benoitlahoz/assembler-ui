import hljs from 'highlight.js';
import hljsVuePlugin from '@highlightjs/vue-plugin';
// @ts-expect-error Types missing
import hljsDefineVue from 'highlightjs-vue';

hljsDefineVue(hljs);
hljs.initHighlightingOnLoad();

export default defineNuxtPlugin(() => {
  return {
    provide: {
      hljs: hljsVuePlugin,
    },
  };
});
