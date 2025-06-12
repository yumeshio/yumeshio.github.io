<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import * as z from 'zod'

const schema = z.object({
	description: z.string().optional(),
	choices: z
		.array(z.string().min(1, 'Choice cannot be empty'))
		.min(1, 'At least one choice is required'),
	selectedChoice: z.number().int(),
	activeItem: z.number().int().optional(),
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
	description: '',
	choices: [''],
	selectedChoice: -1,
	activeItem: undefined,
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

const saveModalState = reactive({
	total: 0,
	cols: 1,
	rows: 0,
})

const savesPerPage = computed(() => {
	if (saveModalState.rows > 0) {
		return saveModalState.cols * saveModalState.rows
	}
	return saveModalState.total
})

const page = ref(0)

watch(saveModalState, () => {
	if (saveData.items.length < saveModalState.total) {
		saveData.items.push(...Array(saveModalState.total - saveData.items.length))
	}
})

const items = ref<ChoiceItem[]>([
	{
		choices: ['A', 'B', 'C'],
		selectedChoice: 0,
		description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
	},
	{
		choices: ['A', 'B', 'C'],
		selectedChoice: 0,
		description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
	},
])

const allItems = ref<Omit<ChoiceItem, 'selectedChoice'>[]>([
	{
		choices: ['A', 'B', 'C'],
		description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
	},
	{
		choices: ['A', 'B', 'C'],
		description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
	},
])

const handleAddItem = (activeItem?: number) => {
	itemModalOpen.value = true
	state.activeItem = activeItem
	if (activeItem !== undefined) {
		state.description = items.value[activeItem].description
		state.choices = items.value[activeItem].choices
		state.selectedChoice = items.value[activeItem].selectedChoice
	} else {
		state.description = ''
		state.choices = ['']
		state.selectedChoice = -1
	}
}

const handleSubmit = (event: FormSubmitEvent<Schema>) => {
	const newItem: ChoiceItem = {
		choices: state.choices!,
		selectedChoice: state.selectedChoice!,
		description: state.description!,
	}
	if (state.activeItem !== undefined) {
		const existingItemIndex = allItems.value.findIndex(
			(item) =>
				item.choices.length === items.value[state.activeItem!].choices.length &&
				item.choices.every((choice: string) =>
					items.value[state.activeItem!].choices.includes(choice),
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
}

const handleLoadItem = (item: ChoiceItem) => {
	state.description = item.description
	state.choices = item.choices
	allItemsModalOpen.value = false
}
const itemModalOpen = ref(false)
const allItemsModalOpen = ref(false)
</script>

<template>
	{{ state }}
	<UTimeline
		:items="items"
		size="xs"
		class="w-96 mx-auto"
		:ui="{
			title: 'text-muted',
			date: 'float-end ms-1',
			description: 'px-3 py-2 ring ring-default mt-2 rounded-md text-default',
		}"
	>
		<template #indicator="{ item }">
			<UButton
				trailing-icon="i-lucide-edit"
				size="xs"
				class="rounded-full"
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

	<UModal
		v-model:open="itemModalOpen"
		:title="state.activeItem !== undefined ? 'Edit Item' : 'Add Item'"
	>
		<UButton label="Add Item" class="mt-4" @click="handleAddItem()" />
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
							color="neutral"
							size="xs"
							class="ml-2"
							@click="state.choices!.splice(index, 1)"
						/>
					</div>
					<UButton
						label="Add Choice"
						class="mt-2 flex ml-auto"
						trailing-icon="i-lucide-plus"
						@click="state.choices!.push('')"
					/>
				</UFormField>
				<div class="flex items-center justify-center">
					<UModal v-model:open="allItemsModalOpen" title="All items">
						<UButton label="All items" color="neutral" />
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
										@click="allItems.splice(index, 1)"
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
					<UButton type="submit" label="Submit" />
				</div>
			</UForm>
		</template>
	</UModal>
	<UModal>
		<UButton label="Save / Load" />
		<template #header>
			<UFormField label="Total Saves" name="total">
				<UInputNumber
					v-model="saveModalState.total"
					placeholder="Total Saves"
					class="w-32"
				/>
			</UFormField>
			<UFormField label="Cols" name="cols">
				<UInputNumber v-model="saveModalState.cols" class="w-32" />
			</UFormField>
			<UFormField label="Rows" name="rows">
				<UInputNumber v-model="saveModalState.rows" class="w-32" />
			</UFormField>
		</template>
		<template #body>
			{{ saveData }}
			<div
				class="grid"
				:style="{ gridTemplateColumns: `repeat(${saveModalState.cols}, 1fr)` }"
			>
				<UCard
					v-for="(saveItem, index) in saveData.items.slice(
						page * savesPerPage,
						(page + 1) * savesPerPage,
					)"
					:key="index"
					:ui="{
						footer: 'px-4 sm:px-6 pb-4 sm:pb-6 pt-0 sm:pt-0 flex justify-end',
					}"
					variant="solid"
					class="mb-2 bg-default text-default border border-default"
				>
					<p>
						{{ saveItem?.items[saveItem.items.length - 1].choices.join(' / ') }}
					</p>
					<template #footer>
						<UButton
							label="Delete"
							trailing-icon="i-lucide-trash"
							color="neutral"
							size="xs"
							class="ml-auto"
							@click="saveData.items[index] = undefined"
						/>
						<UButton
							label="Load"
							trailing-icon="i-lucide-edit"
							size="xs"
							class="ml-2"
						/>
					</template>
				</UCard>
			</div>
			<UButton
				label="Save Current Items"
				class="mt-2 flex ml-auto"
				trailing-icon="i-lucide-save"
				@click="
					saveData.items.push({ items: items.map((item) => ({ ...item })) })
				"
			/>
		</template>
	</UModal>
</template>
