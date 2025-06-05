<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import type { LocationQuery } from 'vue-router'
const { t } = useI18n()
const { resolve } = useRouter()
const viewport = useViewport()
const orientation = computed(() => {
	if (viewport.isGreaterOrEquals('sm')) {
		return 'horizontal'
	}
	return 'vertical'
})
const hasTag = (query: LocationQuery, tag: string) => {
	if (query.tag) {
		if (typeof query.tag === 'string') {
			return query.tag === tag
		}
		return query.tag.includes(tag)
	}
	return false
}
const route = useRoute()
const items = computed((): NavigationMenuItem[] => [
	{
		label: t('home'),
		icon: 'i-lucide-house',
		class: 'px-4 sm:px-2.5',
		to: resolve({
			path: '/',
		}),
	},
	{
		label: t('diary'),
		icon: 'i-lucide-book',
		class: 'px-4 sm:px-2.5',
		to: resolve({
			path: '/diary',
		}),
	},
	{
		label: t('devBlog'),
		icon: 'i-lucide-book',
		class: 'px-4 sm:px-2.5',
		to: resolve({
			path: '/blog',
			query: { tag: 'dev' },
		}),
		active: route.path.includes('/blog') && hasTag(route.query, 'dev'),
	},
	{
		label: t('gameBlog'),
		icon: 'i-lucide-book',
		class: 'px-4 sm:px-2.5',
		to: resolve({
			path: '/blog',
			query: { tag: 'game' },
		}),
		active: route.path.includes('/blog') && hasTag(route.query, 'game'),
	},
])
const open = ref<boolean>(false)
watch(viewport.breakpoint, () => {
	if (viewport.isGreaterOrEquals('sm')) {
		open.value = true
	} else {
		open.value = false
	}
})
</script>

<template>
	<UCollapsible v-model:open="open" class="flex flex-col mb-4 sm:mb-6">
		<div
			class="px-4 sm:px-6 lg:px-8 py-2 sm:py-4 flex justify-between sm:justify-center bg-muted sm:bg-inherit pointer-events-none"
		>
			<div class="flex gap-1 items-center">
				<NuxtImg src="/favicon.png" width="40" height="40" />
				<span class="font-bold text-primary text-lg sm:text-xl"
					>夢見草の栞</span
				>
			</div>
			<UButton
				ref="openButton"
				type="button"
				icon="lucide:align-justify"
				size="sm"
				variant="ghost"
				class="sm:hidden w-10 justify-center pointer-events-auto cursor-pointer"
			/>
		</div>
		<template #content>
			<div @click="open = viewport.isGreaterOrEquals('sm')">
				<UNavigationMenu
					:items="items"
					:orientation
					class="w-full justify-center"
				/>
				<div class="bg-accented h-0.5 max-w-screen-sm mx-auto" />
			</div>
		</template>
	</UCollapsible>
</template>
