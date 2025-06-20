<script setup lang="ts">
const toast = useToast()
const { t } = useI18n({
	useScope: 'local',
})

type TourStep = {
	target: string
	content: string
	onStart?: (target?: HTMLElement) => void
	onEnd?: (target?: HTMLElement) => void
}

const { id, steps } = defineProps<{
	id: string
	steps: TourStep[]
}>()

const cookie = useCookie(`tour-${id}`)

const currentStepId = computed({
	get() {
		if (cookie.value === undefined || cookie.value === null) {
			return 0
		}
		return parseInt(cookie.value)
	},
	set(newValue) {
		cookie.value = newValue.toString()
	},
})

const isEnabled = ref(false)

const enabled = computed({
	get() {
		if (currentStepId.value < 0 || currentStepId.value >= steps.length) {
			return false
		}
		return isEnabled.value
	},
	set(newValue) {
		isEnabled.value = newValue
	},
})

const currentStep = computed(() => {
	if (!enabled.value) {
		return undefined
	}
	return steps[currentStepId.value]
})

watch(currentStep, (newValue, oldValue) => {
	if (oldValue && oldValue.onEnd) {
		const target = document.querySelector<HTMLElement>(oldValue.target)
		oldValue.onEnd(target ?? undefined)
	}
	if (newValue && newValue.onStart) {
		const target = document.querySelector<HTMLElement>(newValue.target)
		nextTick(() => {
			newValue.onStart!(target ?? undefined)
		})
	}
})

type Bounding = {
	width: number
	height: number
	top: number
	left: number
}

const getTargetBounding = (): Bounding | undefined => {
	if (!enabled.value || !currentStep.value) {
		return undefined
	}
	const target = document.querySelector(currentStep.value.target)
	const rect = target?.getBoundingClientRect()
	if (!rect) {
		return undefined
	}
	const b = {
		width: rect.width + 4,
		height: rect.height + 4,
		top: rect.top + window.scrollY - 2,
		left: rect.left + window.scrollX - 2,
	}
	if (b.left < 4) {
		const offset = 4 - b.left
		b.width -= 2 * offset
		b.left = 4
	}
	if (b.top < 4) {
		const offset = 4 - b.top
		b.top -= 2 * offset
		b.top = 4
	}
	return b
}

const nextStep = () => {
	currentStepId.value++
}

const handleContinue = (e: MouseEvent) => {
	e.stopPropagation()
	open.value = true
}

const handleHide = () => {
	open.value = false
	toast.add({
		description: t('tourIsHidden'),
		duration: 0,
		type: 'foreground',
		close: {
			onClick: handleContinue,
		},
		actions: [
			{
				label: t('continue'),
				trailingIcon: 'i-lucide-chevrons-right',
				variant: 'outline',
				color: 'neutral',
				onClick: handleContinue,
			},
			{
				label: t('done'),
				variant: 'outline',
				color: 'neutral',
				onClick: handleDone,
			},
		],
	})
}

const handleDone = () => {
	currentStepId.value = steps.length
}

const bounding = ref<Bounding>()

const interval = shallowRef()

const open = ref(true)

onMounted(() => {
	nextTick(() => {
		enabled.value = true
		interval.value = setInterval(() => {
			bounding.value = getTargetBounding()
		}, 100)
	})
})

onUnmounted(() => {
	clearInterval(interval.value)
})
</script>

<template>
	<Teleport to="body">
		<UPopover
			v-if="enabled && bounding"
			v-model:open="open"
			:arrow="true"
			:dismissible="false"
			:modal="true"
			:ui="{
				content: 'max-w-(--reka-popper-available-width)',
			}"
		>
			<div
				class="absolute rounded border-dotted border-primary pointer-events-none animate-[highlight-target_1500ms_ease-in-out_infinite] z-5000"
				:style="{
					left: `${bounding.left}px`,
					top: `${bounding.top}px`,
					width: `${bounding.width}px`,
					height: `${bounding.height}px`,
					minWidth: `${bounding.width}px`,
					minHeight: `${bounding.height}px`,
				}"
			></div>
			<template #content>
				<UContainer class="bg-default text-default p-4 sm:p-6 md:p-8">
					<div class="max-w-full">{{ currentStep?.content }}</div>
					<div class="flex gap-2 sm:gap-4 justify-end mt-4 sm:mt-6 lg:mt-8">
						<UButton
							:label="t('done')"
							color="neutral"
							class="mr-auto px-4"
							@click="handleDone"
						/>
						<UButton
							:label="t('hide')"
							color="neutral"
							variant="subtle"
							class="px-4"
							@click="handleHide"
						/>
						<UButton
							:label="t('next')"
							variant="subtle"
							class="px-4"
							@click="nextStep"
						/>
					</div>
				</UContainer>
			</template>
		</UPopover>
	</Teleport>
</template>

<i18n lang="json">
{
	"ja": {
		"hide": "試してみる",
		"next": "次へ",
		"done": "終了",
		"continue": "続ける",
		"tourIsHidden": "ガイドが一時的に非表示になっています。アプリをご自由にお試しください。"
	},
	"zh": {
		"hide": "我要试试",
		"next": "下一步",
		"done": "结束引导",
		"continue": "继续",
		"tourIsHidden": "引导已暂时隐藏。您可以自由体验本应用。"
	}
}
</i18n>

<style lang="css">
@keyframes highlight-target {
	0%,
	100% {
		border-width: 1px;
		filter: brightness(90%);
		backdrop-filter: brightness(90%);
	}
	50% {
		border-width: 2px;
		filter: brightness(110%);
		backdrop-filter: brightness(110%);
	}
}
</style>
