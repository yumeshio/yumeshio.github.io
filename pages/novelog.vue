<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import * as z from 'zod'

const { t } = useI18n({
	useScope: 'local',
})

useHead({
	title: t('title'),
})

const schema = z.object({
	description: z.string().optional(),
	choices: z.array(z.string()),
	selectedChoice: z.number().int(),
	activeItem: z.number().int(),
})

type Schema = z.output<typeof schema>

const state = reactive<Schema>({
	description: '',
	choices: [''],
	selectedChoice: -1,
	activeItem: -1,
})

type ChoiceItem = {
	choices: string[]
	selectedChoice: number
	description: string
}

type SaveItem = {
	items: ChoiceItem[]
}

type SaveData = {
	items: (SaveItem | undefined)[]
	title: string
}

const saveData = reactive<SaveData>({
	items: [],
	title: t('title'),
})

watch(
	saveData,
	(newData) => {
		localStorage.setItem('novelog-save-data', JSON.stringify(newData))
		localStorage.setItem('novelog-save-cols', JSON.stringify(saveCols.value))
		localStorage.setItem('novelog-save-rows', JSON.stringify(saveRows.value))
	},
	{ deep: true },
)

const totalSaves = ref(0)
const saveCols = ref(1)
const saveRows = ref(0)
const saveConfigOpen = ref(totalSaves.value < 1)

const savesPerPage = computed(() => {
	if (saveRows.value > 0) {
		return saveCols.value * saveRows.value
	}
	return totalSaves.value
})

const page = ref(1)

watch(totalSaves, () => {
	if (saveData.items.length < totalSaves.value) {
		saveData.items.push(...Array(totalSaves.value - saveData.items.length))
	} else {
		saveData.items.splice(totalSaves.value)
	}
})

const items = ref<ChoiceItem[]>([
	{
		description: t('dummy.description1'),
		choices: [t('dummy.choice1'), t('dummy.choice2'), t('dummy.choice3')],
		selectedChoice: 0,
	},
])

const allItems = ref<Omit<ChoiceItem, 'selectedChoice'>[]>([
	{
		description: t('dummy.description2'),
		choices: [t('dummy.choice1'), t('dummy.choice2'), t('dummy.choice3')],
	},
])

const handleAddItem = (activeItem: number) => {
	itemModalOpen.value = true
	state.activeItem = activeItem
	if (activeItem >= 0) {
		state.description = items.value[activeItem].description
		if (items.value[activeItem].choices.length === 0) {
			state.choices = ['']
		} else {
			state.choices = [...items.value[activeItem].choices]
		}
		state.selectedChoice = items.value[activeItem].selectedChoice
	} else {
		state.description = ''
		state.choices = ['']
		state.selectedChoice = -1
	}
}

const handleSubmit = (event: FormSubmitEvent<Schema>) => {
	const newItem: ChoiceItem = {
		choices: state.choices.filter((choice) => choice.trim() !== ''),
		selectedChoice: state.selectedChoice!,
		description: state.description!,
	}
	if (state.activeItem >= 0) {
		const existingItemIndex = allItems.value.findIndex(
			(item) =>
				item.choices.length === items.value[state.activeItem].choices.length &&
				item.choices.every((choice: string) =>
					items.value[state.activeItem].choices.includes(choice),
				),
		)
		if (existingItemIndex !== -1) {
			allItems.value[existingItemIndex] = {
				choices: newItem.choices,
				description: newItem.description,
			}
		} else {
			allItems.value.push({
				choices: newItem.choices,
				description: newItem.description,
			})
		}
		items.value[state.activeItem] = newItem
	} else {
		items.value.push(newItem)
		const existingItem = allItems.value.find(
			(item) =>
				item.choices.length === newItem.choices.length &&
				item.choices.every((choice: string) =>
					newItem.choices.includes(choice),
				),
		)
		if (!existingItem) {
			allItems.value.push({
				choices: newItem.choices,
				description: newItem.description,
			})
		}
	}
	itemModalOpen.value = false
	localStorage.setItem('novelog-items', JSON.stringify(items.value))
	localStorage.setItem('novelog-all-items', JSON.stringify(allItems.value))
}

