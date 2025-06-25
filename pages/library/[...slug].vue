<template>
	<div>
		<h1>{{ $t('library') }}</h1>
		<UModal v-model:open="isModalOpen" :title="t('filter')">
			<UButton :label="t('filter')" color="neutral" variant="subtle" />
			<template #body>
				<UTabs
					:default-value="getActiveTab()"
					:items="tabs"
					class="w-full"
					:ui="{
						list: 'overflow-x-auto gap-2',
						trigger: 'whitespace-nowrap text-nowrap min-w-fit',
					}"
				>
					<template #content="{ item }">
						<UForm
							:state="condition"
							:schema="schema"
							@submit="onSubmit($event, item.value)"
						>
							<UFormField :label="t('status')">
								<USelect
									v-model="condition.status"
									:items="statusList"
									class="w-full"
								/>
							</UFormField>
							<UButton type="submit" :label="t('filter')" />
						</UForm>
					</template>
				</UTabs>
			</template>
		</UModal>
		<div
			class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
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
import type { TabsItem, FormSubmitEvent } from '@nuxt/ui'
import * as z from 'zod'

const { t } = useI18n({
	useScope: 'local',
})

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

const route = useRoute()
const getActiveTab = () => {
	if (route.params.slug) {
		return typeof route.params.slug === 'string'
			? route.params.slug
			: route.params.slug[0]
	}
	return 'all'
}

const statusList = ref([
	{ label: t('unstarted'), value: 'unstarted' },
	{ label: t('ongoing'), value: 'ongoing' },
	{ label: t('completed'), value: 'completed' },
	{ label: t('wishlist'), value: 'wishlist' },
	{ label: t('all'), value: 'all' },
])

const schema = z.object({
	status: z
		.enum(['wishlist', 'unstarted', 'ongoing', 'completed', 'all'])
		.optional(),
})

type Schema = z.output<typeof schema>

const condition = reactive<Partial<Schema>>({
	status: (route.query.status as Schema['status']) || 'all',
})

const onSubmit = async (event: FormSubmitEvent<Schema>, tab: string) => {
	isModalOpen.value = false
	await navigateTo({
		params: {
			slug: tab === 'all' ? '' : tab,
		},
		query: {
			status: condition.status === 'all' ? undefined : condition.status,
		},
	})
	data.refresh()
}

const isModalOpen = ref(false)

const data = await useAsyncData(route.path, async () => {
	const query = queryCollection('library')
	query.where('stem', 'LIKE', `%${route.path.substring(1)}%`)
	if (route.query.status) {
		query.where('status', '=', route.query.status)
	}
	return query.all()
})

const records = computed(() => {
	return data.data.value || []
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
		"all": "すべて"
	}
}
</i18n>
