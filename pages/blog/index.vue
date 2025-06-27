<script setup lang="ts">
import type { BlogCollectionItem } from '@nuxt/content'

const route = useRoute()
const { resolve } = useRouter()
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
watch(shouldLoadMore, async () => {
	while (shouldLoadMore.value) {
		await refreshNuxtData('blog-posts-list')
		if (data.value && data.value.length > 0) {
			posts.value.push(...data.value)
		} else {
			break
		}
	}
})

const getPostUrl = (post: BlogCollectionItem) => {
	const tags = post.tags
	return resolve({
		path: post.path,
		query: { tag: tags },
	})
}
watch(tags, () => {
	refreshNuxtData()
})
</script>

<template>
	<div>
		<h1>
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
					<NuxtLink :to="getPostUrl(post)" class="absolute inset-0" />
					<div class="flex flex-col md:flex-row items-center">
						<NuxtImg
							src="/favicon.png"
							class="w-full md:min-w-40 md:max-w-1/3"
						/>
						<div>
							<h2 class="font-bold">{{ post.title }}</h2>
							<p class="line-clamp-5 overflow-hidden">
								{{ post.description }}
							</p>
						</div>
					</div>
				</UCard>
			</div>
		</UContainer>
	</div>
</template>