const handleDeleteItem = (index: number) => {
	items.value.splice(index, 1)
	itemModalOpen.value = false
	localStorage.setItem('novelog-items', JSON.stringify(items.value))
}

const handleDeleteItemFromAllItems = (index: number) => {
	allItems.value.splice(index, 1)
	localStorage.setItem('novelog-all-items', JSON.stringify(allItems.value))
}

const handleLoadItem = (item: Omit<ChoiceItem, 'selectedChoice'>) => {
	state.description = item.description
	state.choices = item.choices
	allItemsModalOpen.value = false
}

// Search function
const searchQueryModel = ref('')
const searchQuery = ref('')
const handleSearch = () => {
	searchQuery.value = searchQueryModel.value
}
const hitItems = computed(() => {
	return allItems.value.filter((item) => {
		return (
			item.description.includes(searchQuery.value) ||
			item.choices.findIndex((choice) => choice.includes(searchQuery.value)) >
				-1
		)
	})
})

const itemModalOpen = ref(false)
const allItemsModalOpen = ref(false)
const saveModalOpen = ref(false)

const handleLoadSave = (saveItem: SaveItem) => {
	items.value = saveItem.items.map((item) => ({
		choices: item.choices,
		selectedChoice: item.selectedChoice,
		description: item.description,
	}))
	saveModalOpen.value = false
	localStorage.setItem('novelog-items', JSON.stringify(items.value))
}

const loading = ref(true)

onMounted(() => {
	loading.value = false
	const localSaveData = localStorage.getItem('novelog-save-data')
	if (localSaveData) {
		Object.assign(saveData, JSON.parse(localSaveData))
		totalSaves.value = saveData.items.length
	}
	const localCols = localStorage.getItem('novelog-save-cols')
	if (localCols) {
		saveCols.value = JSON.parse(localCols)
	}
	const localRows = localStorage.getItem('novelog-save-rows')
	if (localRows) {
		saveRows.value = JSON.parse(localRows)
	}
	const localItems = localStorage.getItem('novelog-items')
	if (localItems) {
		items.value = JSON.parse(localItems)
	}
	const localAllItems = localStorage.getItem('novelog-all-items')
	if (localAllItems) {
		allItems.value = JSON.parse(localAllItems)
	}
})

const exportDataToJson = () => {
	const data = {
		saveData: saveData,
		items: items.value,
		allItems: allItems.value,
	}
	const jsonBlob = new Blob([JSON.stringify(data, null, 2)], {
		type: 'application/json',
	})
	const url = URL.createObjectURL(jsonBlob)
	const link = document.createElement('a')
	link.href = url
	link.download = `${saveData.title.trim().length > 0 ? saveData.title.trim().replace(/\s+/g, '-') : 'novelog-data'}.json`
	link.click()
	URL.revokeObjectURL(url)
}
const importDataFromJson = async () => {
	const input = document.createElement('input')
	input.type = 'file'
	input.accept = '.json'
	input.onchange = async (event) => {
		const file = (event.target as HTMLInputElement).files?.[0]
		if (file) {
			try {
				const text = await file.text()
				const data = JSON.parse(text)
				if (data.saveData && data.items && data.allItems) {
					Object.assign(saveData, data.saveData)
					items.value = data.items
					allItems.value = data.allItems
					totalSaves.value = saveData.items.length
					localStorage.setItem('novelog-save-data', JSON.stringify(saveData))
					localStorage.setItem('novelog-items', JSON.stringify(items.value))
					localStorage.setItem(
						'novelog-all-items',
						JSON.stringify(allItems.value),
					)
				} else {
					alert('Invalid JSON structure.')
				}
			} catch {
				alert('Failed to load JSON file.')
			}
		}
	}
	input.click()
}

