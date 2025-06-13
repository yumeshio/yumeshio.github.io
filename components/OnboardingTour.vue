<script setup lang="ts">
type TourStep = {
	target: string
	content: string
}
const props = defineProps<{
	steps: TourStep[]
}>()

const currentStep = ref(-1)
const target = computed(() =>
	currentStep.value < 0
		? undefined
		: document.querySelector(props.steps[currentStep.value].target),
)
const position = computed(() => {
	const rect = target.value?.getBoundingClientRect()
	if (!rect) {
		return undefined
	}
	return {
		top: rect.top + window.scrollY,
		left: rect.left + window.scrollX,
	}
})
onMounted(() => {
	currentStep.value = 0
})
</script>

<template>
	<Teleport to="body">
		<div
			v-if="position"
			class="absolute z-50 bg-muted border"
			:style="{
				left: `${position.left}px`,
				top: `${position.top}px`,
			}"
		>
			{{ steps[currentStep].content }}
		</div>
	</Teleport>
</template>
