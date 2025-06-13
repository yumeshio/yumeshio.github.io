<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import * as z from 'zod'

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
}

const saveData = reactive<SaveData>({
	items: [],
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
	}
})

const items = ref<ChoiceItem[]>([])

const allItems = ref<Omit<ChoiceItem, 'selectedChoice'>[]>([])

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

onMounted(() => {
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
	link.download = 'novelog-data.json'
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
			} catch (error) {
				alert('Failed to load JSON file.')
			}
		}
	}
	input.click()
}
</script>

<template>
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

	<div
		class="flex flex-col-reverse sm:flex-row items-center justify-center gap-4"
	>
		<UButton
			label="Import Data"
			variant="subtle"
			color="neutral"
			leading-icon="i-lucide-upload"
			@click="importDataFromJson"
		/>
		<UButton
			label="Export Data"
			variant="subtle"
			leading-icon="i-lucide-download"
			@click="exportDataToJson"
		/>
		<UModal v-model:open="saveModalOpen" title="Save / Load">
			<UButton
				label="Save / Load"
				color="secondary"
				leading-icon="i-lucide-save"
			/>
			<template #body>
				<UCollapsible class="mb-4">
					<UButton
						label="Configs"
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
						<div
							class="flex flex-col sm:flex-row gap-2 sm:gap-4 items-center p-4"
						>
							<UFormField label="Total Saves" name="total">
								<UInputNumber
									v-model="totalSaves"
									placeholder="Total Saves"
									class="w-32"
								/>
							</UFormField>
							<UFormField label="Cols" name="cols">
								<UInputNumber v-model="saveCols" class="w-32" />
							</UFormField>
							<UFormField label="Rows" name="rows">
								<UInputNumber v-model="saveRows" class="w-32" />
							</UFormField>
						</div>
					</template>
				</UCollapsible>
				<div
					class="grid gap-4 max-w-full overflow-x-auto"
					:style="{ gridTemplateColumns: `repeat(${saveCols}, 1fr)` }"
				>
					<UCard
						v-for="(saveItem, index) in saveData.items.slice(
							(page - 1) * savesPerPage,
							page * savesPerPage,
						)"
						:key="index"
						:ui="{
							footer: 'px-4 sm:px-6 pb-4 sm:pb-6 pt-0 sm:pt-0 flex justify-end',
						}"
						variant="solid"
						class="mb-2 bg-default text-default border border-default"
					>
						<p class="text-sm text-muted">
							No.{{ index + 1 }} ({{ page }} - {{ (index % savesPerPage) + 1 }})
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
								label="Load"
								leading-icon="i-lucide-square-arrow-out-down-right"
								@click="handleLoadSave(saveItem)"
							/>
							<UButton
								label="Save"
								leading-icon="i-lucide-save"
								variant="outline"
								@click="
									saveData.items[index] = {
										items: items.map((item) => ({ ...item })),
									}
								"
							/>
							<UButton
								v-if="saveItem"
								label="Delete"
								variant="outline"
								leading-icon="i-lucide-trash"
								color="warning"
								@click="saveData.items[index] = undefined"
							/>
						</div>
					</UCard>
				</div>
				<UPagination
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
			:title="state.activeItem >= 0 ? 'Edit Item' : 'Add Item'"
		>
			<UButton
				label="Add Item"
				leading-icon="i-lucide-circle-plus"
				@click="handleAddItem(-1)"
			/>
			<template #body>
				<UForm :schema="schema" :state="state" @submit="handleSubmit">
					<UFormField name="description" label="Description">
						<UInput v-model="state.description" type="text" class="w-full" />
					</UFormField>
					<UFormField name="choices" label="Choices">
						<div
							v-for="(choice, index) in state.choices"
							:key="index"
							class="flex items-center w-full"
						>
							<UInput
								v-model="state.choices![index]"
								type="text"
								:placeholder="'Choice ' + (index + 1)"
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
							label="Add Choice"
							class="mt-2 flex ml-auto"
							leading-icon="i-lucide-plus"
							color="neutral"
							variant="soft"
							@click="state.choices!.push('')"
						/>
					</UFormField>
					<div class="flex items-center mt-4">
						<UModal v-model:open="allItemsModalOpen" title="All items">
							<UButton
								label="All items"
								color="neutral"
								variant="subtle"
								leading-icon="i-lucide-history"
							/>
							<template #body>
								<UCard
									v-for="(item, index) in allItems"
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
											label="Delete"
											trailing-icon="i-lucide-trash"
											color="neutral"
											size="xs"
											class="ml-auto"
											@click="handleDeleteItemFromAllItems(index)"
										/>
										<UButton
											label="Load"
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
							label="Delete"
							class="ml-auto"
							color="warning"
							leading-icon="i-lucide-trash"
							@click="handleDeleteItem(state.activeItem)"
						/>
						<UButton
							type="submit"
							label="Submit"
							leading-icon="i-lucide-send"
							class="ml-2"
						/>
					</div>
				</UForm>
			</template>
		</UModal>
	</div>
</template>