const tourSteps = [
	{
		target: `[data-tour-step='1']`,
		content: t('tour.editTitle'),
	},
	{
		target: `[data-tour-step='2']`,
		content: t('tour.addItem'),
		onEnd: () => {
			handleAddItem(-1)
			state.description = t('dummy.description3')
			state.choices = [t('dummy.choice1'), t('dummy.choice2')]
		},
	},
	{
		target: `[data-tour-step='3']`,
		content: t('tour.addChoice'),
	},
	{
		target: `[data-tour-step='history']`,
		content: t('tour.history'),
	},
	{
		target: `[data-tour-step='editItem']`,
		content: t('tour.editItem'),
		onStart: () => {
			itemModalOpen.value = false
		},
	},
	{
		target: `[data-tour-step='saveAndLoad']`,
		content: t('tour.saveAndLoad'),
	},
	{
		target: `[data-tour-step='totalSaves']`,
		content: t('tour.totalSaves'),
		onStart: () => {
			saveModalOpen.value = true
			saveConfigOpen.value = true
		},
		onEnd: () => {
			if (totalSaves.value < 1) {
				totalSaves.value = 1
			}
		},
	},
	{
		target: `[data-tour-step='save']`,
		content: t('tour.save'),
		onStart: () => {
			saveModalOpen.value = true
		},
		onEnd: (el?: HTMLElement) => {
			if (el) {
				el.click()
			}
		},
	},
	{
		target: `[data-tour-step='load']`,
		content: t('tour.load'),
		onStart: () => {
			saveModalOpen.value = true
		},
	},
	{
		target: `[data-tour-step='deleteSave']`,
		content: t('tour.deleteSave'),
		onStart: () => {
			saveModalOpen.value = true
		},
	},
	{
		target: `[data-tour-step='export']`,
		content: t('tour.export'),
		onStart: () => {
			saveModalOpen.value = false
			itemModalOpen.value = false
		},
	},
	{
		target: `[data-tour-step='import']`,
		content: t('tour.import'),
		onStart: () => {
			saveModalOpen.value = false
			itemModalOpen.value = false
		},
	},
]
</script>

