<script setup lang="ts">
const toast = useToast()
const { t } = useI18n({
	useScope: 'local',
})

enum Actions {
	Click = 1,
}

type TourStep = {
	target: string
	content: string
	action?: Actions
}
const props = defineProps<{
	steps: TourStep[]
}>()

const currentStep = ref(-1)
const target = computed(() =>
	currentStep.value < 0 || currentStep.value >= props.steps.length
		? undefined
		: document.querySelector(props.steps[currentStep.value].target),
)

const getTargetBounding = () => {
	const rect = target.value?.getBoundingClientRect()
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
	currentStep.value = props.steps.length
}

const bounding = ref()

const interval = shallowRef()

const open = ref(true)

onMounted(() => {
	nextTick(() => {
		currentStep.value = 0
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
		<UPopover v-if="bounding" v-model:open="open" :dismissible="false">
			<div
				class="absolute border border-primary"
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
					<div>{{ steps[currentStep].content }}</div>
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
		"hide": "非表示",
		"next": "次へ",
		"done": "終了",
		"continue": "続ける",
		"tourIsHidden": "ガイドが一時的に非表示になっています。アプリをご自由にお試しください。"
	}
}
</i18n>
