<script setup>
const route = useRoute()
const { data: post } = await useAsyncData(route.path, () => {
	return queryCollection('blog').path(route.path).first()
})
if (post.value && post.value.tags) {
	await navigateTo({
		query: { tag: post.value.tags },
	})
}
</script>

<template>
	<UContainer>
		<ContentRenderer
			v-if="post"
			:value="post"
			:prose="true"
			tag="article"
			class="blog-post"
		/>
	</UContainer>
</template>