<template>
	<div
		v-if="loading"
		class="fixed top-0 left-0 w-screen h-screen bg-default flex flex-col justify-center items-center z-5000 gap-4 px-4 sm:px-6 lg:px-8"
	>
		<div class="flex items-center gap-2">
			<UIcon name="i-lucide-loader-circle" class="animate-spin size-6" />
			{{ t('loading') }}
		</div>
		<UProgress animation="swing" />
	</div>
	<OnboardingTour
		id="novelog"
		:steps="tourSteps"
		:introduction="t('tour.introduction')"
	/>
	<UPopover>
		<h1
			class="text-center text-lg sm:text-xl lg:text-2xl font-bold mb-4 sm:mb-6 lg:mb-8"
			data-tour-step="1"
		>
			{{ saveData.title.length > 0 ? saveData.title : t('clickToEditTitle') }}
		</h1>
		<template #content>
			<UInput
				v-model.trim="saveData.title"
				type="text"
				:placeholder="t('enterTitle')"
			/>
		</template>
	</UPopover>
	<UTimeline
		:items="items"
		size="xs"
		class="w-xs sm:w-sm mx-auto"
		:ui="{
			title: 'text-muted',
			date: 'float-end ms-1',
		}"
	>
		<template #indicator="{ item }">
			<UButton
				:trailing-icon="
					item.choices.length > 0
						? 'i-lucide-message-circle-question'
						: 'i-lucide-message-circle-more'
				"
				class="rounded-full"
				color="neutral"
				variant="soft"
				data-tour-step="editItem"
				@click="handleAddItem(items.indexOf(item))"
			/>
		</template>
		<template #title="{ item }">
			<template v-for="(choice, i) in item.choices" :key="i">
				<span
					:class="{
						'font-bold': item.selectedChoice === i,
						'text-default': item.selectedChoice === i,
					}"
					>{{ choice }}</span
				>
				<template v-if="i < item.choices.length - 1"> / </template>
			</template>
		</template>
	</UTimeline>

	<div class="flex flex-col gap-4">
		<div class="flex gap-4 justify-center">
			<UModal v-model:open="saveModalOpen" :title="t('saveAndLoad')">
				<UButton
					:label="t('saveAndLoad')"
					color="secondary"
					leading-icon="i-lucide-save"
					class="basis-40 justify-center"
					data-tour-step="saveAndLoad"
				/>
				<template #body>
					<UCollapsible
						v-model:open="saveConfigOpen"
						class="mb-4 bg-muted rounded"
					>
						<UButton
							:label="t('settings')"
							variant="soft"
							color="neutral"
							leading-icon="i-lucide-settings"
							trailing-icon="i-lucide-chevron-down"
							class="w-full group"
							:ui="{
								trailingIcon:
									'ml-auto group-data-[state=open]:rotate-180 transition-transform duration-200',
							}"
						/>
						<template #content>
							<div class="flex flex-col sm:flex-row gap-2 sm:gap-4 p-4">
								<UFormField
									:label="t('totalSaves')"
									name="total"
									data-tour-step="totalSaves"
								>
									<UInputNumber
										v-model="totalSaves"
										:placeholder="t('totalSaves')"
										color="neutral"
										class="w-32"
									/>
								</UFormField>
								<div class="flex gap-2 sm:gap-4">
									<UFormField :label="t('cols')" name="cols">
										<UInputNumber
											v-model="saveCols"
											color="neutral"
											class="w-32"
										/>
									</UFormField>
									<UFormField :label="t('rows')" name="rows">
										<UInputNumber
											v-model="saveRows"
											color="neutral"
											class="w-32"
										/>
									</UFormField>
								</div>
							</div>
						</template>
					</UCollapsible>
					<div
						class="grid gap-2 sm:gap-4 max-w-full overflow-x-auto"
						:style="{ gridTemplateColumns: `repeat(${saveCols}, 1fr)` }"
					>
						<UCard
							v-for="(saveItem, index) in saveData.items.slice(
								(page - 1) * savesPerPage,
								page * savesPerPage,
							)"
							:key="index"
							:ui="{
								footer:
									'px-4 sm:px-6 pb-4 sm:pb-6 pt-0 sm:pt-0 flex justify-end',
							}"
							variant="solid"
							class="bg-default text-default border border-default"
						>
							<p class="text-sm text-muted">
								No.{{ (page - 1) * savesPerPage + index + 1 }} ({{ page }} -
								{{ (index % savesPerPage) + 1 }})
							</p>
							<p>
								{{ saveItem?.items[saveItem.items.length - 1].description }}
							</p>
							<p>
								{{
									saveItem?.items[saveItem.items.length - 1].choices.join(' / ')
								}}
							</p>
							<div class="flex flex-wrap gap-2 mt-2">
								<UButton
									v-if="saveItem"
									:label="t('load')"
									leading-icon="i-lucide-square-arrow-out-down-right"
									data-tour-step="load"
									@click="handleLoadSave(saveItem)"
								/>
								<UButton
									:label="t('save')"
									leading-icon="i-lucide-save"
									variant="outline"
									data-tour-step="save"
									@click="
										saveData.items[index] = {
											items: items.map((item) => ({ ...item })),
										}
									"
								/>
								<UButton
									v-if="saveItem"
									:label="t('delete')"
									variant="outline"
									leading-icon="i-lucide-trash"
									color="warning"
									data-tour-step="deleteSave"
									@click="saveData.items[index] = undefined"
								/>
							</div>
						</UCard>
					</div>
					<UPagination
						v-if="totalSaves > savesPerPage"
						v-model:page="page"
						:total="totalSaves"
						:items-per-page="savesPerPage"
						class="mt-4"
						:ui="{
							list: 'justify-center',
						}"
					/>
				</template>
			</UModal>
			<UModal
				v-model:open="itemModalOpen"
				:title="
					state.activeItem >= 0
						? t('itemModalTitleEdit')
						: t('itemModalTitleAdd')
				"
			>
				<UButton
					:label="t('addItem')"
					leading-icon="i-lucide-circle-plus"
					class="basis-40 justify-center"
					data-tour-step="2"
					@click="handleAddItem(-1)"
				/>
				<template #body>
					<UForm :schema="schema" :state="state" @submit="handleSubmit">
						<UFormField name="description" :label="t('description')">
							<UInput v-model="state.description" type="text" class="w-full" />
						</UFormField>
						<UFormField name="choices" :label="t('choices')" class="mt-2">
							<div
								v-for="(choice, index) in state.choices"
								:key="index"
								class="flex items-center w-full"
							>
								<UInput
									v-model="state.choices![index]"
									type="text"
									:class="index > 0 ? 'mt-2' : ''"
									class="grow"
								/>
								<UButton
									:trailing-icon="
										state.selectedChoice === index ? 'i-lucide-check' : ''
									"
									variant="outline"
									size="xs"
									class="ml-2 rounded-full size-6 items-center justify-center"
									@click="
										state.selectedChoice === index
											? (state.selectedChoice = -1)
											: (state.selectedChoice = index)
									"
								/>
								<UButton
									v-if="state.choices!.length > 1"
									trailing-icon="i-lucide-trash"
									color="warning"
									variant="soft"
									size="sm"
									class="ml-2"
									@click="state.choices!.splice(index, 1)"
								/>
							</div>
							<UButton
								:label="t('addChoice')"
								class="mt-2 flex ml-auto"
								leading-icon="i-lucide-plus"
								color="neutral"
								variant="soft"
								data-tour-step="3"
								@click="state.choices!.push('')"
							/>
						</UFormField>
						<div class="flex items-center mt-4">
							<UModal v-model:open="allItemsModalOpen" :title="t('allItems')">
								<UButton
									:label="t('allItems')"
									color="neutral"
									variant="subtle"
									leading-icon="i-lucide-history"
									data-tour-step="history"
								/>
								<template #body>
									<UButtonGroup class="flex mb-2">
										<UInput
											v-model="searchQueryModel"
											leading-icon="i-lucide-search"
											color="neutral"
											variant="outline"
											class="grow"
										/>
										<UButton
											:label="t('search')"
											color="neutral"
											variant="subtle"
											@click="handleSearch"
										/>
									</UButtonGroup>
									<UCard
										v-for="(item, index) in hitItems"
										:key="index"
										:ui="{
											footer:
												'px-4 sm:px-6 pb-4 sm:pb-6 pt-0 sm:pt-0 flex justify-end',
										}"
										variant="solid"
										class="mb-2 bg-default text-default border border-default"
									>
										<p>{{ item.choices.join(' / ') }}</p>
										<p>{{ item.description }}</p>
										<template #footer>
											<UButton
												:label="t('delete')"
												trailing-icon="i-lucide-trash"
												color="neutral"
												size="xs"
												class="ml-auto"
												@click="handleDeleteItemFromAllItems(index)"
											/>
											<UButton
												:label="t('load')"
												trailing-icon="i-lucide-edit"
												size="xs"
												class="ml-2"
												@click="handleLoadItem(item)"
											/>
										</template>
									</UCard>
								</template>
							</UModal>
							<UButton
								:label="t('delete')"
								class="ml-auto"
								color="warning"
								leading-icon="i-lucide-trash"
								@click="handleDeleteItem(state.activeItem)"
							/>
							<UButton
								type="submit"
								:label="t('submit')"
								leading-icon="i-lucide-send"
								class="ml-2"
							/>
						</div>
					</UForm>
				</template>
			</UModal>
		</div>
		<div class="flex gap-4 justify-center">
			<UButton
				:label="t('importData')"
				variant="subtle"
				color="neutral"
				leading-icon="i-lucide-upload"
				class="basis-40 justify-center"
				data-tour-step="import"
				@click="importDataFromJson"
			/>
			<UButton
				:label="t('exportData')"
				variant="subtle"
				leading-icon="i-lucide-download"
				class="basis-40 justify-center"
				data-tour-step="export"
				@click="exportDataToJson"
			/>
		</div>
	</div>
