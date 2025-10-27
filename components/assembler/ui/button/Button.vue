<template>
	<button
		:class="computedClass"
		:type="type"
		:disabled="disabled"
		v-bind="$attrs"
		@click="onClick"
	>
		<span v-if="$slots.icon" class="mr-2 flex items-center">
			<slot name="icon" />
		</span>
		<span><slot /></span>
	</button>
</template>

<script setup lang="ts">
import { computed, defineProps, defineEmits } from 'vue';

const props = defineProps({
	variant: {
		type: String,
		default: 'default',
		validator: (v: string) => ['default', 'outline', 'ghost', 'link', 'destructive'].includes(v),
	},
	size: {
		type: String,
		default: 'md',
		validator: (v: string) => ['sm', 'md', 'lg'].includes(v),
	},
	type: {
		type: String as () => 'button' | 'submit' | 'reset',
		default: 'button',
		validator: (v: string) => ['button', 'submit', 'reset'].includes(v),
	},
	disabled: {
		type: Boolean,
		default: false,
	},
});

const emit = defineEmits(['click']);

const baseClass =
	'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background';

const variantClasses: Record<string, string> = {
	default: 'bg-primary text-primary-foreground hover:bg-primary/90',
	outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
	ghost: 'hover:bg-accent hover:text-accent-foreground',
	link: 'underline-offset-4 hover:underline text-primary',
	destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
};

const sizeClasses: Record<string, string> = {
	sm: 'h-8 px-3 rounded-md',
	md: 'h-10 px-4 rounded-md',
	lg: 'h-12 px-8 rounded-md',
};

const computedClass = computed(() => {
	return [
		baseClass,
		variantClasses[props.variant] || variantClasses.default,
		sizeClasses[props.size] || sizeClasses.md,
	].join(' ');
});

function onClick(e: MouseEvent) {
	if (!props.disabled) emit('click', e);
}
</script>

<style scoped>
/* Ajoutez ici des styles personnalisés si besoin */
</style>
