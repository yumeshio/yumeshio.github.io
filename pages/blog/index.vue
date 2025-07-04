<script setup lang="ts">
import type { BlogCollectionItem } from '@nuxt/content'

const route = useRoute()
const tags = computed(() => {
	const tag = route.query.tag
	return typeof tag === 'string' ? [tag] : tag
})
const posts = ref<BlogCollectionItem[]>([])
const { data } = useAsyncData('blog-posts-list', () => {
	const query = queryCollection('blog')
	query.order('date', 'DESC')
	query.select('title', 'path', 'description', 'tags')
	if (tags.value) {
		query.andWhere((q) => {
			for (const t of tags.value!) {
				q = q.where('tags', 'LIKE', `%"${t}"%`)
			}
			return q
		})
	}
	query.skip(posts.value.length).limit(1)
	return query.all()
})

const list = useTemplateRef<HTMLElement>('list')
const shouldLoadMore = useElementBottomVisibility(list)
const loadMore = async () => {
	while (shouldLoadMore.value) {
		await refreshNuxtData('blog-posts-list')
		if (data.value && data.value.length > 0) {
			// @ts-expect-error expect "Type instantiation is excessively deep and possibly infinite."
			posts.value.push(...data.value)
		} else {
			break
		}
	}
}
watch(shouldLoadMore, loadMore)

watch(tags, async () => {
	posts.value = []
	await loadMore()
})
</script>

<template>
	<div>
		<h1 class="text-center font-bold">
			{{
				computed(() => {
					if (tags?.includes('dev')) {
						return $t('devBlog')
					} else if (tags?.includes('game')) {
						return $t('gameBlog')
					}
					return $t('blog')
				})
			}}
		</h1>
		<UContainer>
			<div ref="list" class="flex flex-col gap-4">
				<UCard
					v-for="post in posts"
					:key="post.path"
					class="relative hover:bg-elevated"
				>
					<NuxtLink :to="post.path" class="absolute inset-0" />
					<div class="flex flex-col sm:flex-row gap-4">
						<div
							class="flex self-center sm:self-start justify-center items-center w-full max-w-40 sm:min-w-40 sm:max-w-1/3"
						>
							<NuxtImg src="/favicon.png" />
						</div>
						<div>
							<h2 class="font-bold mb-2">{{ post.title }}</h2>
							<p class="line-clamp-5 overflow-hidden text-sm">
								{{ post.description }}
							</p>
						</div>
					</div>
				</UCard>
			</div>
		</UContainer>
	</div>
</template>
