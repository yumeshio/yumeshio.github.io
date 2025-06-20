<script setup lang="ts">
const toast = useToast()
const { t } = useI18n({
	useScope: 'local',
})

type TourStep = {
	target: string
	content: string
}

const { id, steps } = defineProps<{
	id: string
	steps: TourStep[]
}>()

const cookie = useCookie(`tour-${id}`)

const currentStep = computed({
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
		if (currentStep.value < 0 || currentStep.value >= steps.length) {
			return false
		}
		return isEnabled.value
	},
	set(newValue) {
		isEnabled.value = newValue
	},
})

type Bounding = {
	width: number
	height: number
	top: number
	left: number
}

const getTargetBounding = (): Bounding | undefined => {
	if (!enabled.value) {
		return undefined
	}
	const target = document.querySelector(steps[currentStep.value].target)
	const rect = target?.getBoundingClientRect()
	if (!rect) {
		return undefined
	}
	return {
		width: rect.width,
		height: rect.height,
		top: rect.top + window.scrollY,
		left: rect.left + window.scrollX,
	}
}

const nextStep = () => {
	currentStep.value++
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
	currentStep.value = steps.length
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
				class="absolute border border-primary pointer-events-none"
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
					<div class="max-w-full">{{ steps[currentStep].content }}</div>
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
