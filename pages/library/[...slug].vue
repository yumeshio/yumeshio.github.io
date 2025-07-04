<template>
	<div>
		<UContainer class="max-w-7xl">
			<h1 class="hidden">{{ $t('library') }}</h1>
			<div class="flex justify-between pb-4 sm:pb-6 md:pb-8">
				<UModal v-model:open="isModalOpen" :title="t('filter')">
					<UButton
						:label="t('filter')"
						leading-icon="i-lucide-filter"
						color="neutral"
						variant="subtle"
					/>
					<template #body>
						<UTabs
							v-model="activeTab"
							:items="tabs"
							class="w-full"
							:ui="{
								list: 'overflow-x-auto gap-2',
								trigger: 'whitespace-nowrap text-nowrap min-w-fit',
							}"
						>
							<template #content>
								<UForm :state="condition" :schema="schema" @submit="onSubmit">
									<UFormField :label="t('status')">
										<USelect
											v-model="condition.status"
											:items="statusList"
											class="w-full"
										/>
									</UFormField>
									<UFormField :label="t('tags')" class="mt-2">
										<UInputMenu
											v-model="condition.tags"
											:items="availableTags ?? undefined"
											multiple
											class="w-full"
											@update:open="handleTagsInputMenuOpen"
										/>
									</UFormField>
									<UButton
										type="submit"
										:label="t('filter')"
										class="mt-4 w-full mx-auto max-w-sm flex justify-center"
									/>
								</UForm>
							</template>
						</UTabs>
					</template>
				</UModal>
				<USelect
					v-model="sort"
					:items="[
						{
							label: t('sort.default'),
							value: 'default',
						},
					]"
					leading-icon="lucide-arrow-up-down"
				/>
			</div>
		</UContainer>
		<div
			ref="container"
			class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 max-w-7xl px-4 sm:px-6 lg:px-8 mx-auto"
		>
			<UCard
				v-for="record in records"
				:key="record.id"
				class="relative overflow-hidden aspect-[3/4]"
				:ui="{
					body: 'p-0 sm:p-0 h-full',
				}"
			>
				<UCollapsible
					:ui="{
						content:
							'origin-top-right data-[state=open]:animate-[collapsible-scale-in_200ms_ease-out] data-[state=closed]:animate-[collapsible-scale-out_200ms_ease-out] overflow-hidden absolute inset-0 bg-elevated/95 text-toned z-10',
					}"
				>
					<UButton
						class="group absolute top-0 right-0 rotate-45 translate-x-1/2 -translate-y-1/2 size-16 z-20"
						trailing-icon="i-lucide-arrow-down"
						size="xl"
						:color="getButtonColor(record.status)"
						:ui="{
							base: 'rounded-none items-end justify-center p-1',
							trailingIcon:
								'group-data-[state=open]:rotate-180 transition-transform duration-200',
						}"
					/>
					<template #content>
						<div class="pt-8 px-4 pb-4">
							<div class="flex gap-2 mb-2">
								<UBadge v-for="tag in record.tags" :key="tag">{{ tag }}</UBadge>
							</div>
							<h2 class="font-bold text-lg mb-2">{{ record.title }}</h2>
							<div class="flex gap-1 items-center">
								<UIcon name="i-lucide-calendar-1" />{{ record.releaseDate }}
							</div>
							<div class="flex gap-1 items-center">
								<UIcon name="i-lucide-calendar-check" />{{
									record.completeDate
								}}
							</div>
						</div>
					</template>
				</UCollapsible>
				<UCarousel
					v-slot="{ item }"
					:items="record.images"
					:ui="{
						item: 'basis-full h-full',
						container: 'items-center h-full',
						viewport: 'h-full',
					}"
					class="h-full"
				>
					<div class="w-full h-full flex justify-center items-center relative">
						<div
							class="absolute inset-0 blur bg-cover bg-center"
							:style="{
								backgroundImage: `url(//wsrv.nl/?url=${item})`,
							}"
						></div>
						<NuxtImg
							provider="weserv"
							:src="item"
							class="object-contain h-full w-full z-10"
						/>
					</div>
				</UCarousel>
				<h2 class="font-bold text-center hidden">{{ record.title }}</h2>
			</UCard>
		</div>
	</div>
</template>
<script setup lang="ts">
import type { LibraryCollectionItem } from '@nuxt/content'
import type { TabsItem } from '@nuxt/ui'
import * as z from 'zod'

const { t } = useLocalI18n()

