<template>
	<span
		:class="{
			blur: !show,
		}"
		@click="show = !show"
		><slot
	/></span>
</template>

<script lang="ts" setup>
const show = ref(false)
</script>
