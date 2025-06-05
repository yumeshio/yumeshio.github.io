<script setup>
const route = useRoute()
const { data: post } = await useAsyncData(route.path, () => {
	return queryCollection('blog').path(route.path).first()
})
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
