<template>
	<div>
		<h1>{{ $t('library') }}</h1>
		<div
			class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 px-4 sm:px-6 lg:px-8 w-fit mx-auto"
		>
			<template v-for="i in 10">
				<UCard
					v-for="record in data"
					:key="record.id"
					class="max-w-sm relative overflow-hidden"
				>
					<UCollapsible
						:ui="{
							content:
								'origin-top-right data-[state=open]:animate-[collapsible-scale-in_200ms_ease-out] data-[state=closed]:animate-[collapsible-scale-out_200ms_ease-out] overflow-hidden absolute inset-0 bg-elevated text-toned z-10',
						}"
					>
						<UButton
							class="group absolute top-0 right-0 rotate-45 translate-x-1/2 -translate-y-1/2 size-16 z-20"
							trailing-icon="i-lucide-arrow-down"
							size="xl"
							:ui="{
								base: 'rounded-none items-end justify-center p-1',
								trailingIcon:
									'group-data-[state=open]:rotate-180 transition-transform duration-200',
							}"
						/>
						<template #content>
							<div class="pt-8 px-4 pb-4">
								<div class="flex gap-2">
									<UBadge v-for="tag in record.tags" :key="tag">{{
										tag
									}}</UBadge>
								</div>
								<h2>{{ record.title }}</h2>
								<p>
									<UIcon name="i-lucide-calendar-1" />{{ record.releaseDate }}
								</p>
								<p>
									<UIcon name="i-lucide-calendar-check" />{{
										record.completeDate
									}}
								</p>
							</div>
						</template>
					</UCollapsible>
					<UCarousel v-slot="{ item }" :items="record.images" class="z-0">
						<img :src="item" class="rounded-lg" />
					</UCarousel>
					<h2 class="font-bold text-center">{{ record.title }}</h2>
				</UCard>
			</template>
		</div>
	</div>
</template>
<script setup lang="ts">
definePageMeta({
	title: 'ライブラリ',
})
const { data } = await useAsyncData('library', () => {
	const route = useRoute()
	const query = queryCollection('library')
	query.where('stem', 'LIKE', `%${route.path.substring(1)}%`)
	return query.all()
})
</script>