</template>

<i18n lang="json">
{
	"ja": {
		"title": "ノベログ",
		"search": "検索",
		"importData": "データを読み込み",
		"exportData": "データを保存",
		"saveLoad": "保存 / 読み込み",
		"configs": "設定",
		"totalSaves": "セーブ数",
		"cols": "列数",
		"rows": "行数",
		"addItem": "追加",
		"addChoice": "選択肢を追加",
		"description": "説明",
		"choices": "選択肢",
		"allItems": "ログ一覧",
		"delete": "削除",
		"load": "ロード",
		"submit": "送信",
		"itemModalTitleAdd": "新規",
		"itemModalTitleEdit": "編集",
		"clickToEditTitle": "タイトルをクリックして編集",
		"enterTitle": "タイトルを入力",
		"saveAndLoad": "セーブ／ロード",
		"settings": "設定",
		"save": "セーブ",
		"tour": {
			"editTitle": "ここにゲームのタイトルが表示されます。タイトルをクリックして変更できます。"
		}
	},
	"zh": {
		"title": "视觉小说攻略助手",
		"loading": "加载中",
		"search": "搜索",
		"importData": "导入数据",
		"exportData": "导出数据",
		"saveLoad": "存档 / 读取",
		"configs": "设置",
		"totalSaves": "存档数",
		"cols": "列数",
		"rows": "行数",
		"addItem": "添加",
		"addChoice": "添加选项",
		"description": "描述",
		"choices": "选项",
		"allItems": "历史记录",
		"delete": "删除",
		"load": "读取",
		"submit": "提交",
		"itemModalTitleAdd": "新增",
		"itemModalTitleEdit": "编辑",
		"clickToEditTitle": "点击标题进行编辑",
		"enterTitle": "输入标题",
		"saveAndLoad": "存档 / 读取",
		"settings": "设置",
		"save": "保存",
		"tour": {
			"introduction": "本应用用于管理视觉小说游戏的进度和存档。以可视化的形式记录过去每一个选项的选择。",
			"editTitle": "这里是游戏标题。点击可以编辑。",
			"addItem": "点击此处以添加新的时间节点。一个时间节点是一项可以包含描述和选项的记录。",
			"addChoice": "点击此按钮添加选项。点击选项旁边的圆圈以设置选择的选项。",
			"history": "点击提交之后，提交的内容会自动保存在历史记录中。如果下次需要输入相同的内容，可以直接从历史记录中加载。",
			"editItem": "点击这个图标可以编辑该项目的内容。",
			"saveAndLoad": "点击此按钮显示存档。可以将当先时间线上的内容保存至存档，也可以读取存档到当前时间线。这里的存档相当于游戏内的存档，并实现了过去的选项的可视化。",
			"totalSaves": "在这里设置总存档数。也可以设置每页的行数和列数。行数为0表示不限行数，所有存档显示在同一页。",
			"save": "点击此按钮存档。如果该存档已存在则会覆盖。",
			"load": "点击此按钮读取存档。时间线上内容将被覆盖。",
			"deleteSave": "点击此按钮删除存档。",
			"import": "点击此按钮导入本地存档文件（.json）。",
			"export": "点击此按钮导出全部数据至JSON文件。"
		},
		"dummy": {
			"description1": "这是一段描述文本",
			"description2": "这是一段描述文本",
			"description3": "这是一段描述文本",
			"choice1": "选项A",
			"choice2": "选项B",
			"choice3": "选项C"
		}
	}
}
</i18n>
