<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import type { LocationQuery } from 'vue-router'
const { t, locale, locales, setLocale } = useI18n()
const availableLocales = computed(() => {
	return locales.value.filter((i) => i.code !== locale.value)
})
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
const items = computed((): NavigationMenuItem[] =>
	[
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
			label: t('blog'),
			icon: 'i-lucide-book',
			class: 'px-4 sm:px-2.5',
			to: resolve({
				path: '/blog',
			}),
			children: [
				{
					label: t('devBlog'),
					icon: 'i-lucide-book',
					to: resolve({
						path: '/blog',
						query: { tag: 'dev' },
					}),
					active: route.path.includes('/blog') && hasTag(route.query, 'dev'),
				},
				{
					label: t('gameBlog'),
					icon: 'i-lucide-book',
					to: resolve({
						path: '/blog',
						query: { tag: 'game' },
					}),
					active: route.path.includes('/blog') && hasTag(route.query, 'game'),
				},
			],
		},
		{
			label: t('library'),
			icon: 'i-lucide-book',
			class: 'px-4 sm:px-2.5',
			to: resolve({
				path: '/library',
			}),
		},
		{
			label: t('applications'),
			icon: 'i-lucide-panels-top-left',
			class: 'px-4 sm:px-2.5',
			children: [
				{
					label: t('novelog'),
					icon: 'i-lucide-book',
					description: t('novelogDescription'),
					to: resolve({ path: '/novelog' }),
				},
			],
			active: route.path.includes('/novelog'),
		},
	].slice(0, 1),
)
const open = ref<boolean>(false)
watch(viewport.breakpoint, () => {
	if (viewport.isGreaterOrEquals('sm')) {
		open.value = true
	} else {
		open.value = false
	}
})
watch(route, () => {
	open.value = viewport.isGreaterOrEquals('sm')
})
</script>

<template>
	<div
		class="px-4 sm:px-6 lg:px-8 py-2 sm:py-4 flex flex-row-reverse sm:flex-col bg-muted sm:bg-inherit"
	>
		<div class="flex justify-end ml-auto">
			<UPopover
				:content="{
					align: 'end',
				}"
			>
				<UButton
					leading-icon="i-lucide-languages"
					variant="ghost"
					color="neutral"
					size="md"
					class="size-10 justify-center"
				/>
				<template #content>
					<div class="flex flex-col">
						<UButton
							v-for="availableLocale in availableLocales"
							:key="availableLocale.code"
							:label="availableLocale.name"
							color="neutral"
							variant="ghost"
							@click="setLocale(availableLocale.code)"
						/>
					</div>
				</template>
			</UPopover>
			<UButton
				ref="openButton"
				type="button"
				icon="i-lucide-align-justify"
				size="md"
				variant="ghost"
				class="sm:hidden size-10 justify-center pointer-events-auto cursor-pointer"
				@click="open = !open"
			/>
		</div>
		<div class="flex gap-1 items-center sm:mx-auto">
			<NuxtImg src="/favicon.png" width="40" height="40" />
			<span class="font-bold text-primary text-lg sm:text-xl">夢見草の栞</span>
		</div>
	</div>
	<UCollapsible
		v-model:open="open"
		class="flex flex-col mb-4 sm:mb-6 lg:mb-8"
		:ui="{
			content: 'sm:overflow-visible',
		}"
	>
		<template #content>
			<div>
				<UNavigationMenu
					:items="items"
					:orientation
					content-orientation="vertical"
					class="justify-center"
					:ui="{
						linkLeadingIcon: 'min-w-4 min-h-4 sm:min-w-5 sm:min-h-5',
						childLinkIcon: 'min-w-4 min-h-4 sm:min-w-5 sm:min-h-5',
					}"
				/>
				<div class="bg-accented h-0.5 max-w-screen-sm mx-auto" />
			</div>
		</template>
	</UCollapsible>
</template>
