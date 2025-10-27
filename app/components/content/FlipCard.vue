<template>
	<!-- wrapper keeps a fixed height equal to the taller side -->
	<div
		class="cursor-pointer relative overflow-hidden"
		:style="{ height: heightStyle }"
		@click="toggle"
	>
		<Transition
			enter-active-class="duration-250 opacity-100"
			leave-active-class="duration-250"
			enter-from-class="opacity-0 translate-x-10"
			leave-to-class="opacity-0 -translate-x-10"
			mode="out-in"
			class="relative"
		>
			<div v-if="showFront" key="front" class="w-full">
				<slot />
			</div>
			<div v-else key="back" class="w-full">
				<slot name="back" />
			</div>
		</Transition>

		<!-- invisible measurer renders both sides to determine max height -->
		<div class="absolute inset-0 pointer-events-none opacity-0 -z-10">
			<div ref="mFront" class="w-full">
				<slot />
			</div>
			<div ref="mBack" class="w-full">
				<slot name="back" />
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
const showFront = ref(true)

const mFront = useTemplateRef('mFront')
const mBack = useTemplateRef('mBack')

const height = ref<number>()
const heightStyle = computed(() =>
	height.value === undefined ? 'auto' : `${height.value}px`,
)

let ro: ResizeObserver

function measure() {
	if (!mFront.value || !mBack.value) return
	const h1 = mFront.value.getBoundingClientRect().height
	const h2 = mBack.value.getBoundingClientRect().height
	height.value = Math.max(h1, h2)
}

const toggle = () => {
	showFront.value = !showFront.value
	nextTick(measure)
}

onMounted(() => {
	nextTick(measure)

	// watch for dynamic content size changes
	ro = new ResizeObserver(() => {
		measure()
	})
	if (mFront.value) ro.observe(mFront.value)
	if (mBack.value) ro.observe(mBack.value)
	window.addEventListener('resize', measure)
})

onBeforeUnmount(() => {
	if (ro) {
		if (mFront.value) ro.unobserve(mFront.value)
		if (mBack.value) ro.unobserve(mBack.value)
		ro.disconnect()
	}
	window.removeEventListener('resize', measure)
})
</script>