const tabs: (Omit<TabsItem, 'value'> & { value: string })[] = [
	{
		label: 'すべて',
		value: 'all',
	},
	{
		label: 'ゲーム',
		value: 'game',
	},
	{
		label: '本',
		value: 'book',
	},
	{
		label: 'アニメ',
		value: 'anime',
	},
	{
		label: '映画',
		value: 'movie',
	},
	{
		label: '音楽',
		value: 'music',
	},
	{
		label: 'その他',
		value: 'other',
	},
]

const schema = z.object({
	status: z
		.enum(['wishlist', 'unstarted', 'ongoing', 'completed', 'all'])
		.optional(),
	tags: z.array(z.string()).optional(),
})

type Schema = z.output<typeof schema>

const sort = ref('default')

const statusList = ref<
	{
		label: ReturnType<typeof t>
		value: Schema['status']
	}[]
>([
	{ label: t('unstarted'), value: 'unstarted' },
	{ label: t('ongoing'), value: 'ongoing' },
	{ label: t('completed'), value: 'completed' },
	{ label: t('wishlist'), value: 'wishlist' },
	{ label: t('all'), value: 'all' },
])
const route = useRoute()
const getActiveTab = () => {
	if (route.params.slug) {
		return typeof route.params.slug === 'string'
			? route.params.slug
			: route.params.slug[0]
	}
	return 'all'
}

const queryCondition = computed(() => {
	const status: Schema['status'] =
		typeof route.query.status === 'string' &&
		statusList.value
			.map((item) => item.value as string)
			.includes(route.query.status)
			? (route.query.status as Schema['status'])
			: undefined
	const tags: Schema['tags'] = route.query.tag
		? typeof route.query.tag === 'string'
			? [route.query.tag]
			: route.query.tag.filter((t) => t !== null)
		: []
	return {
		status,
		tags,
	}
})

const condition = reactive<Partial<Schema>>({
	status: (queryCondition.value.status as Schema['status']) || 'all',
	tags: queryCondition.value.tags,
})

const onSubmit = async () => {
	isModalOpen.value = false
	records.value = []
	await navigateTo({
		params: {
			slug: activeTab.value === 'all' ? '' : activeTab.value,
		},
		query: {
			status: condition.status === 'all' ? undefined : condition.status,
			tag: condition.tags,
		},
	})
	await loadMore()
}

const activeTab = ref(getActiveTab())
const { data: availableTags, refresh: refreshAvailableTags } = useLazyAsyncData(
	'availableTags',
	async () => {
		const query = queryCollection('library')
		if (activeTab.value && activeTab.value !== 'all') {
			query.where('stem', 'LIKE', `%${activeTab.value}%`)
		}
		query.select('tags')
		const items = await query.all()
		const set: Record<string, boolean> = {}
		for (const item of items) {
			if (item.tags) {
				for (const tag of item.tags) {
					set[tag] = true
				}
			}
		}
		return Object.keys(set)
	},
)
const handleTagsInputMenuOpen = (open: boolean) => {
	if (open) {
		refreshAvailableTags()
	}
}

const isModalOpen = ref(false)
const records = ref([] as LibraryCollectionItem[])

const { data } = await useAsyncData(route.path, async () => {
	const query = queryCollection('library')
	query.where('stem', 'LIKE', `%${route.path.substring(1)}%`)
	if (queryCondition.value.status) {
		query.where('status', '=', queryCondition.value.status)
	}
	if (queryCondition.value.tags.length) {
		query.andWhere((q) => {
			for (const t of queryCondition.value.tags) {
				q = q.where('tags', 'LIKE', `%"${t}"%`)
			}
			return q
		})
	}
	return query.skip(records.value.length).limit(2).all()
})

const getButtonColor = (
	status?: 'completed' | 'ongoing' | 'unstarted' | 'wishlist',
): 'success' | 'primary' | 'secondary' | 'info' | 'neutral' =>
	({
		completed: 'success',
		ongoing: 'primary',
		unstarted: 'secondary',
		wishlist: 'info',
		other: 'neutral',
	})[status ?? 'other'] as
		| 'success'
		| 'primary'
		| 'secondary'
		| 'info'
		| 'neutral'

// Infinite scroll
const container = useTemplateRef<HTMLElement>('container')
const shouldLoadMore = useElementBottomVisibility(container)
const loadMore = async () => {
	while (shouldLoadMore.value) {
		await refreshNuxtData(route.path)
		if (data.value && data.value.length > 0) {
			records.value.push(...data.value)
		} else {
			break
		}
	}
}
watch(shouldLoadMore, loadMore)
</script>

<i18n lang="json">
{
	"ja": {
		"library": "ライブラリ",
		"filter": "絞り込み",
		"status": "ステータス",
		"ongoing": "進行中",
		"completed": "完了",
		"unstarted": "未着手",
		"wishlist": "積み",
		"all": "すべて",
		"tags": "タグ"
	}
}
</i18n>
