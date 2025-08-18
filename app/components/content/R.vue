<template>
	<ruby>
		<template v-for="match in matches" :key="match[0]"
			>{{ match[1] }}<rp>（</rp><rt>{{ match[2] }}</rt
			><rp>）</rp></template
		>
	</ruby>
</template>
<script setup lang="ts">
defineSlots<{
	default(): unknown
}>()
const slots = useSlots()
const slotContent = slots.default ? slots.default() : []
const slotText = slotContent.map((vnode) => vnode.children).join('')
const rgx = /(.*?)（(.*?)）/g
const matches = slotText.matchAll(rgx)
</script>
